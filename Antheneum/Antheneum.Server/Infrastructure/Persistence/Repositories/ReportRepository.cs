using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class ReportRepository : IReportRepository
{
    private readonly AppDbContext _context;

    public ReportRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(IEnumerable<InventoryReportModel> Items, int TotalCount)> GetInventoryAsync(
        int? branchId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Bookcopies
            .AsNoTracking()
            .Where(copy => !branchId.HasValue || copy.Branchid == branchId.Value)
            .GroupBy(copy => new
            {
                copy.Branchid,
                BranchName = copy.Branch.Name,
                copy.Bookid,
                Isbn = copy.Book.IsbnUniquenumber,
                Title = copy.Book.Title
            })
            .Select(group => new InventoryReportModel
            {
                BranchId = group.Key.Branchid,
                BranchName = group.Key.BranchName,
                BookId = group.Key.Bookid,
                Isbn = group.Key.Isbn,
                Title = group.Key.Title,
                TotalCopies = group.Count(),
                AvailableCopies = group.Count(copy => copy.Status == null || copy.Status == "Available"),
                BorrowedCopies = group.Count(copy => copy.Status == "Borrowed")
            });

        int totalCount = await query.CountAsync(cancellationToken);

        List<InventoryReportModel> items = await query
            .OrderBy(item => item.BranchName)
            .ThenBy(item => item.Title)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<(IEnumerable<OverdueReportModel> Items, int TotalCount)> GetOverdueAsync(
        int? branchId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);

        var penaltiesByLoan = _context.Unwantedclients
            .AsNoTracking()
            .Where(penalty => penalty.Loanid != null)
            .GroupBy(penalty => penalty.Loanid!.Value)
            .Select(group => new
            {
                LoanId = group.Key,
                LoanFineTotal = group.Sum(item => item.Penaltyamount ?? 0m)
            });

        var query = from loan in _context.Loans.AsNoTracking()
                    join penalty in penaltiesByLoan on loan.Loanid equals penalty.LoanId into penaltyGroup
                    from penalty in penaltyGroup.DefaultIfEmpty()
                    where loan.Actualreturndate == null
                        && loan.Duedate < today
                        && (!branchId.HasValue || loan.Copy.Branchid == branchId.Value)
                    select new OverdueReportModel
                    {
                        ReaderId = loan.Readerid,
                        Username = loan.Reader.User.Username,
                        Email = loan.Reader.User.Email,
                        LibraryCardNumber = loan.Reader.Librarycardnumber,
                        LoanId = loan.Loanid,
                        BranchId = loan.Copy.Branchid,
                        BranchName = loan.Copy.Branch.Name,
                        BookTitle = loan.Copy.Book.Title,
                        LoanDate = loan.Loandate,
                        DueDate = loan.Duedate,
                        OverdueDays = today.DayNumber - loan.Duedate.DayNumber,
                        LoanFineTotal = penalty != null ? penalty.LoanFineTotal : 0m
                    };

        int totalCount = await query.CountAsync(cancellationToken);

        List<OverdueReportModel> items = await query
            .OrderByDescending(item => item.OverdueDays)
            .ThenBy(item => item.Username)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<(IEnumerable<BlacklistReportModel> Items, int TotalCount)> GetBlacklistAsync(
        int? branchId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Unwantedclients
            .AsNoTracking()
            .Where(entry => entry.Isresolved != true)
            .Where(entry => !branchId.HasValue || (entry.Loan != null && entry.Loan.Copy.Branchid == branchId.Value))
            .Select(entry => new BlacklistReportModel
            {
                PenaltyId = entry.Penaltyid,
                ReaderId = entry.Readerid,
                Username = entry.Reader.User.Username,
                Email = entry.Reader.User.Email,
                LibraryCardNumber = entry.Reader.Librarycardnumber,
                LoanId = entry.Loanid,
                BranchId = entry.Loan != null ? entry.Loan.Copy.Branchid : null,
                BranchName = entry.Loan != null ? entry.Loan.Copy.Branch.Name : null,
                Reason = entry.Reason,
                PenaltyAmount = entry.Penaltyamount ?? 0m,
                IsResolved = entry.Isresolved ?? false
            });

        int totalCount = await query.CountAsync(cancellationToken);

        List<BlacklistReportModel> items = await query
            .OrderByDescending(item => item.PenaltyId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<(IEnumerable<TransactionReportModel> Items, int TotalCount)> GetTransactionsAsync(
        DateOnly from,
        DateOnly to,
        int? branchId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Loans
            .AsNoTracking()
            .Where(loan => loan.Loandate >= from && loan.Loandate <= to)
            .Where(loan => !branchId.HasValue || loan.Copy.Branchid == branchId.Value)
            .Select(loan => new TransactionReportModel
            {
                LoanId = loan.Loanid,
                ReaderId = loan.Readerid,
                Username = loan.Reader.User.Username,
                CopyId = loan.Copyid,
                BranchId = loan.Copy.Branchid,
                BranchName = loan.Copy.Branch.Name,
                BookId = loan.Copy.Bookid,
                Isbn = loan.Copy.Book.IsbnUniquenumber,
                BookTitle = loan.Copy.Book.Title,
                LoanDate = loan.Loandate,
                DueDate = loan.Duedate,
                ActualReturnDate = loan.Actualreturndate,
                TransactionStatus = loan.Actualreturndate == null ? "Borrowed" : "Returned"
            });

        int totalCount = await query.CountAsync(cancellationToken);

        List<TransactionReportModel> items = await query
            .OrderByDescending(item => item.LoanDate)
            .ThenByDescending(item => item.LoanId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}