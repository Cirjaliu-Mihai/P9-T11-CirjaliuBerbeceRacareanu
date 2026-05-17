using Application.Interfaces;
using Infrastructure.Persistence;
using Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace Infrastructure.Services;

public class EmailNotificationService : IEmailNotificationService
{
    private readonly AppDbContext _context;
    private readonly NotificationOptions _options;
    private readonly ILogger<EmailNotificationService> _logger;

    public EmailNotificationService(
        AppDbContext context,
        IOptions<NotificationOptions> options,
        ILogger<EmailNotificationService> logger)
    {
        _context = context;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(NotificationEmailRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.RecipientEmail)
            || string.IsNullOrWhiteSpace(request.TemplateKey)
            || string.IsNullOrWhiteSpace(request.CorrelationKey))
        {
            _logger.LogWarning("Skipping email due to invalid notification request payload.");
            return;
        }

        var now = DateTime.UtcNow;

        var entry = await _context.Notificationlogs
            .FirstOrDefaultAsync(
                item => item.Templatekey == request.TemplateKey
                    && item.Recipientemail == request.RecipientEmail
                    && item.Correlationkey == request.CorrelationKey,
                cancellationToken);

        if (entry is not null && entry.Sentat.HasValue)
        {
            var elapsed = now - entry.Sentat.Value;
            if (elapsed < request.Cooldown)
            {
                return;
            }
        }

        if (entry is null)
        {
            entry = new Notificationlog
            {
                Templatekey = request.TemplateKey,
                Recipientemail = request.RecipientEmail,
                Correlationkey = request.CorrelationKey,
                Attempts = 0
            };
            await _context.Notificationlogs.AddAsync(entry, cancellationToken);
        }

        entry.Attempts += 1;
        entry.Lastattemptat = DateTime.SpecifyKind(now, DateTimeKind.Unspecified);

        if (!_options.Enabled)
        {
            entry.Status = "suppressed";
            entry.Error = "Notification delivery is disabled in configuration.";
            await _context.SaveChangesAsync(cancellationToken);
            return;
        }

        try
        {
            using var message = new MailMessage
            {
                From = new MailAddress(_options.Smtp.FromAddress, _options.Smtp.FromName),
                Subject = request.Subject,
                Body = request.Body,
                IsBodyHtml = true
            };
            message.To.Add(request.RecipientEmail);

            using var smtpClient = new SmtpClient(_options.Smtp.Host, _options.Smtp.Port)
            {
                EnableSsl = _options.Smtp.EnableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false
            };

            if (!string.IsNullOrWhiteSpace(_options.Smtp.Username))
            {
                smtpClient.Credentials = new NetworkCredential(_options.Smtp.Username, _options.Smtp.Password);
            }

            await smtpClient.SendMailAsync(message, cancellationToken);

            entry.Status = "sent";
            entry.Error = null;
            entry.Sentat = DateTime.SpecifyKind(now, DateTimeKind.Unspecified);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            entry.Status = "failed";
            entry.Error = ex.Message.Length > 1500 ? ex.Message[..1500] : ex.Message;
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogError(
                ex,
                "Failed to send email for template {TemplateKey} and correlation {CorrelationKey}.",
                request.TemplateKey,
                request.CorrelationKey);
        }
    }
}
