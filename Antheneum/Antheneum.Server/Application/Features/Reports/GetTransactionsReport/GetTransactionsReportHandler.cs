using Application.DTOs.Books;
using Application.DTOs.Reports;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Reports.GetTransactionsReport;

public class GetTransactionsReportHandler : IRequestHandler<GetTransactionsReportQuery, PagedResult<TransactionReportDto>>
{
    private readonly IReportRepository _reportRepository;

    public GetTransactionsReportHandler(IReportRepository reportRepository)
    {
        _reportRepository = reportRepository;
    }

    public async Task<PagedResult<TransactionReportDto>> Handle(GetTransactionsReportQuery request, CancellationToken cancellationToken)
    {
        if (request.From > request.To)
            throw new ArgumentException("The 'from' date must be earlier than or equal to the 'to' date.");

        int page = Math.Max(request.Page, 1);
        int pageSize = Math.Clamp(request.PageSize, 1, 100);

        var (items, totalCount) = await _reportRepository.GetTransactionsAsync(
            request.From,
            request.To,
            request.BranchId,
            page,
            pageSize,
            cancellationToken);

        IEnumerable<TransactionReportDto> dtos = items.Select(item => new TransactionReportDto(
            item.LoanId,
            item.ReaderId,
            item.Username,
            item.CopyId,
            item.BranchId,
            item.BranchName,
            item.BookId,
            item.Isbn,
            item.BookTitle,
            item.LoanDate,
            item.DueDate,
            item.ActualReturnDate,
            item.TransactionStatus));

        return new PagedResult<TransactionReportDto>(dtos, totalCount, page, pageSize);
    }
}