namespace Domain.Entities;

public class LoanModel
{
    public int LoanId { get; init; }
    public int CopyId { get; init; }
    public int ReaderId { get; init; }
    public string BookTitle { get; init; } = string.Empty;
    public string Isbn { get; init; } = string.Empty;
    public string BranchName { get; init; } = string.Empty;
    public DateOnly LoanDate { get; init; }
    public DateOnly DueDate { get; init; }
    public DateOnly? ActualReturnDate { get; init; }
    public bool IsActive => ActualReturnDate is null;
    public bool IsRenewed => DueDate > LoanDate.AddDays(14);
}
