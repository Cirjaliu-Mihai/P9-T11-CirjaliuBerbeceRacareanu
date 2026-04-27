using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Models;

public partial class Book
{
    public int Bookid { get; set; }

    public string IsbnUniquenumber { get; set; } = null!;

    public string Title { get; set; } = null!;

    public string? Authors { get; set; }

    public string? Publisher { get; set; }

    public virtual ICollection<Bookcopy> Bookcopies { get; set; } = new List<Bookcopy>();
}
