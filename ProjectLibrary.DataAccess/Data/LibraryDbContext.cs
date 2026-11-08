using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ProjectLibrary.Entities.Concrete;
using ProjectLibrary.Entities.Concrete.LibraryAPI.Models;

namespace ProjectLibrary.DataAccess.Data
{
    public class LibraryDbContext : IdentityDbContext<User>
    {
        public LibraryDbContext(DbContextOptions<LibraryDbContext> options) : base(options)
        {
        }

        public DbSet<Book> Books { get; set; }
        public DbSet<BorrowedBook> BorrowedBooks { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<ExtensionRequest> ExtensionRequests { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Statistics> Statistics { get; set; }
        public DbSet<BookReview> BookReviews { get; set; }
        public DbSet<Wishlist> Wishlists { get; set; }
        public DbSet<Penalty> Penalties { get; set; }
        public DbSet<BookSuggestion> BookSuggestions { get; set; }
        public DbSet<ReadingGoal> ReadingGoals { get; set; }
        public DbSet<RoomBooking> RoomBookings { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Statistics>()
                .HasOne(s => s.User)
                .WithOne(u => u.Statistics)
                .HasForeignKey<Statistics>(s => s.UserId);

            modelBuilder.Entity<ReadingGoal>()
                .HasOne(g => g.User)
                .WithOne(u => u.ReadingGoal)
                .HasForeignKey<ReadingGoal>(g => g.UserId);

            modelBuilder.Entity<BorrowedBook>()
                .Property(b => b.BorrowDate)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<BorrowedBook>()
                .Property(b => b.Status)
                .HasDefaultValue(LibraryConstants.BorrowStatus.Borrowed);

            modelBuilder.Entity<Reservation>()
                .Property(r => r.ReservationDate)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<Reservation>()
                .Property(r => r.Status)
                .HasDefaultValue(LibraryConstants.ReservationStatus.Pending);

            modelBuilder.Entity<ExtensionRequest>()
                .Property(e => e.RequestedDate)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<ExtensionRequest>()
                .Property(e => e.Status)
                .HasDefaultValue(LibraryConstants.ExtensionStatus.Pending);

            modelBuilder.Entity<Statistics>()
                .Property(s => s.TotalBorrowed)
                .HasDefaultValue(0);

            modelBuilder.Entity<Statistics>()
                .Property(s => s.ReturnedOnTime)
                .HasDefaultValue(0);

            modelBuilder.Entity<Statistics>()
                .Property(s => s.LateReturns)
                .HasDefaultValue(0);
        }
    }
}
