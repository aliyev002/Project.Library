using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectLibrary.DataAccess.Data;

namespace ProjectLibrary.Server.Controllers
{
    [Route("api/export")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class ExportController : ControllerBase
    {
        private readonly LibraryDbContext _context;

        public ExportController(LibraryDbContext context)
        {
            _context = context;
        }

        [HttpGet("books-csv")]
        public async Task<IActionResult> ExportBooksCsv()
        {
            var books = await _context.Books
                .Where(b => !b.IsDeleted)
                .OrderBy(b => b.BookId)
                .ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("ID,Title,Author,Genre,TotalCopies,AvailableCopies,RatingAverage,ISBN,Location");

            foreach (var b in books)
            {
                var title = EscapeCsv(b.Title);
                var author = EscapeCsv(b.Author);
                var genre = EscapeCsv(b.Genre);
                var location = EscapeCsv(b.Location ?? "");
                sb.AppendLine($"{b.BookId},\"{title}\",\"{author}\",\"{genre}\",{b.TotalCopies},{b.AvailableCopies},{b.RatingAverage},\"{b.Isbn}\",\"{location}\"");
            }

            var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
            return File(bytes, "text/csv", $"Kitablar_{DateTime.Now:yyyyMMdd_HHmm}.csv");
        }

        [HttpGet("borrows-csv")]
        public async Task<IActionResult> ExportBorrowsCsv()
        {
            var borrows = await _context.BorrowedBooks
                .Include(b => b.Book)
                .Include(b => b.User)
                .OrderByDescending(b => b.BorrowDate)
                .ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("BorrowID,User,Email,BookTitle,BorrowDate,ReturnDate,Status");

            foreach (var b in borrows)
            {
                var user = EscapeCsv(b.User?.FullName ?? "");
                var email = EscapeCsv(b.User?.Email ?? "");
                var book = EscapeCsv(b.Book?.Title ?? "");
                sb.AppendLine($"{b.BorrowId},\"{user}\",\"{email}\",\"{book}\",{b.BorrowDate:yyyy-MM-dd},{b.ReturnDate:yyyy-MM-dd},{b.Status}");
            }

            var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
            return File(bytes, "text/csv", $"Icareler_{DateTime.Now:yyyyMMdd_HHmm}.csv");
        }

        private static string EscapeCsv(string value)
        {
            return value.Replace("\"", "\"\"");
        }
    }
}
