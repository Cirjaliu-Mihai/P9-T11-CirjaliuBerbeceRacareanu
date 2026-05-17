namespace Application.DTOs.Events;

public record EventFormValue(
    int? EventId,
    string Title,
    string? Description,
    int BranchId,
    DateTime StartDate,
    DateTime EndDate,
    int MaxSeats,
    string? CoverImageUrl);
