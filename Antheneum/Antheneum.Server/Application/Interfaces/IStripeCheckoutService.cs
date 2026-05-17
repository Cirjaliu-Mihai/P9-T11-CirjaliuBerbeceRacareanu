namespace Application.Interfaces;

public record StripeCheckoutSessionResult(string SessionId, string Url);

public record StripeCheckoutSessionDetails(
    string SessionId,
    string Status,
    string PaymentStatus,
    long? AmountTotal,
    string? Currency,
    IReadOnlyDictionary<string, string> Metadata);

public interface IStripeCheckoutService
{
    Task<StripeCheckoutSessionResult> CreateCheckoutSessionAsync(
        long amountInMinorUnits,
        string currency,
        string productName,
        string successUrl,
        string cancelUrl,
        IReadOnlyDictionary<string, string> metadata,
        string? customerEmail = null,
        CancellationToken cancellationToken = default);

    Task<StripeCheckoutSessionDetails> GetCheckoutSessionAsync(
        string sessionId,
        CancellationToken cancellationToken = default);
}
