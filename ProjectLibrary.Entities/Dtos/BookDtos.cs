using System.ComponentModel.DataAnnotations;

namespace ProjectLibrary.Entities.Dtos
{
    public class BookCreateDto
    {
        [Required(ErrorMessage = "Kitabın adı mütləqdir.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Müəllifin adı mütləqdir.")]
        public string Author { get; set; } = string.Empty;

        [Required(ErrorMessage = "Janr mütləqdir.")]
        public string Genre { get; set; } = string.Empty;

        [Range(1, 1000, ErrorMessage = "Ümumi nüsxə sayı 1-1000 arasında olmalıdır.")]
        public int TotalCopies { get; set; }

        [Required(ErrorMessage = "Təsvir mütləqdir.")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şəkil linki və ya faylı mütləqdir.")]
        public string ImageUrl { get; set; } = string.Empty;

        public string? Isbn { get; set; }
        public string? Publisher { get; set; }
        public int? PublishYear { get; set; }
        public int? PageCount { get; set; }
        public string? Language { get; set; } = "Azərbaycan";
        public string? Location { get; set; }
        public string? PdfUrl { get; set; }
    }

    public class BookUpdateDto : BookCreateDto
    {
        public int BookId { get; set; }
        public int AvailableCopies { get; set; }
    }

    public class BookFilterDto
    {
        public string? Query { get; set; }
        public string? Genre { get; set; }
        public string? Author { get; set; }
        public bool? OnlyAvailable { get; set; }
        public int? MinYear { get; set; }
        public int? MaxYear { get; set; }
        public string? SortBy { get; set; } // "title_asc", "title_desc", "rating", "newest"
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 12;
    }
}
