using ProjectLibrary.Core.Common;
using ProjectLibrary.Entities.Concrete;
using ProjectLibrary.Entities.Dtos;

namespace ProjectLibrary.Business.Services.Abstract
{
    public interface IBookService
    {
        Task<PagedResult<Book>> GetBooksPagedAsync(BookFilterDto filter);
        Task<List<Book>> GetAllBooksAsync();
        Task<Book?> GetBookByIdAsync(int id);
        Task<List<Book>> GetRecommendedBooksAsync(int bookId, int count = 4);
        Task<List<string>> GetAllGenresAsync();
        Task<Book> CreateBookAsync(BookCreateDto dto);
        Task<Book?> UpdateBookAsync(int id, BookUpdateDto dto);
        Task<bool> DeleteBookAsync(int id);
        Task<List<Book>> GetPopularBooksAsync(int count = 6);
    }
}
