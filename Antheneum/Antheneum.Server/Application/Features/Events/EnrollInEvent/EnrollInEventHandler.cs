using Domain.Interfaces;
using MediatR;

namespace Application.Features.Events.EnrollInEvent;

public class EnrollInEventHandler : IRequestHandler<EnrollInEventQuery, bool>
{
    private readonly IEventRepository _eventRepository;

    public EnrollInEventHandler(IEventRepository eventRepository)
    {
        _eventRepository = eventRepository;
    }

    public async Task<bool> Handle(EnrollInEventQuery request, CancellationToken cancellationToken)
    {
        var eventExists = await _eventRepository.EventExistsAsync(request.EventId, cancellationToken);
        if (!eventExists)
        {
            throw new KeyNotFoundException($"Event with id {request.EventId} not found.");
        }
        return await _eventRepository.EnrollReaderAsync(request.EventId, request.ReaderId, cancellationToken);
    }
}
