using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectLibrary.Business.Services.Abstract;
using ProjectLibrary.Core.Common;
using ProjectLibrary.Entities.Dtos;

namespace ProjectLibrary.Server.Controllers
{
    [Route("api/reviews")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpGet("book/{bookId}")]
        public async Task<IActionResult> GetBookReviews(int bookId)
        {
            var reviews = await _reviewService.GetBookReviewsAsync(bookId);
            return Ok(ApiResponse<object>.SuccessResult(reviews));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddReview([FromBody] CreateReviewDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse.Fail("İstifadəçi təyin olunmadı."));
            }

            var review = await _reviewService.AddReviewAsync(userId, dto);
            return Ok(ApiResponse<object>.SuccessResult(review, "Rəyiniz uğurla əlavə olundu."));
        }

        [HttpDelete("{reviewId}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(int reviewId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            var isAdmin = User.IsInRole("Admin");

            var success = await _reviewService.DeleteReviewAsync(reviewId, userId ?? "", isAdmin);
            if (!success)
            {
                return BadRequest(ApiResponse.Fail("Rəy silinə bilmədi və ya icazəniz yoxdur."));
            }

            return Ok(ApiResponse.Ok("Rəy silindi."));
        }
    }
}
