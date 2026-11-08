using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ProjectLibrary.DataAccess.Data;
using ProjectLibrary.Entities.Concrete;
using ProjectLibrary.Server.Services.Abstract;

namespace ProjectLibrary.Business.Services.Concrete
{
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
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<LibraryDbContext>();
                    var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                    var pendingReservations = await dbContext.Reservations
                        .Include(r => r.User)
                        .Include(r => r.Book)
                        .Where(r => r.Status == LibraryConstants.ReservationStatus.Pending)
                        .ToListAsync(stoppingToken);

                    foreach (var reservation in pendingReservations)
                    {
                        if (reservation.Book != null && reservation.Book.AvailableCopies > 0)
                        {
                            reservation.Status = LibraryConstants.ReservationStatus.Approved;

                            if (reservation.User != null && !string.IsNullOrEmpty(reservation.User.Email))
                            {
                                string subject = "Rezervasiya etdiyiniz kitab artıq mövcuddur!";
                                string message = $"Hörmətli {reservation.User.FullName},<br><br>"
                                               + $"Rezerv etdiyiniz <strong>'{reservation.Book.Title}'</strong> kitabı artıq kitabxanadadır və sizin üçün ayrılmışdır. "
                                               + "Zəhmət olmasa yaxınlaşaraq kitabı təhvil alın.<br><br>Hörmətlə,<br>Kitabxana İdarəetmə Sistemi";

                                await emailService.SendEmailAsync(reservation.User.Email, subject, message);
                            }
                        }
                    }

                    if (pendingReservations.Any())
                    {
                        await dbContext.SaveChangesAsync(stoppingToken);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ReservationBackgroundService] Error: {ex.Message}");
                }

                // Hər 5 dəqiqədən bir yoxla
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
    }
}
