using Application.DTOs.Books;
using Application.DTOs.Reports;
using MediatR;

namespace Application.Features.Reports.GetInventoryReport;

public record GetInventoryReportQuery(
    int? BranchId,
    int Page = 1,
    int PageSize = 10) : IRequest<PagedResult<InventoryReportDto>>;