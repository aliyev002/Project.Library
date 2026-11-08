using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectLibrary.Business.Services.Abstract;
using ProjectLibrary.Core.Common;
using ProjectLibrary.Entities.Concrete;
using ProjectLibrary.Entities.Dtos;

namespace ProjectLibrary.Server.Controllers
{
    [Route("api/books")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly IAuditService _auditService;

        public BookController(IBookService bookService, IAuditService auditService)
        {
            _bookService = bookService;
            _auditService = auditService;
        }

        // Bütün kitablar (mövcud sistem üçün)
        [HttpGet("all")]
        public async Task<IActionResult> GetAllBooks()
        {
            var books = await _bookService.GetAllBooksAsync();
            return Ok(books);
        }

        // Qabaqcıl Səhifələmə və Filtrləmə ilə
        [HttpGet("paged")]
        public async Task<IActionResult> GetBooksPaged([FromQuery] BookFilterDto filter)
        {
            var paged = await _bookService.GetBooksPagedAsync(filter);
            return Ok(ApiResponse<PagedResult<Book>>.SuccessResult(paged));
        }

        // Populyar / Ən yüksək reytinqli kitablar
        [HttpGet("popular")]
        public async Task<IActionResult> GetPopularBooks([FromQuery] int count = 6)
        {
            var books = await _bookService.GetPopularBooksAsync(count);
            return Ok(ApiResponse<List<Book>>.SuccessResult(books));
        }

        // Oxşar / Tövsiyə olunan kitablar
        [HttpGet("{id}/recommended")]
        public async Task<IActionResult> GetRecommendedBooks(int id, [FromQuery] int count = 4)
        {
            var books = await _bookService.GetRecommendedBooksAsync(id, count);
            return Ok(ApiResponse<List<Book>>.SuccessResult(books));
        }

        // Tək kitab detalları
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookById(int id)
        {
            var book = await _bookService.GetBookByIdAsync(id);
            if (book == null)
            {
                return NotFound(new { message = "Kitab tapılmadı." });
            }

            return Ok(book);
        }

        // Yalnız mövcud nüsxəsi olan kitablar
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableBooks()
        {
            var filter = new BookFilterDto { OnlyAvailable = true, PageSize = 100 };
            var result = await _bookService.GetBooksPagedAsync(filter);
            return Ok(result.Items);
        }

        // Axtarış
        [HttpGet("search")]
        public async Task<IActionResult> SearchBooks([FromQuery] string query)
        {
            var filter = new BookFilterDto { Query = query, PageSize = 100 };
            var result = await _bookService.GetBooksPagedAsync(filter);
            return Ok(result.Items);
        }

        // Bütün unikal janrlar
        [HttpGet("genres")]
        public async Task<IActionResult> GetAllGenres()
        {
            var genres = await _bookService.GetAllGenresAsync();
            return Ok(genres);
        }

        // Janra görə filtr
        [HttpGet("bygenre")]
        public async Task<IActionResult> GetBooksByGenre([FromQuery] string genre)
        {
            var filter = new BookFilterDto { Genre = genre, PageSize = 100 };
            var result = await _bookService.GetBooksPagedAsync(filter);
            return Ok(result.Items);
        }

        // Yeni kitab əlavə et (Admin)
        [HttpPost("add")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddBook([FromBody] BookCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _bookService.CreateBookAsync(dto);

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = User.Identity?.Name;
            await _auditService.LogAsync(userId, userName, "CREATE", "Book", created.BookId.ToString(), $"'{created.Title}' kitabı əlavə edildi.");

            return CreatedAtAction(nameof(GetBookById), new { id = created.BookId }, created);
        }

        // Kitabı redaktə et (Admin)
        [HttpPut("update/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBook(int id, [FromBody] BookUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _bookService.UpdateBookAsync(id, dto);
            if (updated == null)
            {
                return NotFound(new { message = "Kitab tapılmadı." });
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = User.Identity?.Name;
            await _auditService.LogAsync(userId, userName, "UPDATE", "Book", id.ToString(), $"'{updated.Title}' kitabı redaktə edildi.");

            return Ok(new { message = "Kitab uğurla yeniləndi.", book = updated });
        }

        // Kitabı sil (Admin - Soft Delete)
        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var success = await _bookService.DeleteBookAsync(id);
            if (!success)
            {
                return NotFound(new { message = "Kitab tapılmadı və ya artıq silinib." });
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = User.Identity?.Name;
            await _auditService.LogAsync(userId, userName, "DELETE", "Book", id.ToString(), $"Kitab arxivə köçürüldü (ID: {id}).");

            return Ok(new { message = "Kitab uğurla silindi." });
        }
    }
}
