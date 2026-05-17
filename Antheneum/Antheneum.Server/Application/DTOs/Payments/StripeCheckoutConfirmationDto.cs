namespace Application.DTOs.Payments;

public record StripeCheckoutConfirmationDto(
    string PurchaseType,
    string Message,
    DateOnly? SubscriptionExpiry = null);
