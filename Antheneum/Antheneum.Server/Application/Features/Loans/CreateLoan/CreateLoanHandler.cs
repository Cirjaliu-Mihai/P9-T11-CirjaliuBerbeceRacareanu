using Application.DTOs.Loans;
using AutoMapper;
using Domain.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Loans.CreateLoan;

public class CreateLoanHandler : IRequestHandler<CreateLoanQuery, LoanDto>
{
    private readonly ILoanRepository _loanRepository;
    private readonly IMapper _mapper;

    public CreateLoanHandler(ILoanRepository loanRepository, IMapper mapper)
    {
        _loanRepository = loanRepository;
        _mapper = mapper;
    }

    public async Task<LoanDto> Handle(CreateLoanQuery request, CancellationToken cancellationToken)
    {
        var readerId = await _loanRepository.GetReaderIdByUserIdAsync(request.UserId, cancellationToken)
            ?? throw new KeyNotFoundException($"Reader profile not found for user {request.UserId}.");

        var isBlacklisted = await _loanRepository.IsReaderBlacklistedAsync(readerId, cancellationToken);
        if (isBlacklisted)
            throw new DomainException("Your account has been blacklisted and cannot borrow books.");

        var activeCount = await _loanRepository.GetActiveCountForReaderAsync(readerId, cancellationToken);
        if (activeCount >= 5)
            throw new DomainException("You have reached the maximum of 5 active loans.");

        var isCopyAvailable = await _loanRepository.IsCopyAvailableAsync(request.CopyId, cancellationToken);
        if (!isCopyAvailable)
            throw new DomainException("The requested copy is not available for borrowing.");

        var loanDate = DateOnly.FromDateTime(DateTime.UtcNow);
        var dueDate = loanDate.AddDays(14);

        var loan = await _loanRepository.CreateAsync(request.CopyId, readerId, loanDate, dueDate, cancellationToken);

        return _mapper.Map<LoanDto>(loan);
    }
}
