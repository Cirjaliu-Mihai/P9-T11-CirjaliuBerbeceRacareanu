namespace API.Requests;

public record ConfirmStripeCheckoutRequest(
    string PurchaseType,
    string SessionId);
