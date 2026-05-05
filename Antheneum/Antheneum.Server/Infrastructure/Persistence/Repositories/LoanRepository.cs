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
}
