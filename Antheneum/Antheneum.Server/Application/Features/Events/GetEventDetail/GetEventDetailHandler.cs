using Application.DTOs.Events;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Events.GetEventDetail;

public class GetEventDetailHandler : IRequestHandler<GetEventDetailQuery, EventDetailDto>
{
    private readonly IEventRepository _eventRepository;
    private readonly IBranchRepository _branchRepository;

    public GetEventDetailHandler(IEventRepository eventRepository, IBranchRepository branchRepository)
    {
        _eventRepository = eventRepository;
        _branchRepository = branchRepository;
    }

    public async Task<EventDetailDto> Handle(GetEventDetailQuery request, CancellationToken cancellationToken)
    {
        var eventModel = await _eventRepository.GetByIdAsync(request.EventId, cancellationToken)
            ?? throw new KeyNotFoundException($"Event with id {request.EventId} not found.");
        var branch = await _branchRepository.GetByIdAsync(eventModel.BranchId, cancellationToken)
            ?? throw new KeyNotFoundException($"Branch with id {eventModel.BranchId} not found.");

        var enrolledCount = await _eventRepository.GetEnrolledCountAsync(request.EventId, cancellationToken);
        var isEnrolled = request.ReaderId.HasValue
            ? await _eventRepository.IsReaderEnrolledAsync(request.EventId, request.ReaderId.Value, cancellationToken)
            : false;

        return new EventDetailDto(
            eventModel.EventId,
            eventModel.Title,
            eventModel.Description,
            eventModel.StartDate,
            eventModel.EndDate,
            branch.Name,
            eventModel.BranchId,
            eventModel.MaxSeats,
            enrolledCount,
            isEnrolled,
            eventModel.CoverImageUrl);
    }
}
