namespace Domain.Entities;

public class InventoryReportModel
{
    public int BranchId { get; init; }
    public string BranchName { get; init; } = string.Empty;
    public int BookId { get; init; }
    public string Isbn { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public int TotalCopies { get; init; }
    public int AvailableCopies { get; init; }
    public int BorrowedCopies { get; init; }
}