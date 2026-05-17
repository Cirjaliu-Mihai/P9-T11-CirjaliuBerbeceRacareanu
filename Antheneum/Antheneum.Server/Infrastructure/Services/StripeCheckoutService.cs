using Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Stripe;
using Stripe.Checkout;

namespace Infrastructure.Services;

public class StripeCheckoutService : IStripeCheckoutService
{
    private readonly string? _secretKey;
    private readonly SessionService _sessionService;

    public StripeCheckoutService(IConfiguration configuration)
    {
        _secretKey = configuration["Stripe:SecretKey"];
        _sessionService = new SessionService();
    }

    public async Task<StripeCheckoutSessionResult> CreateCheckoutSessionAsync(
        long amountInMinorUnits,
        string currency,
        string productName,
        string successUrl,
        string cancelUrl,
        IReadOnlyDictionary<string, string> metadata,
        CancellationToken cancellationToken = default)
    {
        EnsureApiKeyConfigured();

        var options = new SessionCreateOptions
        {
            Mode = "payment",
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            LineItems =
            [
                new SessionLineItemOptions
                {
                    Quantity = 1,
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = currency,
                        UnitAmount = amountInMinorUnits,
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = productName
                        }
                    }
                }
            ],
            Metadata = metadata.ToDictionary(kv => kv.Key, kv => kv.Value),
            PaymentMethodTypes = ["card"]
        };

        var session = await _sessionService.CreateAsync(options, cancellationToken: cancellationToken);
        return new StripeCheckoutSessionResult(session.Id, session.Url ?? string.Empty);
    }

    public async Task<StripeCheckoutSessionDetails> GetCheckoutSessionAsync(
        string sessionId,
        CancellationToken cancellationToken = default)
    {
        EnsureApiKeyConfigured();

        var session = await _sessionService.GetAsync(sessionId, cancellationToken: cancellationToken);

        var metadata = session.Metadata is null
            ? new Dictionary<string, string>()
            : new Dictionary<string, string>(session.Metadata);

        return new StripeCheckoutSessionDetails(
            SessionId: session.Id,
            Status: session.Status ?? string.Empty,
            PaymentStatus: session.PaymentStatus ?? string.Empty,
            AmountTotal: session.AmountTotal,
            Currency: session.Currency,
            Metadata: metadata);
    }

    private void EnsureApiKeyConfigured()
    {
        if (string.IsNullOrWhiteSpace(_secretKey))
        {
            throw new InvalidOperationException("Stripe secret key is not configured.");
        }

        StripeConfiguration.ApiKey = _secretKey;
    }
}
