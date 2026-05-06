using Domain.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Readers.RemoveFromBlacklist;

public class RemoveFromBlacklistHandler : IRequestHandler<RemoveFromBlacklistQuery>
{
    private readonly IReaderRepository _readerRepository;

    public RemoveFromBlacklistHandler(IReaderRepository readerRepository)
    {
        _readerRepository = readerRepository;
    }

    public async Task Handle(RemoveFromBlacklistQuery request, CancellationToken cancellationToken)
    {
        var reader = await _readerRepository.GetByIdAsync(request.ReaderId, cancellationToken)
            ?? throw new KeyNotFoundException($"Reader with ID {request.ReaderId} was not found.");

        if (!reader.IsBlacklisted)
            throw new ConflictException($"Reader with ID {request.ReaderId} is not blacklisted.");

        await _readerRepository.RemoveFromBlacklistAsync(request.ReaderId, cancellationToken);
    }
}
