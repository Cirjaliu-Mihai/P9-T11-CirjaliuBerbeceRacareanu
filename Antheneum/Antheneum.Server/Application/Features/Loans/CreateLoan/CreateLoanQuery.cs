using Application.DTOs.Loans;
using MediatR;

namespace Application.Features.Loans.CreateLoan;

public record CreateLoanQuery(int CopyId, int UserId) : IRequest<LoanDto>;
