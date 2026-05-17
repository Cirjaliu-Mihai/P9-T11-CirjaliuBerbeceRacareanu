namespace Domain.Entities;

public class ReaderPenaltyModel
{
    public int PenaltyId { get; init; }
    public string BookTitle { get; init; } = string.Empty;
    public string BranchName { get; init; } = string.Empty;
    public string? Reason { get; init; }
    public decimal Amount { get; init; }
}
