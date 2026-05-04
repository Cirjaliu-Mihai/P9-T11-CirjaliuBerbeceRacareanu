namespace Domain.Entities;

public class BookAvailabilityModel
{
    public int CopyId { get; init; }
    public string BranchName { get; init; } = string.Empty;
    public string? Status { get; init; }
}
