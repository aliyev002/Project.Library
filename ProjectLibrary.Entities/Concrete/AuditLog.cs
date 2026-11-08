using System.ComponentModel.DataAnnotations;

namespace ProjectLibrary.Entities.Concrete
{
    public class AuditLog
    {
        [Key]
        public int AuditId { get; set; }

        public string? UserId { get; set; }

        public string? UserName { get; set; }

        [Required]
        [MaxLength(100)]
        public string Action { get; set; } = string.Empty; // "CREATE", "UPDATE", "DELETE", "BORROW", "RETURN"

        [Required]
        [MaxLength(100)]
        public string EntityName { get; set; } = string.Empty; // "Book", "BorrowedBook", "User"

        public string? EntityId { get; set; }

        public string? Details { get; set; }

        public string? IpAddress { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
