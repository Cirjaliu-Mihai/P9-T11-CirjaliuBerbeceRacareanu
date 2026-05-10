namespace Application.DTOs.Reports;

public record BlacklistReportDto(
    int PenaltyId,
    int ReaderId,
    string Username,
    string Email,
    string LibraryCardNumber,
    int? LoanId,
    int? BranchId,
    string? BranchName,
    string? Reason,
    decimal PenaltyAmount,
    bool IsResolved);