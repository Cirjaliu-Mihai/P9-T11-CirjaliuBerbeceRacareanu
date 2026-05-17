using Application.Interfaces;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Events.EnrollInEvent;

public class EnrollInEventHandler : IRequestHandler<EnrollInEventQuery, bool>
{
    private readonly IEventRepository _eventRepository;
    private readonly IReaderRepository _readerRepository;
    private readonly IEmailNotificationService _emailNotificationService;

    public EnrollInEventHandler(
        IEventRepository eventRepository,
        IReaderRepository readerRepository,
        IEmailNotificationService emailNotificationService)
    {
        _eventRepository = eventRepository;
        _readerRepository = readerRepository;
        _emailNotificationService = emailNotificationService;
    }

    public async Task<bool> Handle(EnrollInEventQuery request, CancellationToken cancellationToken)
    {
        var eventExists = await _eventRepository.EventExistsAsync(request.EventId, cancellationToken);
        if (!eventExists)
        {
            throw new KeyNotFoundException($"Event with id {request.EventId} not found.");
        }
        var enrolled = await _eventRepository.EnrollReaderAsync(request.EventId, request.ReaderId, cancellationToken);
        if (!enrolled)
        {
            return false;
        }

        var eventModel = await _eventRepository.GetByIdAsync(request.EventId, cancellationToken)
            ?? throw new KeyNotFoundException($"Event with id {request.EventId} not found.");

        var reader = await _readerRepository.GetByIdAsync(request.ReaderId, cancellationToken)
            ?? throw new KeyNotFoundException($"Reader with id {request.ReaderId} not found.");

        await _emailNotificationService.SendAsync(
            new NotificationEmailRequest(
                RecipientEmail: reader.Email,
                Subject: $"Event registration confirmed: {eventModel.Title}",
                Body:
                    $"<p>Hello {reader.Username},</p>" +
                    $"<p>You are enrolled for <strong>{eventModel.Title}</strong>.</p>" +
                    $"<p>Starts: {eventModel.StartDate:yyyy-MM-dd HH:mm} UTC</p>",
                TemplateKey: "event_registration_confirmation",
                CorrelationKey: $"event:{eventModel.EventId}:reader:{reader.ReaderId}",
                Cooldown: TimeSpan.FromDays(36500)),
            cancellationToken);

        return true;
    }
}
