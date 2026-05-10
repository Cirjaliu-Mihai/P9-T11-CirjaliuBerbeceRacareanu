namespace Application.DTOs.Reports;

public record InventoryReportDto(
    int BranchId,
    string BranchName,
    int BookId,
    string Isbn,
    string Title,
    int TotalCopies,
    int AvailableCopies,
    int BorrowedCopies);