namespace Application.DTOs.Books;

public record BookAvailabilityDto(
    int CopyId,
    string BranchName,
    string? Status,
    string? BorrowerName);
