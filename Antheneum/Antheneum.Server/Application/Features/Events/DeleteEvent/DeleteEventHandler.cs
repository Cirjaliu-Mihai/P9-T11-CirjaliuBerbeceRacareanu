using Application.Interfaces;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Events.DeleteEvent;

public class DeleteEventHandler : IRequestHandler<DeleteEventQuery, bool>
{
    private readonly IEventRepository _eventRepository;
    private readonly IFileStorageService _fileStorage;

    public DeleteEventHandler(IEventRepository eventRepository, IFileStorageService fileStorage)
    {
        _eventRepository = eventRepository;
        _fileStorage = fileStorage;
    }

    public async Task<bool> Handle(DeleteEventQuery request, CancellationToken cancellationToken)
    {
        var existingEvent = await _eventRepository.GetByIdAsync(request.EventId, cancellationToken)
            ?? throw new KeyNotFoundException($"Event with id {request.EventId} not found.");
        var now = DateTime.UtcNow;
        if (existingEvent.EndDate <= now)
        {
            throw new InvalidOperationException($"Cannot delete event '{existingEvent.Title}' because it has already ended.");
        }

        await _eventRepository.DeleteAsync(request.EventId, cancellationToken);
        _fileStorage.DeleteEventCover(request.EventId);
        return true;
    }
}
