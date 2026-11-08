using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectLibrary.Business.Services.Abstract;
using ProjectLibrary.Core.Common;
using ProjectLibrary.Entities.Dtos;
using ProjectLibrary.Server.Services.Abstract;

namespace ProjectLibrary.Server.Controllers
{
    [Route("api/penalties")]
    [ApiController]
    [Authorize]
    public class PenaltyController : ControllerBase
    {
        private readonly IPenaltyService _penaltyService;
        private readonly INotificationService _notificationService;

        public PenaltyController(IPenaltyService penaltyService, INotificationService notificationService)
        {
            _penaltyService = penaltyService;
            _notificationService = notificationService;
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyPenalties()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var penalties = await _penaltyService.GetUserPenaltiesAsync(userId);
            return Ok(ApiResponse<object>.SuccessResult(penalties));
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllPenalties()
        {
            var penalties = await _penaltyService.GetAllPenaltiesAsync();
            return Ok(ApiResponse<object>.SuccessResult(penalties));
        }

        [HttpPost("create")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreatePenalty([FromBody] CreatePenaltyDto dto)
        {
            var penalty = await _penaltyService.CreatePenaltyAsync(dto);

            // İstifadəçiyə bildiriş göndər
            await _notificationService.SendNotificationAsync(
                dto.UserId,
                "Yeni Cərimə Qeydi",
                $"{dto.Amount:0.00} AZN məbləğində cərimə tətbiq edildi. Səbəb: {dto.Reason}",
                "Warning"
            );

            return Ok(ApiResponse<object>.SuccessResult(penalty, "Cərimə qeydə alındı."));
        }

        [HttpPost("pay/{id}")]
        public async Task<IActionResult> PayPenalty(int id)
        {
            var success = await _penaltyService.PayPenaltyAsync(id);
            if (!success)
            {
                return NotFound(ApiResponse.Fail("Cərimə tapılmadı."));
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            var userName = User.Identity?.Name ?? "Oxucu";

            if (!string.IsNullOrEmpty(userId))
            {
                await _notificationService.SendNotificationAsync(
                    userId,
                    "Cərimə Ödənildi",
                    "Cərimə borcunuz uğurla ödənildi və sistemdə bağlandı.",
                    "Success"
                );

                await _notificationService.SendToAdminsAsync(
                    "Cərimə Ödənildi",
                    $"{userName} #{id} nömrəli cərimə borcunu ödədi.",
                    "Info"
                );
            }

            return Ok(ApiResponse.Ok("Cərimə uğurla ödənildi."));
        }

        [HttpPost("calculate-overdue")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CalculateOverdue()
        {
            await _penaltyService.CalculateOverduePenaltiesAsync();
            return Ok(ApiResponse.Ok("Bütün gecikmiş icarələr üzrə cərimələr yeniləndi."));
        }
    }
}
