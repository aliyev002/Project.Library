
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using ProjectLibrary.Entities.Concrete.LibraryAPI.Models;

namespace ProjectLibrary.Entities.Concrete
{


    public class BorrowedBook
    {
        [Key]
        public int BorrowId { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required]
        public int BookId { get; set; }

        [Required]
        public DateTime BorrowDate { get; set; }

        public DateTime? ReturnDate { get; set; }

        [Required]
        public string Status { get; set; } // "Borrowed", "Returned" ,...

        
        [ForeignKey("UserId")]
        public User User { get; set; }

        [ForeignKey("BookId")]
        public Book Book { get; set; }

        public ICollection<ExtensionRequest> ExtensionRequests { get; set; }
    }

}
