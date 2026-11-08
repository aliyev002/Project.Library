using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectLibrary.Core.Common;

namespace ProjectLibrary.Server.Controllers
{
    [Route("api/upload")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;

        public UploadController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        [HttpPost("image")]
        [Authorize]
        [RequestSizeLimit(10_000_000)] // 10MB
        public async Task<IActionResult> UploadImage([FromForm(Name = "file")] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(ApiResponse.Fail("Fayl seçilməyib."));
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(ApiResponse.Fail("Yalnız şəkil faylları (.jpg, .jpeg, .png, .webp, .gif) yüklənə bilər."));
            }

            var webRoot = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsFolder = Path.Combine(webRoot, "uploads", "images");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativeUrl = $"/uploads/images/{uniqueFileName}";
            var absoluteUrl = $"{Request.Scheme}://{Request.Host}{relativeUrl}";

            return Ok(ApiResponse<object>.SuccessResult(new
            {
                url = absoluteUrl,
                relativePath = relativeUrl,
                fileName = uniqueFileName
            }, "Şəkil uğurla yükləndi."));
        }

        [HttpPost("document")]
        [Authorize(Roles = "Admin")]
        [RequestSizeLimit(50_000_000)] // 50MB (PDF, ePub)
        public async Task<IActionResult> UploadDocument(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(ApiResponse.Fail("Fayl seçilməyib."));
            }

            var allowedExtensions = new[] { ".pdf", ".epub" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(ApiResponse.Fail("Yalnız PDF və ePub faylları yüklənə bilər."));
            }

            var webRoot = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var docsFolder = Path.Combine(webRoot, "uploads", "documents");

            if (!Directory.Exists(docsFolder))
            {
                Directory.CreateDirectory(docsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(docsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativeUrl = $"/uploads/documents/{uniqueFileName}";
            var absoluteUrl = $"{Request.Scheme}://{Request.Host}{relativeUrl}";

            return Ok(ApiResponse<object>.SuccessResult(new
            {
                url = absoluteUrl,
                relativePath = relativeUrl,
                fileName = file.FileName
            }, "Sənəd uğurla yükləndi."));
        }
    }
}
