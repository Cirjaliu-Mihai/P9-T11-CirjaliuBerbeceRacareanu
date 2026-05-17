using MediatR;

namespace Application.Features.Events.DeleteEvent;

public record DeleteEventQuery(
    int EventId) : IRequest<bool>;