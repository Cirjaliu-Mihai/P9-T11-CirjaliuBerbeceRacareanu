using Application.DTOs.Events;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Events.UpdateEvent;

public class UpdateEventHandler : IRequestHandler<UpdateEventQuery, EventDetailDto>
{
    private readonly IEventRepository _eventRepository;
    private readonly IBranchRepository _branchRepository;
    private readonly IFileStorageService _fileStorage;

    public UpdateEventHandler(
        IEventRepository eventRepository,
        IBranchRepository branchRepository,
        IFileStorageService fileStorage)
    {
        _eventRepository = eventRepository;
        _branchRepository = branchRepository;
        _fileStorage = fileStorage;
    }

    public async Task<EventDetailDto> Handle(UpdateEventQuery request, CancellationToken cancellationToken)
    {
        var form = request.FormValue;
        var eventId = form.EventId ?? throw new ArgumentException("EventId is required for update.");
        var existingEvent = await _eventRepository.GetByIdAsync(eventId, cancellationToken)
            ?? throw new KeyNotFoundException($"Event with id {eventId} not found.");

        // Check if event has already ended
        var now = DateTime.UtcNow;
        if (existingEvent.EndDate <= now)
        {
            throw new InvalidOperationException($"Cannot update event '{existingEvent.Title}' because it has already ended.");
        }
        var branch = await _branchRepository.GetByIdAsync(form.BranchId, cancellationToken)
            ?? throw new KeyNotFoundException($"Branch with id {form.BranchId} not found.");
        var coverImageUrl = form.CoverImageUrl;
        if (request.CoverImageStream is not null && request.CoverImageContentType is not null)
        {
            coverImageUrl = await _fileStorage.SaveEventCoverAsync(
                eventId,
                request.CoverImageStream,
                request.CoverImageContentType);
        }

        var eventModel = new EventModel
        {
            EventId = eventId,
            BranchId = form.BranchId,
            Title = form.Title,
            Description = form.Description,
            StartDate = form.StartDate,
            EndDate = form.EndDate,
            MaxSeats = form.MaxSeats,
            CoverImageUrl = coverImageUrl
        };

        var updatedEvent = await _eventRepository.UpdateAsync(eventModel, cancellationToken);
        var enrolledCount = await _eventRepository.GetEnrolledCountAsync(updatedEvent.EventId, cancellationToken);

        return new EventDetailDto(
            updatedEvent.EventId,
            updatedEvent.Title,
            updatedEvent.Description,
            updatedEvent.StartDate,
            updatedEvent.EndDate,
            branch.Name,
            updatedEvent.BranchId,
            updatedEvent.MaxSeats,
            enrolledCount,
            false,
            updatedEvent.CoverImageUrl);
    }
}
