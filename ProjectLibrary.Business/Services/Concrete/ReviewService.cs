using Microsoft.EntityFrameworkCore;
using ProjectLibrary.DataAccess.Data;
using ProjectLibrary.Entities.Concrete;
using ProjectLibrary.Entities.Dtos;

namespace ProjectLibrary.Business.Services.Abstract
{
    public interface IReviewService
    {
        Task<List<BookReview>> GetBookReviewsAsync(int bookId);
        Task<BookReview> AddReviewAsync(string userId, CreateReviewDto dto);
        Task<bool> DeleteReviewAsync(int reviewId, string userId, bool isAdmin);
    }
}

namespace ProjectLibrary.Business.Services.Concrete
{
    public class ReviewService : Abstract.IReviewService
    {
        private readonly LibraryDbContext _context;

        public ReviewService(LibraryDbContext context)
        {
            _context = context;
        }

        public async Task<List<BookReview>> GetBookReviewsAsync(int bookId)
        {
            return await _context.BookReviews
                .Include(r => r.User)
                .Where(r => r.BookId == bookId && r.IsApproved)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<BookReview> AddReviewAsync(string userId, CreateReviewDto dto)
        {
            var existing = await _context.BookReviews
                .FirstOrDefaultAsync(r => r.UserId == userId && r.BookId == dto.BookId);

            BookReview review;
            if (existing != null)
            {
                existing.Rating = dto.Rating;
                existing.Comment = dto.Comment.Trim();
                existing.CreatedAt = DateTime.UtcNow;
                review = existing;
            }
            else
            {
                review = new BookReview
                {
                    UserId = userId,
                    BookId = dto.BookId,
                    Rating = dto.Rating,
                    Comment = dto.Comment.Trim(),
                    CreatedAt = DateTime.UtcNow,
                    IsApproved = true
                };
                await _context.BookReviews.AddAsync(review);
            }

            await _context.SaveChangesAsync();

            // Kitabın ümumi reytinqini yenilə
            var book = await _context.Books.FindAsync(dto.BookId);
            if (book != null)
            {
                var allReviews = await _context.BookReviews
                    .Where(r => r.BookId == dto.BookId && r.IsApproved)
                    .ToListAsync();

                book.RatingCount = allReviews.Count;
                book.RatingAverage = allReviews.Count > 0 ? Math.Round(allReviews.Average(r => r.Rating), 1) : 0;
                await _context.SaveChangesAsync();
            }

            return review;
        }

        public async Task<bool> DeleteReviewAsync(int reviewId, string userId, bool isAdmin)
        {
            var review = await _context.BookReviews.FindAsync(reviewId);
            if (review == null) return false;

            if (!isAdmin && review.UserId != userId) return false;

            var bookId = review.BookId;
            _context.BookReviews.Remove(review);
            await _context.SaveChangesAsync();

            // Yenidən hesabla
            var book = await _context.Books.FindAsync(bookId);
            if (book != null)
            {
                var allReviews = await _context.BookReviews
                    .Where(r => r.BookId == bookId && r.IsApproved)
                    .ToListAsync();

                book.RatingCount = allReviews.Count;
                book.RatingAverage = allReviews.Count > 0 ? Math.Round(allReviews.Average(r => r.Rating), 1) : 0;
                await _context.SaveChangesAsync();
            }

            return true;
        }
    }
}
