namespace Domain.Entities;

public class BranchModel
{
    public int BranchId { get; init; }
    public string UniqueNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Address { get; init; }
}
