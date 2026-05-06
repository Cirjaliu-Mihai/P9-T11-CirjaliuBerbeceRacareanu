using Application.DTOs.Branches;
using AutoMapper;
using Domain.Entities;
using Domain.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Branches.UpdateBranch;

public class UpdateBranchHandler : IRequestHandler<UpdateBranchQuery, BranchDto>
{
    private readonly IBranchRepository _branchRepository;
    private readonly IMapper _mapper;

    public UpdateBranchHandler(IBranchRepository branchRepository, IMapper mapper)
    {
        _branchRepository = branchRepository;
        _mapper = mapper;
    }

    public async Task<BranchDto> Handle(UpdateBranchQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new DomainException("Name is required.");

        var existing = await _branchRepository.GetByIdAsync(request.BranchId, cancellationToken)
            ?? throw new KeyNotFoundException($"Branch with ID {request.BranchId} was not found.");

        var updated = new BranchModel
        {
            BranchId = existing.BranchId,
            UniqueNumber = existing.UniqueNumber,
            Name = request.Name,
            Address = request.Address
        };

        var result = await _branchRepository.UpdateAsync(updated, cancellationToken);
        return _mapper.Map<BranchDto>(result);
    }
}
