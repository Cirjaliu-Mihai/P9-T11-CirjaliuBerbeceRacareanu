using MediatR;

namespace Application.Features.Readers.RemoveFromBlacklist;

public record RemoveFromBlacklistQuery(int ReaderId) : IRequest;
