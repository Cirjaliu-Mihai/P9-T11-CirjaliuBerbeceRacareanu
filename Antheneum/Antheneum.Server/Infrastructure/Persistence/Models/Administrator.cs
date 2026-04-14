using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Models;

public partial class Administrator
{
    public int Adminid { get; set; }

    public int Userid { get; set; }

    public virtual User User { get; set; } = null!;
}
