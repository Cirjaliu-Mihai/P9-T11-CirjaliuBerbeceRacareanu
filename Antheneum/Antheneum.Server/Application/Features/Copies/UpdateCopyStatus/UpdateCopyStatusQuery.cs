using MediatR;

namespace Application.Features.Copies.UpdateCopyStatus;

public record UpdateCopyStatusQuery(int CopyId, string Status) : IRequest;
