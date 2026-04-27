using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Models;

public partial class Unwantedclient
{
    public int Penaltyid { get; set; }

    public int? Loanid { get; set; }

    public int Readerid { get; set; }

    public string? Reason { get; set; }

    public decimal? Penaltyamount { get; set; }

    public bool? Isresolved { get; set; }

    public virtual Loan? Loan { get; set; }

    public virtual Reader Reader { get; set; } = null!;
}
