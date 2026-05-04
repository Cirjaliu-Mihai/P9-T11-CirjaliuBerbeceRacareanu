using MediatR;

namespace Application.Features.Books.DeleteBook;

public record DeleteBookQuery(int BookId) : IRequest;
