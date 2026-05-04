using Application.DTOs.Books;
using MediatR;

namespace Application.Features.Books.GetBookAvailability;

public record GetBookAvailabilityQuery(int BookId) : IRequest<IEnumerable<BookAvailabilityDto>>;
