using Application.DTOs.Branches;
using MediatR;

namespace Application.Features.Branches.GetBranches;

public record GetBranchesQuery : IRequest<IEnumerable<BranchDto>>;
