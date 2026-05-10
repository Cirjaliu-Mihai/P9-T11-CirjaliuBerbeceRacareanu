using Application.DTOs.Books;
using Application.DTOs.Reports;
using MediatR;

namespace Application.Features.Reports.GetTransactionsReport;

public record GetTransactionsReportQuery(
    DateOnly From,
    DateOnly To,
    int? BranchId,
    int Page = 1,
    int PageSize = 10) : IRequest<PagedResult<TransactionReportDto>>;