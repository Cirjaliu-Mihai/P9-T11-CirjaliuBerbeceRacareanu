namespace Application.Interfaces;

public interface ILoginAttemptTracker
{
    bool IsLockedOut(string username);
    void RecordFailure(string username);
    void Reset(string username);
}
