using Domain.Interfaces;
using MediatR;

namespace Application.Features.Auth.Logout;

public sealed class LogoutHandler : IRequestHandler<LogoutQuery>
{
    private readonly IUserRepository _userRepository;

    public LogoutHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task Handle(LogoutQuery request, CancellationToken cancellationToken)
    {
        await _userRepository.RevokeRefreshTokenAsync(request.UserId, cancellationToken);
    }
}
