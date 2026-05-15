using Domain.Interfaces;
using MediatR;

namespace Application.Features.Readers.ResolveAllPenalties;

public class ResolveAllPenaltiesHandler : IRequestHandler<ResolveAllPenaltiesQuery>
{
    private readonly IReaderRepository _readerRepository;

    public ResolveAllPenaltiesHandler(IReaderRepository readerRepository)
    {
        _readerRepository = readerRepository;
    }

    public async Task Handle(ResolveAllPenaltiesQuery request, CancellationToken cancellationToken)
    {
        await _readerRepository.ResolveAllPenaltiesAsync(request.ReaderId, cancellationToken);
    }
}
