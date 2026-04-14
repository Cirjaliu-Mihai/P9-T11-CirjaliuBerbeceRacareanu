using Application.DTOs.Auth;
using Application.Interfaces;
using Domain.Interfaces;
using MediatR;
using System.Security.Cryptography;
using System.Text;

namespace Application.Features.Auth.Login
{
    public class LoginHandler : IRequestHandler<LoginQuery, AuthResponse>
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;
        private readonly IPasswordHashingService _passwordHashingService;

        public LoginHandler(
            IUserRepository userRepository,
            ITokenService tokenService,
            IPasswordHashingService passwordHashingService)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
            _passwordHashingService = passwordHashingService;
        }

        public async Task<AuthResponse> Handle(LoginQuery request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByUsernameAsync(request.Username, cancellationToken)
                ?? throw new UnauthorizedAccessException("Invalid username or password.");

            if (!_passwordHashingService.VerifyPassword(user.PasswordHash, request.Password))
                throw new UnauthorizedAccessException("Invalid username or password.");

            var token = _tokenService.GenerateToken(user);

            var refreshToken = _tokenService.GenerateRefreshToken();
            var refreshTokenHash = HashToken(refreshToken);
            await _userRepository.StoreRefreshTokenAsync(user.Id, refreshTokenHash, DateTime.UtcNow.AddDays(7), cancellationToken);

            return new AuthResponse(token, refreshToken, user.Username, user.Role.ToString());
        }

        private static string HashToken(string token)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            return Convert.ToBase64String(bytes);
        }
    }
}

