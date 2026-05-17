namespace Application.DTOs.Loans;

public record ActiveLoanSummaryDto(
    int LoanId,
    string ReaderName,
    string BookTitle,
    string BranchName,
    DateOnly DueDate,
    int OverdueDays,
    decimal FineAmount);
