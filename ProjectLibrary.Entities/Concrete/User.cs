//using Microsoft.AspNetCore.Identity;
//using System.ComponentModel.DataAnnotations;

//namespace ProjectLibrary.Server.Entities
//{
//    public class User:IdentityUser
//    {
//        [Key]
//        public int UserId { get; set; }

//        [Required]
//        public string FullName { get; set; }

//        [Required] 
//        [EmailAddress]
//        public string Email { get; set; }

//        [Required]
//        public string Password { get; set; }

//        [Required]
//        public string Role { get; set; } // "Admin" or "User"

//        // Navigation properties
//        public ICollection<BorrowedBook> BorrowedBooks { get; set; }
//        public ICollection<Reservation> Reservations { get; set; }
//        public ICollection<Notification> Notifications { get; set; }
//        public Statistics Statistics { get; set; }
//    }
//}

//using Microsoft.AspNetCore.Identity;
//using System.Collections.Generic;
//using System.ComponentModel.DataAnnotations;

//namespace ProjectLibrary.Server.Entities
//{
//    public class User : IdentityUser
//    {
//        [Required]
//        public string FullName { get; set; }

//        [Required]
//        public string Role { get; set; } // "Admin" or "User"

//        // Navigation properties
//        public ICollection<BorrowedBook> BorrowedBooks { get; set; }
//        public ICollection<Reservation> Reservations { get; set; }
//        public ICollection<Notification> Notifications { get; set; }
//        public Statistics Statistics { get; set; }
//    }
//}


using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;



namespace ProjectLibrary.Entities.Concrete
{
    public class User : IdentityUser
    {
        [Required]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        public override string Email { get; set; }

        [Required]
        public string Role { get; set; } // "Admin" ya da  "User"

        public ICollection<BorrowedBook> BorrowedBooks { get; set; }
        public ICollection<Reservation> Reservations { get; set; }
        public ICollection<Notification> Notifications { get; set; }
        public Statistics Statistics { get; set; }
    }
}