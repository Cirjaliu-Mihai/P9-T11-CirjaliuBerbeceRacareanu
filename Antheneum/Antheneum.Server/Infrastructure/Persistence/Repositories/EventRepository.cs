using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class EventRepository : IEventRepository
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public EventRepository(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<(IEnumerable<EventModel> Items, int TotalCount)> GetActiveEventsAsync(
        int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var todayStart = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc);
        var query = _context.Events
            .AsNoTracking()
            .Where(e => e.Enddate >= todayStart);

        var totalCount = await query.CountAsync(cancellationToken);

        var events = await query
            .OrderBy(e => e.Startdate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<EventModel>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return (events, totalCount);
    }

    public async Task<EventModel?> GetByIdAsync(int eventId, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Events
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Eventid == eventId, cancellationToken);

        return entity is null ? null : _mapper.Map<EventModel>(entity);
    }

    public async Task<(IEnumerable<EventModel> Upcoming, IEnumerable<EventModel> Past)> GetAdminViewAsync(
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var events = await _context.Events
            .AsNoTracking()
            .ProjectTo<EventModel>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        var upcoming = events
            .Where(e => e.EndDate > now)
            .OrderBy(e => e.StartDate)
            .ToList();

        var past = events
            .Where(e => e.EndDate <= now)
            .OrderByDescending(e => e.EndDate)
            .ToList();

        return (upcoming, past);
    }

    public async Task<EventModel> CreateAsync(EventModel eventModel, CancellationToken cancellationToken = default)
    {
        var entity = new Event
        {
            Branchid = eventModel.BranchId,
            Title = eventModel.Title,
            Description = eventModel.Description,
            Startdate = eventModel.StartDate,
            Enddate = eventModel.EndDate,
            Availableseats = eventModel.MaxSeats,
            Coverimageurl = eventModel.CoverImageUrl
        };

        await _context.Events.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<EventModel>(entity);
    }

    public async Task<EventModel> UpdateAsync(EventModel eventModel, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Events.FindAsync([eventModel.EventId], cancellationToken)
            ?? throw new KeyNotFoundException($"Event with id {eventModel.EventId} was not found.");

        entity.Title = eventModel.Title;
        entity.Description = eventModel.Description;
        entity.Startdate = eventModel.StartDate;
        entity.Enddate = eventModel.EndDate;
        entity.Availableseats = eventModel.MaxSeats;
        entity.Coverimageurl = eventModel.CoverImageUrl;
        entity.Branchid = eventModel.BranchId;

        _context.Events.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<EventModel>(entity);
    }

    public async Task DeleteAsync(int eventId, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Events.FindAsync([eventId], cancellationToken)
            ?? throw new KeyNotFoundException($"Event with id {eventId} was not found.");

        _context.Events.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<(IEnumerable<(int ReaderId, string Username, string Email, string LibraryCardNumber)> Attendees, int TotalCount)> GetEventAttendeesAsync(
        int eventId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.Events
            .Where(e => e.Eventid == eventId)
            .SelectMany(e => e.Readers)
            .Select(r => new { r.Readerid, r.User.Email, r.Librarycardnumber, r.User.Username })
            .AsNoTracking();

        var totalCount = await query.CountAsync(cancellationToken);

        var attendeeRows = await query
            .OrderBy(a => a.Username)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var attendees = attendeeRows
            .Select(a => (a.Readerid, a.Username, a.Email, a.Librarycardnumber))
            .ToList();

        return (attendees, totalCount);
    }

    public async Task<int> GetEnrolledCountAsync(int eventId, CancellationToken cancellationToken = default)
    {
        return await _context.Events
            .Where(e => e.Eventid == eventId)
            .SelectMany(e => e.Readers)
            .CountAsync(cancellationToken);
    }

    public async Task<bool> EnrollReaderAsync(int eventId, int readerId, CancellationToken cancellationToken = default)
    {
        var eventEntity = await _context.Events
            .Include(e => e.Readers)
            .FirstOrDefaultAsync(e => e.Eventid == eventId, cancellationToken)
            ?? throw new KeyNotFoundException($"Event with id {eventId} was not found.");

        var reader = await _context.Readers.FindAsync([readerId], cancellationToken)
            ?? throw new KeyNotFoundException($"Reader with id {readerId} was not found.");

        // Check if reader is already enrolled
        if (eventEntity.Readers.Any(r => r.Readerid == readerId))
        {
            return false; // Already enrolled
        }

        // Check capacity
        var enrolledCount = await GetEnrolledCountAsync(eventId, cancellationToken);
        if (enrolledCount >= eventEntity.Availableseats)
        {
            throw new InvalidOperationException($"Event is at full capacity ({eventEntity.Availableseats} seats).");
        }

        eventEntity.Readers.Add(reader);
        await _context.SaveChangesAsync(cancellationToken);

        return true; // Successfully enrolled
    }

    public async Task<bool> RemoveReaderAsync(int eventId, int readerId, CancellationToken cancellationToken = default)
    {
        var eventEntity = await _context.Events
            .Include(e => e.Readers)
            .FirstOrDefaultAsync(e => e.Eventid == eventId, cancellationToken)
            ?? throw new KeyNotFoundException($"Event with id {eventId} was not found.");

        var reader = eventEntity.Readers.FirstOrDefault(r => r.Readerid == readerId);
        if (reader is null)
        {
            return false; // Not enrolled
        }

        eventEntity.Readers.Remove(reader);
        await _context.SaveChangesAsync(cancellationToken);

        return true; // Successfully removed
    }

    public async Task<bool> IsReaderEnrolledAsync(int eventId, int readerId, CancellationToken cancellationToken = default)
    {
        return await _context.Events
            .Where(e => e.Eventid == eventId)
            .SelectMany(e => e.Readers)
            .AnyAsync(r => r.Readerid == readerId, cancellationToken);
    }

    public async Task<bool> EventExistsAsync(int eventId, CancellationToken cancellationToken = default)
    {
        return await _context.Events.AnyAsync(e => e.Eventid == eventId, cancellationToken);
    }
}
