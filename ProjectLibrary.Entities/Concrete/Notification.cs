using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace ProjectLibrary.Entities.Concrete
{
    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public string Title { get; set; } = "Bildiriş";

        [Required]
        public string Message { get; set; } = string.Empty;

        public string Type { get; set; } = "Info"; // "Info", "Success", "Warning", "Error"

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
