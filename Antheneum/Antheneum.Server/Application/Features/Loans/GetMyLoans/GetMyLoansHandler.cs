using Application.DTOs.Loans;
using AutoMapper;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Loans.GetMyLoans;

public class GetMyLoansHandler : IRequestHandler<GetMyLoansQuery, IEnumerable<LoanDto>>
{
    private readonly ILoanRepository _loanRepository;
    private readonly IMapper _mapper;

    public GetMyLoansHandler(ILoanRepository loanRepository, IMapper mapper)
    {
        _loanRepository = loanRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<LoanDto>> Handle(GetMyLoansQuery request, CancellationToken cancellationToken)
    {
        var readerId = await _loanRepository.GetReaderIdByUserIdAsync(request.UserId, cancellationToken)
            ?? throw new KeyNotFoundException($"Reader profile not found for user {request.UserId}.");

        var loans = await _loanRepository.GetByReaderIdAsync(readerId, cancellationToken);

        return _mapper.Map<IEnumerable<LoanDto>>(loans);
    }
}
