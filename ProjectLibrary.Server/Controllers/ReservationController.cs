using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectLibrary.Business.Services.Concrete;
using ProjectLibrary.DataAccess.Data;
using ProjectLibrary.Entities.Concrete;
using System.Security.Claims;

namespace ProjectLibrary.Server.Controllers
{
    [Route("api/reserve")]
    [ApiController]
    public class ReservationController : ControllerBase
    {

        private readonly LibraryDbContext _context;
        private readonly EmailService _emailService;

        public ReservationController(LibraryDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpPost("reserve/{bookId}")]
        [Authorize]
        public async Task<IActionResult> ReserveBook(int bookId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var book = await _context.Books.FindAsync(bookId);

            if (book == null)
                return NotFound("Book not found.");

            if (book.TotalCopies > 0)
                return BadRequest("Book is available. No need to reserve.");

            var existingReservation = await _context.Reservations
                .FirstOrDefaultAsync(r => r.UserId == userId.ToString() && r.BookId == bookId);

            if (existingReservation != null)
                return BadRequest("You have already reserved this book.");

            var reservation = new Reservation { UserId = userId.ToString(), BookId = bookId };
            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Book reserved successfully" });
        }

        [HttpGet("checks")]
        public async Task CheckReservations()
        {
            var reservations = await _context.Reservations
                .Where(r => !(r.Status=="IsNotified"))
                .ToListAsync();

            foreach (var reservation in reservations)
            {
                var book = await _context.Books.FindAsync(reservation.BookId);

                if (book.TotalCopies > 0)
                {
                    // Istifadecini ui den ve ya mailden melumatlandirmaq
                    await NotifyUser(reservation.UserId, book.Title);

                    
                    reservation.Status= "IsNotified";
                    await _context.SaveChangesAsync();
                }
            }
        }

        private async Task NotifyUser(string userId, string bookTitle)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                Console.WriteLine($"Notification: {user.FullName}, the book '{bookTitle}' is now available.");
                // email e bildiris gonderme hissesi olacaq 
            }
        }
        [HttpPost("approve/{id}")]
        public async Task<IActionResult> ApproveReservation(int id)
        {
            var reservation = await _context.Reservations.Include(r => r.User).Include(r => r.Book)
                .FirstOrDefaultAsync(r => r.ReservationId == id);

            if (reservation == null) return NotFound();

            reservation.Status = "Approved";
            await _context.SaveChangesAsync();

            string subject = "Library Reservation Approved";
            string message = $"Dear {reservation.User.FullName},<br><br>"
                           + $"Your reservation for the book <strong>{reservation.Book.Title}</strong> has been approved. "
                           + "You may now borrow the book from the library.<br><br>Best regards,<br>Library Management System";

            await _emailService.SendEmailAsync(reservation.User.Email, subject, message);

            return Ok(new { message = "Reservation approved and email sent." });
        }

        [HttpPost("decline/{id}")]
        public async Task<IActionResult> DeclineReservation(int id)
        {
            var reservation = await _context.Reservations.Include(r => r.User).Include(r => r.Book)
                .FirstOrDefaultAsync(r => r.ReservationId == id);

            if (reservation == null) return NotFound();

            reservation.Status = "Declined";
            await _context.SaveChangesAsync();

            string subject = "Library Reservation Declined";
            string message = $"Dear {reservation.User.FullName},<br><br>"
                           + $"Your reservation for the book <strong>{reservation.Book.Title}</strong> has been declined. "
                           + "Please contact the library for further details.<br><br>Best regards,<br>Library Management System";

            await _emailService.SendEmailAsync(reservation.User.Email, subject, message);

            return Ok(new { message = "Reservation declined and email sent." });
        }




    }
}
