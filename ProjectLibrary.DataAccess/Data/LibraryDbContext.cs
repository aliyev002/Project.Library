//using Microsoft.EntityFrameworkCore;
//using ProjectLibrary.Server.Entities.LibraryAPI.Models;
//using ProjectLibrary.Server.Entities;
//using System.Collections.Generic;
//using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

//namespace ProjectLibrary.Server.Data
//{

//    public class LibraryDbContext : IdentityDbContext<User>
//    {
//        public LibraryDbContext(DbContextOptions<LibraryDbContext> options)
//            : base(options)
//        {
//        }

//        public DbSet<User> Users { get; set; }
//        public DbSet<Book> Books { get; set; }
//        public DbSet<BorrowedBook> BorrowedBooks { get; set; }
//        public DbSet<Reservation> Reservations { get; set; }
//        public DbSet<ExtensionRequest> ExtensionRequests { get; set; }
//        public DbSet<Notification> Notifications { get; set; }
//        public DbSet<Statistics> Statistics { get; set; }

//        protected override void OnModelCreating(ModelBuilder modelBuilder)
//        {
//            // Configure unique constraint for User.Email
//            modelBuilder.Entity<User>()
//                .HasIndex(u => u.Email)
//                .IsUnique();

//            // Configure one-to-one relationship between User and Statistics
//            modelBuilder.Entity<Statistics>()
//                .HasOne(s => s.User)
//                .WithOne(u => u.Statistics)
//                .HasForeignKey<Statistics>(s => s.UserId);

//            // Set default values
//            modelBuilder.Entity<BorrowedBook>()
//                .Property(b => b.BorrowDate)
//                .HasDefaultValueSql("GETDATE()");

//            modelBuilder.Entity<BorrowedBook>()
//                .Property(b => b.Status)
//                .HasDefaultValue("Borrowed");

//            modelBuilder.Entity<Reservation>()
//                .Property(r => r.ReservationDate)
//                .HasDefaultValueSql("GETDATE()");

//            modelBuilder.Entity<Reservation>()
//                .Property(r => r.Status)
//                .HasDefaultValue("Pending");

//            modelBuilder.Entity<ExtensionRequest>()
//                .Property(e => e.RequestedDate)
//                .HasDefaultValueSql("GETDATE()");

//            modelBuilder.Entity<ExtensionRequest>()
//                .Property(e => e.Status)
//                .HasDefaultValue("Pending");

//            modelBuilder.Entity<Statistics>()
//                .Property(s => s.TotalBorrowed)
//                .HasDefaultValue(0);

//            modelBuilder.Entity<Statistics>()
//                .Property(s => s.ReturnedOnTime)
//                .HasDefaultValue(0);

//            modelBuilder.Entity<Statistics>()
//                .Property(s => s.LateReturns)
//                .HasDefaultValue(0);
//        }
//    }
//}



using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ProjectLibrary.Entities.Concrete;
using ProjectLibrary.Entities.Concrete.LibraryAPI.Models;

namespace ProjectLibrary.DataAccess.Data
{
    public class LibraryDbContext : Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityDbContext<User>
    {
        public LibraryDbContext(DbContextOptions<LibraryDbContext> options):base(options)
        {
                
        }

        public DbSet<Book> Books { get; set; }
        public DbSet<BorrowedBook> BorrowedBooks { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<ExtensionRequest> ExtensionRequests { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Statistics> Statistics { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); 

            
            modelBuilder.Entity<Statistics>()
                .HasOne(s => s.User)
                .WithOne(u => u.Statistics)
                .HasForeignKey<Statistics>(s => s.UserId);

            
            modelBuilder.Entity<BorrowedBook>()
                .Property(b => b.BorrowDate)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<BorrowedBook>()
                .Property(b => b.Status)
                .HasDefaultValue("Borrowed");

            modelBuilder.Entity<Reservation>()
                .Property(r => r.ReservationDate)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<Reservation>()
                .Property(r => r.Status)
                .HasDefaultValue("Pending");

            modelBuilder.Entity<ExtensionRequest>()
                .Property(e => e.RequestedDate)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<ExtensionRequest>()
                .Property(e => e.Status)
                .HasDefaultValue("Pending");

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
