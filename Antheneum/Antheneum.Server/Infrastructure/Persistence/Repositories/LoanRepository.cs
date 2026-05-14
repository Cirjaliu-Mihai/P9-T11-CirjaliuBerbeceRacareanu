using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class LoanRepository : ILoanRepository
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public LoanRepository(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<LoanModel> CreateAsync(int copyId, int readerId, DateOnly loanDate, DateOnly dueDate, CancellationToken cancellationToken = default)
    {
        var copy = await _context.Bookcopies
            .FirstOrDefaultAsync(c => c.Copyid == copyId, cancellationToken)
            ?? throw new KeyNotFoundException($"Copy {copyId} not found.");

        copy.Status = "Borrowed";

        var loan = new Loan
        {
            Copyid = copyId,
            Readerid = readerId,
            Loandate = loanDate,
            Duedate = dueDate
        };

        _context.Loans.Add(loan);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdInternalAsync(loan.Loanid, cancellationToken);
    }

    public async Task<LoanModel?> GetByIdAsync(int loanId, CancellationToken cancellationToken = default)
    {
        var loan = await _context.Loans
            .AsNoTracking()
            .Include(l => l.Copy)
                .ThenInclude(c => c.Book)
            .Include(l => l.Copy)
                .ThenInclude(c => c.Branch)
            .FirstOrDefaultAsync(l => l.Loanid == loanId, cancellationToken);

        return loan is null ? null : _mapper.Map<LoanModel>(loan);
    }

    public async Task<int> GetActiveCountForReaderAsync(int readerId, CancellationToken cancellationToken = default)
    {
        return await _context.Loans
            .AsNoTracking()
            .CountAsync(l => l.Readerid == readerId && l.Actualreturndate == null, cancellationToken);
    }

    public async Task<bool> IsReaderBlacklistedAsync(int readerId, CancellationToken cancellationToken = default)
    {
        var reader = await _context.Readers
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Readerid == readerId, cancellationToken);

        return reader?.Isblacklisted == true;
    }

    public async Task<int?> GetReaderIdByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        var reader = await _context.Readers
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Userid == userId, cancellationToken);

        return reader?.Readerid;
    }

    public async Task RenewAsync(int loanId, DateOnly newDueDate, CancellationToken cancellationToken = default)
    {
        var loan = await _context.Loans
            .FirstOrDefaultAsync(l => l.Loanid == loanId, cancellationToken)
            ?? throw new KeyNotFoundException($"Loan {loanId} not found.");

        loan.Duedate = newDueDate;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<LoanModel> ReturnAsync(int loanId, DateOnly actualReturnDate, CancellationToken cancellationToken = default)
    {
        var loan = await _context.Loans
            .Include(l => l.Copy)
            .FirstOrDefaultAsync(l => l.Loanid == loanId, cancellationToken)
            ?? throw new KeyNotFoundException($"Loan {loanId} not found.");

        loan.Actualreturndate = actualReturnDate;
        loan.Copy.Status = "Available";
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdInternalAsync(loanId, cancellationToken);
    }

    public async Task AddFineAsync(int loanId, int readerId, decimal amount, string reason, CancellationToken cancellationToken = default)
    {
        var fine = new Unwantedclient
        {
            Loanid = loanId,
            Readerid = readerId,
            Reason = reason,
            Penaltyamount = amount,
            Isresolved = false
        };

        _context.Unwantedclients.Add(fine);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<decimal> GetTotalUnresolvedFinesAsync(int readerId, CancellationToken cancellationToken = default)
    {
        var total = await _context.Unwantedclients
            .AsNoTracking()
            .Where(u => u.Readerid == readerId && u.Isresolved == false)
            .SumAsync(u => (decimal?)u.Penaltyamount ?? 0m, cancellationToken);

        return total;
    }

    public async Task BlacklistReaderAsync(int readerId, CancellationToken cancellationToken = default)
    {
        var reader = await _context.Readers
            .FirstOrDefaultAsync(r => r.Readerid == readerId, cancellationToken)
            ?? throw new KeyNotFoundException($"Reader {readerId} not found.");

        reader.Isblacklisted = true;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<LoanModel>> GetByReaderIdAsync(int readerId, CancellationToken cancellationToken = default)
    {
        var loans = await _context.Loans
            .AsNoTracking()
            .Include(l => l.Copy)
                .ThenInclude(c => c.Book)
            .Include(l => l.Copy)
                .ThenInclude(c => c.Branch)
            .Where(l => l.Readerid == readerId)
            .OrderByDescending(l => l.Loandate)
            .ToListAsync(cancellationToken);

        return _mapper.Map<IEnumerable<LoanModel>>(loans);
    }

    public async Task<bool> IsCopyAvailableAsync(int copyId, CancellationToken cancellationToken = default)
    {
        var copy = await _context.Bookcopies
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Copyid == copyId, cancellationToken);

        return copy?.Status is null or "Available";
    }

    public async Task<IEnumerable<OverdueReportModel>> SearchActiveLoansAsync(string username, CancellationToken cancellationToken = default)
    {
        var term = username.Trim().ToLower();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var loans = await _context.Loans
            .AsNoTracking()
            .Include(l => l.Reader).ThenInclude(r => r.User)
            .Include(l => l.Copy).ThenInclude(c => c.Branch)
            .Include(l => l.Copy).ThenInclude(c => c.Book)
            .Where(l => l.Actualreturndate == null && l.Reader.User.Username.ToLower().Contains(term))
            .ToListAsync(cancellationToken);

        if (loans.Count == 0)
            return [];

        var loanIds = loans.Select(l => l.Loanid).ToList();

        var penaltyTotals = await _context.Unwantedclients
            .AsNoTracking()
            .Where(u => u.Loanid != null && loanIds.Contains(u.Loanid!.Value))
            .GroupBy(u => u.Loanid!.Value)
            .Select(g => new { LoanId = g.Key, Total = g.Sum(u => u.Penaltyamount ?? 0m) })
            .ToListAsync(cancellationToken);

        var penaltyDict = penaltyTotals.ToDictionary(p => p.LoanId, p => p.Total);

        return loans
            .Select(l => new OverdueReportModel
            {
                ReaderId = l.Readerid,
                Username = l.Reader.User.Username,
                Email = l.Reader.User.Email,
                LibraryCardNumber = l.Reader.Librarycardnumber,
                LoanId = l.Loanid,
                BranchId = l.Copy.Branchid,
                BranchName = l.Copy.Branch.Name,
                BookTitle = l.Copy.Book.Title,
                LoanDate = l.Loandate,
                DueDate = l.Duedate,
                OverdueDays = Math.Max(0, today.DayNumber - l.Duedate.DayNumber),
                LoanFineTotal = penaltyDict.TryGetValue(l.Loanid, out var fine) ? fine : 0m
            })
            .OrderBy(r => r.Username)
            .ThenByDescending(r => r.OverdueDays)
            .ToList();
    }

    private async Task<LoanModel> GetByIdInternalAsync(int loanId, CancellationToken cancellationToken)
    {
        var loan = await _context.Loans
            .AsNoTracking()
            .Include(l => l.Copy)
                .ThenInclude(c => c.Book)
            .Include(l => l.Copy)
                .ThenInclude(c => c.Branch)
            .FirstOrDefaultAsync(l => l.Loanid == loanId, cancellationToken)
            ?? throw new KeyNotFoundException($"Loan {loanId} not found.");

        return _mapper.Map<LoanModel>(loan);
    }

    public async Task<bool> IsReaderSubscribedAsync(int readerId, CancellationToken cancellationToken = default)
    {
        var reader = await _context.Readers
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Readerid == readerId, cancellationToken);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return reader?.Subscriptionexpiry.HasValue == true && reader.Subscriptionexpiry.Value >= today;
    }

    public async Task<IEnumerable<ReaderPenaltyModel>> GetUnresolvedPenaltiesForReaderAsync(int readerId, CancellationToken cancellationToken = default)
    {
        var penalties = await _context.Unwantedclients
            .AsNoTracking()
            .Include(u => u.Loan)
                .ThenInclude(l => l!.Copy)
                    .ThenInclude(c => c.Book)
            .Include(u => u.Loan)
                .ThenInclude(l => l!.Copy)
                    .ThenInclude(c => c.Branch)
            .Where(u => u.Readerid == readerId && u.Isresolved != true)
            .ToListAsync(cancellationToken);

        return penalties.Select(u => new ReaderPenaltyModel
        {
            PenaltyId = u.Penaltyid,
            BookTitle = u.Loan?.Copy?.Book?.Title ?? "Unknown",
            BranchName = u.Loan?.Copy?.Branch?.Name ?? "Unknown",
            Reason = u.Reason,
            Amount = u.Penaltyamount ?? 0m,
        });
    }
}
