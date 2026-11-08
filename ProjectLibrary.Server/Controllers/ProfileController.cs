using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ProjectLibrary.Core.Common;
using ProjectLibrary.Entities.Concrete;
using ProjectLibrary.Entities.Dtos;

namespace ProjectLibrary.Server.Controllers
{
    [Route("api/profile")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly UserManager<User> _userManager;

        public ProfileController(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound(ApiResponse.Fail("İstifadəçi tapılmadı."));

            return Ok(ApiResponse<object>.SuccessResult(new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.PhoneNumber,
                user.AvatarUrl,
                user.Role,
                user.CreatedAt
            }));
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateProfile([FromBody] UserProfileUpdateDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound(ApiResponse.Fail("İstifadəçi tapılmadı."));

            if (!string.IsNullOrWhiteSpace(dto.FullName))
                user.FullName = dto.FullName.Trim();

            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))
                user.PhoneNumber = dto.PhoneNumber.Trim();

            if (!string.IsNullOrWhiteSpace(dto.AvatarUrl))
                user.AvatarUrl = dto.AvatarUrl.Trim();

            if (!string.IsNullOrWhiteSpace(dto.CurrentPassword) && !string.IsNullOrWhiteSpace(dto.NewPassword))
            {
                var passResult = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
                if (!passResult.Succeeded)
                {
                    var errors = passResult.Errors.Select(e => e.Description).ToList();
                    return BadRequest(ApiResponse.Fail("Şifrə yenilənə bilmədi.", errors));
                }
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(ApiResponse.Fail("Profil yenilənərkən xəta baş verdi."));
            }

            return Ok(ApiResponse<object>.SuccessResult(new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.PhoneNumber,
                user.AvatarUrl
            }, "Profil uğurla yeniləndi."));
        }
    }
}
