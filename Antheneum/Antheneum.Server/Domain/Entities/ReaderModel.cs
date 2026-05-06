using Domain.Enums;

namespace Domain.Entities;

public class ReaderModel
{
    public int ReaderId { get; init; }
    public int UserId { get; init; }
    public string Username { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public string? Address { get; init; }
    public string LibraryCardNumber { get; init; } = string.Empty;
    public bool IsBlacklisted { get; init; }
    public Role Role { get; init; }
}
