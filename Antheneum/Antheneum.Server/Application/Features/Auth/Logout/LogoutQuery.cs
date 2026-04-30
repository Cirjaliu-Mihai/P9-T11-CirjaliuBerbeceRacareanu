using MediatR;

namespace Application.Features.Auth.Logout;

public record LogoutQuery(int UserId) : IRequest;
