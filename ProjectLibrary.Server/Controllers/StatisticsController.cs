using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectLibrary.DataAccess.Data;
using ProjectLibrary.Entities.Concrete;

namespace ProjectLibrary.Server.Controllers
{
    [Route("api/stats")]
    [ApiController]
    public class StatisticsController : ControllerBase
    {
        private readonly LibraryDbContext _context;

        public StatisticsController(LibraryDbContext context)
        {
            _context = context;
        }

        // Admin üçün ümumi icmal statistikası
        [HttpGet("summary")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminSummary()
        {
            var now = DateTime.UtcNow;

            var totalBooks = await _context.Books.CountAsync();
            var totalCopies = await _context.Books.SumAsync(b => b.TotalCopies);
            var availableCopies = await _context.Books.SumAsync(b => b.AvailableCopies);

            var activeBorrows = await _context.BorrowedBooks
                .CountAsync(bb => bb.Status != LibraryConstants.BorrowStatus.Returned);

            var overdueBorrows = await _context.BorrowedBooks
                .CountAsync(bb => bb.Status != LibraryConstants.BorrowStatus.Returned && bb.ReturnDate < now);

            var pendingReservations = await _context.Reservations
                .CountAsync(r => r.Status == LibraryConstants.ReservationStatus.Pending);

            var pendingExtensions = await _context.ExtensionRequests
                .CountAsync(er => er.Status == LibraryConstants.ExtensionStatus.Pending);

            var totalUsers = await _context.Users.CountAsync();

            return Ok(new
            {
                totalBooks,
                totalCopies,
                availableCopies,
                activeBorrows,
                overdueBorrows,
                pendingReservations,
                pendingExtensions,
                totalUsers
            });
        }

        // İstifadəçi üçün şəxsi statistika
        [HttpGet("user/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetUserSummary(string userId)
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            var isAdmin = User.IsInRole(LibraryConstants.Roles.Admin);

            if (!isAdmin && currentUserId != userId)
            {
                return Forbid();
            }

            var now = DateTime.UtcNow;

            var activeBorrows = await _context.BorrowedBooks
                .CountAsync(bb => bb.UserId == userId && bb.Status != LibraryConstants.BorrowStatus.Returned);

            var totalBorrowed = await _context.BorrowedBooks
                .CountAsync(bb => bb.UserId == userId);

            var overdueBorrows = await _context.BorrowedBooks
                .CountAsync(bb => bb.UserId == userId && bb.Status != LibraryConstants.BorrowStatus.Returned && bb.ReturnDate < now);

            var activeReservations = await _context.Reservations
                .CountAsync(r => r.UserId == userId &&
                    (r.Status == LibraryConstants.ReservationStatus.Pending || r.Status == LibraryConstants.ReservationStatus.Approved));

            return Ok(new
            {
                activeBorrows,
                totalBorrowed,
                overdueBorrows,
                activeReservations
            });
        }
    }
}
