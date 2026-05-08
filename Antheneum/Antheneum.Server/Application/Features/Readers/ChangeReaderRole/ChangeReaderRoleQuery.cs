using Application.DTOs.Readers;
using Domain.Enums;
using MediatR;

namespace Application.Features.Readers.ChangeReaderRole;

public record ChangeReaderRoleQuery(int ReaderId, Role NewRole) : IRequest<ReaderDto>;
