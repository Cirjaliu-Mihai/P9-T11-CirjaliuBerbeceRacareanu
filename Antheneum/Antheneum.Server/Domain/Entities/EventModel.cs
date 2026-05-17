namespace Domain.Entities;

public class EventModel
{
    public int EventId { get; init; }
    public int BranchId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public int MaxSeats { get; init; }
    public string? CoverImageUrl { get; init; }
}
