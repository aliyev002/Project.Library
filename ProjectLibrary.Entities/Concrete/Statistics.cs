using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace ProjectLibrary.Entities.Concrete
{
    public class Statistics
    {
        [Key]
        public int StatsId { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required]
        public int TotalBorrowed { get; set; }

        [Required]
        public int ReturnedOnTime { get; set; }

        [Required]
        public int LateReturns { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }
    }
}
