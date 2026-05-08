using Application.DTOs.Readers;
using MediatR;

namespace Application.Features.Readers.UpdateMyProfile;

public record UpdateMyProfileQuery(
    int UserId,
    string? Phone,
    string? Address,
    string? CurrentPassword,
    string? NewPassword) : IRequest<ReaderDto>;
