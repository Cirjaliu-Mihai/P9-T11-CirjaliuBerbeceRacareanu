using Domain.Entities;

namespace Domain.Interfaces;

public interface ILoanRepository
{
    Task<LoanModel> CreateAsync(int copyId, int readerId, DateOnly loanDate, DateOnly dueDate, CancellationToken cancellationToken = default);

    Task<LoanModel?> GetByIdAsync(int loanId, CancellationToken cancellationToken = default);

    Task<int> GetActiveCountForReaderAsync(int readerId, CancellationToken cancellationToken = default);

    Task<bool> IsReaderBlacklistedAsync(int readerId, CancellationToken cancellationToken = default);

    Task<int?> GetReaderIdByUserIdAsync(int userId, CancellationToken cancellationToken = default);

    Task RenewAsync(int loanId, DateOnly newDueDate, CancellationToken cancellationToken = default);

    Task<LoanModel> ReturnAsync(int loanId, DateOnly actualReturnDate, CancellationToken cancellationToken = default);

    Task AddFineAsync(int loanId, int readerId, decimal amount, string reason, CancellationToken cancellationToken = default);

    Task<decimal> GetTotalUnresolvedFinesAsync(int readerId, CancellationToken cancellationToken = default);

    Task BlacklistReaderAsync(int readerId, CancellationToken cancellationToken = default);

    Task<IEnumerable<LoanModel>> GetByReaderIdAsync(int readerId, CancellationToken cancellationToken = default);

    Task<bool> IsCopyAvailableAsync(int copyId, CancellationToken cancellationToken = default);
}
