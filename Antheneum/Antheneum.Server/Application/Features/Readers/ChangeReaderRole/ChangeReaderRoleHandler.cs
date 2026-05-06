using Application.DTOs.Readers;
using AutoMapper;
using Domain.Enums;
using Domain.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Readers.ChangeReaderRole;

public class ChangeReaderRoleHandler : IRequestHandler<ChangeReaderRoleQuery, ReaderDto>
{
    private readonly IReaderRepository _readerRepository;
    private readonly IMapper _mapper;

    public ChangeReaderRoleHandler(IReaderRepository readerRepository, IMapper mapper)
    {
        _readerRepository = readerRepository;
        _mapper = mapper;
    }

    public async Task<ReaderDto> Handle(ChangeReaderRoleQuery request, CancellationToken cancellationToken)
    {
        if (!Enum.IsDefined(request.NewRole))
            throw new DomainException("Invalid role.");

        var reader = await _readerRepository.GetByIdAsync(request.ReaderId, cancellationToken)
            ?? throw new KeyNotFoundException($"Reader with ID {request.ReaderId} was not found.");

        if (reader.Role == request.NewRole)
            throw new ConflictException($"Reader is already in the '{request.NewRole}' role.");

        await _readerRepository.ChangeRoleAsync(request.ReaderId, request.NewRole, cancellationToken);

        var updated = await _readerRepository.GetByIdAsync(request.ReaderId, cancellationToken)!;
        return _mapper.Map<ReaderDto>(updated);
    }
}
