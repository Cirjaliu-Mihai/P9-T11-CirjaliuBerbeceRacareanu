using API.Requests;
using Application.Features.Readers.ChangeReaderRole;
using Application.Features.Readers.GetReaders;
using Application.Features.Readers.RemoveFromBlacklist;
using Application.Features.Readers.ResolvePenalty;
using Application.Features.Readers.UpdateMyProfile;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace API.Controllers;

[ApiController]
[Route("[controller]")]
public class ReadersController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReadersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> GetReaders(
        [FromQuery] string? search,
        [FromQuery] string? sortBy,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetReadersQuery(search, sortBy), cancellationToken);
        return Ok(result);
    }

    [HttpPatch("{id}/role")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> ChangeRole(
        int id,
        [FromBody] ChangeRoleRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new ChangeReaderRoleQuery(id, request.Role), cancellationToken);
        return Ok(result);
    }

    [HttpPut("me")]
    [Authorize(Roles = "Reader")]
    public async Task<IActionResult> UpdateMyProfile(
        [FromBody] UpdateMyProfileRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _mediator.Send(
            new UpdateMyProfileQuery(userId, request.Phone, request.Address, request.CurrentPassword, request.NewPassword),
            cancellationToken);
        return Ok(result);
    }

    [HttpDelete("/blacklist/{readerId}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> RemoveFromBlacklist(int readerId, CancellationToken cancellationToken)
    {
        await _mediator.Send(new RemoveFromBlacklistQuery(readerId), cancellationToken);
        return NoContent();
    }

    [HttpPut("/blacklist/{penaltyId}/resolve")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> ResolvePenalty(int penaltyId, CancellationToken cancellationToken)
    {
        await _mediator.Send(new ResolvePenaltyQuery(penaltyId), cancellationToken);
        return NoContent();
    }

    private int GetUserId()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(sub, out var userId))
            throw new UnauthorizedAccessException("Invalid token.");

        return userId;
    }
}
