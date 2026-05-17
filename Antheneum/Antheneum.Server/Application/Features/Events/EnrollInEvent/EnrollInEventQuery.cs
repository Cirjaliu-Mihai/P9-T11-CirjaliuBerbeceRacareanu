using MediatR;

namespace Application.Features.Events.EnrollInEvent;

public record EnrollInEventQuery(
    int EventId,
    int ReaderId) : IRequest<bool>;