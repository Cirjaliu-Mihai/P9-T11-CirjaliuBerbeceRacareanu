using Application.DTOs.Readers;
using AutoMapper;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Readers.GetReaders;

public class GetReadersHandler : IRequestHandler<GetReadersQuery, IEnumerable<ReaderDto>>
{
    private readonly IReaderRepository _readerRepository;
    private readonly IMapper _mapper;

    public GetReadersHandler(IReaderRepository readerRepository, IMapper mapper)
    {
        _readerRepository = readerRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ReaderDto>> Handle(GetReadersQuery request, CancellationToken cancellationToken)
    {
        var readers = await _readerRepository.GetAllAsync(request.Search, request.SortBy, cancellationToken);
        return _mapper.Map<IEnumerable<ReaderDto>>(readers);
    }
}
