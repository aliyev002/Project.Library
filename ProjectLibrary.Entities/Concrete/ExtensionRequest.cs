using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace ProjectLibrary.Entities.Concrete
{
    namespace LibraryAPI.Models
    {
        public class ExtensionRequest
        {
            [Key]
            public int RequestId { get; set; }

            [Required]
            public int BorrowId { get; set; }

            [Required]
            public DateTime RequestedDate { get; set; }

            [Required]
            public DateTime NewReturnDate { get; set; }

            [Required]
            public string Status { get; set; } // "Pending", "Approved", "Declined", ...

            
            [ForeignKey("BorrowId")]
            public BorrowedBook BorrowedBook { get; set; }
        }
    }

}
