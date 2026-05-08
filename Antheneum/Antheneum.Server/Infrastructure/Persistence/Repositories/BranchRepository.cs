using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class BranchRepository : IBranchRepository
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public BranchRepository(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<BranchModel>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.Branches
            .AsNoTracking()
            .OrderBy(b => b.Name)
            .ProjectTo<BranchModel>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);
    }

    public async Task<BranchModel?> GetByIdAsync(int branchId, CancellationToken ct = default)
    {
        var entity = await _context.Branches
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Branchid == branchId, ct);

        return entity is null ? null : _mapper.Map<BranchModel>(entity);
    }

    public async Task<BranchModel?> GetByUniqueNumberAsync(string uniqueNumber, CancellationToken ct = default)
    {
        var entity = await _context.Branches
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Uniquenumber == uniqueNumber, ct);

        return entity is null ? null : _mapper.Map<BranchModel>(entity);
    }

    public async Task<BranchModel> CreateAsync(BranchModel branch, CancellationToken ct = default)
    {
        var entity = new Branch
        {
            Uniquenumber = branch.UniqueNumber,
            Name = branch.Name,
            Address = branch.Address
        };

        await _context.Branches.AddAsync(entity, ct);
        await _context.SaveChangesAsync(ct);

        return _mapper.Map<BranchModel>(entity);
    }

    public async Task<BranchModel> UpdateAsync(BranchModel branch, CancellationToken ct = default)
    {
        var entity = await _context.Branches
            .FirstOrDefaultAsync(b => b.Branchid == branch.BranchId, ct)
            ?? throw new KeyNotFoundException($"Branch with ID {branch.BranchId} was not found.");

        entity.Name = branch.Name;
        entity.Address = branch.Address;

        await _context.SaveChangesAsync(ct);
        return _mapper.Map<BranchModel>(entity);
    }

    public async Task DeleteAsync(int branchId, CancellationToken ct = default)
    {
        var entity = await _context.Branches
            .FirstOrDefaultAsync(b => b.Branchid == branchId, ct)
            ?? throw new KeyNotFoundException($"Branch with ID {branchId} was not found.");

        _context.Branches.Remove(entity);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<bool> HasActiveLoansAsync(int branchId, CancellationToken ct = default)
    {
        return await _context.Loans
            .AnyAsync(l => l.Copy.Branchid == branchId && l.Actualreturndate == null, ct);
    }
}
