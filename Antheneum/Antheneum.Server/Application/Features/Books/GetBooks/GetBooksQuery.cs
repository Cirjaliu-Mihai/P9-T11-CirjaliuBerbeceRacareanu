using Application.DTOs.Books;
using MediatR;

namespace Application.Features.Books.GetBooks;

public record GetBooksQuery(
    string? Search,
    int Page = 1,
    int PageSize = 10,
    string? Author = null,
    string? Publisher = null) : IRequest<PagedResult<BookDto>>;
