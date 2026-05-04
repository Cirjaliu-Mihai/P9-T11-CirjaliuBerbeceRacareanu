using Application.DTOs.Books;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Books.UpdateBook;

public class UpdateBookHandler : IRequestHandler<UpdateBookQuery, BookDto>
{
    private readonly IBookRepository _bookRepository;
    private readonly IFileStorageService _fileStorage;

    public UpdateBookHandler(IBookRepository bookRepository, IFileStorageService fileStorage)
    {
        _bookRepository = bookRepository;
        _fileStorage = fileStorage;
    }

    public async Task<BookDto> Handle(UpdateBookQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            throw new DomainException("Title is required.");

        var existing = await _bookRepository.GetByIdAsync(request.BookId, cancellationToken)
            ?? throw new KeyNotFoundException($"Book with id {request.BookId} was not found.");

        string? imgUrl = existing.ImgUrl;
        if (request.CoverImageStream is not null && request.CoverImageContentType is not null)
            imgUrl = await _fileStorage.SaveBookCoverAsync(existing.Isbn, request.CoverImageStream, request.CoverImageContentType);

        var updated = new BookModel
        {
            BookId = existing.BookId,
            Isbn = existing.Isbn,
            Title = request.Title,
            Authors = request.Authors,
            Publisher = request.Publisher,
            ImgUrl = imgUrl
        };

        var result = await _bookRepository.UpdateAsync(updated, cancellationToken);

        return new BookDto(result.BookId, result.Isbn, result.Title, result.Authors, result.Publisher, result.ImgUrl);
    }
}
