using Application.DTOs.Loans;
using AutoMapper;
using Domain.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Loans.ReturnLoan;

public class ReturnLoanHandler : IRequestHandler<ReturnLoanQuery, LoanDto>
{
    private readonly ILoanRepository _loanRepository;
    private readonly IMapper _mapper;

    public ReturnLoanHandler(ILoanRepository loanRepository, IMapper mapper)
    {
        _loanRepository = loanRepository;
        _mapper = mapper;
    }

    public async Task<LoanDto> Handle(ReturnLoanQuery request, CancellationToken cancellationToken)
    {
        var loan = await _loanRepository.GetByIdAsync(request.LoanId, cancellationToken)
            ?? throw new KeyNotFoundException($"Loan {request.LoanId} not found.");

        if (loan.ActualReturnDate is not null)
            throw new DomainException("This loan has already been returned.");

        var returnDate = DateOnly.FromDateTime(DateTime.UtcNow);
        // Fine calculation and blacklisting are handled by DB triggers on loans/unwantedclients tables.
        var returned = await _loanRepository.ReturnAsync(request.LoanId, returnDate, cancellationToken);

        return _mapper.Map<LoanDto>(returned);
    }
}
