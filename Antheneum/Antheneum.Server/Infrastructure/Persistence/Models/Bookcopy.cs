using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Models;

public partial class Bookcopy
{
    public int Copyid { get; set; }

    public int Bookid { get; set; }

    public int Branchid { get; set; }

    public string? Status { get; set; }

    public virtual Book Book { get; set; } = null!;

    public virtual Branch Branch { get; set; } = null!;

    public virtual ICollection<Loan> Loans { get; set; } = new List<Loan>();
}
