using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Models;

public partial class User
{
    public int Userid { get; set; }

    public string Username { get; set; } = null!;

    public string Passwordhash { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Phone { get; set; }

    public string? Address { get; set; }

    public string? Refreshtoken { get; set; }

    public DateTime? Refreshtokenexpiry { get; set; }

    public virtual ICollection<Administrator> Administrators { get; set; } = new List<Administrator>();

    public virtual ICollection<Reader> Readers { get; set; } = new List<Reader>();
}
