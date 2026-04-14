using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Models;

public partial class Event
{
    public int Eventid { get; set; }

    public int Branchid { get; set; }

    public string Title { get; set; } = null!;

    public DateTime Date { get; set; }

    public int? Availableseats { get; set; }

    public virtual Branch Branch { get; set; } = null!;

    public virtual ICollection<Reader> Readers { get; set; } = new List<Reader>();
}
