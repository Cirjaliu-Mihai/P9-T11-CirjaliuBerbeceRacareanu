namespace Application.DTOs.Loans;

public record LoanDto(
    int LoanId,
    int CopyId,
    string BookTitle,
    string Isbn,
    string BranchName,
    DateOnly LoanDate,
    DateOnly DueDate,
    DateOnly? ActualReturnDate,
    bool IsActive,
    bool IsRenewed,
    string? CopyStatus);
