namespace Domain.Entities;

public class OverdueReportModel
{
    public int ReaderId { get; init; }
    public string Username { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string LibraryCardNumber { get; init; } = string.Empty;
    public int LoanId { get; init; }
    public int BranchId { get; init; }
    public string BranchName { get; init; } = string.Empty;
    public string BookTitle { get; init; } = string.Empty;
    public DateOnly LoanDate { get; init; }
    public DateOnly DueDate { get; init; }
    public int OverdueDays { get; init; }
    public decimal LoanFineTotal { get; init; }
}