using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Models;

public partial class Event
{
    public int Eventid { get; set; }

    public int Branchid { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime Startdate { get; set; }

    public DateTime Enddate { get; set; }

    public int? Availableseats { get; set; }

    public string? Coverimageurl { get; set; }

    public virtual Branch Branch { get; set; } = null!;

    public virtual ICollection<Reader> Readers { get; set; } = new List<Reader>();
}
