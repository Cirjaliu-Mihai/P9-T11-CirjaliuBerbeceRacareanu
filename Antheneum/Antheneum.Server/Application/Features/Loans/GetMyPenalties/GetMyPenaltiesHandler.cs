using Application.DTOs.Loans;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Loans.GetMyPenalties;

public record GetMyPenaltiesQuery(int UserId) : IRequest<IEnumerable<ReaderPenaltyDto>>;

public class GetMyPenaltiesHandler : IRequestHandler<GetMyPenaltiesQuery, IEnumerable<ReaderPenaltyDto>>
{
    private readonly ILoanRepository _loanRepository;

    public GetMyPenaltiesHandler(ILoanRepository loanRepository)
    {
        _loanRepository = loanRepository;
    }

    public async Task<IEnumerable<ReaderPenaltyDto>> Handle(GetMyPenaltiesQuery request, CancellationToken cancellationToken)
    {
        var readerId = await _loanRepository.GetReaderIdByUserIdAsync(request.UserId, cancellationToken)
            ?? throw new KeyNotFoundException($"Reader profile not found for user {request.UserId}.");

        var penalties = await _loanRepository.GetUnresolvedPenaltiesForReaderAsync(readerId, cancellationToken);

        return penalties.Select(p => new ReaderPenaltyDto(
            p.PenaltyId,
            p.BookTitle,
            p.BranchName,
            p.Reason,
            p.Amount));
    }
}
