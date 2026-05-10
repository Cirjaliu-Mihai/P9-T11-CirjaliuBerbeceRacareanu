namespace Domain.Entities;

public class TransactionReportModel
{
    public int LoanId { get; init; }
    public int ReaderId { get; init; }
    public string Username { get; init; } = string.Empty;
    public int CopyId { get; init; }
    public int BranchId { get; init; }
    public string BranchName { get; init; } = string.Empty;
    public int BookId { get; init; }
    public string Isbn { get; init; } = string.Empty;
    public string BookTitle { get; init; } = string.Empty;
    public DateOnly LoanDate { get; init; }
    public DateOnly DueDate { get; init; }
    public DateOnly? ActualReturnDate { get; init; }
    public string TransactionStatus { get; init; } = string.Empty;
}