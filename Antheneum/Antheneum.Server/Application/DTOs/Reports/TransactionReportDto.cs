namespace Application.DTOs.Reports;

public record TransactionReportDto(
    int LoanId,
    int ReaderId,
    string Username,
    int CopyId,
    int BranchId,
    string BranchName,
    int BookId,
    string Isbn,
    string BookTitle,
    DateOnly LoanDate,
    DateOnly DueDate,
    DateOnly? ActualReturnDate,
    string TransactionStatus);