using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectLibrary.Entities.Concrete
{
    public class RoomBooking
    {
        [Key]
        public int BookingId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string RoomOrSeatNumber { get; set; } = string.Empty; // Məs: "Masa-12", "Fərdi Otaq 3"

        public DateTime BookingDate { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public string Status { get; set; } = "Confirmed"; // "Confirmed", "Cancelled", "Completed"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
