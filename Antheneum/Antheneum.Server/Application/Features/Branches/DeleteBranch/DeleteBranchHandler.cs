using Domain.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Branches.DeleteBranch;

public class DeleteBranchHandler : IRequestHandler<DeleteBranchQuery>
{
    private readonly IBranchRepository _branchRepository;

    public DeleteBranchHandler(IBranchRepository branchRepository)
    {
        _branchRepository = branchRepository;
    }

    public async Task Handle(DeleteBranchQuery request, CancellationToken cancellationToken)
    {
        var branch = await _branchRepository.GetByIdAsync(request.BranchId, cancellationToken)
            ?? throw new KeyNotFoundException($"Branch with ID {request.BranchId} was not found.");

        var hasActiveLoans = await _branchRepository.HasActiveLoansAsync(request.BranchId, cancellationToken);
        if (hasActiveLoans)
            throw new ConflictException($"Branch '{branch.Name}' cannot be removed because it has active loans.");

        await _branchRepository.DeleteAsync(request.BranchId, cancellationToken);
    }
}
