namespace Application.DTOs.Loans;

public record ReaderPenaltyDto(
    int PenaltyId,
    string BookTitle,
    string BranchName,
    string? Reason,
    decimal Amount);
