using Application.DTOs.Books;
using MediatR;

namespace Application.Features.Books.UpdateBook;

public record UpdateBookQuery(
    int BookId,
    string Title,
    string? Authors,
    string? Publisher,
    Stream? CoverImageStream,
    string? CoverImageContentType) : IRequest<BookDto>;
