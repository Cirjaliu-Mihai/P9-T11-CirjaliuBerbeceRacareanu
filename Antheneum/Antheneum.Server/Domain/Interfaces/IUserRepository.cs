using Domain.Entities;
using Domain.Enums;

namespace Domain.Interfaces;

public interface IUserRepository
{
    Task<UserModel?> GetByIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<UserModel?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<UserModel?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> UsernameExistsAsync(string username, CancellationToken cancellationToken = default);
    Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default);
    Task CreateUserAsync(UserModel user, Role role, CancellationToken cancellationToken = default);
    Task PromoteToAdministratorAsync(int userId, CancellationToken cancellationToken = default);
    Task StoreRefreshTokenAsync(int userId, string refreshTokenHash, DateTime expiry, CancellationToken cancellationToken = default);
    Task<UserModel?> GetByRefreshTokenHashAsync(string refreshTokenHash, CancellationToken cancellationToken = default);
    Task RevokeRefreshTokenAsync(int userId, CancellationToken cancellationToken = default);
}
