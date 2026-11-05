using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace ProjectLibrary.Entities.Concrete
{
    public class Reservation
    {
        [Key]
        public int ReservationId { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required]
        public int BookId { get; set; }

        [Required]
        public DateTime ReservationDate { get; set; }

        [Required]
        public string Status { get; set; } // "NotNotified", "IsNotified", "Declined", ...

        [ForeignKey("UserId")]
        public User User { get; set; }

        [ForeignKey("BookId")]
        public Book Book { get; set; }
    }
}
