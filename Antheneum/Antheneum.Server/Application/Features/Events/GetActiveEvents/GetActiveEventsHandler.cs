using Application.DTOs.Books;
using Application.DTOs.Events;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Events.GetActiveEvents;

public class GetActiveEventsHandler : IRequestHandler<GetActiveEventsQuery, PagedResult<EventDto>>
{
    private readonly IEventRepository _eventRepository;
    private readonly IBranchRepository _branchRepository;

    public GetActiveEventsHandler(IEventRepository eventRepository, IBranchRepository branchRepository)
    {
        _eventRepository = eventRepository;
        _branchRepository = branchRepository;
    }

    public async Task<PagedResult<EventDto>> Handle(GetActiveEventsQuery request, CancellationToken cancellationToken)
    {
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var page = Math.Max(request.Page, 1);

        var (items, totalCount) = await _eventRepository.GetActiveEventsAsync(page, pageSize, cancellationToken);

        var dtos = new List<EventDto>();
        foreach (var item in items)
        {
            var branch = await _branchRepository.GetByIdAsync(item.BranchId, cancellationToken);
            var enrolledCount = await _eventRepository.GetEnrolledCountAsync(item.EventId, cancellationToken);

            dtos.Add(new EventDto(
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

        return new PagedResult<EventDto>(dtos, totalCount, page, pageSize);
    }
}
