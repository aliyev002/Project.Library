using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectLibrary.Entities.Concrete
{
    public class BookReview
    {
        [Key]
        public int ReviewId { get; set; }

        [Required]
        public int BookId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Range(1, 5)]
        public int Rating { get; set; } // 1 - 5 stars

        [Required]
        [MaxLength(1000)]
        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsApproved { get; set; } = true;

        [ForeignKey("BookId")]
        public Book? Book { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
