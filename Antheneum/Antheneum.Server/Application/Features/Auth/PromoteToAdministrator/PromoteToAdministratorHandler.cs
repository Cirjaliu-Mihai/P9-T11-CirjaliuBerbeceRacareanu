using Domain.Interfaces;
using MediatR;

namespace Application.Features.Auth.PromoteToAdministrator
{
    public class PromoteToAdministratorHandler : IRequestHandler<PromoteToAdministratorQuery>
    {
        private readonly IUserRepository _userRepository;

        public PromoteToAdministratorHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task Handle(PromoteToAdministratorQuery request, CancellationToken cancellationToken)
        {
            await _userRepository.PromoteToAdministratorAsync(request.UserId, cancellationToken);
        }
    }
}
