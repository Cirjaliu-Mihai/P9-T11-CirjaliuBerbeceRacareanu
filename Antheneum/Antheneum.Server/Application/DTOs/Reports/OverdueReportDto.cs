namespace Application.DTOs.Reports;

public record OverdueReportDto(
    int ReaderId,
    string Username,
    string Email,
    string LibraryCardNumber,
    int LoanId,
    int BranchId,
    string BranchName,
    string BookTitle,
    DateOnly LoanDate,
    DateOnly DueDate,
    int OverdueDays,
    decimal LoanFineTotal);