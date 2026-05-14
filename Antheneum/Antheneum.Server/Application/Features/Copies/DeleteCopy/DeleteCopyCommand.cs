using MediatR;

namespace Application.Features.Copies.DeleteCopy;

public record DeleteCopyCommand(int CopyId) : IRequest;
