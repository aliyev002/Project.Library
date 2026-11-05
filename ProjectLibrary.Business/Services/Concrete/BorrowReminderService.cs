using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using ProjectLibrary.DataAccess.Data;
using ProjectLibrary.Server.Services.Abstract; // EmailService interface-i burada olur
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

public class BorrowReminderService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IEmailService _emailService;

    public BorrowReminderService(IServiceProvider serviceProvider, IEmailService emailService)
    {
        _serviceProvider = serviceProvider;
        _emailService = emailService;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<LibraryDbContext>();

                var now = DateTime.UtcNow;

                // Vaxtı keçmiş borrowed book-ları tap
                var overdueBorrowedBooks = await dbContext.BorrowedBooks
                    .Include(bb => bb.Book)
                    .Where(bb => bb.Status == "borrowed" && bb.ReturnDate <= now)
                    .ToListAsync();

                foreach (var borrowedBook in overdueBorrowedBooks)
                {
                    // İstifadəçinin emailini tapmalısan
                    var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == borrowedBook.UserId);
                    if (user != null)
                    {
                        string email = user.Email;
                        string subject = "Library Reminder: Book Return";
                        string message = $"Dear {user.FullName},<br><br>Your borrowing period for the book <b>{borrowedBook.Book.Title}</b> has expired. Please return it as soon as possible.<br><br>Thanks!";

                        await _emailService.SendEmailAsync(email, subject, message);
                    }

                    // İstəsən burada avtomatik olaraq Status-u "overdue" da edə bilərsən
                    borrowedBook.Status = "overdue";
                }

                await dbContext.SaveChangesAsync();
            }

            // Hər 1 dəqiqədən bir yoxla
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
