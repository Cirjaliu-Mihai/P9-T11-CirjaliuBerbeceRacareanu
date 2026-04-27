using Application.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Services;

internal sealed class PasswordHashingService : IPasswordHashingService
{
    private readonly IPasswordHasher<object> _hasher = new PasswordHasher<object>();

    public string HashPassword(string password) =>
        _hasher.HashPassword(new object(), password);

    public bool VerifyPassword(string hashedPassword, string providedPassword) =>
        _hasher.VerifyHashedPassword(new object(), hashedPassword, providedPassword)
            != PasswordVerificationResult.Failed;
}
