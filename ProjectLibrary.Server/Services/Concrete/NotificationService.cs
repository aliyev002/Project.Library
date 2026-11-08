using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ProjectLibrary.DataAccess.Data;
using ProjectLibrary.Entities.Concrete;
using ProjectLibrary.Server.Hubs;

namespace ProjectLibrary.Server.Services.Abstract
{
    public interface INotificationService
    {
        Task SendNotificationAsync(string userId, string title, string message, string type = "Info");
        Task SendToAdminsAsync(string title, string message, string type = "Info");
        Task<List<Notification>> GetUserNotificationsAsync(string userId);
        Task<bool> MarkAsReadAsync(int notificationId, string userId);
        Task<bool> MarkAllAsReadAsync(string userId);
    }
}

namespace ProjectLibrary.Server.Services.Concrete
{
    public class NotificationService : Abstract.INotificationService
    {
        private readonly LibraryDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(LibraryDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task SendNotificationAsync(string userId, string title, string message, string type = "Info")
        {
            var notification = new Notification
            {
                UserId = userId,
                Title = title,
                Message = message,
                Type = type,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();

            // SignalR ilə həmin istifadəçiyə dərhal canlı göndər
            await _hubContext.Clients.Group($"User_{userId}").SendAsync("ReceiveNotification", new
            {
                notification.NotificationId,
                notification.Title,
                notification.Message,
                notification.Type,
                notification.CreatedAt
            });
        }

        public async Task SendToAdminsAsync(string title, string message, string type = "Info")
        {
            // Bütün adminləri tap
            var admins = await _context.Users
                .Where(u => u.Role == LibraryConstants.Roles.Admin)
                .ToListAsync();

            var notifications = admins.Select(admin => new Notification
            {
                UserId = admin.Id,
                Title = title,
                Message = message,
                Type = type,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            if (notifications.Count > 0)
            {
                await _context.Notifications.AddRangeAsync(notifications);
                await _context.SaveChangesAsync();
            }

            // SignalR ilə bütün aktiv admin pəncərələrinə anında göndər
            await _hubContext.Clients.Group("Admins").SendAsync("ReceiveNotification", new
            {
                NotificationId = notifications.FirstOrDefault()?.NotificationId ?? 0,
                Title = title,
                Message = message,
                Type = type,
                CreatedAt = DateTime.UtcNow
            });
        }

        public async Task<List<Notification>> GetUserNotificationsAsync(string userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(50)
                .ToListAsync();
        }

        public async Task<bool> MarkAsReadAsync(int notificationId, string userId)
        {
            var notif = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId);

            if (notif == null) return false;

            notif.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MarkAllAsReadAsync(string userId)
        {
            var unread = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var n in unread)
            {
                n.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
