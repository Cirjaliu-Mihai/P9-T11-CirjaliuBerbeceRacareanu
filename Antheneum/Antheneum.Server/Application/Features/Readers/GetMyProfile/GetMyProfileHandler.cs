using Application.DTOs.Readers;
using AutoMapper;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Readers.GetMyProfile;

public class GetMyProfileHandler : IRequestHandler<GetMyProfileQuery, ReaderDto>
{
    private readonly IReaderRepository _readerRepository;
    private readonly IMapper _mapper;

    public GetMyProfileHandler(IReaderRepository readerRepository, IMapper mapper)
    {
        _readerRepository = readerRepository;
        _mapper = mapper;
    }

    public async Task<ReaderDto> Handle(GetMyProfileQuery request, CancellationToken cancellationToken)
    {
        var reader = await _readerRepository.GetByUserIdAsync(request.UserId, cancellationToken)
            ?? throw new KeyNotFoundException("Reader profile not found.");
        return _mapper.Map<ReaderDto>(reader);
    }
}
