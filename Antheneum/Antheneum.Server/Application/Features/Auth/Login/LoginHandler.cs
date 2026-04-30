using Application.DTOs.Auth;
using Application.Helpers;
using Application.Interfaces;
using Domain.Interfaces;
using MediatR;
using System.Text.RegularExpressions;

namespace Application.Features.Auth.Login
{
    public class LoginHandler : IRequestHandler<LoginQuery, AuthResponse>
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;
        private readonly IPasswordHashingService _passwordHashingService;
        private readonly ILoginAttemptTracker _loginAttemptTracker;

        public LoginHandler(
            IUserRepository userRepository,
            ITokenService tokenService,
            IPasswordHashingService passwordHashingService,
            ILoginAttemptTracker loginAttemptTracker)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
            _passwordHashingService = passwordHashingService;
            _loginAttemptTracker = loginAttemptTracker;
        }

        public async Task<AuthResponse> Handle(LoginQuery request, CancellationToken cancellationToken)
        {
            SanitizeInput(request.Username, nameof(request.Username));
            SanitizeInput(request.Password, nameof(request.Password));

            if (_loginAttemptTracker.IsLockedOut(request.Username))
                throw new UnauthorizedAccessException("Account is temporarily locked. Try again in 15 minutes.");

            var user = await _userRepository.GetByUsernameAsync(request.Username, cancellationToken);

            if (user is null || !_passwordHashingService.VerifyPassword(user.PasswordHash, request.Password))
            {
                _loginAttemptTracker.RecordFailure(request.Username);
                throw new UnauthorizedAccessException("Invalid username or password.");
            }

            _loginAttemptTracker.Reset(request.Username);

            var token = _tokenService.GenerateToken(user);

            var refreshToken = _tokenService.GenerateRefreshToken();
            var refreshTokenHash = TokenHasher.Hash(refreshToken);
            await _userRepository.StoreRefreshTokenAsync(user.Id, refreshTokenHash, DateTime.UtcNow.AddDays(7), cancellationToken);

            return new AuthResponse(token, refreshToken, user.Username, user.Role.ToString());
        }

        private static readonly Regex XssPattern = new(
            @"<[^>]*>|javascript\s*:|on\w+\s*=|&[#\w]+;",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static void SanitizeInput(string value, string fieldName)
        {
            if (XssPattern.IsMatch(value))
                throw new ArgumentException($"{fieldName} contains invalid characters.");
        }
    }
}

