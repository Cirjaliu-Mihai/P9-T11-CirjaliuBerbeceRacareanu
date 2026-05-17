using Application.Interfaces;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.Services;

public class LoanReminderBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly NotificationOptions _options;
    private readonly ILogger<LoanReminderBackgroundService> _logger;

    public LoanReminderBackgroundService(
        IServiceScopeFactory scopeFactory,
        IOptions<NotificationOptions> options,
        ILogger<LoanReminderBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _options = options.Value;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalMinutes = Math.Clamp(_options.Reminders.IntervalMinutes, 5, 24 * 60);
        var interval = TimeSpan.FromMinutes(intervalMinutes);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RunReminderCycleAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Loan reminder cycle failed.");
            }

            await Task.Delay(interval, stoppingToken);
        }
    }

    private async Task RunReminderCycleAsync(CancellationToken cancellationToken)
    {
        if (!_options.Enabled || !_options.Reminders.Enabled)
        {
            return;
        }

        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var emailNotificationService = scope.ServiceProvider.GetRequiredService<IEmailNotificationService>();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var dueDate = today.AddDays(_options.Reminders.DueReminderDaysBefore);

        var dueSoonLoans = await context.Loans
            .AsNoTracking()
            .Where(loan => loan.Actualreturndate == null && loan.Duedate == dueDate)
            .Select(loan => new
            {
                loan.Loanid,
                loan.Duedate,
                BookTitle = loan.Copy.Book.Title,
                ReaderEmail = loan.Reader.User.Email,
                ReaderUsername = loan.Reader.User.Username
            })
            .ToListAsync(cancellationToken);

        foreach (var loan in dueSoonLoans)
        {
            await emailNotificationService.SendAsync(
                new NotificationEmailRequest(
                    RecipientEmail: loan.ReaderEmail,
                    Subject: "Book due reminder",
                    Body:
                        $"<p>Hello {loan.ReaderUsername},</p>" +
                        $"<p>This is a reminder that <strong>{loan.BookTitle}</strong> is due on {loan.Duedate:yyyy-MM-dd}.</p>",
                    TemplateKey: "loan_due_reminder",
                    CorrelationKey: $"loan:{loan.Loanid}:due:{loan.Duedate:yyyyMMdd}",
                    Cooldown: TimeSpan.FromHours(Math.Max(1, _options.Reminders.DueReminderCooldownHours))),
                cancellationToken);
        }

        var overdueLoans = await context.Loans
            .AsNoTracking()
            .Where(loan => loan.Actualreturndate == null && loan.Duedate < today)
            .Select(loan => new
            {
                loan.Loanid,
                loan.Duedate,
                BookTitle = loan.Copy.Book.Title,
                ReaderEmail = loan.Reader.User.Email,
                ReaderUsername = loan.Reader.User.Username
            })
            .ToListAsync(cancellationToken);

        foreach (var loan in overdueLoans)
        {
            var overdueDays = today.DayNumber - loan.Duedate.DayNumber;

            await emailNotificationService.SendAsync(
                new NotificationEmailRequest(
                    RecipientEmail: loan.ReaderEmail,
                    Subject: "Overdue loan reminder",
                    Body:
                        $"<p>Hello {loan.ReaderUsername},</p>" +
                        $"<p><strong>{loan.BookTitle}</strong> is overdue by {overdueDays} day(s). Please return it as soon as possible.</p>",
                    TemplateKey: "loan_overdue_reminder",
                    CorrelationKey: $"loan:{loan.Loanid}:overdue",
                    Cooldown: TimeSpan.FromHours(Math.Max(1, _options.Reminders.OverdueReminderCooldownHours))),
                cancellationToken);
        }
    }
}
