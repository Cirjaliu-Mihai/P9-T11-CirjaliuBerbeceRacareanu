namespace Application.Interfaces;

public record NotificationEmailRequest(
    string RecipientEmail,
    string Subject,
    string Body,
    string TemplateKey,
    string CorrelationKey,
    TimeSpan Cooldown);

public interface IEmailNotificationService
{
    Task SendAsync(NotificationEmailRequest request, CancellationToken cancellationToken = default);
}
