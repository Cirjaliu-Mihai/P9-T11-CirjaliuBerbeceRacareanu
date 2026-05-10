using Application.DTOs.Books;
using Application.DTOs.Reports;
using MediatR;

namespace Application.Features.Reports.GetOverdueReport;

public record GetOverdueReportQuery(
    int? BranchId,
    int Page = 1,
    int PageSize = 10) : IRequest<PagedResult<OverdueReportDto>>;