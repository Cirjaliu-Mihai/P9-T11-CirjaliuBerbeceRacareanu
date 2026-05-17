using Application.DTOs.Books;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Books.GetBookFilterOptions;

public class GetBookFilterOptionsHandler : IRequestHandler<GetBookFilterOptionsQuery, BookFilterOptionsDto>
{
    private readonly IBookRepository _bookRepository;

    public GetBookFilterOptionsHandler(IBookRepository bookRepository)
    {
        _bookRepository = bookRepository;
    }

    public async Task<BookFilterOptionsDto> Handle(GetBookFilterOptionsQuery request, CancellationToken cancellationToken)
    {
        var (authors, publishers) = await _bookRepository.GetFilterOptionsAsync(cancellationToken);
        return new BookFilterOptionsDto(authors, publishers);
    }
}
