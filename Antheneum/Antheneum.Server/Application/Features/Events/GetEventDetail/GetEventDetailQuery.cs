using Application.DTOs.Events;
using MediatR;

namespace Application.Features.Events.GetEventDetail;

public record GetEventDetailQuery(
    int EventId,
    int? ReaderId = null) : IRequest<EventDetailDto>;
