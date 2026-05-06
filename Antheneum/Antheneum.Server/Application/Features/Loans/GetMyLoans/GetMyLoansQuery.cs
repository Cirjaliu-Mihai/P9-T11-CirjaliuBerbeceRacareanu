using Application.DTOs.Loans;
using MediatR;

namespace Application.Features.Loans.GetMyLoans;

public record GetMyLoansQuery(int UserId) : IRequest<IEnumerable<LoanDto>>;
