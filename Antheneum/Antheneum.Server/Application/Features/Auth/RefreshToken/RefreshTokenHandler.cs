using Application.DTOs.Auth;
using Application.Interfaces;
using Domain.Interfaces;
using MediatR;
using System.Security.Cryptography;
using System.Text;

namespace Application.Features.Auth.RefreshToken
{
    public class RefreshTokenHandler : IRequestHandler<RefreshTokenQuery, AuthResponse>
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;

        public RefreshTokenHandler(IUserRepository userRepository, ITokenService tokenService)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
        }

        public async Task<AuthResponse> Handle(RefreshTokenQuery request, CancellationToken cancellationToken)
        {
            var tokenHash = HashToken(request.RefreshToken);

            var user = await _userRepository.GetByRefreshTokenHashAsync(tokenHash, cancellationToken)
                ?? throw new UnauthorizedAccessException("Invalid or expired refresh token.");

            var newRefreshToken = _tokenService.GenerateRefreshToken();
            var newRefreshTokenHash = HashToken(newRefreshToken);
            var expiry = DateTime.UtcNow.AddDays(7);

            await _userRepository.StoreRefreshTokenAsync(user.Id, newRefreshTokenHash, expiry, cancellationToken);

            var accessToken = _tokenService.GenerateToken(user);

            return new AuthResponse(accessToken, newRefreshToken, user.Username, user.Role.ToString());
        }

        private static string HashToken(string token)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            return Convert.ToBase64String(bytes);
        }
    }
}
