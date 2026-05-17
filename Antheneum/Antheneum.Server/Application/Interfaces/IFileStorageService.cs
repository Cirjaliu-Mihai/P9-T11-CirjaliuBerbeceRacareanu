namespace Application.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveBookCoverAsync(string isbn, Stream stream, string contentType);
    Task<string> SaveEventCoverAsync(int eventId, Stream stream, string contentType);
    void DeleteBookCover(string isbn);
    void DeleteEventCover(int eventId);
}
