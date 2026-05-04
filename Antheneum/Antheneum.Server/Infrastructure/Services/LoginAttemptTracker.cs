using Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace Infrastructure.Services;

public class LoginAttemptTracker : ILoginAttemptTracker
{
    private const int MaxFailedAttempts = 5;
    private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);

    private readonly IMemoryCache _cache;

    public LoginAttemptTracker(IMemoryCache cache)
    {
        _cache = cache;
    }

    public bool IsLockedOut(string username) =>
        _cache.TryGetValue(LockoutKey(username), out _);

    public void RecordFailure(string username)
    {
        var attemptsKey = AttemptsKey(username);

        var attempts = _cache.TryGetValue(attemptsKey, out int current) ? current + 1 : 1;

        _cache.Set(attemptsKey, attempts, TimeSpan.FromMinutes(15));

        if (attempts >= MaxFailedAttempts)
        {
            _cache.Set(LockoutKey(username), true, LockoutDuration);
            _cache.Remove(attemptsKey);
        }
    }

    public void Reset(string username)
    {
        _cache.Remove(AttemptsKey(username));
        _cache.Remove(LockoutKey(username));
    }

    private static string AttemptsKey(string username) => $"login_attempts:{username.ToLowerInvariant()}";
    private static string LockoutKey(string username) => $"login_lockout:{username.ToLowerInvariant()}";
}
