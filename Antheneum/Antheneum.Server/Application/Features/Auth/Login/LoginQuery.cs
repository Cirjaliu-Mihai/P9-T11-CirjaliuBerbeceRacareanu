using Application.DTOs.Auth;
using MediatR;

namespace Application.Features.Auth.Login
{
    public record LoginQuery(string Username, string Password) : IRequest<AuthResponse>;
}
