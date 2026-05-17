using System;

namespace Infrastructure.Persistence.Models;

public partial class Notificationlog
{
    public int Notificationid { get; set; }

    public string Templatekey { get; set; } = null!;

    public string Recipientemail { get; set; } = null!;

    public string Correlationkey { get; set; } = null!;

    public string Status { get; set; } = null!;

    public int Attempts { get; set; }

    public DateTime Lastattemptat { get; set; }

    public DateTime? Sentat { get; set; }

    public string? Error { get; set; }
}
