namespace API.Requests;

public record CreateStripeCheckoutSessionRequest(
    string PurchaseType,
    string SuccessUrl,
    string CancelUrl);
