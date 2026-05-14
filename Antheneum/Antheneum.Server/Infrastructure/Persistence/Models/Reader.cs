using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Models;

public partial class Reader
{
    public int Readerid { get; set; }

    public int Userid { get; set; }

    public string Librarycardnumber { get; set; } = null!;

    public bool? Isblacklisted { get; set; }

    public DateOnly? Subscriptionexpiry { get; set; }

    public virtual ICollection<Loan> Loans { get; set; } = new List<Loan>();

    public virtual ICollection<Unwantedclient> Unwantedclients { get; set; } = new List<Unwantedclient>();

    public virtual User User { get; set; } = null!;

    public virtual ICollection<Event> Events { get; set; } = new List<Event>();
}
