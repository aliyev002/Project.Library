using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ProjectLibrary.DataAccess.Data;


public class ReservationBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;

    public ReservationBackgroundService(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<LibraryDbContext>();
                var reservations = await dbContext.Reservations
                    .Where(r => !(r.Status=="IsNotified"))
                    .ToListAsync();

                foreach (var reservation in reservations)
                {
                    var book = await dbContext.Books.FindAsync(reservation.BookId);
                    if (book.TotalCopies > 0)
                    {
                        var user = await dbContext.Users.FindAsync(reservation.UserId);
                        if (user != null)
                        {
                            Console.WriteLine($"Notification: {user.FullName}, the book '{book.Title}' is now available.");
                            reservation.Status ="IsNotified" ;
                        }
                    }
                }

                await dbContext.SaveChangesAsync();
            }

            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken); // 5deyqeden bir yoxlama
        }
    }
}
