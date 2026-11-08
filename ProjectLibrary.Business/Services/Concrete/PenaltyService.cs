using Microsoft.EntityFrameworkCore;
using ProjectLibrary.DataAccess.Data;
using ProjectLibrary.Entities.Concrete;
using ProjectLibrary.Entities.Dtos;

namespace ProjectLibrary.Business.Services.Abstract
{
    public interface IPenaltyService
    {
        Task<List<Penalty>> GetUserPenaltiesAsync(string userId);
        Task<List<Penalty>> GetAllPenaltiesAsync();
        Task<Penalty> CreatePenaltyAsync(CreatePenaltyDto dto);
        Task<bool> PayPenaltyAsync(int penaltyId);
        Task CalculateOverduePenaltiesAsync();
    }
}

namespace ProjectLibrary.Business.Services.Concrete
{
    public class PenaltyService : Abstract.IPenaltyService
    {
        private readonly LibraryDbContext _context;

        public PenaltyService(LibraryDbContext context)
        {
            _context = context;
        }

        public async Task<List<Penalty>> GetUserPenaltiesAsync(string userId)
        {
            return await _context.Penalties
                .Include(p => p.BorrowedBook)
                    .ThenInclude(bb => bb!.Book)
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Penalty>> GetAllPenaltiesAsync()
        {
            return await _context.Penalties
                .Include(p => p.User)
                .Include(p => p.BorrowedBook)
                    .ThenInclude(bb => bb!.Book)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<Penalty> CreatePenaltyAsync(CreatePenaltyDto dto)
        {
            var penalty = new Penalty
            {
                UserId = dto.UserId,
                BorrowId = dto.BorrowId,
                Amount = dto.Amount,
                Reason = dto.Reason,
                IsPaid = false,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Penalties.AddAsync(penalty);
            await _context.SaveChangesAsync();
            return penalty;
        }

        public async Task<bool> PayPenaltyAsync(int penaltyId)
        {
            var penalty = await _context.Penalties.FindAsync(penaltyId);
            if (penalty == null) return false;

            penalty.IsPaid = true;
            penalty.PaidAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task CalculateOverduePenaltiesAsync()
        {
            var now = DateTime.UtcNow;
            var overdueBorrows = await _context.BorrowedBooks
                .Include(bb => bb.Book)
                .Where(bb => bb.Status == LibraryConstants.BorrowStatus.Borrowed &&
                             bb.ReturnDate.HasValue && bb.ReturnDate.Value < now)
                .ToListAsync();

            const decimal dailyFee = 0.50m; // Gündəlik 50 qəpik cərimə

            foreach (var borrow in overdueBorrows)
            {
                var daysLate = (int)(now - borrow.ReturnDate!.Value).TotalDays;
                if (daysLate <= 0) continue;

                var expectedAmount = daysLate * dailyFee;

                var existingPenalty = await _context.Penalties
                    .FirstOrDefaultAsync(p => p.BorrowId == borrow.BorrowId && !p.IsPaid);

                if (existingPenalty != null)
                {
                    existingPenalty.Amount = expectedAmount;
                    existingPenalty.Reason = $"Gecikmə ({daysLate} gün)";
                }
                else
                {
                    await _context.Penalties.AddAsync(new Penalty
                    {
                        UserId = borrow.UserId,
                        BorrowId = borrow.BorrowId,
                        Amount = expectedAmount,
                        Reason = $"Gecikmə ({daysLate} gün)",
                        IsPaid = false,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}
