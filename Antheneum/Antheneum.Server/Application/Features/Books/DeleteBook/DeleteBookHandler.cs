using Application.Interfaces;
using Domain.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Books.DeleteBook;

public class DeleteBookHandler : IRequestHandler<DeleteBookQuery>
{
    private readonly IBookRepository _bookRepository;
    private readonly IFileStorageService _fileStorage;

    public DeleteBookHandler(IBookRepository bookRepository, IFileStorageService fileStorage)
    {
        _bookRepository = bookRepository;
        _fileStorage = fileStorage;
    }

    public async Task Handle(DeleteBookQuery request, CancellationToken cancellationToken)
    {
        var book = await _bookRepository.GetByIdAsync(request.BookId, cancellationToken)
            ?? throw new KeyNotFoundException($"Book with id {request.BookId} was not found.");

        var hasBorrowed = await _bookRepository.HasBorrowedCopiesAsync(request.BookId, cancellationToken);
        if (hasBorrowed)
            throw new ConflictException("Cannot delete a book that has copies currently borrowed.");

        await _bookRepository.DeleteAsync(request.BookId, cancellationToken);

        if (book.ImgUrl is not null)
            _fileStorage.DeleteBookCover(book.Isbn);
    }
}
