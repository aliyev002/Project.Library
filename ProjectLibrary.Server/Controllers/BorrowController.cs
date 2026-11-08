using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectLibrary.DataAccess.Data;
using ProjectLibrary.Entities.Concrete;
using ProjectLibrary.Server.Services.Abstract;

namespace ProjectLibrary.Server.Controllers
{
    [Route("api/borrow")]
    [ApiController]
    public class BorrowController : ControllerBase
    {
        private readonly LibraryDbContext _context;
        private readonly IEmailService _emailService;
        private readonly INotificationService _notificationService;

        public BorrowController(LibraryDbContext context, IEmailService emailService, INotificationService notificationService)
        {
            _context = context;
            _emailService = emailService;
            _notificationService = notificationService;
        }

        // Kitabı icarəyə götürmək
        [HttpPost("borrow/{bookId}")]
        [Authorize]
        public async Task<IActionResult> BorrowBook(int bookId)
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

            if (book.AvailableCopies <= 0)
            {
                return BadRequest(new { message = "Kitab hazırda bitib. İstəsəniz rezerv edə bilərsiniz." });
            }

            // İstifadəçinin artıq bu kitabı qaytarmayıb-qaytarmadığını yoxla
            var alreadyBorrowed = await _context.BorrowedBooks
                .AnyAsync(bb => bb.UserId == userId && bb.BookId == bookId && bb.Status != LibraryConstants.BorrowStatus.Returned);

            if (alreadyBorrowed)
            {
                return BadRequest(new { message = "Siz artıq bu kitabı icarəyə götürmüsünüz. Yeni nüsxə götürməzdən əvvəl mövcud olanı qaytarmalısınız." });
            }

            var borrowedBook = new BorrowedBook
            {
                UserId = userId,
                BookId = bookId,
                BorrowDate = DateTime.UtcNow,
                ReturnDate = DateTime.UtcNow.AddDays(14), // 14 günlük standart icarə müddəti
                Status = LibraryConstants.BorrowStatus.Borrowed
            };

            book.AvailableCopies -= 1;
            await _context.BorrowedBooks.AddAsync(borrowedBook);

            // Əgər istifadəçinin bu kitab üçün rezervasiyası var idisə, onu Completed et
            var userReservation = await _context.Reservations
                .FirstOrDefaultAsync(r => r.UserId == userId && r.BookId == bookId &&
                    (r.Status == LibraryConstants.ReservationStatus.Pending || r.Status == LibraryConstants.ReservationStatus.Approved));

            if (userReservation != null)
            {
                userReservation.Status = LibraryConstants.ReservationStatus.Completed;
            }

            await _context.SaveChangesAsync();

            var borrower = await _context.Users.FindAsync(userId);
            var borrowerName = borrower?.FullName ?? "Oxucu";

            // İstifadəçiyə və Adminlərə bildiriş
            await _notificationService.SendNotificationAsync(
                userId,
                "İcarə Təsdiqləndi",
                $"'{book.Title}' kitabını icarəyə götürdünüz. Son qaytarma tarixi: {borrowedBook.ReturnDate:dd.MM.yyyy}.",
                "Success"
            );

            await _notificationService.SendToAdminsAsync(
                "Yeni Kitab İcarəsi",
                $"{borrowerName} '{book.Title}' kitabını icarəyə götürdü.",
                "Info"
            );

            return Ok(new
            {
                message = "Kitab uğurla icarəyə götürüldü!",
                borrowId = borrowedBook.BorrowId,
                dueDate = borrowedBook.ReturnDate?.ToString("dd.MM.yyyy")
            });
        }

        // Kitabı qaytarmaq (İstifadəçi və ya Admin)
        [HttpPost("return/{borrowId}")]
        [Authorize]
        public async Task<IActionResult> ReturnBook(int borrowId)
        {
            var borrowedBook = await _context.BorrowedBooks
                .Include(bb => bb.Book)
                .Include(bb => bb.User)
                .FirstOrDefaultAsync(bb => bb.BorrowId == borrowId);

            if (borrowedBook == null)
            {
                return NotFound(new { message = "İcarə qeydi tapılmadı." });
            }

            if (borrowedBook.Status == LibraryConstants.BorrowStatus.Returned)
            {
                return BadRequest(new { message = "Bu kitab artıq qaytarılıb." });
            }

            borrowedBook.Status = LibraryConstants.BorrowStatus.Returned;

            if (borrowedBook.Book != null)
            {
                borrowedBook.Book.AvailableCopies += 1;

                // Növbədə gözləyən ilk rezervasiyanı tap və istifadəçisinə email göndər
                var nextReservation = await _context.Reservations
                    .Include(r => r.User)
                    .Where(r => r.BookId == borrowedBook.BookId && r.Status == LibraryConstants.ReservationStatus.Pending)
                    .OrderBy(r => r.ReservationDate)
                    .FirstOrDefaultAsync();

                if (nextReservation?.User != null)
                {
                    nextReservation.Status = LibraryConstants.ReservationStatus.Approved;

                    // Rezerv edən oxucuya dərhal bildiriş
                    await _notificationService.SendNotificationAsync(
                        nextReservation.UserId,
                        "Rezerv Etdiyiniz Kitab Hazırdır! 🎉",
                        $"Rezerv etdiyiniz '{borrowedBook.Book.Title}' kitabı artıq kitabxanaya qaytarıldı və sizin üçün ayrıldı. Yaxınlaşaraq təhvil ala bilərsiniz.",
                        "Success"
                    );

                    if (!string.IsNullOrEmpty(nextReservation.User.Email))
                    {
                        string subject = "Rezerv etdiyiniz kitab artıq kitabxanadadır!";
                        string message = $"Hörmətli {nextReservation.User.FullName},<br><br>"
                                       + $"Rezerv etdiyiniz <strong>'{borrowedBook.Book.Title}'</strong> kitabı qaytarıldı və sizin üçün ayrıldı. "
                                       + "Zəhmət olmasa yaxınlaşıb təhvil alın.<br><br>Hörmətlə,<br>Kitabxana İdarəetmə Sistemi";

                        try { await _emailService.SendEmailAsync(nextReservation.User.Email, subject, message); } catch {}
                    }
                }
            }

            await _context.SaveChangesAsync();

            // Kitabı qaytaran istifadəçiyə bildiriş
            await _notificationService.SendNotificationAsync(
                borrowedBook.UserId,
                "Kitab Təhvil Verildi",
                $"'{borrowedBook.Book?.Title}' kitabı uğurla kitabxanaya təhvil verildi. Təşəkkür edirik!",
                "Success"
            );

            return Ok(new { message = "Kitab uğurla qaytarıldı kimi qeyd edildi!" });
        }

        // İstifadəçinin bütün (tarixçə daxil) icarə kitabları
        [HttpGet("user/{userId}/all")]
        [Authorize]
        public async Task<IActionResult> GetAllBorrowedBooksByUser(string userId)
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            var isAdmin = User.IsInRole(LibraryConstants.Roles.Admin);

            if (!isAdmin && currentUserId != userId)
            {
                return Forbid();
            }

            var borrowedBooks = await _context.BorrowedBooks
                .Include(bb => bb.Book)
                .Where(bb => bb.UserId == userId)
                .OrderByDescending(bb => bb.BorrowDate)
                .Select(bb => new
                {
                    bb.BorrowId,
                    bb.BookId,
                    Title = bb.Book.Title,
                    Author = bb.Book.Author,
                    Genre = bb.Book.Genre,
                    ImageUrl = bb.Book.ImageUrl,
                    BorrowDate = bb.BorrowDate.ToString("dd.MM.yyyy"),
                    ReturnDate = bb.ReturnDate.HasValue ? bb.ReturnDate.Value.ToString("dd.MM.yyyy") : null,
                    bb.Status,
                    IsOverdue = bb.Status == LibraryConstants.BorrowStatus.Borrowed && bb.ReturnDate < DateTime.UtcNow
                })
                .ToListAsync();

            return Ok(borrowedBooks);
        }

        // İstifadəçinin hazırda aktiv icarədə olan kitabları
        [HttpGet("user/{userId}/active")]
        [Authorize]
        public async Task<IActionResult> GetActiveBorrowedBooksByUser(string userId)
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            var isAdmin = User.IsInRole(LibraryConstants.Roles.Admin);

            if (!isAdmin && currentUserId != userId)
            {
                return Forbid();
            }

            var activeBorrows = await _context.BorrowedBooks
                .Include(bb => bb.Book)
                .Where(bb => bb.UserId == userId && bb.Status != LibraryConstants.BorrowStatus.Returned)
                .OrderByDescending(bb => bb.BorrowDate)
                .Select(bb => new
                {
                    bb.BorrowId,
                    bb.BookId,
                    Title = bb.Book.Title,
                    Author = bb.Book.Author,
                    Genre = bb.Book.Genre,
                    ImageUrl = bb.Book.ImageUrl,
                    BorrowDate = bb.BorrowDate.ToString("dd.MM.yyyy"),
                    ReturnDate = bb.ReturnDate.HasValue ? bb.ReturnDate.Value.ToString("dd.MM.yyyy") : null,
                    RawReturnDate = bb.ReturnDate,
                    bb.Status,
                    IsOverdue = bb.ReturnDate < DateTime.UtcNow
                })
                .ToListAsync();

            return Ok(activeBorrows);
        }

        // Bütün icarələr (Yalnız Admin üçün)
        [HttpGet("getallborrowedbooks")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllBorrowedBooks()
        {
            var borrowedBooks = await _context.BorrowedBooks
                .Include(bb => bb.Book)
                .Include(bb => bb.User)
                .OrderByDescending(bb => bb.BorrowDate)
                .Select(bb => new
                {
                    bb.BorrowId,
                    BookInfo = new
                    {
                        bb.Book.BookId,
                        bb.Book.Title,
                        bb.Book.Author,
                        bb.Book.ImageUrl
                    },
                    UserInfo = new
                    {
                        UserId = bb.User.Id,
                        bb.User.FullName,
                        bb.User.Email
                    },
                    BorrowDate = bb.BorrowDate.ToString("dd.MM.yyyy"),
                    ReturnDate = bb.ReturnDate.HasValue ? bb.ReturnDate.Value.ToString("dd.MM.yyyy") : null,
                    bb.Status,
                    IsOverdue = bb.Status == LibraryConstants.BorrowStatus.Borrowed && bb.ReturnDate < DateTime.UtcNow
                })
                .ToListAsync();

            return Ok(borrowedBooks);
        }
    }
}
