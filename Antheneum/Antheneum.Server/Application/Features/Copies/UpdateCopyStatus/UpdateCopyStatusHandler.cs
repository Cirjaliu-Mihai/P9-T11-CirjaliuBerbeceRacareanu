using Domain.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Copies.UpdateCopyStatus;

public class UpdateCopyStatusHandler : IRequestHandler<UpdateCopyStatusQuery>
{
    private static readonly HashSet<string> AllowedStatuses =
        new(StringComparer.OrdinalIgnoreCase) { "Available", "Borrowed", "Lost" };

    private readonly IBookRepository _bookRepository;

    public UpdateCopyStatusHandler(IBookRepository bookRepository)
    {
        _bookRepository = bookRepository;
    }

    public async Task Handle(UpdateCopyStatusQuery request, CancellationToken cancellationToken)
    {
        if (!AllowedStatuses.Contains(request.Status))
            throw new DomainException($"Invalid status '{request.Status}'. Allowed values: Available, Borrowed, Lost.");

        var exists = await _bookRepository.CopyExistsAsync(request.CopyId, cancellationToken);
        if (!exists)
            throw new KeyNotFoundException($"Copy with id {request.CopyId} was not found.");

        await _bookRepository.UpdateCopyStatusAsync(request.CopyId, request.Status, cancellationToken);
    }
}
