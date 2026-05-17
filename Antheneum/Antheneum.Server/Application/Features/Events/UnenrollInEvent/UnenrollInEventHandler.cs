using Domain.Interfaces;
using MediatR;

namespace Application.Features.Events.UnenrollInEvent;

public class UnenrollInEventHandler : IRequestHandler<UnenrollInEventQuery, bool>
{
    private readonly IEventRepository _eventRepository;

    public UnenrollInEventHandler(IEventRepository eventRepository)
    {
        _eventRepository = eventRepository;
    }

    public async Task<bool> Handle(UnenrollInEventQuery request, CancellationToken cancellationToken)
    {
        var eventExists = await _eventRepository.EventExistsAsync(request.EventId, cancellationToken);
        if (!eventExists)
        {
            throw new KeyNotFoundException($"Event with id {request.EventId} not found.");
        }

        return await _eventRepository.RemoveReaderAsync(request.EventId, request.ReaderId, cancellationToken);
    }
}
