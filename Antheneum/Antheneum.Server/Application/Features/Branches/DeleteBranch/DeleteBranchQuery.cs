using MediatR;

namespace Application.Features.Branches.DeleteBranch;

public record DeleteBranchQuery(int BranchId) : IRequest;
