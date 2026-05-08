using Application.DTOs.Readers;
using Application.Interfaces;
using AutoMapper;
using Domain.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Readers.UpdateMyProfile;

public class UpdateMyProfileHandler : IRequestHandler<UpdateMyProfileQuery, ReaderDto>
{
    private readonly IReaderRepository _readerRepository;
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHashingService _passwordHashingService;
    private readonly IMapper _mapper;

    public UpdateMyProfileHandler(
        IReaderRepository readerRepository,
        IUserRepository userRepository,
        IPasswordHashingService passwordHashingService,
        IMapper mapper)
    {
        _readerRepository = readerRepository;
        _userRepository = userRepository;
        _passwordHashingService = passwordHashingService;
        _mapper = mapper;
    }

    public async Task<ReaderDto> Handle(UpdateMyProfileQuery request, CancellationToken cancellationToken)
    {
        var reader = await _readerRepository.GetByUserIdAsync(request.UserId, cancellationToken)
            ?? throw new KeyNotFoundException("Reader profile not found.");

        string? newPasswordHash = null;

        if (request.NewPassword is not null)
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword))
                throw new DomainException("Current password is required to set a new password.");

            var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken)
                ?? throw new KeyNotFoundException("User not found.");

            if (!_passwordHashingService.VerifyPassword(user.PasswordHash, request.CurrentPassword))
                throw new UnauthorizedAccessException("Current password is incorrect.");

            if (request.NewPassword.Length < 8)
                throw new DomainException("New password must be at least 8 characters.");

            newPasswordHash = _passwordHashingService.HashPassword(request.NewPassword);
        }

        if (request.Phone is not null && request.Phone.Length > 20)
            throw new DomainException("Phone number cannot exceed 20 characters.");

        if (request.Address is not null && request.Address.Length > 200)
            throw new DomainException("Address cannot exceed 200 characters.");

        await _readerRepository.UpdateProfileAsync(
            request.UserId, request.Phone, request.Address, newPasswordHash, cancellationToken);

        var updated = await _readerRepository.GetByUserIdAsync(request.UserId, cancellationToken)!;
        return _mapper.Map<ReaderDto>(updated);
    }
}
