using Application.DTOs.Payments;
using Application.Interfaces;
using Domain.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Payments.CreateStripeCheckoutSession;

public record CreateStripeCheckoutSessionCommand(
    int UserId,
    string PurchaseType,
    string SuccessUrl,
    string CancelUrl) : IRequest<StripeCheckoutSessionDto>;

public class CreateStripeCheckoutSessionHandler : IRequestHandler<CreateStripeCheckoutSessionCommand, StripeCheckoutSessionDto>
{
    private const long SubscriptionMonthlyPriceMinorUnits = 3999;

    private readonly IReaderRepository _readerRepository;
    private readonly ILoanRepository _loanRepository;
    private readonly IStripeCheckoutService _stripeCheckoutService;

    public CreateStripeCheckoutSessionHandler(
        IReaderRepository readerRepository,
        ILoanRepository loanRepository,
        IStripeCheckoutService stripeCheckoutService)
    {
        _readerRepository = readerRepository;
        _loanRepository = loanRepository;
        _stripeCheckoutService = stripeCheckoutService;
    }

    public async Task<StripeCheckoutSessionDto> Handle(CreateStripeCheckoutSessionCommand request, CancellationToken cancellationToken)
    {
        var normalizedType = request.PurchaseType.Trim().ToLowerInvariant();

        var reader = await _readerRepository.GetByUserIdAsync(request.UserId, cancellationToken)
            ?? throw new KeyNotFoundException($"Reader profile not found for user {request.UserId}.");

        var (amountInMinorUnits, productName) = await ResolveLineItemAsync(normalizedType, reader.ReaderId, cancellationToken);

        var metadata = new Dictionary<string, string>
        {
            ["userId"] = request.UserId.ToString(),
            ["readerId"] = reader.ReaderId.ToString(),
            ["purchaseType"] = normalizedType
        };

        var session = await _stripeCheckoutService.CreateCheckoutSessionAsync(
            amountInMinorUnits,
            "ron",
            productName,
            request.SuccessUrl,
            request.CancelUrl,
            metadata,
            reader.Email,
            cancellationToken);

        return new StripeCheckoutSessionDto(session.SessionId, session.Url);
    }

    private async Task<(long AmountInMinorUnits, string ProductName)> ResolveLineItemAsync(
        string purchaseType,
        int readerId,
        CancellationToken cancellationToken)
    {
        return purchaseType switch
        {
            "subscription" => (SubscriptionMonthlyPriceMinorUnits, "Antheneum Monthly Subscription"),
            "fines" => await ResolveFinesLineItemAsync(readerId, cancellationToken),
            _ => throw new DomainException("Unsupported purchase type.")
        };
    }

    private async Task<(long AmountInMinorUnits, string ProductName)> ResolveFinesLineItemAsync(
        int readerId,
        CancellationToken cancellationToken)
    {
        var totalFines = await _loanRepository.GetTotalUnresolvedFinesAsync(readerId, cancellationToken);
        if (totalFines <= 0)
        {
            throw new DomainException("There are no outstanding fines to pay.");
        }

        var amountInMinorUnits = (long)Math.Round(totalFines * 100m, MidpointRounding.AwayFromZero);
        return (amountInMinorUnits, "Antheneum Outstanding Fines");
    }
}
