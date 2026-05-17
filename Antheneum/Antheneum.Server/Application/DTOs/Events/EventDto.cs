namespace Application.DTOs.Events;

public record EventDto(
    int EventId,
    string Title,
    string? Description,
    DateTime StartDate,
    DateTime EndDate,
    string BranchName,
    int MaxSeats,
    int EnrolledCount,
    string? CoverImageUrl);
