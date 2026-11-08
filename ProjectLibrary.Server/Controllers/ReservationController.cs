using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectLibrary.DataAccess.Data;
using ProjectLibrary.Entities.Concrete;
using ProjectLibrary.Server.Services.Abstract;

namespace ProjectLibrary.Server.Controllers
{
    [Route("api/reserve")]
    [ApiController]
    public class ReservationController : ControllerBase
    {
        private readonly LibraryDbContext _context;
        private readonly IEmailService _emailService;
        private readonly INotificationService _notificationService;

        public ReservationController(LibraryDbContext context, IEmailService emailService, INotificationService notificationService)
        {
            _context = context;
            _emailService = emailService;
            _notificationService = notificationService;
        }

        // Bütün rezervasiyalar (Yalnız Admin üçün)
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllReservations()
        {
            var reservations = await _context.Reservations
                .Include(r => r.User)
                .Include(r => r.Book)
                .OrderByDescending(r => r.ReservationDate)
                .Select(r => new
                {
                    r.ReservationId,
                    r.BookId,
                    Book = new
                    {
                        r.Book.BookId,
                        r.Book.Title,
                        r.Book.Author,
                        r.Book.ImageUrl
                    },
                    r.UserId,
                    User = new
                    {
                        r.User.Id,
                        r.User.FullName,
                        r.User.Email
                    },
                    ReservationDate = r.ReservationDate.ToString("dd.MM.yyyy HH:mm"),
                    r.Status
                })
                .ToListAsync();

            return Ok(reservations);
        }

        // Cari istifadəçinin rezervasiyaları
        [HttpGet("user/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetUserReservations(string userId)
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            var isAdmin = User.IsInRole(LibraryConstants.Roles.Admin);

            if (!isAdmin && currentUserId != userId)
            {
                return Forbid();
            }

            var reservations = await _context.Reservations
                .Include(r => r.Book)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.ReservationDate)
                .Select(r => new
                {
                    r.ReservationId,
                    r.BookId,
                    Book = new
                    {
                        r.Book.BookId,
                        r.Book.Title,
                        r.Book.Author,
                        r.Book.ImageUrl
                    },
                    r.UserId,
                    ReservationDate = r.ReservationDate.ToString("dd.MM.yyyy HH:mm"),
                    r.Status
                })
                .ToListAsync();

            return Ok(reservations);
        }

        // Kitabı rezerv etmək
        [HttpPost("reserve/{bookId}")]
        [Authorize]
        public async Task<IActionResult> ReserveBook(int bookId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "İstifadəçi müəyyən edilmədi." });
            }

            var book = await _context.Books.FindAsync(bookId);
            if (book == null)
            {
                return NotFound(new { message = "Kitab tapılmadı." });
            }

            if (book.AvailableCopies > 0)
            {
                return BadRequest(new { message = "Kitab hazırda kitabxanada mövcuddur. Birbaşa icarəyə götürə bilərsiniz." });
            }

            var existingReservation = await _context.Reservations
                .FirstOrDefaultAsync(r => r.UserId == userId && r.BookId == bookId &&
                    (r.Status == LibraryConstants.ReservationStatus.Pending ||
                     r.Status == LibraryConstants.ReservationStatus.Approved ||
                     r.Status == LibraryConstants.ReservationStatus.IsNotified));

            if (existingReservation != null)
            {
                return BadRequest(new { message = "Bu kitab üçün artıq aktiv rezervasiyanız mövcuddur." });
            }

            var alreadyBorrowed = await _context.BorrowedBooks
                .AnyAsync(bb => bb.UserId == userId && bb.BookId == bookId && bb.Status != LibraryConstants.BorrowStatus.Returned);

            if (alreadyBorrowed)
            {
                return BadRequest(new { message = "Siz bu kitabı artıq icarəyə götürmüsünüz." });
            }

            var reservation = new Reservation
            {
                UserId = userId,
                BookId = bookId,
                ReservationDate = DateTime.UtcNow,
                Status = LibraryConstants.ReservationStatus.Pending
            };

            await _context.Reservations.AddAsync(reservation);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(userId);
            var userName = user?.FullName ?? "Oxucu";

            // İstifadəçiyə bildiriş
            await _notificationService.SendNotificationAsync(
                userId,
                "Rezervasiya Qeydə Alındı",
                $"'{book.Title}' kitabı üçün növbəyə alındınız. Kitab mövcud olduqda sizə xəbər veriləcək.",
                "Info"
            );

            // Bütün Adminlərə bildiriş
            await _notificationService.SendToAdminsAsync(
                "Yeni Kitab Rezervasiyası",
                $"{userName} '{book.Title}' kitabını rezerv etdi.",
                "Info"
            );

            return Ok(new { message = "Kitab uğurla rezerv edildi! Kitabxanaya qaytarıldıqda sizə bildiriş göndəriləcək." });
        }

        // Rezervasiyanı ləğv etmək
        [HttpPost("cancel/{id}")]
        [Authorize]
        public async Task<IActionResult> CancelReservation(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            var isAdmin = User.IsInRole(LibraryConstants.Roles.Admin);

            var reservation = await _context.Reservations
                .Include(r => r.Book)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.ReservationId == id);

            if (reservation == null)
            {
                return NotFound(new { message = "Rezervasiya tapılmadı." });
            }

            if (!isAdmin && reservation.UserId != userId)
            {
                return Forbid();
            }

            reservation.Status = LibraryConstants.ReservationStatus.Cancelled;
            await _context.SaveChangesAsync();

            // Əgər admin ləğv etdisə istifadəçiyə bildiriş getsin
            if (isAdmin && reservation.UserId != userId)
            {
                await _notificationService.SendNotificationAsync(
                    reservation.UserId,
                    "Rezervasiya Ləğv Edildi",
                    $"'{reservation.Book?.Title}' kitabı üzrə rezervasiyanız inzibatçı tərəfindən ləğv edildi.",
                    "Warning"
                );
            }

            return Ok(new { message = "Rezervasiya ləğv edildi." });
        }

        // Rezervasiyanı təsdiq etmək (Admin)
        [HttpPost("approve/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveReservation(int id)
        {
            var reservation = await _context.Reservations
                .Include(r => r.User)
                .Include(r => r.Book)
                .FirstOrDefaultAsync(r => r.ReservationId == id);

            if (reservation == null)
            {
                return NotFound(new { message = "Rezervasiya tapılmadı." });
            }

            reservation.Status = LibraryConstants.ReservationStatus.Approved;
            await _context.SaveChangesAsync();

            // Oxucuya dərhal SignalR və DB bildirişi göndər
            await _notificationService.SendNotificationAsync(
                reservation.UserId,
                "Rezervasiyanız Təsdiqləndi! 🎉",
                $"Rezerv etdiyiniz '{reservation.Book?.Title}' kitabı artıq sizin üçün ayrıldı. Zəhmət olmasa kitabxanaya yaxınlaşaraq təhvil alın.",
                "Success"
            );

            // Email bildirişi
            if (reservation.User != null && !string.IsNullOrEmpty(reservation.User.Email))
            {
                string subject = "Kitabxana Rezervasiyanız Təsdiqləndi!";
                string message = $"Hörmətli {reservation.User.FullName},<br><br>"
                               + $"Rezerv etdiyiniz <strong>'{reservation.Book.Title}'</strong> kitabı artıq sizin üçün təsdiqləndi. "
                               + "Zəhmət olmasa yaxın vaxtda kitabxanaya yaxınlaşaraq kitabı təhvil alın.<br><br>Hörmətlə,<br>Kitabxana İdarəetmə Sistemi";

                try { await _emailService.SendEmailAsync(reservation.User.Email, subject, message); } catch {}
            }

            return Ok(new { message = "Rezervasiya təsdiqləndi və oxucuya bildiriş göndərildi." });
        }

        // Rezervasiyadan imtina etmək (Admin)
        [HttpPost("decline/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeclineReservation(int id)
        {
            var reservation = await _context.Reservations
                .Include(r => r.User)
                .Include(r => r.Book)
                .FirstOrDefaultAsync(r => r.ReservationId == id);

            if (reservation == null)
            {
                return NotFound(new { message = "Rezervasiya tapılmadı." });
            }

            reservation.Status = LibraryConstants.ReservationStatus.Declined;
            await _context.SaveChangesAsync();

            // Oxucuya dərhal SignalR və DB bildirişi göndər
            await _notificationService.SendNotificationAsync(
                reservation.UserId,
                "Rezervasiya İmtina Edildi",
                $"Təəssüf ki, '{reservation.Book?.Title}' kitabı üzrə rezervasiya müraciətiniz qəbul edilmədi.",
                "Warning"
            );

            if (reservation.User != null && !string.IsNullOrEmpty(reservation.User.Email))
            {
                string subject = "Kitabxana Rezervasiyası";
                string message = $"Hörmətli {reservation.User.FullName},<br><br>"
                               + $"Təəssüf ki, <strong>'{reservation.Book.Title}'</strong> kitabı üzrə rezervasiya müraciətiniz qəbul edilmədi.<br><br>Hörmətlə,<br>Kitabxana İdarəetmə Sistemi";

                try { await _emailService.SendEmailAsync(reservation.User.Email, subject, message); } catch {}
            }

            return Ok(new { message = "Rezervasiya imtina edildi və oxucuya məlumat göndərildi." });
        }
    }
}
