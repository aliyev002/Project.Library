using Microsoft.EntityFrameworkCore;
using ProjectLibrary.DataAccess.Data;
using ProjectLibrary.Entities.Concrete;
using ProjectLibrary.Entities.Dtos;

namespace ProjectLibrary.Business.Services.Abstract
{
    public interface IRoomBookingService
    {
        Task<List<RoomBooking>> GetUserBookingsAsync(string userId);
        Task<List<RoomBooking>> GetAllBookingsAsync();
        Task<List<RoomBooking>> GetBookingsByDateAsync(DateTime date);
        Task<RoomBooking> CreateBookingAsync(string userId, CreateRoomBookingDto dto);
        Task<bool> CancelBookingAsync(int bookingId, string userId, bool isAdmin);
    }
}

namespace ProjectLibrary.Business.Services.Concrete
{
    public class RoomBookingService : Abstract.IRoomBookingService
    {
        private readonly LibraryDbContext _context;

        public RoomBookingService(LibraryDbContext context)
        {
            _context = context;
        }

        public async Task<List<RoomBooking>> GetUserBookingsAsync(string userId)
        {
            return await _context.RoomBookings
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();
        }

        public async Task<List<RoomBooking>> GetAllBookingsAsync()
        {
            return await _context.RoomBookings
                .Include(b => b.User)
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();
        }

        public async Task<List<RoomBooking>> GetBookingsByDateAsync(DateTime date)
        {
            var target = date.Date;
            return await _context.RoomBookings
                .Where(b => b.BookingDate.Date == target && b.Status == "Confirmed")
                .ToListAsync();
        }

        public async Task<RoomBooking> CreateBookingAsync(string userId, CreateRoomBookingDto dto)
        {
            TimeSpan.TryParse(dto.StartTime, out var start);
            TimeSpan.TryParse(dto.EndTime, out var end);

            var booking = new RoomBooking
            {
                UserId = userId,
                RoomOrSeatNumber = dto.RoomOrSeatNumber.Trim(),
                BookingDate = dto.BookingDate.Date,
                StartTime = start,
                EndTime = end,
                Status = "Confirmed",
                CreatedAt = DateTime.UtcNow
            };

            await _context.RoomBookings.AddAsync(booking);
            await _context.SaveChangesAsync();
            return booking;
        }

        public async Task<bool> CancelBookingAsync(int bookingId, string userId, bool isAdmin)
        {
            var booking = await _context.RoomBookings.FindAsync(bookingId);
            if (booking == null) return false;

            if (!isAdmin && booking.UserId != userId) return false;

            booking.Status = "Cancelled";
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
