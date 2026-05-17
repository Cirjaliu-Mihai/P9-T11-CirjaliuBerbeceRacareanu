using MediatR;

namespace Application.Features.Events.UnenrollInEvent;

public record UnenrollInEventQuery(
    int EventId,
    int ReaderId) : IRequest<bool>;
