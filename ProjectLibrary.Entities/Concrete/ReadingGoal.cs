using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectLibrary.Entities.Concrete
{
    public class ReadingGoal
    {
        [Key]
        public int GoalId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        public int Year { get; set; } = DateTime.UtcNow.Year;

        public int TargetBooksCount { get; set; } = 10;

        public int CompletedBooksCount { get; set; } = 0;

        public int Points { get; set; } = 0;

        public string? Badges { get; set; } // JSON or comma separated: "Novice Reader, Bookworm, Fast Reader"

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
