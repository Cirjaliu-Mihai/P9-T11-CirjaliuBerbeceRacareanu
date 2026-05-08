using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class ReaderRepository : IReaderRepository
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public ReaderRepository(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ReaderModel>> GetAllAsync(string? search, string? sortBy, CancellationToken ct = default)
    {
        var query = _context.Readers
            .AsNoTracking()
            .Include(r => r.User)
                .ThenInclude(u => u.Administrators)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(r =>
                (r.User.Phone != null && r.User.Phone.ToLower().Contains(term)) ||
                r.User.Email.ToLower().Contains(term));
        }

        query = sortBy?.ToLower() switch
        {
            "cardnumber" => query.OrderBy(r => r.Librarycardnumber),
            _ => query.OrderBy(r => r.User.Username)
        };

        var entities = await query.ToListAsync(ct);
        return entities.Select(_mapper.Map<ReaderModel>);
    }

    public async Task<ReaderModel?> GetByIdAsync(int readerId, CancellationToken ct = default)
    {
        var entity = await _context.Readers
            .AsNoTracking()
            .Include(r => r.User)
                .ThenInclude(u => u.Administrators)
            .FirstOrDefaultAsync(r => r.Readerid == readerId, ct);

        return entity is null ? null : _mapper.Map<ReaderModel>(entity);
    }

    public async Task<ReaderModel?> GetByUserIdAsync(int userId, CancellationToken ct = default)
    {
        var entity = await _context.Readers
            .AsNoTracking()
            .Include(r => r.User)
                .ThenInclude(u => u.Administrators)
            .FirstOrDefaultAsync(r => r.Userid == userId, ct);

        return entity is null ? null : _mapper.Map<ReaderModel>(entity);
    }

    public async Task ChangeRoleAsync(int readerId, Role newRole, CancellationToken ct = default)
    {
        var reader = await _context.Readers
            .Include(r => r.User)
                .ThenInclude(u => u.Administrators)
            .FirstOrDefaultAsync(r => r.Readerid == readerId, ct)
            ?? throw new KeyNotFoundException($"Reader with ID {readerId} was not found.");

        var userId = reader.Userid;

        if (newRole == Role.Administrator)
        {
            var alreadyAdmin = reader.User.Administrators.Any();
            if (!alreadyAdmin)
            {
                await _context.Administrators.AddAsync(new Administrator { Userid = userId }, ct);
                await _context.SaveChangesAsync(ct);
            }
        }
        else
        {
            var adminEntry = await _context.Administrators
                .FirstOrDefaultAsync(a => a.Userid == userId, ct);

            if (adminEntry is not null)
            {
                _context.Administrators.Remove(adminEntry);
                await _context.SaveChangesAsync(ct);
            }
        }
    }

    public async Task UpdateProfileAsync(int userId, string? phone, string? address, string? passwordHash, CancellationToken ct = default)
    {
        var user = await _context.Users.FindAsync([userId], ct)
            ?? throw new KeyNotFoundException($"User with ID {userId} was not found.");

        user.Phone = phone;
        user.Address = address;

        if (passwordHash is not null)
            user.Passwordhash = passwordHash;

        await _context.SaveChangesAsync(ct);
    }

    public async Task RemoveFromBlacklistAsync(int readerId, CancellationToken ct = default)
    {
        var reader = await _context.Readers.FindAsync([readerId], ct)
            ?? throw new KeyNotFoundException($"Reader with ID {readerId} was not found.");

        reader.Isblacklisted = false;
        await _context.SaveChangesAsync(ct);
    }
}
