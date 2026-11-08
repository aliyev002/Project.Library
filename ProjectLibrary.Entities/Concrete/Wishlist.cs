using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectLibrary.Entities.Concrete
{
    public class Wishlist
    {
        [Key]
        public int WishlistId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public int BookId { get; set; }

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [ForeignKey("BookId")]
        public Book? Book { get; set; }
    }
}
