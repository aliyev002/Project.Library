using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectLibrary.Business.Services.Abstract;
using ProjectLibrary.Core.Common;
using ProjectLibrary.Entities.Dtos;
using ProjectLibrary.Server.Services.Abstract;

namespace ProjectLibrary.Server.Controllers
{
    [Route("api/room-bookings")]
    [ApiController]
    [Authorize]
    public class RoomBookingController : ControllerBase
    {
        private readonly IRoomBookingService _bookingService;
        private readonly INotificationService _notificationService;

        public RoomBookingController(IRoomBookingService bookingService, INotificationService notificationService)
        {
            _bookingService = bookingService;
            _notificationService = notificationService;
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyBookings()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var list = await _bookingService.GetUserBookingsAsync(userId);
            return Ok(ApiResponse<object>.SuccessResult(list));
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllBookings()
        {
            var list = await _bookingService.GetAllBookingsAsync();
            return Ok(ApiResponse<object>.SuccessResult(list));
        }

        [HttpGet("by-date")]
        public async Task<IActionResult> GetBookingsByDate([FromQuery] DateTime date)
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value ?? "";
            var list = await _bookingService.GetBookingsByDateAsync(date);
            var result = list.Select(b => new
            {
                b.BookingId,
                b.RoomOrSeatNumber,
                b.BookingDate,
                StartTime = b.StartTime.ToString(@"hh\:mm"),
                EndTime = b.EndTime.ToString(@"hh\:mm"),
                b.Status,
                IsMyBooking = !string.IsNullOrEmpty(currentUserId) && b.UserId == currentUserId
            });
            return Ok(ApiResponse<object>.SuccessResult(result));
        }

        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateRoomBookingDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var booking = await _bookingService.CreateBookingAsync(userId, dto);
            var userName = User.Identity?.Name ?? "Oxucu";

            // İstifadəçiyə bildiriş
            await _notificationService.SendNotificationAsync(
                userId,
                "Masa Rezerv Edildi",
                $"{dto.RoomOrSeatNumber} üçün {dto.BookingDate:dd.MM.yyyy} ({dto.StartTime} - {dto.EndTime}) tarixinə yeriniz ayrıldı.",
                "Success"
            );

            // Adminə bildiriş
            await _notificationService.SendToAdminsAsync(
                "Yeni Masa Rezervasiyası",
                $"{userName} {dto.RoomOrSeatNumber} üçün rezervasiya etdi ({dto.BookingDate:dd.MM.yyyy}).",
                "Info"
            );

            return Ok(ApiResponse<object>.SuccessResult(booking, "Rezervasiya uğurla təsdiqləndi."));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            var isAdmin = User.IsInRole("Admin");

            var success = await _bookingService.CancelBookingAsync(id, userId ?? "", isAdmin);
            if (!success) return BadRequest(ApiResponse.Fail("Rezervasiya ləğv edilə bilmədi."));

            return Ok(ApiResponse.Ok("Rezervasiya ləğv edildi."));
        }
    }
}
