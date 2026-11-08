using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ProjectLibrary.DataAccess.Data;
using ProjectLibrary.Entities.Concrete;
using ProjectLibrary.Server.Services.Abstract;

namespace ProjectLibrary.Business.Services.Concrete
{
    public class BorrowReminderService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public BorrowReminderService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<LibraryDbContext>();
                    var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                    var now = DateTime.UtcNow;

                    // Vaxtı keçmiş aktiv icarələri tap
                    var overdueBorrowedBooks = await dbContext.BorrowedBooks
                        .Include(bb => bb.Book)
                        .Include(bb => bb.User)
                        .Where(bb => bb.Status == LibraryConstants.BorrowStatus.Borrowed && bb.ReturnDate <= now)
                        .ToListAsync(stoppingToken);

                    foreach (var borrowedBook in overdueBorrowedBooks)
                    {
                        if (borrowedBook.User != null && !string.IsNullOrEmpty(borrowedBook.User.Email))
                        {
                            string email = borrowedBook.User.Email;
                            string subject = "Kitabxana Xəbərdarlığı: İcarə Müddəti Bitib";
                            string message = $"Hörmətli {borrowedBook.User.FullName},<br><br>"
                                           + $"<strong>'{borrowedBook.Book.Title}'</strong> kitabı üçün icarə müddətiniz bitmişdir. "
                                           + "Zəhmət olmasa kitabı ən qısa zamanda kitabxanaya təhvil verin.<br><br>Hörmətlə,<br>Kitabxana İdarəetmə Sistemi";

                            await emailService.SendEmailAsync(email, subject, message);
                        }

                        borrowedBook.Status = LibraryConstants.BorrowStatus.Overdue;
                    }

                    if (overdueBorrowedBooks.Any())
                    {
                        await dbContext.SaveChangesAsync(stoppingToken);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[BorrowReminderService] Error: {ex.Message}");
                }

                // Hər 30 dəqiqədən bir yoxla
                await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
            }
        }
    }
}
