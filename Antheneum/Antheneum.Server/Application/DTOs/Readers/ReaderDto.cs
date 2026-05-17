namespace Application.DTOs.Readers;

public record ReaderDto(
    int ReaderId,
    int UserId,
    string Username,
    string Email,
    string? Phone,
    string? Address,
    string LibraryCardNumber,
    bool IsBlacklisted,
    DateOnly? SubscriptionExpiry,
    bool HasActiveSubscription,
    string Role);
