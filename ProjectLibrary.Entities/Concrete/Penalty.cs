using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectLibrary.Entities.Concrete
{
    public class Penalty
    {
        [Key]
        public int PenaltyId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        public int? BorrowId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(250)]
        public string Reason { get; set; } = string.Empty;

        public bool IsPaid { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? PaidAt { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [ForeignKey("BorrowId")]
        public BorrowedBook? BorrowedBook { get; set; }
    }
}
