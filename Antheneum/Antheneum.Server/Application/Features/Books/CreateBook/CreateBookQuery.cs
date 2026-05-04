using Application.DTOs.Books;
using MediatR;

namespace Application.Features.Books.CreateBook;

public record CreateBookQuery(
    string Isbn,
    string Title,
    string? Authors,
    string? Publisher,
    Stream? CoverImageStream,
    string? CoverImageContentType) : IRequest<BookDto>;
