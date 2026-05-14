using MediatR;

namespace Application.Features.Readers.ResolvePenalty;

public record ResolvePenaltyQuery(int PenaltyId) : IRequest;