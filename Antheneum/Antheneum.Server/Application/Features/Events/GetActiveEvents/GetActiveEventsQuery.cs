using Application.DTOs.Books;
using Application.DTOs.Events;
using MediatR;

namespace Application.Features.Events.GetActiveEvents;

public record GetActiveEventsQuery(
    int Page = 1,
    int PageSize = 10) : IRequest<PagedResult<EventDto>>;
