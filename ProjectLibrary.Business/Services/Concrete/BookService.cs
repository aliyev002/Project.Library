using Microsoft.EntityFrameworkCore;
using ProjectLibrary.Business.Services.Abstract;
using ProjectLibrary.Core.Common;
using ProjectLibrary.DataAccess.Data;
using ProjectLibrary.Entities.Concrete;
using ProjectLibrary.Entities.Dtos;

namespace ProjectLibrary.Business.Services.Concrete
{
    public class BookService : IBookService
    {
        private readonly LibraryDbContext _context;

        public BookService(LibraryDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<Book>> GetBooksPagedAsync(BookFilterDto filter)
        {
            var query = _context.Books
                .Where(b => !b.IsDeleted)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Query))
            {
                var q = filter.Query.Trim().ToLower();
                query = query.Where(b => b.Title.ToLower().Contains(q) ||
                                         b.Author.ToLower().Contains(q) ||
                                         b.Genre.ToLower().Contains(q) ||
                                         (b.Isbn != null && b.Isbn.ToLower().Contains(q)));
            }

            if (!string.IsNullOrWhiteSpace(filter.Genre) && filter.Genre != "All")
            {
                query = query.Where(b => b.Genre.ToLower() == filter.Genre.Trim().ToLower());
            }

            if (!string.IsNullOrWhiteSpace(filter.Author))
            {
                query = query.Where(b => b.Author.ToLower().Contains(filter.Author.Trim().ToLower()));
            }

            if (filter.OnlyAvailable == true)
            {
                query = query.Where(b => b.AvailableCopies > 0);
            }

            if (filter.MinYear.HasValue)
            {
                query = query.Where(b => b.PublishYear >= filter.MinYear.Value);
            }

            if (filter.MaxYear.HasValue)
            {
                query = query.Where(b => b.PublishYear <= filter.MaxYear.Value);
            }

            // Sıralama
            query = filter.SortBy switch
            {
                "title_asc" => query.OrderBy(b => b.Title),
                "title_desc" => query.OrderByDescending(b => b.Title),
                "rating" => query.OrderByDescending(b => b.RatingAverage),
                "oldest" => query.OrderBy(b => b.BookId),
                _ => query.OrderByDescending(b => b.BookId) // "newest" default
            };

            var totalCount = await query.CountAsync();
            var pageNumber = filter.PageNumber < 1 ? 1 : filter.PageNumber;
            var pageSize = filter.PageSize < 1 ? 12 : filter.PageSize;

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<Book>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<List<Book>> GetAllBooksAsync()
        {
            return await _context.Books
                .Where(b => !b.IsDeleted)
                .OrderByDescending(b => b.BookId)
                .ToListAsync();
        }

        public async Task<Book?> GetBookByIdAsync(int id)
        {
            return await _context.Books
                .Include(b => b.Reviews!)
                    .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(b => b.BookId == id && !b.IsDeleted);
        }

        public async Task<List<Book>> GetRecommendedBooksAsync(int bookId, int count = 4)
        {
            var currentBook = await _context.Books.FindAsync(bookId);
            if (currentBook == null) return new List<Book>();

            return await _context.Books
                .Where(b => b.BookId != bookId && !b.IsDeleted &&
                           (b.Genre == currentBook.Genre || b.Author == currentBook.Author))
                .OrderByDescending(b => b.RatingAverage)
                .Take(count)
                .ToListAsync();
        }

        public async Task<List<string>> GetAllGenresAsync()
        {
            return await _context.Books
                .Where(b => !b.IsDeleted && !string.IsNullOrEmpty(b.Genre))
                .Select(b => b.Genre)
                .Distinct()
                .ToListAsync();
        }

        public async Task<Book> CreateBookAsync(BookCreateDto dto)
        {
            var book = new Book
            {
                Title = dto.Title.Trim(),
                Author = dto.Author.Trim(),
                Genre = dto.Genre.Trim(),
                TotalCopies = dto.TotalCopies,
                AvailableCopies = dto.TotalCopies,
                Description = dto.Description.Trim(),
                ImageUrl = dto.ImageUrl.Trim(),
                Isbn = dto.Isbn?.Trim(),
                Publisher = dto.Publisher?.Trim(),
                PublishYear = dto.PublishYear,
                PageCount = dto.PageCount,
                Language = string.IsNullOrWhiteSpace(dto.Language) ? "Azərbaycan" : dto.Language.Trim(),
                Location = dto.Location?.Trim(),
                PdfUrl = dto.PdfUrl?.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            await _context.Books.AddAsync(book);
            await _context.SaveChangesAsync();
            return book;
        }

        public async Task<Book?> UpdateBookAsync(int id, BookUpdateDto dto)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null || book.IsDeleted) return null;

            book.Title = dto.Title.Trim();
            book.Author = dto.Author.Trim();
            book.Genre = dto.Genre.Trim();
            book.TotalCopies = dto.TotalCopies;
            book.AvailableCopies = dto.AvailableCopies;
            book.Description = dto.Description.Trim();
            book.ImageUrl = dto.ImageUrl.Trim();
            book.Isbn = dto.Isbn?.Trim();
            book.Publisher = dto.Publisher?.Trim();
            book.PublishYear = dto.PublishYear;
            book.PageCount = dto.PageCount;
            book.Language = dto.Language?.Trim() ?? book.Language;
            book.Location = dto.Location?.Trim();
            book.PdfUrl = dto.PdfUrl?.Trim();

            await _context.SaveChangesAsync();
            return book;
        }

        public async Task<bool> DeleteBookAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null || book.IsDeleted) return false;

            // Soft delete
            book.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Book>> GetPopularBooksAsync(int count = 6)
        {
            return await _context.Books
                .Where(b => !b.IsDeleted)
                .OrderByDescending(b => b.RatingAverage)
                .ThenByDescending(b => b.RatingCount)
                .Take(count)
                .ToListAsync();
        }
    }
}
