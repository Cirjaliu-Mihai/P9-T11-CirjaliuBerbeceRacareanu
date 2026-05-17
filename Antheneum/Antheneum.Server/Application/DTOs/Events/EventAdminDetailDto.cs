namespace Application.DTOs.Events;

public record EventAdminDetailDto(
    int EventId,
    string Title,
    string? Description,
    DateTime StartDate,
    DateTime EndDate,
    string BranchName,
    int BranchId,
    int MaxSeats,
    int EnrolledCount,
    string? CoverImageUrl,
    List<EventAttendeeDto> Attendees);

public record EventAttendeeDto(
    int ReaderId,
    string Username,
    string Email,
    string LibraryCardNumber);
