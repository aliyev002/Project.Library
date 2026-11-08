using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectLibrary.Business.Services.Abstract;
using ProjectLibrary.Core.Common;
using ProjectLibrary.Entities.Dtos;
using ProjectLibrary.Server.Services.Abstract;

namespace ProjectLibrary.Server.Controllers
{
    [Route("api/suggestions")]
    [ApiController]
    [Authorize]
    public class SuggestionController : ControllerBase
    {
        private readonly ISuggestionService _suggestionService;
        private readonly INotificationService _notificationService;

        public SuggestionController(ISuggestionService suggestionService, INotificationService notificationService)
        {
            _suggestionService = suggestionService;
            _notificationService = notificationService;
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMySuggestions()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var list = await _suggestionService.GetUserSuggestionsAsync(userId);
            return Ok(ApiResponse<object>.SuccessResult(list));
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllSuggestions()
        {
            var list = await _suggestionService.GetAllSuggestionsAsync();
            return Ok(ApiResponse<object>.SuccessResult(list));
        }

        [HttpPost]
        public async Task<IActionResult> CreateSuggestion([FromBody] CreateSuggestionDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var item = await _suggestionService.CreateSuggestionAsync(userId, dto);

            var userName = User.Identity?.Name ?? "Oxucu";
            var typeText = dto.Type == "Donation" ? "kitab ianəsi" : "kitab təklifi";
            await _notificationService.SendToAdminsAsync(
                "Yeni Kitab Müraciəti",
                $"{userName} '{dto.Title}' adlı əsər üçün yeni {typeText} göndərdi.",
                "Info"
            );

            return Ok(ApiResponse<object>.SuccessResult(item, "Müraciətiniz qəbul edildi."));
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            var updatedItem = await _suggestionService.UpdateStatusAsync(id, status);
            if (updatedItem == null) return NotFound(ApiResponse.Fail("Qeyd tapılmadı."));

            // Oxucuya dərhal canlı SignalR bildirişi göndər
            string typeName = updatedItem.Type == "Donation" ? "Kitab İanəsi" : "Kitab Təklifi";
            string title = status == "Approved" ? $"{typeName} Təsdiqləndi! 🎉" : $"{typeName} Rədd Edildi";
            string msg = status == "Approved"
                ? $"Təbrik edirik! '{updatedItem.Title}' adlı kitab üçün göndərdiyiniz {typeName.ToLower()} müraciəti kitabxana tərəfindən qəbul edildi."
                : $"Təəssüf ki, '{updatedItem.Title}' adlı kitab üçün göndərdiyiniz {typeName.ToLower()} müraciəti bu dəfə qəbul edilmədi.";
            string notifType = status == "Approved" ? "Success" : "Warning";

            await _notificationService.SendNotificationAsync(updatedItem.UserId, title, msg, notifType);

            return Ok(ApiResponse.Ok("Status yeniləndi və oxucuya bildiriş göndərildi."));
        }
    }
}
