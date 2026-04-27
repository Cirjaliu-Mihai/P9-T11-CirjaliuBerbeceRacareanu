using Domain.Enums;
using Domain.Exceptions;

namespace Domain.Entities
{
    public sealed class UserModel
    {
        public int Id { get; private set; }
        public string Username { get; private set; } = string.Empty;
        public string PasswordHash { get; private set; } = string.Empty;
        public string Email { get; private set; } = string.Empty;
        public string? Phone { get; private set; }
        public string? Address { get; private set; }
        public Role Role { get; private set; }

        private UserModel() { }

        public static UserModel Create(
            string username,
            string passwordHash,
            string email,
            Role role,
            string? phone = null,
            string? address = null)
        {
            if (string.IsNullOrWhiteSpace(username))
                throw new DomainException("Username cannot be empty.");
            if (username.Length < 3 || username.Length > 50)
                throw new DomainException("Username must be between 3 and 50 characters.");

            if (string.IsNullOrWhiteSpace(email))
                throw new DomainException("Email cannot be empty.");
            if (!email.Contains('@') || !email.Contains('.'))
                throw new DomainException("Email is not valid.");

            if (string.IsNullOrWhiteSpace(passwordHash))
                throw new DomainException("Password hash cannot be empty.");

            if (!Enum.IsDefined(role))
                throw new DomainException("Invalid role.");

            if (phone is not null && phone.Length > 20)
                throw new DomainException("Phone number cannot exceed 20 characters.");

            if (address is not null && address.Length > 200)
                throw new DomainException("Address cannot exceed 200 characters.");

            return new UserModel
            {
                Username = username,
                PasswordHash = passwordHash,
                Email = email,
                Role = role,
                Phone = phone,
                Address = address
            };
        }

        public static UserModel Reconstitute(
            int id,
            string username,
            string passwordHash,
            string email,
            Role role,
            string? phone,
            string? address)
        {
            return new UserModel
            {
                Id = id,
                Username = username,
                PasswordHash = passwordHash,
                Email = email,
                Role = role,
                Phone = phone,
                Address = address
            };
        }
    }
}
