using Domain.Entities;

namespace Domain.Interfaces;

public interface IReportRepository
{
    Task<(IEnumerable<InventoryReportModel> Items, int TotalCount)> GetInventoryAsync(
        int? branchId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<(IEnumerable<OverdueReportModel> Items, int TotalCount)> GetOverdueAsync(
        int? branchId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<(IEnumerable<BlacklistReportModel> Items, int TotalCount)> GetBlacklistAsync(
        int? branchId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<(IEnumerable<TransactionReportModel> Items, int TotalCount)> GetTransactionsAsync(
        DateOnly from,
        DateOnly to,
        int? branchId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
}