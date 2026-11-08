using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectLibrary.Business.Services.Abstract;
using ProjectLibrary.Core.Common;

namespace ProjectLibrary.Server.Controllers
{
    [Route("api/wishlist")]
    [ApiController]
    [Authorize]
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;

        public WishlistController(IWishlistService wishlistService)
        {
            _wishlistService = wishlistService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserWishlist()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var list = await _wishlistService.GetUserWishlistAsync(userId);
            return Ok(ApiResponse<object>.SuccessResult(list));
        }

        [HttpPost("toggle/{bookId}")]
        public async Task<IActionResult> ToggleWishlist(int bookId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var added = await _wishlistService.ToggleWishlistAsync(userId, bookId);
            var message = added ? "Kitab sevimlilərə əlavə edildi." : "Kitab sevimlilərdən çıxarıldı.";
            return Ok(ApiResponse<object>.SuccessResult(new { isInWishlist = added }, message));
        }

        [HttpGet("check/{bookId}")]
        public async Task<IActionResult> CheckWishlist(int bookId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var exists = await _wishlistService.IsInWishlistAsync(userId, bookId);
            return Ok(ApiResponse<object>.SuccessResult(new { isInWishlist = exists }));
        }
    }
}
