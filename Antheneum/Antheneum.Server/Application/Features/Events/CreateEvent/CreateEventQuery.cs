using Application.DTOs.Events;
using MediatR;

namespace Application.Features.Events.CreateEvent;

public record CreateEventQuery(
    EventFormValue FormValue,
    Stream? CoverImageStream,
    string? CoverImageContentType) : IRequest<EventDetailDto>;