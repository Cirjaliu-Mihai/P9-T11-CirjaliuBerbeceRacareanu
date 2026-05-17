namespace Application.DTOs.Payments;

public record StripeCheckoutSessionDto(string SessionId, string Url);
