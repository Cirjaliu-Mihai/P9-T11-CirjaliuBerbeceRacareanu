using Domain.Interfaces;
using MediatR;

namespace Application.Features.Readers.ResolvePenalty;

public class ResolvePenaltyQueryHandler : IRequestHandler<ResolvePenaltyQuery>
{
    private readonly IReaderRepository _readerRepository;

    public ResolvePenaltyQueryHandler(IReaderRepository readerRepository)
    {
        _readerRepository = readerRepository;
    }

    public async Task Handle(ResolvePenaltyQuery request, CancellationToken cancellationToken)
    {
        await _readerRepository.ResolvePenaltyAsync(request.PenaltyId, cancellationToken);
    }
}