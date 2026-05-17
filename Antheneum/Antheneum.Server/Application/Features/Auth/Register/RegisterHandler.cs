using Application.DTOs.Auth;
using Application.Helpers;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using MediatR;
using System.Text.RegularExpressions;

namespace Application.Features.Auth.Register
{
    public class RegisterHandler : IRequestHandler<RegisterQuery, AuthResponse>
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;
        private readonly IPasswordHashingService _passwordHashingService;
        private readonly IEmailNotificationService _emailNotificationService;

        public RegisterHandler(
            IUserRepository userRepository,
            ITokenService tokenService,
            IPasswordHashingService passwordHashingService,
            IEmailNotificationService emailNotificationService)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
            _passwordHashingService = passwordHashingService;
            _emailNotificationService = emailNotificationService;
        }

        public async Task<AuthResponse> Handle(RegisterQuery request, CancellationToken cancellationToken)
        {
            SanitizeInput(request.Username, nameof(request.Username));
            SanitizeInput(request.Email, nameof(request.Email));
            SanitizeInput(request.Password, nameof(request.Password));
            if (request.Phone is not null) SanitizeInput(request.Phone, nameof(request.Phone));
            if (request.Address is not null) SanitizeInput(request.Address, nameof(request.Address));

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
            var refreshTokenHash = TokenHasher.Hash(refreshToken);
            await _userRepository.StoreRefreshTokenAsync(createdUser.Id, refreshTokenHash, DateTime.UtcNow.AddDays(7), cancellationToken);

            await _emailNotificationService.SendAsync(
                new NotificationEmailRequest(
                    RecipientEmail: createdUser.Email,
                    Subject: "Welcome to Antheneum",
                    Body: $"<p>Hello {createdUser.Username},</p><p>Your account is ready and you can start borrowing books.</p>",
                    TemplateKey: "registration_confirmation",
                    CorrelationKey: $"registration:{createdUser.Id}",
                    Cooldown: TimeSpan.FromDays(36500)),
                cancellationToken);

            return new AuthResponse(token, refreshToken, createdUser.Username, createdUser.Role.ToString());
        }

        private static readonly Regex XssPattern = new(
            @"<[^>]*>|javascript\s*:|on\w+\s*=|&[#\w]+;",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static void SanitizeInput(string value, string fieldName)
        {
            if (XssPattern.IsMatch(value))
                throw new ArgumentException($"{fieldName} contains invalid characters.");
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

