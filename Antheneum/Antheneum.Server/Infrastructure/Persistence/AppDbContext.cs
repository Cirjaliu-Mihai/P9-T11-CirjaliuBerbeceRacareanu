using System;
using System.Collections.Generic;
using Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Administrator> Administrators { get; set; }

    public virtual DbSet<Book> Books { get; set; }

    public virtual DbSet<Bookcopy> Bookcopies { get; set; }

    public virtual DbSet<Branch> Branches { get; set; }

    public virtual DbSet<Event> Events { get; set; }

    public virtual DbSet<Loan> Loans { get; set; }

    public virtual DbSet<Reader> Readers { get; set; }

    public virtual DbSet<Unwantedclient> Unwantedclients { get; set; }

    public virtual DbSet<User> Users { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasPostgresEnum("auth", "aal_level", new[] { "aal1", "aal2", "aal3" })
            .HasPostgresEnum("auth", "code_challenge_method", new[] { "s256", "plain" })
            .HasPostgresEnum("auth", "factor_status", new[] { "unverified", "verified" })
            .HasPostgresEnum("auth", "factor_type", new[] { "totp", "webauthn", "phone" })
            .HasPostgresEnum("auth", "oauth_authorization_status", new[] { "pending", "approved", "denied", "expired" })
            .HasPostgresEnum("auth", "oauth_client_type", new[] { "public", "confidential" })
            .HasPostgresEnum("auth", "oauth_registration_type", new[] { "dynamic", "manual" })
            .HasPostgresEnum("auth", "oauth_response_type", new[] { "code" })
            .HasPostgresEnum("auth", "one_time_token_type", new[] { "confirmation_token", "reauthentication_token", "recovery_token", "email_change_token_new", "email_change_token_current", "phone_change_token" })
            .HasPostgresEnum("realtime", "action", new[] { "INSERT", "UPDATE", "DELETE", "TRUNCATE", "ERROR" })
            .HasPostgresEnum("realtime", "equality_op", new[] { "eq", "neq", "lt", "lte", "gt", "gte", "in" })
            .HasPostgresEnum("storage", "buckettype", new[] { "STANDARD", "ANALYTICS", "VECTOR" })
            .HasPostgresExtension("extensions", "pg_stat_statements")
            .HasPostgresExtension("extensions", "pgcrypto")
            .HasPostgresExtension("extensions", "uuid-ossp")
            .HasPostgresExtension("graphql", "pg_graphql")
            .HasPostgresExtension("vault", "supabase_vault");

        modelBuilder.Entity<Administrator>(entity =>
        {
            entity.HasKey(e => e.Adminid).HasName("administrators_pkey");

            entity.ToTable("administrators");

            entity.Property(e => e.Adminid).HasColumnName("adminid");
            entity.Property(e => e.Userid).HasColumnName("userid");

            entity.HasOne(d => d.User).WithMany(p => p.Administrators)
                .HasForeignKey(d => d.Userid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("administrators_userid_fkey");
        });

        modelBuilder.Entity<Book>(entity =>
        {
            entity.HasKey(e => e.Bookid).HasName("books_pkey");

            entity.ToTable("books");

            entity.HasIndex(e => e.IsbnUniquenumber, "books_isbn_uniquenumber_key").IsUnique();

            entity.Property(e => e.Bookid).HasColumnName("bookid");
            entity.Property(e => e.Authors).HasColumnName("authors");
            entity.Property(e => e.IsbnUniquenumber)
                .HasMaxLength(20)
                .HasColumnName("isbn_uniquenumber");
            entity.Property(e => e.Publisher)
                .HasMaxLength(100)
                .HasColumnName("publisher");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
            entity.Property(e => e.ImgUrl)
                .HasMaxLength(500)
                .HasColumnName("imgUrl");
        });

        modelBuilder.Entity<Bookcopy>(entity =>
        {
            entity.HasKey(e => e.Copyid).HasName("bookcopies_pkey");

            entity.ToTable("bookcopies");

            entity.Property(e => e.Copyid).HasColumnName("copyid");
            entity.Property(e => e.Bookid).HasColumnName("bookid");
            entity.Property(e => e.Branchid).HasColumnName("branchid");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasColumnName("status");

            entity.HasOne(d => d.Book).WithMany(p => p.Bookcopies)
                .HasForeignKey(d => d.Bookid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("bookcopies_bookid_fkey");

            entity.HasOne(d => d.Branch).WithMany(p => p.Bookcopies)
                .HasForeignKey(d => d.Branchid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("bookcopies_branchid_fkey");
        });

        modelBuilder.Entity<Branch>(entity =>
        {
            entity.HasKey(e => e.Branchid).HasName("branches_pkey");

            entity.ToTable("branches");

            entity.HasIndex(e => e.Uniquenumber, "branches_uniquenumber_key").IsUnique();

            entity.Property(e => e.Branchid).HasColumnName("branchid");
            entity.Property(e => e.Address).HasColumnName("address");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Uniquenumber)
                .HasMaxLength(50)
                .HasColumnName("uniquenumber");
        });

        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.Eventid).HasName("events_pkey");

            entity.ToTable("events");

            entity.Property(e => e.Eventid).HasColumnName("eventid");
            entity.Property(e => e.Availableseats).HasColumnName("availableseats");
            entity.Property(e => e.Branchid).HasColumnName("branchid");
            entity.Property(e => e.Startdate)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("startdate");
            entity.Property(e => e.Enddate)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("enddate");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Coverimageurl)
                .HasMaxLength(500)
                .HasColumnName("coverimageurl");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");

            entity.HasOne(d => d.Branch).WithMany(p => p.Events)
                .HasForeignKey(d => d.Branchid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("events_branchid_fkey");

            entity.HasMany(d => d.Readers).WithMany(p => p.Events)
                .UsingEntity<Dictionary<string, object>>(
                    "EventAttendee",
                    r => r.HasOne<Reader>().WithMany()
                        .HasForeignKey("Readerid")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("event_attendees_readerid_fkey"),
                    l => l.HasOne<Event>().WithMany()
                        .HasForeignKey("Eventid")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("event_attendees_eventid_fkey"),
                    j =>
                    {
                        j.HasKey("Eventid", "Readerid").HasName("event_attendees_pkey");
                        j.ToTable("event_attendees");
                        j.IndexerProperty<int>("Eventid").HasColumnName("eventid");
                        j.IndexerProperty<int>("Readerid").HasColumnName("readerid");
                    });
        });

        modelBuilder.Entity<Loan>(entity =>
        {
            entity.HasKey(e => e.Loanid).HasName("loans_pkey");

            entity.ToTable("loans");

            entity.Property(e => e.Loanid).HasColumnName("loanid");
            entity.Property(e => e.Actualreturndate).HasColumnName("actualreturndate");
            entity.Property(e => e.Copyid).HasColumnName("copyid");
            entity.Property(e => e.Duedate).HasColumnName("duedate");
            entity.Property(e => e.Loandate).HasColumnName("loandate");
            entity.Property(e => e.Readerid).HasColumnName("readerid");

            entity.HasOne(d => d.Copy).WithMany(p => p.Loans)
                .HasForeignKey(d => d.Copyid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("loans_copyid_fkey");

            entity.HasOne(d => d.Reader).WithMany(p => p.Loans)
                .HasForeignKey(d => d.Readerid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("loans_readerid_fkey");
        });

        modelBuilder.Entity<Reader>(entity =>
        {
            entity.HasKey(e => e.Readerid).HasName("readers_pkey");

            entity.ToTable("readers");

            entity.HasIndex(e => e.Librarycardnumber, "readers_librarycardnumber_key").IsUnique();

            entity.Property(e => e.Readerid).HasColumnName("readerid");
            entity.Property(e => e.Isblacklisted)
                .HasDefaultValue(false)
                .HasColumnName("isblacklisted");
            entity.Property(e => e.Librarycardnumber)
                .HasMaxLength(50)
                .HasColumnName("librarycardnumber");
            entity.Property(e => e.Subscriptionexpiry).HasColumnName("subscriptionexpiry");
            entity.Property(e => e.Userid).HasColumnName("userid");

            entity.HasOne(d => d.User).WithMany(p => p.Readers)
                .HasForeignKey(d => d.Userid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("readers_userid_fkey");
        });

        modelBuilder.Entity<Unwantedclient>(entity =>
        {
            entity.HasKey(e => e.Penaltyid).HasName("unwantedclients_pkey");

            entity.ToTable("unwantedclients");

            entity.Property(e => e.Penaltyid).HasColumnName("penaltyid");
            entity.Property(e => e.Isresolved)
                .HasDefaultValue(false)
                .HasColumnName("isresolved");
            entity.Property(e => e.Loanid).HasColumnName("loanid");
            entity.Property(e => e.Penaltyamount)
                .HasPrecision(10, 2)
                .HasColumnName("penaltyamount");
            entity.Property(e => e.Readerid).HasColumnName("readerid");
            entity.Property(e => e.Reason).HasColumnName("reason");

            entity.HasOne(d => d.Loan).WithMany(p => p.Unwantedclients)
                .HasForeignKey(d => d.Loanid)
                .HasConstraintName("unwantedclients_loanid_fkey");

            entity.HasOne(d => d.Reader).WithMany(p => p.Unwantedclients)
                .HasForeignKey(d => d.Readerid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("unwantedclients_readerid_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Userid).HasName("users_pkey");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "users_email_key").IsUnique();

            entity.HasIndex(e => e.Username, "users_username_key").IsUnique();

            entity.Property(e => e.Userid).HasColumnName("userid");
            entity.Property(e => e.Address).HasColumnName("address");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.Passwordhash).HasColumnName("passwordhash");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .HasColumnName("phone");
            entity.Property(e => e.Username)
                .HasMaxLength(50)
                .HasColumnName("username");

            entity.Property(e => e.Refreshtoken)
                .HasColumnName("refreshtoken");

            entity.Property(e => e.Refreshtokenexpiry)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("refreshtokenexpiry");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
