using Application.DTOs.Books;
using Application.DTOs.Reports;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Reports.GetInventoryReport;

public class GetInventoryReportHandler : IRequestHandler<GetInventoryReportQuery, PagedResult<InventoryReportDto>>
{
    private readonly IReportRepository _reportRepository;

    public GetInventoryReportHandler(IReportRepository reportRepository)
    {
        _reportRepository = reportRepository;
    }

    public async Task<PagedResult<InventoryReportDto>> Handle(GetInventoryReportQuery request, CancellationToken cancellationToken)
    {
        int page = Math.Max(request.Page, 1);
        int pageSize = Math.Clamp(request.PageSize, 1, 100);

        var (items, totalCount) = await _reportRepository.GetInventoryAsync(
            request.BranchId,
            page,
            pageSize,
            cancellationToken);

        IEnumerable<InventoryReportDto> dtos = items.Select(item => new InventoryReportDto(
            item.BranchId,
            item.BranchName,
            item.BookId,
            item.Isbn,
            item.Title,
            item.TotalCopies,
            item.AvailableCopies,
            item.BorrowedCopies));

        return new PagedResult<InventoryReportDto>(dtos, totalCount, page, pageSize);
    }
}