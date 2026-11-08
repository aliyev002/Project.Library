using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectLibrary.DataAccess.Data;
using ProjectLibrary.Entities.Concrete;
using ProjectLibrary.Entities.Concrete.LibraryAPI.Models;
using ProjectLibrary.Server.Services.Abstract;

namespace ProjectLibrary.Server.Controllers
{
    [Route("api/extension")]
    [ApiController]
    public class ExtensionController : ControllerBase
    {
        private readonly LibraryDbContext _context;
        private readonly IEmailService _emailService;
        private readonly INotificationService _notificationService;

        public ExtensionController(LibraryDbContext context, IEmailService emailService, INotificationService notificationService)
        {
            _context = context;
            _emailService = emailService;
            _notificationService = notificationService;
        }

        // Bütün uzadılma istəkləri (Yalnız Admin)
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllExtensionRequests()
        {
            var requests = await _context.ExtensionRequests
                .Include(er => er.BorrowedBook)
                    .ThenInclude(bb => bb.Book)
                .Include(er => er.BorrowedBook)
                    .ThenInclude(bb => bb.User)
                .OrderByDescending(er => er.RequestedDate)
                .Select(er => new
                {
                    er.RequestId,
                    er.BorrowId,
                    Book = new
                    {
                        er.BorrowedBook.Book.BookId,
                        er.BorrowedBook.Book.Title,
                        er.BorrowedBook.Book.Author,
                        er.BorrowedBook.Book.ImageUrl
                    },
                    User = new
                    {
                        er.BorrowedBook.User.Id,
                        er.BorrowedBook.User.FullName,
                        er.BorrowedBook.User.Email
                    },
                    RequestedDate = er.RequestedDate.ToString("dd.MM.yyyy"),
                    CurrentReturnDate = er.BorrowedBook.ReturnDate.HasValue ? er.BorrowedBook.ReturnDate.Value.ToString("dd.MM.yyyy") : null,
                    NewReturnDate = er.NewReturnDate.ToString("dd.MM.yyyy"),
                    er.Status
                })
                .ToListAsync();

            return Ok(requests);
        }

        // İstifadəçinin uzadılma istəkləri
        [HttpGet("user/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetUserExtensionRequests(string userId)
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            var isAdmin = User.IsInRole(LibraryConstants.Roles.Admin);

            if (!isAdmin && currentUserId != userId)
            {
                return Forbid();
            }

            var requests = await _context.ExtensionRequests
                .Include(er => er.BorrowedBook)
                    .ThenInclude(bb => bb.Book)
                .Where(er => er.BorrowedBook.UserId == userId)
                .OrderByDescending(er => er.RequestedDate)
                .Select(er => new
                {
                    er.RequestId,
                    er.BorrowId,
                    Book = new
                    {
                        er.BorrowedBook.Book.BookId,
                        er.BorrowedBook.Book.Title,
                        er.BorrowedBook.Book.Author,
                        er.BorrowedBook.Book.ImageUrl
                    },
                    RequestedDate = er.RequestedDate.ToString("dd.MM.yyyy"),
                    CurrentReturnDate = er.BorrowedBook.ReturnDate.HasValue ? er.BorrowedBook.ReturnDate.Value.ToString("dd.MM.yyyy") : null,
                    NewReturnDate = er.NewReturnDate.ToString("dd.MM.yyyy"),
                    er.Status
                })
                .ToListAsync();

            return Ok(requests);
        }

        // İcarə müddətini uzatmaq üçün müraciət (İstifadəçi)
        [HttpPost("request/{borrowId}")]
        [Authorize]
        public async Task<IActionResult> RequestExtension(int borrowId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "İstifadəçi müəyyən edilmədi." });
            }

            var borrowedBook = await _context.BorrowedBooks
                .Include(bb => bb.Book)
                .Include(bb => bb.User)
                .FirstOrDefaultAsync(bb => bb.BorrowId == borrowId);

            if (borrowedBook == null)
            {
                return NotFound(new { message = "İcarə qeydi tapılmadı." });
            }

            if (borrowedBook.UserId != userId && !User.IsInRole(LibraryConstants.Roles.Admin))
            {
                return Forbid();
            }

            if (borrowedBook.Status == LibraryConstants.BorrowStatus.Returned)
            {
                return BadRequest(new { message = "Qaytarılmış kitabın müddəti uzadıla bilməz." });
            }

            var existingRequest = await _context.ExtensionRequests
                .AnyAsync(er => er.BorrowId == borrowId && er.Status == LibraryConstants.ExtensionStatus.Pending);

            if (existingRequest)
            {
                return BadRequest(new { message = "Bu icarə üçün artıq gözləyən uzadılma müraciətiniz mövcuddur." });
            }

            var currentReturnDate = borrowedBook.ReturnDate ?? DateTime.UtcNow;
            var extensionRequest = new ExtensionRequest
            {
                BorrowId = borrowId,
                RequestedDate = DateTime.UtcNow,
                NewReturnDate = currentReturnDate.AddDays(7),
                Status = LibraryConstants.ExtensionStatus.Pending
            };

            await _context.ExtensionRequests.AddAsync(extensionRequest);
            await _context.SaveChangesAsync();

            // Adminlərə canlı bildiriş
            await _notificationService.SendToAdminsAsync(
                "Müddət Uzadılma Müraciəti",
                $"{borrowedBook.User?.FullName ?? "Oxucu"} '{borrowedBook.Book?.Title}' kitabı üçün 7 günlük uzadılma müraciəti etdi.",
                "Info"
            );

            return Ok(new
            {
                message = "Müddətin 7 gün uzadılması üçün müraciət adminə göndərildi!",
                requestId = extensionRequest.RequestId,
                newReturnDate = extensionRequest.NewReturnDate.ToString("dd.MM.yyyy")
            });
        }

        // Uzadılmanı təsdiq etmək (Admin)
        [HttpPost("approve/{requestId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveExtension(int requestId)
        {
            var request = await _context.ExtensionRequests
                .Include(er => er.BorrowedBook)
                    .ThenInclude(bb => bb.Book)
                .Include(er => er.BorrowedBook)
                    .ThenInclude(bb => bb.User)
                .FirstOrDefaultAsync(er => er.RequestId == requestId);

            if (request == null)
            {
                return NotFound(new { message = "Müraciət tapılmadı." });
            }

            request.Status = LibraryConstants.ExtensionStatus.Approved;
            if (request.BorrowedBook != null)
            {
                request.BorrowedBook.ReturnDate = request.NewReturnDate;
            }

            await _context.SaveChangesAsync();

            // Oxucuya dərhal SignalR və DB bildirişi göndər
            if (request.BorrowedBook != null)
            {
                await _notificationService.SendNotificationAsync(
                    request.BorrowedBook.UserId,
                    "İcarə Müddəti Uzadıldı! 🎉",
                    $"'{request.BorrowedBook.Book?.Title}' kitabı üçün icarə müddətiniz {request.NewReturnDate:dd.MM.yyyy} tarixinədək uzadıldı.",
                    "Success"
                );
            }

            if (request.BorrowedBook?.User != null && !string.IsNullOrEmpty(request.BorrowedBook.User.Email))
            {
                string subject = "İcarə Müddətinin Uzadılması Təsdiqləndi";
                string message = $"Hörmətli {request.BorrowedBook.User.FullName},<br><br>"
                               + $"<strong>'{request.BorrowedBook.Book?.Title}'</strong> kitabı üçün icarə müddətiniz <strong>{request.NewReturnDate:dd.MM.yyyy}</strong> tarixinədək uğurla uzadıldı.<br><br>Hörmətlə,<br>Kitabxana İdarəetmə Sistemi";

                try { await _emailService.SendEmailAsync(request.BorrowedBook.User.Email, subject, message); } catch {}
            }

            return Ok(new { message = "Müddət uzadılması təsdiqləndi və oxucuya bildiriş göndərildi." });
        }

        // Uzadılmadan imtina etmək (Admin)
        [HttpPost("decline/{requestId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeclineExtension(int requestId)
        {
            var request = await _context.ExtensionRequests
                .Include(er => er.BorrowedBook)
                    .ThenInclude(bb => bb.Book)
                .Include(er => er.BorrowedBook)
                    .ThenInclude(bb => bb.User)
                .FirstOrDefaultAsync(er => er.RequestId == requestId);

            if (request == null)
            {
                return NotFound(new { message = "Müraciət tapılmadı." });
            }

            request.Status = LibraryConstants.ExtensionStatus.Declined;
            await _context.SaveChangesAsync();

            // Oxucuya dərhal bildiriş göndər
            if (request.BorrowedBook != null)
            {
                await _notificationService.SendNotificationAsync(
                    request.BorrowedBook.UserId,
                    "Müddət Uzadılması İmtina Edildi",
                    $"'{request.BorrowedBook.Book?.Title}' kitabı üçün müddətin uzadılması müraciətiniz qəbul edilmədi.",
                    "Warning"
                );
            }

            if (request.BorrowedBook?.User != null && !string.IsNullOrEmpty(request.BorrowedBook.User.Email))
            {
                string subject = "İcarə Müddətinin Uzadılması";
                string message = $"Hörmətli {request.BorrowedBook.User.FullName},<br><br>"
                               + $"Təəssüf ki, <strong>'{request.BorrowedBook.Book?.Title}'</strong> kitabı üçün müddətin uzadılması müraciətiniz inzibatçı tərəfindən qəbul edilmədi.<br><br>Hörmətlə,<br>Kitabxana İdarəetmə Sistemi";

                try { await _emailService.SendEmailAsync(request.BorrowedBook.User.Email, subject, message); } catch {}
            }

            return Ok(new { message = "Müddət uzadılması imtina edildi və oxucuya məlumat göndərildi." });
        }
    }
}
