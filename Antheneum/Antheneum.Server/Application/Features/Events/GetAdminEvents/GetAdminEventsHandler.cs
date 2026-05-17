using Application.DTOs.Events;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Events.GetAdminEvents;

public class GetAdminEventsHandler : IRequestHandler<GetAdminEventsQuery, AdminEventsResultDto>
{
    private readonly IEventRepository _eventRepository;
    private readonly IBranchRepository _branchRepository;

    public GetAdminEventsHandler(IEventRepository eventRepository, IBranchRepository branchRepository)
    {
        _eventRepository = eventRepository;
        _branchRepository = branchRepository;
    }

    public async Task<AdminEventsResultDto> Handle(GetAdminEventsQuery request, CancellationToken cancellationToken)
    {
        var (upcomingModels, pastModels) = await _eventRepository.GetAdminViewAsync(cancellationToken);

        var upcomingDtos = new List<EventDto>();
        foreach (var item in upcomingModels)
        {
            var branch = await _branchRepository.GetByIdAsync(item.BranchId, cancellationToken);
            var enrolledCount = await _eventRepository.GetEnrolledCountAsync(item.EventId, cancellationToken);

            upcomingDtos.Add(new EventDto(
                item.EventId,
                item.Title,
                item.Description,
                item.StartDate,
                item.EndDate,
                branch?.Name ?? "Unknown",
                item.MaxSeats,
                enrolledCount,
                item.CoverImageUrl));
        }

        var pastDtos = new List<EventDto>();
        foreach (var item in pastModels)
        {
            var branch = await _branchRepository.GetByIdAsync(item.BranchId, cancellationToken);
            var enrolledCount = await _eventRepository.GetEnrolledCountAsync(item.EventId, cancellationToken);

            pastDtos.Add(new EventDto(
                item.EventId,
                item.Title,
                item.Description,
                item.StartDate,
                item.EndDate,
                branch?.Name ?? "Unknown",
                item.MaxSeats,
                enrolledCount,
                item.CoverImageUrl));
        }

        return new AdminEventsResultDto(upcomingDtos, pastDtos);
    }
}
