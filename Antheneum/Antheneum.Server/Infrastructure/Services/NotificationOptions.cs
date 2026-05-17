namespace Infrastructure.Services;

public class NotificationOptions
{
    public bool Enabled { get; set; }

    public SmtpOptions Smtp { get; set; } = new();

    public ReminderOptions Reminders { get; set; } = new();
}

public class SmtpOptions
{
    public string Host { get; set; } = string.Empty;

    public int Port { get; set; } = 587;

    public bool EnableSsl { get; set; } = true;

    public string? Username { get; set; }

    public string? Password { get; set; }

    public string FromAddress { get; set; } = string.Empty;

    public string FromName { get; set; } = "Antheneum";
}

public class ReminderOptions
{
    public bool Enabled { get; set; } = true;

    public int IntervalMinutes { get; set; } = 1440;

    public int DueReminderDaysBefore { get; set; } = 3;

    public int DueReminderCooldownHours { get; set; } = 72;

    public int OverdueReminderCooldownHours { get; set; } = 48;
}
