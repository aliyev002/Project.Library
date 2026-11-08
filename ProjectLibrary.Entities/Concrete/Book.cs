using System.ComponentModel.DataAnnotations;

namespace ProjectLibrary.Entities.Concrete
{
    public class Book
    {
        [Key]
        public int BookId { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Author { get; set; } = string.Empty;

        [Required]
        public string Genre { get; set; } = string.Empty;

        [Required]
        public int TotalCopies { get; set; }

        [Required]
        public int AvailableCopies { get; set; }

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        // Yeni funksionallıqlar üçün əlavə sahələr
        public string? Isbn { get; set; }
        public string? Publisher { get; set; }
        public int? PublishYear { get; set; }
        public int? PageCount { get; set; }
        public string? Language { get; set; } = "Azərbaycan";
        public string? Location { get; set; } // Məsələn: "Əsas Zal, Rəf A-4"
        public string? PdfUrl { get; set; } // E-Kitab oxu üçün link və ya fayl yolu
        public double RatingAverage { get; set; } = 0.0;
        public int RatingCount { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;

        public ICollection<BorrowedBook>? BorrowedBooks { get; set; }
        public ICollection<Reservation>? Reservations { get; set; }
        public ICollection<BookReview>? Reviews { get; set; }
        public ICollection<Wishlist>? Wishlists { get; set; }
    }
}
