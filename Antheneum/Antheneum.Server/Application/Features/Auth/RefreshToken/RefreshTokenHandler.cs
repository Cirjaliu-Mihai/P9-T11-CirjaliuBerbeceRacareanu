using Application.DTOs.Auth;
using Application.Helpers;
using Application.Interfaces;
using Domain.Interfaces;
using MediatR;

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
            var tokenHash = TokenHasher.Hash(request.RefreshToken);

            var user = await _userRepository.GetByRefreshTokenHashAsync(tokenHash, cancellationToken)
                ?? throw new UnauthorizedAccessException("Invalid or expired refresh token.");

            var newRefreshToken = _tokenService.GenerateRefreshToken();
            var newRefreshTokenHash = TokenHasher.Hash(newRefreshToken);
            var expiry = DateTime.UtcNow.AddDays(7);

            await _userRepository.StoreRefreshTokenAsync(user.Id, newRefreshTokenHash, expiry, cancellationToken);

            var accessToken = _tokenService.GenerateToken(user);

            return new AuthResponse(accessToken, newRefreshToken, user.Username, user.Role.ToString());
        }
    }
}
