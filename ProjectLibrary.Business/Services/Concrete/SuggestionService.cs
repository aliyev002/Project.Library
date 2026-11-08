using Microsoft.EntityFrameworkCore;
using ProjectLibrary.DataAccess.Data;
using ProjectLibrary.Entities.Concrete;
using ProjectLibrary.Entities.Dtos;

namespace ProjectLibrary.Business.Services.Abstract
{
    public interface ISuggestionService
    {
        Task<List<BookSuggestion>> GetUserSuggestionsAsync(string userId);
        Task<List<BookSuggestion>> GetAllSuggestionsAsync();
        Task<BookSuggestion> CreateSuggestionAsync(string userId, CreateSuggestionDto dto);
        Task<BookSuggestion?> UpdateStatusAsync(int id, string status);
    }
}

namespace ProjectLibrary.Business.Services.Concrete
{
    public class SuggestionService : Abstract.ISuggestionService
    {
        private readonly LibraryDbContext _context;

        public SuggestionService(LibraryDbContext context)
        {
            _context = context;
        }

        public async Task<List<BookSuggestion>> GetUserSuggestionsAsync(string userId)
        {
            return await _context.BookSuggestions
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<BookSuggestion>> GetAllSuggestionsAsync()
        {
            return await _context.BookSuggestions
                .Include(s => s.User)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<BookSuggestion> CreateSuggestionAsync(string userId, CreateSuggestionDto dto)
        {
            var item = new BookSuggestion
            {
                UserId = userId,
                Title = dto.Title.Trim(),
                Author = dto.Author.Trim(),
                Genre = dto.Genre?.Trim() ?? string.Empty,
                Type = dto.Type,
                Note = dto.Note?.Trim(),
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            await _context.BookSuggestions.AddAsync(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<BookSuggestion?> UpdateStatusAsync(int id, string status)
        {
            var item = await _context.BookSuggestions.FindAsync(id);
            if (item == null) return null;

            item.Status = status;
            await _context.SaveChangesAsync();
            return item;
        }
    }
}
