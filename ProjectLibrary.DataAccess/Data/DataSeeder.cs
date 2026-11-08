using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ProjectLibrary.Entities.Concrete;

namespace ProjectLibrary.DataAccess.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<LibraryDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            // 0. Baza sxeminin avtomatik yenilənməsi (sütunlar və yeni cədvəllər)
            await EnsureSchemaUpdatedAsync(context);

            // 1. Rolların yaradılması
            string[] roles = { LibraryConstants.Roles.Admin, LibraryConstants.Roles.User };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            // 2. İlkin Admin istifadəçisinin yaradılması
            var adminEmail = "admin@library.com";
            var existingAdmin = await userManager.FindByEmailAsync(adminEmail);
            if (existingAdmin == null)
            {
                var adminUser = new User
                {
                    UserName = "admin",
                    Email = adminEmail,
                    FullName = "Sistem Admini",
                    Role = LibraryConstants.Roles.Admin,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow
                };

                var result = await userManager.CreateAsync(adminUser, "Admin123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, LibraryConstants.Roles.Admin);
                }
            }

            // 3. Əgər heç bir kitab yoxdursa, ilkin nümunəvi kitabların əlavə edilməsi
            if (!await context.Books.AnyAsync())
            {
                var sampleBooks = new List<Book>
                {
                    new Book
                    {
                        Title = "Dəli Kür",
                        Author = "İsmayıl Şıxlı",
                        Genre = "Roman",
                        TotalCopies = 5,
                        AvailableCopies = 5,
                        Description = "Azərbaycan ədəbiyyatının şah əsərlərindən biri olan 'Dəli Kür' romanı Kür sahilindəki həyatı və dəyişiklikləri təsvir edir.",
                        ImageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
                        CreatedAt = DateTime.UtcNow
                    },
                    new Book
                    {
                        Title = "1984",
                        Author = "George Orwell",
                        Genre = "Antiutopiya",
                        TotalCopies = 4,
                        AvailableCopies = 4,
                        Description = "Corc Oruellin totalitarizm və nəzarət cəmiyyətini ifşa edən məşhur antiutopik şah əsəri.",
                        ImageUrl = "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=600&q=80",
                        CreatedAt = DateTime.UtcNow
                    },
                    new Book
                    {
                        Title = "Qürur və Qərəz",
                        Author = "Jane Austen",
                        Genre = "Klassika",
                        TotalCopies = 3,
                        AvailableCopies = 3,
                        Description = "Ceyn Ostinin cəmiyyət, əxlaq, sevgi və sinfi fərqləri incə yumorla qələmə aldığı dünya şöhrətli romanı.",
                        ImageUrl = "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
                        CreatedAt = DateTime.UtcNow
                    },
                    new Book
                    {
                        Title = "Cinayət və Cəza",
                        Author = "Fyodor Dostoyevski",
                        Genre = "Psixoloji",
                        TotalCopies = 6,
                        AvailableCopies = 6,
                        Description = "Raskolnikovun daxili vicdan əzabları və psixoloji böhranını təsvir edən dahi rus klassiki.",
                        ImageUrl = "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
                        CreatedAt = DateTime.UtcNow
                    },
                    new Book
                    {
                        Title = "Körpü",
                        Author = "Elçin",
                        Genre = "Dram",
                        TotalCopies = 2,
                        AvailableCopies = 2,
                        Description = "Müasir Azərbaycan nəsrinə aid maraqlı və düşündürücü hekayələr toplusu.",
                        ImageUrl = "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80",
                        CreatedAt = DateTime.UtcNow
                    }
                };

                await context.Books.AddRangeAsync(sampleBooks);
                await context.SaveChangesAsync();
            }
        }

        private static async Task EnsureSchemaUpdatedAsync(LibraryDbContext context)
        {
            try
            {
                var sql = @"
-- 1. AspNetUsers cədvəlinə çatışmayan sütunlar
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'AvatarUrl')
BEGIN
    ALTER TABLE AspNetUsers ADD AvatarUrl nvarchar(max) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'CreatedAt')
BEGIN
    ALTER TABLE AspNetUsers ADD CreatedAt datetime2 NOT NULL DEFAULT GETUTCDATE();
END

-- 2. Books cədvəlinə çatışmayan sütunlar
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Books') AND name = 'Isbn')
    ALTER TABLE Books ADD Isbn nvarchar(max) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Books') AND name = 'Publisher')
    ALTER TABLE Books ADD Publisher nvarchar(max) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Books') AND name = 'PublishYear')
    ALTER TABLE Books ADD PublishYear int NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Books') AND name = 'PageCount')
    ALTER TABLE Books ADD PageCount int NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Books') AND name = 'Language')
    ALTER TABLE Books ADD Language nvarchar(max) NULL DEFAULT N'Azərbaycan';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Books') AND name = 'Location')
    ALTER TABLE Books ADD Location nvarchar(max) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Books') AND name = 'PdfUrl')
    ALTER TABLE Books ADD PdfUrl nvarchar(max) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Books') AND name = 'RatingAverage')
    ALTER TABLE Books ADD RatingAverage float NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Books') AND name = 'RatingCount')
    ALTER TABLE Books ADD RatingCount int NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Books') AND name = 'CreatedAt')
    ALTER TABLE Books ADD CreatedAt datetime2 NOT NULL DEFAULT GETUTCDATE();

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Books') AND name = 'IsDeleted')
    ALTER TABLE Books ADD IsDeleted bit NOT NULL DEFAULT 0;

-- 3. Notifications cədvəlinə sütunlar
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Notifications') AND name = 'Title')
    ALTER TABLE Notifications ADD Title nvarchar(max) NOT NULL DEFAULT N'Bildiriş';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Notifications') AND name = 'Type')
    ALTER TABLE Notifications ADD Type nvarchar(max) NOT NULL DEFAULT N'Info';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Notifications') AND name = 'IsRead')
    ALTER TABLE Notifications ADD IsRead bit NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Notifications') AND name = 'CreatedAt')
    ALTER TABLE Notifications ADD CreatedAt datetime2 NOT NULL DEFAULT GETUTCDATE();

-- 4. Yeni Cədvəllər
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BookReviews')
BEGIN
    CREATE TABLE BookReviews (
        ReviewId int IDENTITY(1,1) PRIMARY KEY,
        BookId int NOT NULL,
        UserId nvarchar(450) NOT NULL,
        Rating int NOT NULL,
        Comment nvarchar(1000) NOT NULL,
        CreatedAt datetime2 NOT NULL DEFAULT GETUTCDATE(),
        IsApproved bit NOT NULL DEFAULT 1,
        CONSTRAINT FK_BookReviews_Books FOREIGN KEY (BookId) REFERENCES Books(BookId) ON DELETE CASCADE,
        CONSTRAINT FK_BookReviews_Users FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Wishlists')
BEGIN
    CREATE TABLE Wishlists (
        WishlistId int IDENTITY(1,1) PRIMARY KEY,
        UserId nvarchar(450) NOT NULL,
        BookId int NOT NULL,
        AddedAt datetime2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_Wishlists_Users FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
        CONSTRAINT FK_Wishlists_Books FOREIGN KEY (BookId) REFERENCES Books(BookId) ON DELETE CASCADE
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Penalties')
BEGIN
    CREATE TABLE Penalties (
        PenaltyId int IDENTITY(1,1) PRIMARY KEY,
        UserId nvarchar(450) NOT NULL,
        BorrowId int NULL,
        Amount decimal(18,2) NOT NULL,
        Reason nvarchar(250) NOT NULL,
        IsPaid bit NOT NULL DEFAULT 0,
        CreatedAt datetime2 NOT NULL DEFAULT GETUTCDATE(),
        PaidAt datetime2 NULL,
        CONSTRAINT FK_Penalties_Users FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BookSuggestions')
BEGIN
    CREATE TABLE BookSuggestions (
        SuggestionId int IDENTITY(1,1) PRIMARY KEY,
        UserId nvarchar(450) NOT NULL,
        Title nvarchar(200) NOT NULL,
        Author nvarchar(150) NOT NULL,
        Genre nvarchar(100) NULL,
        Type nvarchar(50) NOT NULL DEFAULT 'Suggestion',
        Status nvarchar(50) NOT NULL DEFAULT 'Pending',
        Note nvarchar(max) NULL,
        CreatedAt datetime2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_BookSuggestions_Users FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RoomBookings')
BEGIN
    CREATE TABLE RoomBookings (
        BookingId int IDENTITY(1,1) PRIMARY KEY,
        UserId nvarchar(450) NOT NULL,
        RoomOrSeatNumber nvarchar(50) NOT NULL,
        BookingDate datetime2 NOT NULL,
        StartTime time NOT NULL,
        EndTime time NOT NULL,
        Status nvarchar(50) NOT NULL DEFAULT 'Confirmed',
        CreatedAt datetime2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_RoomBookings_Users FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLogs')
BEGIN
    CREATE TABLE AuditLogs (
        AuditId int IDENTITY(1,1) PRIMARY KEY,
        UserId nvarchar(max) NULL,
        UserName nvarchar(max) NULL,
        Action nvarchar(100) NOT NULL,
        EntityName nvarchar(100) NOT NULL,
        EntityId nvarchar(max) NULL,
        Details nvarchar(max) NULL,
        IpAddress nvarchar(max) NULL,
        Timestamp datetime2 NOT NULL DEFAULT GETUTCDATE()
    );
END
";
                await context.Database.ExecuteSqlRawAsync(sql);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EnsureSchemaUpdatedAsync] Xəta: {ex.Message}");
            }
        }
    }
}
