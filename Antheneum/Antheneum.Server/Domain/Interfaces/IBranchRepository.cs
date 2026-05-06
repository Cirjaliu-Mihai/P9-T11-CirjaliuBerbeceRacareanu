using Domain.Entities;

namespace Domain.Interfaces;

public interface IBranchRepository
{
    Task<IEnumerable<BranchModel>> GetAllAsync(CancellationToken ct = default);
    Task<BranchModel?> GetByIdAsync(int branchId, CancellationToken ct = default);
    Task<BranchModel?> GetByUniqueNumberAsync(string uniqueNumber, CancellationToken ct = default);
    Task<BranchModel> CreateAsync(BranchModel branch, CancellationToken ct = default);
    Task<BranchModel> UpdateAsync(BranchModel branch, CancellationToken ct = default);
    Task DeleteAsync(int branchId, CancellationToken ct = default);
    Task<bool> HasActiveLoansAsync(int branchId, CancellationToken ct = default);
}
