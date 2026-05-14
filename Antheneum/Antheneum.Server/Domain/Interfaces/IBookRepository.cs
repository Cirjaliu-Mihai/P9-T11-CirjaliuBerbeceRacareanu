using Domain.Entities;

namespace Domain.Interfaces;

public interface IBookRepository
{
    Task<(IEnumerable<BookModel> Items, int TotalCount)> GetAllAsync(
        string? search, string? author, string? publisher, int page, int pageSize, CancellationToken cancellationToken = default);

    Task<BookModel?> GetByIdAsync(int bookId, CancellationToken cancellationToken = default);

    Task<BookModel?> GetByIsbnAsync(string isbn, CancellationToken cancellationToken = default);

    Task<BookModel> CreateAsync(BookModel book, CancellationToken cancellationToken = default);

    Task<BookModel> UpdateAsync(BookModel book, CancellationToken cancellationToken = default);

    Task DeleteAsync(int bookId, CancellationToken cancellationToken = default);

    Task<bool> HasBorrowedCopiesAsync(int bookId, CancellationToken cancellationToken = default);

    Task<IEnumerable<BookAvailabilityModel>> GetAvailabilityAsync(int bookId, CancellationToken cancellationToken = default);

    Task AddCopiesAsync(int bookId, int branchId, int count, CancellationToken cancellationToken = default);

    Task<bool> CopyExistsAsync(int copyId, CancellationToken cancellationToken = default);

    Task UpdateCopyStatusAsync(int copyId, string status, CancellationToken cancellationToken = default);

    Task DeleteCopyAsync(int copyId, CancellationToken cancellationToken = default);

    Task<bool> BranchExistsAsync(int branchId, CancellationToken cancellationToken = default);
}
