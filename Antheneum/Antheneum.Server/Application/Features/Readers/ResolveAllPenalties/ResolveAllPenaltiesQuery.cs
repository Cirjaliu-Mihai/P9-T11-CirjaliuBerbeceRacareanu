using MediatR;

namespace Application.Features.Readers.ResolveAllPenalties;

public record ResolveAllPenaltiesQuery(int ReaderId) : IRequest;
