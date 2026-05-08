using Application.DTOs.Readers;
using MediatR;

namespace Application.Features.Readers.GetReaders;

public record GetReadersQuery(string? Search = null, string? SortBy = "name") : IRequest<IEnumerable<ReaderDto>>;
