using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectLibrary.DataAccess.Data;
using ProjectLibrary.Entities.Concrete;
//using ProjectLibrary.Entities.Entities;
//using ProjectLibrary.Server.Entities;

namespace LibraryManagement.Controllers
{
    [Route("api/books")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private readonly LibraryDbContext _context;

        public BookController(LibraryDbContext context)
        {
            _context = context;
        }

        [HttpPost("add")]
        // [Authorize(Roles = "Admin")] // Adminin Kitab elave etme funksiyonallighi
        public async Task<IActionResult> AddBook(Book book)
        {
            if (await _context.Books.AnyAsync(b => b.BookId == book.BookId))
            {
                return BadRequest("A book with this ISBN already exists.");
            }

            await _context.Books.AddAsync(book);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Book added successfully" });
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllBooks()
        {
            var books = await _context.Books.ToListAsync();
            return Ok(books);
        }

        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableBooks()
        {
            var books = await _context.Books.Where(b => b.TotalCopies > 0).ToListAsync();
            return Ok(books);
        }
        [HttpGet("search")]
        public async Task<IActionResult> SearchBooks([FromQuery] string query)
        {
            var books = await _context.Books
                .Where(b => b.Title.Contains(query) || b.Author.Contains(query) || b.Genre.Contains(query))
                .ToListAsync();

            return Ok(books);
        }

        //[HttpPut("edit/{id}")]
        //[Authorize(Roles = "Admin")]
        //public async Task<IActionResult> EditBook(int id, Book updatedBook)
        //{
        //    var book = await _context.Books.FindAsync(id);
        //    if (book == null)
        //        return NotFound("Book not found.");

        //    book.Title = updatedBook.Title;
        //    book.Author = updatedBook.Author;
        //   // book.BookId = updatedBook.BookId;
        //    book.Genre = updatedBook.Genre;
        //    book.TotalCopies = updatedBook.TotalCopies;

        //    await _context.SaveChangesAsync();
        //    return Ok(new { message = "Book updated successfully" });
        //}

        [HttpPut("edit/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> EditBook(int id, Book updatedBook)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
                return NotFound("Book not found.");

            if (updatedBook.TotalCopies < 0)
                return BadRequest("Total copies cannot be negative.");

            if (updatedBook.AvailableCopies < 0 || updatedBook.AvailableCopies > updatedBook.TotalCopies)
                return BadRequest("Available copies must be between 0 and total copies.");

            book.Title = updatedBook.Title;
            book.Author = updatedBook.Author;
            book.Genre = updatedBook.Genre;
            book.TotalCopies = updatedBook.TotalCopies;
            book.AvailableCopies = updatedBook.AvailableCopies;
            book.Description = updatedBook.Description;
            book.ImageUrl = updatedBook.ImageUrl;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Book updated successfully" });
        }

        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
                return NotFound("Book not found.");

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Book deleted successfully" });
        }

        [HttpGet("filter/genre/{genre}")]
        public async Task<IActionResult> GetBooksByGenre(string genre)
        {
            var books = await _context.Books.Where(b => b.Genre == genre).ToListAsync();
            return Ok(books);
        }

        [HttpGet("genres")]
        public async Task<IActionResult> GetAllGenres()
        {
            var genres = await _context.Books
                .Select(b => b.Genre)
                .Distinct()
                .ToListAsync();

            return Ok(genres);
        }

        [HttpGet("bygenre")]
        public async Task<IActionResult> GetBooksBySelectedGenre([FromQuery] string genre)
        {
            if (string.IsNullOrEmpty(genre))
                return BadRequest("Genre parameter is required.");

            var books = await _context.Books
                .Where(b => b.Genre.ToLower() == genre.ToLower())
                .ToListAsync();

            if (!books.Any())
                return NotFound($"No books found for genre: {genre}");

            return Ok(books);
        }






    }
}
