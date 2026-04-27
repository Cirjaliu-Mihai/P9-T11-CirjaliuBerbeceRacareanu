using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

internal sealed class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public UserRepository(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<UserModel?> GetByIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        var dbUser = await _context.Users
            .Include(u => u.Administrators)
            .Include(u => u.Readers)
            .FirstOrDefaultAsync(u => u.Userid == userId, cancellationToken);

        return dbUser is null ? null : _mapper.Map<UserModel>(dbUser);
    }

    public async Task<UserModel?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        var dbUser = await _context.Users
            .Include(u => u.Administrators)
            .Include(u => u.Readers)
            .FirstOrDefaultAsync(u => u.Username == username, cancellationToken);

        return dbUser is null ? null : _mapper.Map<UserModel>(dbUser);
    }

    public async Task<UserModel?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var dbUser = await _context.Users
            .Include(u => u.Administrators)
            .Include(u => u.Readers)
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        return dbUser is null ? null : _mapper.Map<UserModel>(dbUser);
    }

    public async Task<bool> UsernameExistsAsync(string username, CancellationToken cancellationToken = default) =>
        await _context.Users.AnyAsync(u => u.Username == username, cancellationToken);

    public async Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default) =>
        await _context.Users.AnyAsync(u => u.Email == email, cancellationToken);

    public async Task CreateUserAsync(UserModel user, Role role, CancellationToken cancellationToken = default)
    {
        var dbUser = new User
        {
            Username = user.Username,
            Passwordhash = user.PasswordHash,
            Email = user.Email,
            Phone = user.Phone,
            Address = user.Address
        };

        await _context.Users.AddAsync(dbUser, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        if (role == Role.Administrator)
        {
            await _context.Administrators.AddAsync(
                new Administrator { Userid = dbUser.Userid }, cancellationToken);
        }
        else
        {
            await _context.Readers.AddAsync(new Models.Reader
            {
                Userid = dbUser.Userid,
                Librarycardnumber = Guid.NewGuid().ToString("N")[..10].ToUpper()
            }, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task PromoteToAdministratorAsync(int userId, CancellationToken cancellationToken = default)
    {
        var userExists = await _context.Users.AnyAsync(u => u.Userid == userId, cancellationToken);
        if (!userExists)
            throw new KeyNotFoundException($"User with id {userId} not found.");

        var alreadyAdmin = await _context.Administrators.AnyAsync(a => a.Userid == userId, cancellationToken);
        if (alreadyAdmin)
            throw new InvalidOperationException("User is already an administrator.");

        await _context.Administrators.AddAsync(
            new Administrator { Userid = userId }, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task StoreRefreshTokenAsync(int userId, string refreshTokenHash, DateTime expiry, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync([userId], cancellationToken)
            ?? throw new KeyNotFoundException($"User with id {userId} not found.");

        user.Refreshtoken = refreshTokenHash;
        user.Refreshtokenexpiry = DateTime.SpecifyKind(expiry, DateTimeKind.Unspecified);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<UserModel?> GetByRefreshTokenHashAsync(string refreshTokenHash, CancellationToken cancellationToken = default)
    {
        var dbUser = await _context.Users
            .Include(u => u.Administrators)
            .Include(u => u.Readers)
            .FirstOrDefaultAsync(u => u.Refreshtoken == refreshTokenHash
                && u.Refreshtokenexpiry > DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified), cancellationToken);

        return dbUser is null ? null : _mapper.Map<UserModel>(dbUser);
    }

    public async Task RevokeRefreshTokenAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync([userId], cancellationToken)
            ?? throw new KeyNotFoundException($"User with id {userId} not found.");

        user.Refreshtoken = null;
        user.Refreshtokenexpiry = null;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
