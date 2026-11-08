using Microsoft.EntityFrameworkCore;
using ProjectLibrary.DataAccess.Data;
using ProjectLibrary.Entities.Concrete;

namespace ProjectLibrary.Business.Services.Abstract
{
    public interface IWishlistService
    {
        Task<List<Book>> GetUserWishlistAsync(string userId);
        Task<bool> ToggleWishlistAsync(string userId, int bookId);
        Task<bool> IsInWishlistAsync(string userId, int bookId);
    }
}

namespace ProjectLibrary.Business.Services.Concrete
{
    public class WishlistService : Abstract.IWishlistService
    {
        private readonly LibraryDbContext _context;

        public WishlistService(LibraryDbContext context)
        {
            _context = context;
        }

        public async Task<List<Book>> GetUserWishlistAsync(string userId)
        {
            return await _context.Wishlists
                .Where(w => w.UserId == userId && !w.Book!.IsDeleted)
                .Include(w => w.Book)
                .Select(w => w.Book!)
                .ToListAsync();
        }

        public async Task<bool> ToggleWishlistAsync(string userId, int bookId)
        {
            var item = await _context.Wishlists
                .FirstOrDefaultAsync(w => w.UserId == userId && w.BookId == bookId);

            if (item != null)
            {
                _context.Wishlists.Remove(item);
                await _context.SaveChangesAsync();
                return false; // Çıxarıldı
            }

            var newItem = new Wishlist
            {
                UserId = userId,
                BookId = bookId,
                AddedAt = DateTime.UtcNow
            };

            await _context.Wishlists.AddAsync(newItem);
            await _context.SaveChangesAsync();
            return true; // Əlavə olundu
        }

        public async Task<bool> IsInWishlistAsync(string userId, int bookId)
        {
            return await _context.Wishlists.AnyAsync(w => w.UserId == userId && w.BookId == bookId);
        }
    }
}
