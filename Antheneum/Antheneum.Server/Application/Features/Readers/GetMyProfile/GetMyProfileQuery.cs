using Application.DTOs.Readers;
using MediatR;

namespace Application.Features.Readers.GetMyProfile;

public record GetMyProfileQuery(int UserId) : IRequest<ReaderDto>;
