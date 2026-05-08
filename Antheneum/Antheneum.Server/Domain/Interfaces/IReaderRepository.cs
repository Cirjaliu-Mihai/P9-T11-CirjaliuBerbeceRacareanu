using Domain.Entities;
using Domain.Enums;

namespace Domain.Interfaces;

public interface IReaderRepository
{
    Task<IEnumerable<ReaderModel>> GetAllAsync(string? search, string? sortBy, CancellationToken ct = default);
    Task<ReaderModel?> GetByIdAsync(int readerId, CancellationToken ct = default);
    Task<ReaderModel?> GetByUserIdAsync(int userId, CancellationToken ct = default);
    Task ChangeRoleAsync(int readerId, Role newRole, CancellationToken ct = default);
    Task UpdateProfileAsync(int userId, string? phone, string? address, string? passwordHash, CancellationToken ct = default);
    Task RemoveFromBlacklistAsync(int readerId, CancellationToken ct = default);
}
