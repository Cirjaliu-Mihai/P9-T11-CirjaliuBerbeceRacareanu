using Application.DTOs.Events;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Events.CreateEvent;

public class CreateEventHandler : IRequestHandler<CreateEventQuery, EventDetailDto>
{
    private readonly IEventRepository _eventRepository;
    private readonly IBranchRepository _branchRepository;
    private readonly IFileStorageService _fileStorage;

    public CreateEventHandler(
        IEventRepository eventRepository,
        IBranchRepository branchRepository,
        IFileStorageService fileStorage)
    {
        _eventRepository = eventRepository;
        _branchRepository = branchRepository;
        _fileStorage = fileStorage;
    }

    public async Task<EventDetailDto> Handle(CreateEventQuery request, CancellationToken cancellationToken)
    {
        var form = request.FormValue;
        var branch = await _branchRepository.GetByIdAsync(form.BranchId, cancellationToken)
            ?? throw new KeyNotFoundException($"Branch with id {form.BranchId} not found.");
        var eventModel = new EventModel
        {
            EventId = 0, // Will be assigned by the database
            BranchId = form.BranchId,
            Title = form.Title,
            Description = form.Description,
            StartDate = form.StartDate,
            EndDate = form.EndDate,
            MaxSeats = form.MaxSeats,
            CoverImageUrl = form.CoverImageUrl
        };

        var createdEvent = await _eventRepository.CreateAsync(eventModel, cancellationToken);

        if (request.CoverImageStream is not null && request.CoverImageContentType is not null)
        {
            var imgUrl = await _fileStorage.SaveEventCoverAsync(
                createdEvent.EventId,
                request.CoverImageStream,
                request.CoverImageContentType);

            createdEvent = await _eventRepository.UpdateAsync(new EventModel
            {
                EventId = createdEvent.EventId,
                BranchId = createdEvent.BranchId,
                Title = createdEvent.Title,
                Description = createdEvent.Description,
                StartDate = createdEvent.StartDate,
                EndDate = createdEvent.EndDate,
                MaxSeats = createdEvent.MaxSeats,
                CoverImageUrl = imgUrl
            }, cancellationToken);
        }

        return new EventDetailDto(
            createdEvent.EventId,
            createdEvent.Title,
            createdEvent.Description,
            createdEvent.StartDate,
            createdEvent.EndDate,
            branch.Name,
            createdEvent.BranchId,
            createdEvent.MaxSeats,
            0, // No one enrolled yet
            false,
            createdEvent.CoverImageUrl);
    }
}
