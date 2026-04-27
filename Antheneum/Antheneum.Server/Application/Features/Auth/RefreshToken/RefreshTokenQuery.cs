using Application.DTOs.Auth;
using MediatR;

namespace Application.Features.Auth.RefreshToken
{
    public record RefreshTokenQuery(string RefreshToken) : IRequest<AuthResponse>;
}
