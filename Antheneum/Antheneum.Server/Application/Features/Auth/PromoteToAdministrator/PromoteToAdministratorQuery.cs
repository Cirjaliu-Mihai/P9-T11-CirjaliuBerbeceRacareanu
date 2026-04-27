using MediatR;

namespace Application.Features.Auth.PromoteToAdministrator
{
    public record PromoteToAdministratorQuery(int UserId) : IRequest;
}
