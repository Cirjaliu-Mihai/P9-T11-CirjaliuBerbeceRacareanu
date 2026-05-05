using MediatR;

namespace Application.Features.Books.AddCopy;

public record AddCopyQuery(int BookId, int BranchId, int Count = 1) : IRequest;
