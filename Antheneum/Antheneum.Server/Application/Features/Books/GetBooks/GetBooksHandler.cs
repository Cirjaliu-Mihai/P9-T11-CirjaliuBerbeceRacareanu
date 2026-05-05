using Application.DTOs.Books;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Books.GetBooks;

public class GetBooksHandler : IRequestHandler<GetBooksQuery, PagedResult<BookDto>>
{
    private readonly IBookRepository _bookRepository;

    public GetBooksHandler(IBookRepository bookRepository)
    {
        _bookRepository = bookRepository;
    }

    public async Task<PagedResult<BookDto>> Handle(GetBooksQuery request, CancellationToken cancellationToken)
    {
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var page = Math.Max(request.Page, 1);

        var (items, totalCount) = await _bookRepository.GetAllAsync(
            request.Search, page, pageSize, cancellationToken);

        var dtos = items.Select(b => new BookDto(
            b.BookId, b.Isbn, b.Title, b.Authors, b.Publisher, b.ImgUrl));

        return new PagedResult<BookDto>(dtos, totalCount, page, pageSize);
    }
}
