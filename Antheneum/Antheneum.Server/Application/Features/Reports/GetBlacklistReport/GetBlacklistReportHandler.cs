using Application.DTOs.Books;
using Application.DTOs.Reports;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Reports.GetBlacklistReport;

public class GetBlacklistReportHandler : IRequestHandler<GetBlacklistReportQuery, PagedResult<BlacklistReportDto>>
{
    private readonly IReportRepository _reportRepository;

    public GetBlacklistReportHandler(IReportRepository reportRepository)
    {
        _reportRepository = reportRepository;
    }

    public async Task<PagedResult<BlacklistReportDto>> Handle(GetBlacklistReportQuery request, CancellationToken cancellationToken)
    {
        int page = Math.Max(request.Page, 1);
        int pageSize = Math.Clamp(request.PageSize, 1, 100);

        var (items, totalCount) = await _reportRepository.GetBlacklistAsync(
            request.BranchId,
            page,
            pageSize,
            cancellationToken);

        IEnumerable<BlacklistReportDto> dtos = items.Select(item => new BlacklistReportDto(
            item.PenaltyId,
            item.ReaderId,
            item.Username,
            item.Email,
            item.LibraryCardNumber,
            item.LoanId,
            item.BranchId,
            item.BranchName,
            item.Reason,
            item.PenaltyAmount,
            item.IsResolved,
            item.IsBlacklisted));

        return new PagedResult<BlacklistReportDto>(dtos, totalCount, page, pageSize);
    }
}