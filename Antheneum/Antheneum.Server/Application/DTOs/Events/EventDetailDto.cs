namespace Application.DTOs.Events;

public record EventDetailDto(
    int EventId,
    string Title,
    string? Description,
    DateTime StartDate,
    DateTime EndDate,
    string BranchName,
    int BranchId,
    int MaxSeats,
    int EnrolledCount,
    bool IsEnrolled,
    string? CoverImageUrl);
