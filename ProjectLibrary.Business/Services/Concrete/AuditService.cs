using Microsoft.EntityFrameworkCore;
using ProjectLibrary.DataAccess.Data;
using ProjectLibrary.Entities.Concrete;

namespace ProjectLibrary.Business.Services.Abstract
{
    public interface IAuditService
    {
        Task LogAsync(string? userId, string? userName, string action, string entityName, string? entityId, string? details, string? ipAddress = null);
        Task<List<AuditLog>> GetRecentLogsAsync(int count = 100);
    }
}

namespace ProjectLibrary.Business.Services.Concrete
{
    public class AuditService : Abstract.IAuditService
    {
        private readonly LibraryDbContext _context;

        public AuditService(LibraryDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(string? userId, string? userName, string action, string entityName, string? entityId, string? details, string? ipAddress = null)
        {
            var log = new AuditLog
            {
                UserId = userId,
                UserName = userName,
                Action = action,
                EntityName = entityName,
                EntityId = entityId,
                Details = details,
                IpAddress = ipAddress,
                Timestamp = DateTime.UtcNow
            };

            await _context.AuditLogs.AddAsync(log);
            await _context.SaveChangesAsync();
        }

        public async Task<List<AuditLog>> GetRecentLogsAsync(int count = 100)
        {
            return await _context.AuditLogs
                .OrderByDescending(a => a.Timestamp)
                .Take(count)
                .ToListAsync();
        }
    }
}
