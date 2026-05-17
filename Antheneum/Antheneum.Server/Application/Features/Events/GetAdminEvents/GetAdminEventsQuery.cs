using Application.DTOs.Events;
using MediatR;

namespace Application.Features.Events.GetAdminEvents;

public record GetAdminEventsQuery() : IRequest<AdminEventsResultDto>;

public record AdminEventsResultDto(
    IEnumerable<EventDto> UpcomingEvents,
    IEnumerable<EventDto> PastEvents);
