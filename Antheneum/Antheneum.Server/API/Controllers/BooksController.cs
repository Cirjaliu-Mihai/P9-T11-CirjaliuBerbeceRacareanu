using Application.Features.Books.AddCopy;
using Application.Features.Books.CreateBook;
using Application.Features.Books.DeleteBook;
using Application.Features.Books.GetBookAvailability;
using Application.Features.Books.GetBooks;
using Application.Features.Books.UpdateBook;
using API.Requests;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("[controller]")]
public class BooksController : ControllerBase
{
    private readonly IMediator _mediator;

    public BooksController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetBooks(
        [FromQuery] string? search,
        [FromQuery] string? author,
        [FromQuery] string? publisher,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetBooksQuery(search, page, pageSize, author, publisher), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}/availability")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAvailability(int id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetBookAvailabilityQuery(id), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreateBook(
        [FromForm] string isbn,
        [FromForm] string title,
        [FromForm] string? authors,
        [FromForm] string? publisher,
        IFormFile? cover,
        CancellationToken cancellationToken)
    {
        Stream? stream = cover?.OpenReadStream();
        var command = new CreateBookQuery(isbn, title, authors, publisher, stream, cover?.ContentType);
        var result = await _mediator.Send(command, cancellationToken);
        return Created($"/books/{result.BookId}", result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrator")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UpdateBook(
        int id,
        [FromForm] string title,
        [FromForm] string? authors,
        [FromForm] string? publisher,
        IFormFile? cover,
        CancellationToken cancellationToken)
    {
        Stream? stream = cover?.OpenReadStream();
        var command = new UpdateBookQuery(id, title, authors, publisher, stream, cover?.ContentType);
        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    // PTC-78: DELETE /books/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> DeleteBook(int id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteBookQuery(id), cancellationToken);
        return NoContent();
    }

    [HttpPost("{id}/copies")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> AddCopies(
        int id,
        [FromBody] AddCopiesRequest request,
        CancellationToken cancellationToken)
    {
        await _mediator.Send(new AddCopyQuery(id, request.BranchId, request.Count), cancellationToken);
        return Created(string.Empty, null);
    }
}
