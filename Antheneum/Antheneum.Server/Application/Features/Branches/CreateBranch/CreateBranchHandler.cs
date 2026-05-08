using Application.DTOs.Branches;
using AutoMapper;
using Domain.Entities;
using Domain.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Branches.CreateBranch;

public class CreateBranchHandler : IRequestHandler<CreateBranchQuery, BranchDto>
{
    private readonly IBranchRepository _branchRepository;
    private readonly IMapper _mapper;

    public CreateBranchHandler(IBranchRepository branchRepository, IMapper mapper)
    {
        _branchRepository = branchRepository;
        _mapper = mapper;
    }

    public async Task<BranchDto> Handle(CreateBranchQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new DomainException("Name is required.");

        string uniqueNumber;
        do
        {
            uniqueNumber = $"BR-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        }
        while (await _branchRepository.GetByUniqueNumberAsync(uniqueNumber, cancellationToken) is not null);

        var branch = new BranchModel
        {
            UniqueNumber = uniqueNumber,
            Name = request.Name,
            Address = request.Address
        };

        var created = await _branchRepository.CreateAsync(branch, cancellationToken);
        return _mapper.Map<BranchDto>(created);
    }
}
