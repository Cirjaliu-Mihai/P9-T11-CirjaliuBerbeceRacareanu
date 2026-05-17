using Domain.Interfaces;
using MediatR;

namespace Application.Features.Copies.DeleteCopy;

public class DeleteCopyHandler : IRequestHandler<DeleteCopyCommand>
{
    private readonly IBookRepository _bookRepository;

    public DeleteCopyHandler(IBookRepository bookRepository)
    {
        _bookRepository = bookRepository;
    }

    public async Task Handle(DeleteCopyCommand request, CancellationToken cancellationToken)
    {
        var exists = await _bookRepository.CopyExistsAsync(request.CopyId, cancellationToken);
        if (!exists)
            throw new KeyNotFoundException($"Copy with id {request.CopyId} was not found.");

        await _bookRepository.DeleteCopyAsync(request.CopyId, cancellationToken);
    }
}
