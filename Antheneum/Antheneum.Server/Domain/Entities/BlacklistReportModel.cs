namespace Domain.Entities;

public class BlacklistReportModel
{
    public int PenaltyId { get; init; }
    public int ReaderId { get; init; }
    public string Username { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string LibraryCardNumber { get; init; } = string.Empty;
    public int? LoanId { get; init; }
    public int? BranchId { get; init; }
    public string? BranchName { get; init; }
    public string? Reason { get; init; }
    public decimal PenaltyAmount { get; init; }
    public bool IsResolved { get; init; }
}