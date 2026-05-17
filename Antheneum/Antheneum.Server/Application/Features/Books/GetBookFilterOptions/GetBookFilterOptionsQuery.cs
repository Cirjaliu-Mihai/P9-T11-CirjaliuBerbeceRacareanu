using Application.DTOs.Books;
using MediatR;

namespace Application.Features.Books.GetBookFilterOptions;

public record GetBookFilterOptionsQuery : IRequest<BookFilterOptionsDto>;
