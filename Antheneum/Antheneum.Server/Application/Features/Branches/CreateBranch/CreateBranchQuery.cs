using Application.DTOs.Branches;
using MediatR;

namespace Application.Features.Branches.CreateBranch;

public record CreateBranchQuery(string Name, string? Address) : IRequest<BranchDto>;
