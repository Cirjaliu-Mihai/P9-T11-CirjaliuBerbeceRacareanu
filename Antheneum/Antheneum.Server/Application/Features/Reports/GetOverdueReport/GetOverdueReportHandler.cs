using Application.DTOs.Books;
using Application.DTOs.Reports;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Reports.GetOverdueReport;

public class GetOverdueReportHandler : IRequestHandler<GetOverdueReportQuery, PagedResult<OverdueReportDto>>
{
    private readonly IReportRepository _reportRepository;

    public GetOverdueReportHandler(IReportRepository reportRepository)
    {
        _reportRepository = reportRepository;
    }

    public async Task<PagedResult<OverdueReportDto>> Handle(GetOverdueReportQuery request, CancellationToken cancellationToken)
    {
        int page = Math.Max(request.Page, 1);
        int pageSize = Math.Clamp(request.PageSize, 1, 100);

        var (items, totalCount) = await _reportRepository.GetOverdueAsync(
            request.BranchId,
            page,
            pageSize,
            cancellationToken);

        IEnumerable<OverdueReportDto> dtos = items.Select(item => new OverdueReportDto(
            item.ReaderId,
            item.Username,
            item.Email,
            item.LibraryCardNumber,
            item.LoanId,
            item.BranchId,
            item.BranchName,
            item.BookTitle,
            item.LoanDate,
            item.DueDate,
            item.OverdueDays,
            item.LoanFineTotal));

        return new PagedResult<OverdueReportDto>(dtos, totalCount, page, pageSize);
    }
}