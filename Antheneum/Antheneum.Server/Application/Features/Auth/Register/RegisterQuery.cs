using Application.DTOs.Auth;
using MediatR;

namespace Application.Features.Auth.Register
{
    public record RegisterQuery(
        string Username,
        string Email,
        string Password,
        string? Phone = null,
        string? Address = null) : IRequest<AuthResponse>;
}
