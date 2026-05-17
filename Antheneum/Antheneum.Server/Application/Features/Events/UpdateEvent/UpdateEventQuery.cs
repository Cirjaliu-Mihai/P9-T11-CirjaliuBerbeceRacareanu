using Application.DTOs.Events;
using MediatR;

namespace Application.Features.Events.UpdateEvent;

public record UpdateEventQuery(
    EventFormValue FormValue,
    Stream? CoverImageStream,
    string? CoverImageContentType) : IRequest<EventDetailDto>;