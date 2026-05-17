using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class BookRepository : IBookRepository
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public BookRepository(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<(IEnumerable<BookModel> Items, int TotalCount)> GetAllAsync(
        string? search, string? author, string? publisher, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.Books.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(b =>
                b.Title.ToLower().Contains(term) ||
                (b.Authors != null && b.Authors.ToLower().Contains(term)) ||
                (b.Publisher != null && b.Publisher.ToLower().Contains(term)));
        }

        if (!string.IsNullOrWhiteSpace(author))
        {
            var term = author.Trim().ToLower();
            query = query.Where(b => b.Authors != null && b.Authors.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(publisher))
        {
            var term = publisher.Trim().ToLower();
            query = query.Where(b => b.Publisher != null && b.Publisher.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var books = await query
            .OrderBy(b => b.Title)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<BookModel>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return (books, totalCount);
    }

    public async Task<BookModel?> GetByIdAsync(int bookId, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Books
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Bookid == bookId, cancellationToken);

        return entity is null ? null : _mapper.Map<BookModel>(entity);
    }

    public async Task<BookModel?> GetByIsbnAsync(string isbn, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Books
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.IsbnUniquenumber == isbn, cancellationToken);

        return entity is null ? null : _mapper.Map<BookModel>(entity);
    }

    public async Task<BookModel> CreateAsync(BookModel book, CancellationToken cancellationToken = default)
    {
        var entity = new Book
        {
            IsbnUniquenumber = book.Isbn,
            Title = book.Title,
            Authors = book.Authors,
            Publisher = book.Publisher,
            ImgUrl = book.ImgUrl
        };

        await _context.Books.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<BookModel>(entity);
    }

    public async Task<BookModel> UpdateAsync(BookModel book, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Books.FindAsync([book.BookId], cancellationToken)
            ?? throw new KeyNotFoundException($"Book with id {book.BookId} was not found.");

        entity.Title = book.Title;
        entity.Authors = book.Authors;
        entity.Publisher = book.Publisher;
        entity.ImgUrl = book.ImgUrl;

        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<BookModel>(entity);
    }

    public async Task DeleteAsync(int bookId, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Books.FindAsync([bookId], cancellationToken)
            ?? throw new KeyNotFoundException($"Book with id {bookId} was not found.");

        var copies = await _context.Bookcopies
            .Where(c => c.Bookid == bookId)
            .ToListAsync(cancellationToken);
        _context.Bookcopies.RemoveRange(copies);

        _context.Books.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> HasBorrowedCopiesAsync(int bookId, CancellationToken cancellationToken = default) =>
        await _context.Bookcopies
            .AnyAsync(c => c.Bookid == bookId && c.Status == "Borrowed", cancellationToken);

    public async Task<IEnumerable<BookAvailabilityModel>> GetAvailabilityAsync(int bookId, CancellationToken cancellationToken = default) =>
        await _context.Bookcopies
            .AsNoTracking()
            .Where(c => c.Bookid == bookId)
            .ProjectTo<BookAvailabilityModel>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

    public async Task<(IEnumerable<string> Authors, IEnumerable<string> Publishers)> GetFilterOptionsAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _context.Books
            .AsNoTracking()
            .Select(b => new { b.Authors, b.Publisher })
            .ToListAsync(cancellationToken);

        var authors = rows
            .Where(r => !string.IsNullOrWhiteSpace(r.Authors))
            .SelectMany(r => (r.Authors ?? string.Empty)
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            .Where(a => !string.IsNullOrWhiteSpace(a))
            .Select(a => a.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(a => a)
            .ToList();

        var publishers = rows
            .Where(r => !string.IsNullOrWhiteSpace(r.Publisher))
            .Select(r => (r.Publisher ?? string.Empty).Trim())
            .Where(p => !string.IsNullOrWhiteSpace(p))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(p => p)
            .ToList();

        return (authors, publishers);
    }

    public async Task AddCopiesAsync(int bookId, int branchId, int count, CancellationToken cancellationToken = default)
    {
        var copies = Enumerable.Range(0, count).Select(_ => new Bookcopy
        {
            Bookid = bookId,
            Branchid = branchId,
            Status = "Available"
        });

        await _context.Bookcopies.AddRangeAsync(copies, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> CopyExistsAsync(int copyId, CancellationToken cancellationToken = default) =>
        await _context.Bookcopies.AnyAsync(c => c.Copyid == copyId, cancellationToken);

    public async Task UpdateCopyStatusAsync(int copyId, string status, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Bookcopies.FindAsync([copyId], cancellationToken)
            ?? throw new KeyNotFoundException($"Copy with id {copyId} was not found.");

        entity.Status = status;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteCopyAsync(int copyId, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Bookcopies.FindAsync([copyId], cancellationToken)
            ?? throw new KeyNotFoundException($"Copy with id {copyId} was not found.");

        _context.Bookcopies.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> BranchExistsAsync(int branchId, CancellationToken cancellationToken = default) =>
        await _context.Branches.AnyAsync(b => b.Branchid == branchId, cancellationToken);
}
