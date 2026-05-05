namespace Application.DTOs.Books;

public record BookDto(
    int BookId,
    string Isbn,
    string Title,
    string? Authors,
    string? Publisher,
    string? ImgUrl);
