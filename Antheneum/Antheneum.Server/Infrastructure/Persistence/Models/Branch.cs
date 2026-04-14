using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Models;

public partial class Branch
{
    public int Branchid { get; set; }

    public string Uniquenumber { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? Address { get; set; }

    public virtual ICollection<Bookcopy> Bookcopies { get; set; } = new List<Bookcopy>();

    public virtual ICollection<Event> Events { get; set; } = new List<Event>();
}
