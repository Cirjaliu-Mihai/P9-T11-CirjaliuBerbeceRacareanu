using Domain.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Books.AddCopy;

public class AddCopyHandler : IRequestHandler<AddCopyQuery>
{
    private readonly IBookRepository _bookRepository;

    public AddCopyHandler(IBookRepository bookRepository)
    {
        _bookRepository = bookRepository;
    }

    public async Task Handle(AddCopyQuery request, CancellationToken cancellationToken)
    {
        if (request.Count < 1)
            throw new DomainException("Count must be at least 1.");

        var book = await _bookRepository.GetByIdAsync(request.BookId, cancellationToken)
            ?? throw new KeyNotFoundException($"Book with id {request.BookId} was not found.");

        var branchExists = await _bookRepository.BranchExistsAsync(request.BranchId, cancellationToken);
        if (!branchExists)
            throw new KeyNotFoundException($"Branch with id {request.BranchId} was not found.");

        await _bookRepository.AddCopiesAsync(request.BookId, request.BranchId, request.Count, cancellationToken);
    }
}
