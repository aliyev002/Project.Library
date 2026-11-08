using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace ProjectLibrary.Entities.Concrete
{
    public class User : IdentityUser
    {
        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = LibraryConstants.Roles.User; // "Admin" ya da "User"

        public string? AvatarUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<BorrowedBook>? BorrowedBooks { get; set; }
        public ICollection<Reservation>? Reservations { get; set; }
        public ICollection<Notification>? Notifications { get; set; }
        public ICollection<BookReview>? Reviews { get; set; }
        public ICollection<Wishlist>? Wishlists { get; set; }
        public ICollection<Penalty>? Penalties { get; set; }
        public ICollection<BookSuggestion>? Suggestions { get; set; }
        public ICollection<RoomBooking>? RoomBookings { get; set; }
        public ReadingGoal? ReadingGoal { get; set; }
        public Statistics? Statistics { get; set; }
    }
}
