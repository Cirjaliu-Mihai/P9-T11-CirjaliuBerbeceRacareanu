using Application.DTOs.Loans;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Loans.SearchActiveLoans;

public class SearchActiveLoansHandler : IRequestHandler<SearchActiveLoansQuery, IEnumerable<ActiveLoanSummaryDto>>
{
    private readonly ILoanRepository _loanRepository;

    public SearchActiveLoansHandler(ILoanRepository loanRepository)
    {
        _loanRepository = loanRepository;
    }

    public async Task<IEnumerable<ActiveLoanSummaryDto>> Handle(SearchActiveLoansQuery request, CancellationToken cancellationToken)
    {
        var results = await _loanRepository.SearchActiveLoansAsync(request.Username, cancellationToken);

        return results.Select(r => new ActiveLoanSummaryDto(
            r.LoanId,
            r.Username,
            r.BookTitle,
            r.BranchName,
            r.DueDate,
            r.OverdueDays,
            r.LoanFineTotal));
    }
}
