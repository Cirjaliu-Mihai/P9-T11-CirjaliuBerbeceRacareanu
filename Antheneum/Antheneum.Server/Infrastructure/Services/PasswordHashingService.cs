using Application.Interfaces;

namespace Infrastructure.Services;

internal sealed class PasswordHashingService : IPasswordHashingService
{
    public string HashPassword(string password) =>
        BCrypt.Net.BCrypt.EnhancedHashPassword(password, hashType: BCrypt.Net.HashType.SHA256);

    public bool VerifyPassword(string hashedPassword, string providedPassword) =>
        BCrypt.Net.BCrypt.EnhancedVerify(providedPassword, hashedPassword, hashType: BCrypt.Net.HashType.SHA256);
}
