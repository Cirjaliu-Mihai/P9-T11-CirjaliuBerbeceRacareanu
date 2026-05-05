namespace Domain.Entities;

public class BookModel
{
    public int BookId { get; init; }
    public string Isbn { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string? Authors { get; init; }
    public string? Publisher { get; init; }
    public string? ImgUrl { get; init; }
}
