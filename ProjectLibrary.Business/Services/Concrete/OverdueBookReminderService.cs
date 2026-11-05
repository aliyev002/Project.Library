using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using ProjectLibrary.Server.Services.Abstract;
using ProjectLibrary.DataAccess.Data;

public class OverdueBookReminderService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public OverdueBookReminderService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<LibraryDbContext>();
                var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                var overdueBooks = await dbContext.BorrowedBooks
                    .Include(b => b.User)
                    .Include(b => b.Book)
                    .Where(b => b.ReturnDate < DateTime.Now && b.Status == "Borrowed")
                    .ToListAsync();

                foreach (var book in overdueBooks)
                {
                    string subject = "Overdue Book Reminder";
                    string message = $"Dear {book.User.FullName},<br><br>"
                                   + $"The book <strong>{book.Book.Title}</strong> is overdue. "
                                   + "Please return it as soon as possible to avoid penalties.<br><br>Best regards,<br>Library Management System";

                    await emailService.SendEmailAsync(book.User.Email, subject, message);
                }
            }

            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}
