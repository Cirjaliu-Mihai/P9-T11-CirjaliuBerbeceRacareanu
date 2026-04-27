using Domain.Entities;

namespace Application.Interfaces;

public interface ITokenService
{
    string GenerateToken(UserModel user);
    string GenerateRefreshToken();
}
