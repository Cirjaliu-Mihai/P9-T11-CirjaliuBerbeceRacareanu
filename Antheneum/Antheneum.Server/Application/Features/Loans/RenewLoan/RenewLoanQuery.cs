using Application.DTOs.Loans;
using MediatR;

namespace Application.Features.Loans.RenewLoan;

public record RenewLoanQuery(int LoanId, int UserId) : IRequest<LoanDto>;
