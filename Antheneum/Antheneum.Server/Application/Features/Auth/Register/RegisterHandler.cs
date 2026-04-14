using Application.DTOs.Auth;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using MediatR;
using System.Security.Cryptography;
using System.Text;

namespace Application.Features.Auth.Register
{
    public class RegisterHandler : IRequestHandler<RegisterQuery, AuthResponse>
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;
        private readonly IPasswordHashingService _passwordHashingService;

        public RegisterHandler(
            IUserRepository userRepository,
            ITokenService tokenService,
            IPasswordHashingService passwordHashingService)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
            _passwordHashingService = passwordHashingService;
        }

        public async Task<AuthResponse> Handle(RegisterQuery request, CancellationToken cancellationToken)
        {
            ValidatePassword(request.Password);

            if (await _userRepository.UsernameExistsAsync(request.Username, cancellationToken))
                throw new ArgumentException("Username is already taken.");

            if (await _userRepository.EmailExistsAsync(request.Email, cancellationToken))
                throw new ArgumentException("Email is already registered.");

            var passwordHash = _passwordHashingService.HashPassword(request.Password);

            var user = UserModel.Create(
                request.Username,
                passwordHash,
                request.Email,
                Role.Reader,
                request.Phone,
                request.Address);

            await _userRepository.CreateUserAsync(user, Role.Reader, cancellationToken);

            var createdUser = await _userRepository.GetByUsernameAsync(request.Username, cancellationToken)
                ?? throw new InvalidOperationException("Failed to retrieve created user.");

            var token = _tokenService.GenerateToken(createdUser);

            var refreshToken = _tokenService.GenerateRefreshToken();
            var refreshTokenHash = HashToken(refreshToken);
            await _userRepository.StoreRefreshTokenAsync(createdUser.Id, refreshTokenHash, DateTime.UtcNow.AddDays(7), cancellationToken);

            return new AuthResponse(token, refreshToken, createdUser.Username, createdUser.Role.ToString());
        }

        private static string HashToken(string token)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            return Convert.ToBase64String(bytes);
        }

        private static void ValidatePassword(string password)
        {
            if (password.Length < 8)
                throw new ArgumentException("Password must be at least 8 characters.");

            if (!password.Any(char.IsUpper))
                throw new ArgumentException("Password must contain at least one uppercase letter.");

            if (!password.Any(char.IsDigit))
                throw new ArgumentException("Password must contain at least one numeric digit.");

            if (!password.Any(c => "!@#$%^&*".Contains(c)))
                throw new ArgumentException("Password must contain at least one special character (!, @, #, $, %, ^, &, *).");
        }
    }
}

