using Domain.Interfaces;
using MediatR;

namespace Application.Features.Readers.RenewSubscription;

public record RenewSubscriptionCommand(int UserId) : IRequest<DateOnly>;

public class RenewSubscriptionHandler : IRequestHandler<RenewSubscriptionCommand, DateOnly>
{
    private readonly IReaderRepository _readerRepository;

    public RenewSubscriptionHandler(IReaderRepository readerRepository)
    {
        _readerRepository = readerRepository;
    }

    public async Task<DateOnly> Handle(RenewSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var reader = await _readerRepository.GetByUserIdAsync(request.UserId, cancellationToken)
            ?? throw new KeyNotFoundException($"Reader profile not found for user {request.UserId}.");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var baseDate = reader.SubscriptionExpiry.HasValue && reader.SubscriptionExpiry.Value > today
            ? reader.SubscriptionExpiry.Value
            : today;

        var newExpiry = baseDate.AddMonths(1);

        await _readerRepository.UpdateSubscriptionAsync(reader.ReaderId, newExpiry, cancellationToken);

        return newExpiry;
    }
}
