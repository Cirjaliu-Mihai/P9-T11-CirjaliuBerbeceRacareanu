using Application.DTOs.Payments;
using Application.Interfaces;
using Domain.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Payments.ConfirmStripeCheckout;

public record ConfirmStripeCheckoutCommand(int UserId, string PurchaseType, string SessionId)
    : IRequest<StripeCheckoutConfirmationDto>;

public class ConfirmStripeCheckoutHandler : IRequestHandler<ConfirmStripeCheckoutCommand, StripeCheckoutConfirmationDto>
{
    private readonly IStripeCheckoutService _stripeCheckoutService;
    private readonly IReaderRepository _readerRepository;

    public ConfirmStripeCheckoutHandler(
        IStripeCheckoutService stripeCheckoutService,
        IReaderRepository readerRepository)
    {
        _stripeCheckoutService = stripeCheckoutService;
        _readerRepository = readerRepository;
    }

    public async Task<StripeCheckoutConfirmationDto> Handle(ConfirmStripeCheckoutCommand request, CancellationToken cancellationToken)
    {
        var normalizedType = request.PurchaseType.Trim().ToLowerInvariant();

        var session = await _stripeCheckoutService.GetCheckoutSessionAsync(request.SessionId, cancellationToken);
        ValidateSession(session, request.UserId, normalizedType);

        var reader = await _readerRepository.GetByUserIdAsync(request.UserId, cancellationToken)
            ?? throw new KeyNotFoundException($"Reader profile not found for user {request.UserId}.");

        var result = normalizedType switch
        {
            "subscription" => await ConfirmSubscriptionAsync(reader, cancellationToken),
            "fines" => await ConfirmFinesAsync(reader.ReaderId, cancellationToken),
            _ => throw new DomainException("Unsupported purchase type.")
        };
        return result;
    }

    private static void ValidateSession(StripeCheckoutSessionDetails session, int userId, string purchaseType)
    {
        if (!string.Equals(session.PaymentStatus, "paid", StringComparison.OrdinalIgnoreCase))
        {
            throw new DomainException("Payment has not been completed.");
        }

        if (!session.Metadata.TryGetValue("userId", out var metadataUserId)
            || !string.Equals(metadataUserId, userId.ToString(), StringComparison.Ordinal))
        {
            throw new UnauthorizedAccessException("Stripe session does not belong to the authenticated user.");
        }

        if (!session.Metadata.TryGetValue("purchaseType", out var metadataType)
            || !string.Equals(metadataType, purchaseType, StringComparison.OrdinalIgnoreCase))
        {
            throw new DomainException("Stripe session does not match the requested payment type.");
        }
    }

    private async Task<StripeCheckoutConfirmationDto> ConfirmSubscriptionAsync(
        Domain.Entities.ReaderModel reader,
        CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var baseDate = reader.SubscriptionExpiry.HasValue && reader.SubscriptionExpiry.Value > today
            ? reader.SubscriptionExpiry.Value
            : today;

        var newExpiry = baseDate.AddMonths(1);
        await _readerRepository.UpdateSubscriptionAsync(reader.ReaderId, newExpiry, cancellationToken);

        return new StripeCheckoutConfirmationDto(
            PurchaseType: "subscription",
            Message: "Subscription was renewed successfully.",
            SubscriptionExpiry: newExpiry);
    }

    private async Task<StripeCheckoutConfirmationDto> ConfirmFinesAsync(int readerId, CancellationToken cancellationToken)
    {
        await _readerRepository.ResolveAllPenaltiesAsync(readerId, cancellationToken);

        return new StripeCheckoutConfirmationDto(
            PurchaseType: "fines",
            Message: "All outstanding fines were marked as paid.");
    }
}
