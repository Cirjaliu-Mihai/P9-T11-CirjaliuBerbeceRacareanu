using Application.Features.Events.CreateEvent;
using Application.Features.Events.DeleteEvent;
using Application.Features.Events.EnrollInEvent;
using Application.Features.Events.GetActiveEvents;
using Application.Features.Events.GetAdminEvents;
using Application.Features.Events.GetEventAttendees;
using Application.Features.Events.GetEventDetail;
using Application.Features.Events.UnenrollInEvent;
using Application.Features.Events.UpdateEvent;
using Application.DTOs.Events;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace API.Controllers;

[ApiController]
[Route("[controller]")]
public class EventsController : ControllerBase
{
    private readonly IMediator _mediator;

    public EventsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetActiveEvents(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetActiveEventsQuery(page, pageSize), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetEventDetail(int id, CancellationToken cancellationToken)
    {
        var readerId = GetReaderId();
        var result = await _mediator.Send(new GetEventDetailQuery(id, readerId), cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id}/enroll")]
    [Authorize(Roles = "Reader")]
    public async Task<IActionResult> EnrollInEvent(int id, CancellationToken cancellationToken)
    {
        var readerId = GetReaderId() ?? throw new UnauthorizedAccessException("Reader ID not found in token.");
        var enrolled = await _mediator.Send(new EnrollInEventQuery(id, readerId), cancellationToken);
        if (!enrolled)
        {
            return BadRequest(new { error = "Could not enroll: you may already be enrolled or the event is full." });
        }

        return Ok(new { enrolled = true });
    }

    [HttpPost("{id}/unenroll")]
    [Authorize(Roles = "Reader")]
    public async Task<IActionResult> UnenrollInEvent(int id, CancellationToken cancellationToken)
    {
        var readerId = GetReaderId() ?? throw new UnauthorizedAccessException("Reader ID not found in token.");
        var unenrolled = await _mediator.Send(new UnenrollInEventQuery(id, readerId), cancellationToken);
        if (!unenrolled)
        {
            return BadRequest(new { error = "Could not un-enroll: you are not enrolled in this event." });
        }

        return Ok(new { unenrolled = true });
    }

    [HttpGet("admin/list")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> GetAdminEvents(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetAdminEventsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpPost("admin")]
    [Authorize(Roles = "Administrator")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreateEvent(
        [FromForm] string title,
        [FromForm] string? description,
        [FromForm] int branchId,
        [FromForm] DateTime startDate,
        [FromForm] DateTime endDate,
        [FromForm] int maxSeats,
        [FromForm] string? coverImageUrl,
        IFormFile? cover,
        CancellationToken cancellationToken)
    {
        var formValue = new EventFormValue(
            null,
            title,
            description,
            branchId,
            startDate,
            endDate,
            maxSeats,
            coverImageUrl);

        Stream? stream = cover?.OpenReadStream();
        var result = await _mediator.Send(
            new CreateEventQuery(formValue, stream, cover?.ContentType),
            cancellationToken);
        return CreatedAtAction(nameof(GetEventDetail), new { id = result.EventId }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrator")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UpdateEvent(
        int id,
        [FromForm] string title,
        [FromForm] string? description,
        [FromForm] int branchId,
        [FromForm] DateTime startDate,
        [FromForm] DateTime endDate,
        [FromForm] int maxSeats,
        [FromForm] string? coverImageUrl,
        IFormFile? cover,
        CancellationToken cancellationToken)
    {
        var form = new EventFormValue(
            id,
            title,
            description,
            branchId,
            startDate,
            endDate,
            maxSeats,
            coverImageUrl);

        Stream? stream = cover?.OpenReadStream();
        var result = await _mediator.Send(
            new UpdateEventQuery(form, stream, cover?.ContentType),
            cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> DeleteEvent(int id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteEventQuery(id), cancellationToken);
        if (result)
        {
            return NoContent();
        }
        return BadRequest(new { error = "Failed to delete event." });
    }

    [HttpGet("{id}/attendees")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> GetEventAttendees(
        int id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetEventAttendeesQuery(id, page, pageSize), cancellationToken);
        return Ok(result);
    }

    private int? GetReaderId()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(sub, out var userId))
            return null;
        return userId;
    }
}
