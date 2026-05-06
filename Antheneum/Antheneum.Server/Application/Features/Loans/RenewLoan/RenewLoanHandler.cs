using Application.DTOs.Loans;
using AutoMapper;
using Domain.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Loans.RenewLoan;

public class RenewLoanHandler : IRequestHandler<RenewLoanQuery, LoanDto>
{
    private readonly ILoanRepository _loanRepository;
    private readonly IMapper _mapper;

    public RenewLoanHandler(ILoanRepository loanRepository, IMapper mapper)
    {
        _loanRepository = loanRepository;
        _mapper = mapper;
    }

    public async Task<LoanDto> Handle(RenewLoanQuery request, CancellationToken cancellationToken)
    {
        var loan = await _loanRepository.GetByIdAsync(request.LoanId, cancellationToken)
            ?? throw new KeyNotFoundException($"Loan {request.LoanId} not found.");

        var readerId = await _loanRepository.GetReaderIdByUserIdAsync(request.UserId, cancellationToken)
            ?? throw new KeyNotFoundException($"Reader profile not found for user {request.UserId}.");

        if (loan.ReaderId != readerId)
            throw new KeyNotFoundException($"Loan {request.LoanId} not found.");

        if (loan.ActualReturnDate is not null)
            throw new DomainException("This loan has already been returned.");

        if (loan.IsRenewed)
            throw new DomainException("This loan has already been renewed once.");

        var newDueDate = loan.DueDate.AddDays(14);
        await _loanRepository.RenewAsync(request.LoanId, newDueDate, cancellationToken);

        var updated = await _loanRepository.GetByIdAsync(request.LoanId, cancellationToken)
            ?? throw new KeyNotFoundException($"Loan {request.LoanId} not found.");

        return _mapper.Map<LoanDto>(updated);
    }
}
