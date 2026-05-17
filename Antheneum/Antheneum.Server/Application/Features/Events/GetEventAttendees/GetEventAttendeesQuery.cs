using Application.DTOs.Books;
using Application.DTOs.Events;
using MediatR;

namespace Application.Features.Events.GetEventAttendees;

public record GetEventAttendeesQuery(
    int EventId,
    int Page = 1,
    int PageSize = 10) : IRequest<PagedResult<EventAttendeeDto>>;
