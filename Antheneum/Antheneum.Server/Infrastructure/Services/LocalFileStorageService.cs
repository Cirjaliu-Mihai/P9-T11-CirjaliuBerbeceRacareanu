using Application.Interfaces;
using Microsoft.AspNetCore.Hosting;

namespace Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _webRootPath;

    public LocalFileStorageService(IWebHostEnvironment env)
    {
        _webRootPath = string.IsNullOrWhiteSpace(env.WebRootPath)
            ? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")
            : env.WebRootPath;
    }

    public async Task<string> SaveBookCoverAsync(string isbn, Stream stream, string contentType)
    {
        var ext = contentType switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            "image/gif" => ".gif",
            _ => ".jpg"
        };

        var safeIsbn = SanitizeIsbn(isbn);
        var folder = Path.Combine(_webRootPath, "images", "books");
        Directory.CreateDirectory(folder);

        // Remove any existing cover for this ISBN (potentially different extension)
        foreach (var existing in Directory.GetFiles(folder, $"{safeIsbn}.*"))
            File.Delete(existing);

        var fileName = $"{safeIsbn}{ext}";
        var filePath = Path.Combine(folder, fileName);

        await using var fileStream = File.Create(filePath);
        await stream.CopyToAsync(fileStream);

        return $"/images/books/{fileName}";
    }

    public void DeleteBookCover(string isbn)
    {
        var safeIsbn = SanitizeIsbn(isbn);
        var folder = Path.Combine(_webRootPath, "images", "books");

        if (!Directory.Exists(folder))
            return;

        foreach (var file in Directory.GetFiles(folder, $"{safeIsbn}.*"))
            File.Delete(file);
    }

    private static string SanitizeIsbn(string isbn) =>
        new string(isbn.Where(c => char.IsLetterOrDigit(c) || c == '-').ToArray());
}
