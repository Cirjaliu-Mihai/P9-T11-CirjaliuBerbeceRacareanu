using Application.DTOs.Books;
using Application.DTOs.Events;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Events.GetEventAttendees;

public class GetEventAttendeesHandler : IRequestHandler<GetEventAttendeesQuery, PagedResult<EventAttendeeDto>>
{
    private readonly IEventRepository _eventRepository;

    public GetEventAttendeesHandler(IEventRepository eventRepository)
    {
        _eventRepository = eventRepository;
    }

    public async Task<PagedResult<EventAttendeeDto>> Handle(GetEventAttendeesQuery request, CancellationToken cancellationToken)
    {
        var eventExists = await _eventRepository.EventExistsAsync(request.EventId, cancellationToken);
        if (!eventExists)
        {
            throw new KeyNotFoundException($"Event with id {request.EventId} not found.");
        }
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var page = Math.Max(request.Page, 1);

        var (attendeeTuples, totalCount) = await _eventRepository.GetEventAttendeesAsync(
            request.EventId, page, pageSize, cancellationToken);

        var dtos = attendeeTuples.Select(a => new EventAttendeeDto(
            a.ReaderId,
            a.Username,
            a.Email,
            a.LibraryCardNumber)).ToList();

        return new PagedResult<EventAttendeeDto>(dtos, totalCount, page, pageSize);
    }
}
