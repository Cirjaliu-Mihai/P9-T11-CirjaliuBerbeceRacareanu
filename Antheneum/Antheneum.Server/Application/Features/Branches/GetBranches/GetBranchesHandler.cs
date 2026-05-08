using Application.DTOs.Branches;
using AutoMapper;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Branches.GetBranches;

public class GetBranchesHandler : IRequestHandler<GetBranchesQuery, IEnumerable<BranchDto>>
{
    private readonly IBranchRepository _branchRepository;
    private readonly IMapper _mapper;

    public GetBranchesHandler(IBranchRepository branchRepository, IMapper mapper)
    {
        _branchRepository = branchRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<BranchDto>> Handle(GetBranchesQuery request, CancellationToken cancellationToken)
    {
        var branches = await _branchRepository.GetAllAsync(cancellationToken);
        return _mapper.Map<IEnumerable<BranchDto>>(branches);
    }
}
