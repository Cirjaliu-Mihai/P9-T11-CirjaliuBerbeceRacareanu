using Application.DTOs.Books;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Books.CreateBook;

public class CreateBookHandler : IRequestHandler<CreateBookQuery, BookDto>
{
    private readonly IBookRepository _bookRepository;
    private readonly IFileStorageService _fileStorage;

    public CreateBookHandler(IBookRepository bookRepository, IFileStorageService fileStorage)
    {
        _bookRepository = bookRepository;
        _fileStorage = fileStorage;
    }

    public async Task<BookDto> Handle(CreateBookQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Isbn))
            throw new DomainException("ISBN is required.");

        if (string.IsNullOrWhiteSpace(request.Title))
            throw new DomainException("Title is required.");

        var existing = await _bookRepository.GetByIsbnAsync(request.Isbn, cancellationToken);
        if (existing is not null)
            throw new ConflictException($"A book with ISBN '{request.Isbn}' already exists.");

        string? imgUrl = null;
        if (request.CoverImageStream is not null && request.CoverImageContentType is not null)
            imgUrl = await _fileStorage.SaveBookCoverAsync(request.Isbn, request.CoverImageStream, request.CoverImageContentType);

        var book = new BookModel
        {
            Isbn = request.Isbn,
            Title = request.Title,
            Authors = request.Authors,
            Publisher = request.Publisher,
            ImgUrl = imgUrl
        };

        var created = await _bookRepository.CreateAsync(book, cancellationToken);

        return new BookDto(created.BookId, created.Isbn, created.Title, created.Authors, created.Publisher, created.ImgUrl);
    }
}
