using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectLibrary.Core.Common;
using ProjectLibrary.Server.Services.Abstract;

namespace ProjectLibrary.Server.Controllers
{
    [Route("api/notifications")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyNotifications()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var list = await _notificationService.GetUserNotificationsAsync(userId);
            return Ok(ApiResponse<object>.SuccessResult(list));
        }

        [HttpPatch("read/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var success = await _notificationService.MarkAsReadAsync(id, userId);
            if (!success) return NotFound();

            return Ok(ApiResponse.Ok("Oxundu olaraq qeyd edildi."));
        }

        [HttpPost("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            await _notificationService.MarkAllAsReadAsync(userId);
            return Ok(ApiResponse.Ok("Bütün bildirişlər oxundu olaraq qeyd edildi."));
        }
    }
}
