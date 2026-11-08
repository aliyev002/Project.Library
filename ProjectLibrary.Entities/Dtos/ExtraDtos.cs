using System.ComponentModel.DataAnnotations;

namespace ProjectLibrary.Entities.Dtos
{
    public class CreateReviewDto
    {
        [Required]
        public int BookId { get; set; }

        [Range(1, 5, ErrorMessage = "Reytinq 1 ilə 5 arasında olmalıdır.")]
        public int Rating { get; set; }

        [Required(ErrorMessage = "Rəy mətni daxil edilməlidir.")]
        [MaxLength(1000, ErrorMessage = "Rəy maksimum 1000 simvol ola bilər.")]
        public string Comment { get; set; } = string.Empty;
    }

    public class CreateSuggestionDto
    {
        [Required(ErrorMessage = "Kitabın adı mütləqdir.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Müəllif adı mütləqdir.")]
        public string Author { get; set; } = string.Empty;

        public string? Genre { get; set; }
        public string Type { get; set; } = "Suggestion"; // "Suggestion" ya da "Donation"
        public string? Note { get; set; }
    }

    public class CreateRoomBookingDto
    {
        [Required(ErrorMessage = "Masa və ya otaq nömrəsi seçilməlidir.")]
        public string RoomOrSeatNumber { get; set; } = string.Empty;

        [Required]
        public DateTime BookingDate { get; set; }

        [Required]
        public string StartTime { get; set; } = "09:00"; // "HH:mm"

        [Required]
        public string EndTime { get; set; } = "11:00";
    }

    public class UserProfileUpdateDto
    {
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? AvatarUrl { get; set; }
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
    }

    public class CreatePenaltyDto
    {
        [Required]
        public string UserId { get; set; } = string.Empty;
        public int? BorrowId { get; set; }
        public decimal Amount { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
