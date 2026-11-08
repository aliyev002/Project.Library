using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectLibrary.Entities.Concrete
{
    public class BookSuggestion
    {
        [Key]
        public int SuggestionId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Author { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Genre { get; set; } = string.Empty;

        // "Suggestion" (Kitab tələbi/təklifi) və ya "Donation" (Kitab ianəsi)
        [Required]
        public string Type { get; set; } = "Suggestion";

        // "Pending", "Approved", "Rejected"
        public string Status { get; set; } = "Pending";

        public string? Note { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
