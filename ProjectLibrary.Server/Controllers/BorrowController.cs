//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using ProjectLibrary.DataAccess.Data;
//using ProjectLibrary.Entities.Concrete;
//using System.Security.Claims;

//namespace ProjectLibrary.Server.Controllers
//{
//    [Route("api/borrow")]
//    [ApiController]
//    public class BorrowController : ControllerBase
//    {
//        private readonly LibraryDbContext _context;

//        public BorrowController(LibraryDbContext context)
//        {
//            _context = context;
//        }

//        //[HttpPost("borrow/{bookId}")]
//        //[Authorize]
//        //public async Task<IActionResult> BorrowBook(int bookId)
//        //{
//        //    var userId = (User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
//        //    var book = await _context.Books.FindAsync(bookId);

//        //    if (book == null || book.TotalCopies == 1)
//        //        return BadRequest("Book is not available.");

//        //    var borrowedBook = new BorrowedBook
//        //    {
//        //        UserId = userId.ToString(),
//        //        BookId = bookId,
//        //        ReturnDate = DateTime.UtcNow.AddDays(14) //2 heftelik icaze
//        //    };

//        //    book.AvailableCopies -= 1;
//        //    _context.BorrowedBooks.Add(borrowedBook);
//        //    await _context.SaveChangesAsync();

//        //    return Ok(new { message = "Book borrowed successfully", dueDate = borrowedBook.ReturnDate });
//        //}
//        [HttpPost("borrow/{bookId}")]
//        [Authorize]
//        public async Task<IActionResult> BorrowBook(int bookId)
//        {
//            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
//            var book = await _context.Books.FindAsync(bookId);

//            if (book == null || book.AvailableCopies <= 0)
//                return BadRequest("Book is not available.");

//            // ❗ Check if user already has this book borrowed and not yet returned
//            var alreadyBorrowed = await _context.BorrowedBooks
//                .AnyAsync(bb => bb.UserId == userId && bb.BookId == bookId && bb.Status != "returned");

//            if (alreadyBorrowed)
//                return BadRequest("You have already borrowed this book. Please return it before borrowing again.");

//            var borrowedBook = new BorrowedBook
//            {
//                UserId = userId,
//                BookId = bookId,
//                //ReturnDate = DateTime.UtcNow.AddDays(14),
//                ReturnDate = DateTime.UtcNow.AddMinutes(3),
//                Status = "borrowed" // ← Make sure you set this on creation
//            };

//            book.AvailableCopies -= 1;
//            _context.BorrowedBooks.Add(borrowedBook);
//            await _context.SaveChangesAsync();

//            return Ok(new { message = "Book borrowed successfully", dueDate = borrowedBook.ReturnDate });
//        }

//        [HttpPost("return/{borrowId}")]
//        [Authorize]
//        public async Task<IActionResult> ReturnBook(int borrowId)
//        {
//            var borrowedBook = await _context.BorrowedBooks.FindAsync(borrowId);

//            if (borrowedBook == null || borrowedBook.Status == "returned")
//                return BadRequest("Invalid return request.");

//            var book = await _context.Books.FindAsync(borrowedBook.BookId);
//            book.AvailableCopies += 1;
//            borrowedBook.Status = "returned";

//            await _context.SaveChangesAsync();
//            return Ok(new { message = "Book returned successfully" });
//        }
//        [HttpGet("user/{userId}/all")]
//        [Authorize]
//        public async Task<IActionResult> GetAllBorrowedBooksByUser(string userId)
//        {
//            var borrowedBooks = await _context.BorrowedBooks
//                .Include(bb => bb.Book)
//                .Where(bb => bb.UserId == userId)
//                .Select(bb => new
//                {
//                    bb.BorrowId,
//                    bb.BookId,
//                    bb.Book.Title,
//                    bb.Book.Author,
//                    bb.Book.Genre,
//                    bb.ReturnDate,
//                    bb.Status
//                })
//                .ToListAsync();

//            if (!borrowedBooks.Any())
//                return NotFound("No borrowed books found for this user.");

//            return Ok(borrowedBooks);
//        }
//        [HttpGet("user/{userId}/active")]
//        [Authorize]
//        public async Task<IActionResult> GetActiveBorrowedBooksByUser(string userId)
//        {
//            var borrowedBooks = await _context.BorrowedBooks
//                .Include(bb => bb.Book)
//                .Where(bb => bb.UserId == userId && bb.Status != "returned")
//                .Select(bb => new
//                {
//                    bb.BorrowId,
//                    bb.BookId,
//                    bb.Book.Title,
//                    bb.Book.Author,
//                    bb.Book.Genre,
//                    bb.ReturnDate,
//                    bb.Status
//                })
//                .ToListAsync();

//            if (!borrowedBooks.Any())
//                return NotFound("No active borrowed books found for this user.");

//            return Ok(borrowedBooks);
//        }

//        [HttpGet("getallborrowedbooks")]
//        //[Authorize(Roles = "Admin")] // Only accessible by admins
//        public async Task<IActionResult> GetAllBorrowedBooks()
//        {
//            var borrowedBooks = await _context.BorrowedBooks
//                .Include(bb => bb.Book)
//                .Include(bb => bb.User)
//                .OrderByDescending(bb => bb.BorrowDate)
//                .Select(bb => new
//                {
//                    BorrowId = bb.BorrowId,
//                    BookInfo = new
//                    {
//                        bb.Book.BookId,
//                        bb.Book.Title,
//                        bb.Book.Author
//                    },
//                    UserInfo = new
//                    {
//                        UserId = bb.User.Id,
//                        bb.User.FullName,
//                        bb.User.Email
//                    },
//                    bb.BorrowDate,
//                    bb.ReturnDate,
//                    bb.Status,
//                    IsOverdue = bb.Status == "borrowed" && bb.ReturnDate < DateTime.UtcNow
//                })
//                .ToListAsync();

//            if (!borrowedBooks.Any())
//                return NotFound("No borrowed books found in the system.");

//            return Ok(borrowedBooks);
//        }



//    }


//}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectLibrary.DataAccess.Data;
using ProjectLibrary.Entities.Concrete;
using System.Security.Claims;

namespace ProjectLibrary.Server.Controllers
{
    [Route("api/borrow")]
    [ApiController]
    public class BorrowController : ControllerBase
    {
        private readonly LibraryDbContext _context;

        public BorrowController(LibraryDbContext context)
        {
            _context = context;
        }

        //[HttpPost("borrow/{bookId}")]
        //[Authorize]
        //public async Task<IActionResult> BorrowBook(int bookId)
        //{
        //    var userId = (User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        //    var book = await _context.Books.FindAsync(bookId);

        //    if (book == null || book.TotalCopies == 1)
        //        return BadRequest("Book is not available.");

        //    var borrowedBook = new BorrowedBook
        //    {
        //        UserId = userId.ToString(),
        //        BookId = bookId,
        //        ReturnDate = DateTime.UtcNow.AddDays(14) //2 heftelik icaze
        //    };

        //    book.AvailableCopies -= 1;
        //    _context.BorrowedBooks.Add(borrowedBook);
        //    await _context.SaveChangesAsync();

        //    return Ok(new { message = "Book borrowed successfully", dueDate = borrowedBook.ReturnDate });
        //}
        [HttpPost("borrow/{bookId}")]
        [Authorize]
        public async Task<IActionResult> BorrowBook(int bookId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var book = await _context.Books.FindAsync(bookId);

            if (book == null || book.AvailableCopies <= 0)
                return BadRequest("Book is not available.");

            // ❗ Check if user already has this book borrowed and not yet returned
            var alreadyBorrowed = await _context.BorrowedBooks
                .AnyAsync(bb => bb.UserId == userId && bb.BookId == bookId && bb.Status != "returned");

            if (alreadyBorrowed)
                return BadRequest("You have already borrowed this book. Please return it before borrowing again.");

            var borrowedBook = new BorrowedBook
            {
                UserId = userId,
                BookId = bookId,
                //ReturnDate = DateTime.UtcNow.AddDays(14),
                ReturnDate = DateTime.UtcNow.AddMinutes(1),
                Status = "borrowed" // ← Make sure you set this on creation
            };

            book.AvailableCopies -= 1;
            _context.BorrowedBooks.Add(borrowedBook);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Book borrowed successfully", dueDate = borrowedBook.ReturnDate });
        }

        //[HttpPost("return/{borrowId}")]
        //[Authorize]
        //public async Task<IActionResult> ReturnBook(int borrowId)
        //{
        //    var borrowedBook = await _context.BorrowedBooks.FindAsync(borrowId);

        //    if (borrowedBook == null || borrowedBook.Status == "returned")
        //        return BadRequest("Invalid return request.");

        //    var book = await _context.Books.FindAsync(borrowedBook.BookId);
        //    book.AvailableCopies += 1;
        //    borrowedBook.Status = "returned";

        //    await _context.SaveChangesAsync();
        //    return Ok(new { message = "Book returned successfully" });
        //}

        [HttpPost("return/{borrowId}")]
        [Authorize]
        public async Task<IActionResult> ReturnBook(int borrowId)
        {
            var borrowedBook = await _context.BorrowedBooks.FindAsync(borrowId);

            if (borrowedBook == null || borrowedBook.Status == "returned")
                return BadRequest("Invalid return request.");
              var book = await _context.Books.FindAsync(borrowedBook.BookId);
              book.AvailableCopies += 1;
            borrowedBook.Status = "returned";

            _context.BorrowedBooks.Update(borrowedBook); // <-- əlavə et

            await _context.SaveChangesAsync();
            return Ok(new { message = "Book status updated to returned" });
        }

        [HttpGet("user/{userId}/all")]
        [Authorize]
        public async Task<IActionResult> GetAllBorrowedBooksByUser(string userId)
        {
            var borrowedBooks = await _context.BorrowedBooks
                .Include(bb => bb.Book)
                .Where(bb => bb.UserId == userId)
                .Select(bb => new
                {
                    bb.BorrowId,
                    bb.BookId,
                    bb.Book.Title,
                    bb.Book.Author,
                    bb.Book.Genre,
                    ReturnDate = bb.ReturnDate.HasValue
                                 ? bb.ReturnDate.Value.ToString("dd.MM.yyyy")
                                 : null,
                    bb.Status
                })
                .ToListAsync();

            if (!borrowedBooks.Any())
                return NotFound("No borrowed books found for this user.");

            return Ok(borrowedBooks);
        }
        //[HttpGet("user/{userId}/active")]
        //[Authorize]
        //public async Task<IActionResult> GetActiveBorrowedBooksByUser(string userId)
        //{
        //    var borrowedBooks = await _context.BorrowedBooks
        //        .Include(bb => bb.Book)
        //        .Where(bb => bb.UserId == userId && bb.Status != "returned")
        //        .Select(bb => new
        //        {
        //            bb.BorrowId,
        //            bb.BookId,
        //            bb.Book.Title,
        //            bb.Book.Author,
        //            bb.Book.Genre,
        //            bb.ReturnDate,
        //            bb.Status
        //        })
        //        .ToListAsync();

        //    if (!borrowedBooks.Any())
        //        return NotFound("No active borrowed books found for this user.");

        //    return Ok(borrowedBooks);
        //}

        [HttpGet("user/{userId}/active")]
        [Authorize]
        public async Task<IActionResult> GetActiveBorrowedBooksByUser(string userId)
        {
            var borrowedBooks = await _context.BorrowedBooks
                .Include(bb => bb.Book)
                .Where(bb => bb.UserId == userId && bb.Status != "returned")
                .Select(bb => new
                {
                    bb.BorrowId,
                    bb.BookId,
                    bb.Book.Title,
                    bb.Book.Author,
                    bb.Book.Genre,
                    ReturnDate = bb.ReturnDate.HasValue
                                 ? bb.ReturnDate.Value.ToString("dd.MM.yyyy")
                                 : null,
                    bb.Status
                })
                .ToListAsync();

            if (!borrowedBooks.Any())
                return NotFound("No active borrowed books found for this user.");

            return Ok(borrowedBooks);
        }

        [HttpGet("getallborrowedbooks")]
        //[Authorize(Roles = "Admin")] // Only accessible by admins
        public async Task<IActionResult> GetAllBorrowedBooks()
        {
            var borrowedBooks = await _context.BorrowedBooks
                .Include(bb => bb.Book)
                .Include(bb => bb.User)
                .OrderByDescending(bb => bb.BorrowDate)
                .Select(bb => new
                {
                    BorrowId = bb.BorrowId,
                    BookInfo = new
                    {
                        bb.Book.BookId,
                        bb.Book.Title,
                        bb.Book.Author
                    },
                    UserInfo = new
                    {
                        UserId = bb.User.Id,
                        bb.User.FullName,
                        bb.User.Email
                    },
                    BorrowDate = bb.BorrowDate.ToString("dd.MM.yyyy"), // Səliqəli format
                    ReturnDate = bb.ReturnDate.HasValue
                 ? bb.ReturnDate.Value.ToString("dd.MM.yyyy")
                 : null,
                    bb.Status,
                    IsOverdue = bb.Status == "borrowed" && bb.ReturnDate < DateTime.UtcNow
                })
                .ToListAsync();

            if (!borrowedBooks.Any())
                return NotFound("No borrowed books found in the system.");

            return Ok(borrowedBooks);
        }




    }
}



