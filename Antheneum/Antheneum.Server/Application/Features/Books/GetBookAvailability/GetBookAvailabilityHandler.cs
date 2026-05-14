using Application.DTOs.Books;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Books.GetBookAvailability;

public class GetBookAvailabilityHandler : IRequestHandler<GetBookAvailabilityQuery, IEnumerable<BookAvailabilityDto>>
{
    private readonly IBookRepository _bookRepository;

    public GetBookAvailabilityHandler(IBookRepository bookRepository)
    {
        _bookRepository = bookRepository;
    }

    public async Task<IEnumerable<BookAvailabilityDto>> Handle(GetBookAvailabilityQuery request, CancellationToken cancellationToken)
    {
        var book = await _bookRepository.GetByIdAsync(request.BookId, cancellationToken)
            ?? throw new KeyNotFoundException($"Book with id {request.BookId} was not found.");

        var availability = await _bookRepository.GetAvailabilityAsync(book.BookId, cancellationToken);

        return availability.Select(a => new BookAvailabilityDto(a.CopyId, a.BranchName, a.Status, a.BorrowerName));
    }
}
