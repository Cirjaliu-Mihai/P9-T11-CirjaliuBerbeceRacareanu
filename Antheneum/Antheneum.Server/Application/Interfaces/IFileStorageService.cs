namespace Application.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveBookCoverAsync(string isbn, Stream stream, string contentType);
    void DeleteBookCover(string isbn);
}
