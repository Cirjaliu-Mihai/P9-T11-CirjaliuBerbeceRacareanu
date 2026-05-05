using Application.DTOs.Loans;
using MediatR;

namespace Application.Features.Loans.ReturnLoan;

public record ReturnLoanQuery(int LoanId) : IRequest<LoanDto>;
