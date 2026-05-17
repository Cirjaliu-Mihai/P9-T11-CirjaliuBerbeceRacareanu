using Domain.Entities;

namespace Domain.Interfaces;

public interface IEventRepository
{
    // Get active events (today + future) for public/reader view
    Task<(IEnumerable<EventModel> Items, int TotalCount)> GetActiveEventsAsync(
        int page, int pageSize, CancellationToken cancellationToken = default);

    // Get single event detail by ID
    Task<EventModel?> GetByIdAsync(int eventId, CancellationToken cancellationToken = default);

    // Get admin split view: upcoming and past events
    Task<(IEnumerable<EventModel> Upcoming, IEnumerable<EventModel> Past)> GetAdminViewAsync(
        CancellationToken cancellationToken = default);

    // Create new event
    Task<EventModel> CreateAsync(EventModel eventModel, CancellationToken cancellationToken = default);

    // Update event
    Task<EventModel> UpdateAsync(EventModel eventModel, CancellationToken cancellationToken = default);

    // Delete event
    Task DeleteAsync(int eventId, CancellationToken cancellationToken = default);

    // Get enrolled readers for an event with paging
    Task<(IEnumerable<(int ReaderId, string Username, string Email, string LibraryCardNumber)> Attendees, int TotalCount)> GetEventAttendeesAsync(
        int eventId, int page, int pageSize, CancellationToken cancellationToken = default);

    // Get enrolled count for an event
    Task<int> GetEnrolledCountAsync(int eventId, CancellationToken cancellationToken = default);

    // Enroll a reader in an event
    Task<bool> EnrollReaderAsync(int eventId, int readerId, CancellationToken cancellationToken = default);

    // Remove a reader from an event
    Task<bool> RemoveReaderAsync(int eventId, int readerId, CancellationToken cancellationToken = default);

    // Check if a reader is enrolled in an event
    Task<bool> IsReaderEnrolledAsync(int eventId, int readerId, CancellationToken cancellationToken = default);

    // Check if event exists
    Task<bool> EventExistsAsync(int eventId, CancellationToken cancellationToken = default);
}
