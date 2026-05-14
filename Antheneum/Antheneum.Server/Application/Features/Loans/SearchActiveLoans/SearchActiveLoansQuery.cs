using Application.DTOs.Loans;
using MediatR;

namespace Application.Features.Loans.SearchActiveLoans;

public record SearchActiveLoansQuery(string Username) : IRequest<IEnumerable<ActiveLoanSummaryDto>>;
