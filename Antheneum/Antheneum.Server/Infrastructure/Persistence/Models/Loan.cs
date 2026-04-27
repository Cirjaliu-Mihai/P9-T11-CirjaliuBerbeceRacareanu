using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Models;

public partial class Loan
{
    public int Loanid { get; set; }

    public int Copyid { get; set; }

    public int Readerid { get; set; }

    public DateOnly Loandate { get; set; }

    public DateOnly Duedate { get; set; }

    public DateOnly? Actualreturndate { get; set; }

    public virtual Bookcopy Copy { get; set; } = null!;

    public virtual Reader Reader { get; set; } = null!;

    public virtual ICollection<Unwantedclient> Unwantedclients { get; set; } = new List<Unwantedclient>();
}
