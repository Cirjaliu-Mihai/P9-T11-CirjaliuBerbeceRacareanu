using Application.DTOs.Branches;
using MediatR;

namespace Application.Features.Branches.UpdateBranch;

public record UpdateBranchQuery(int BranchId, string Name, string? Address) : IRequest<BranchDto>;
