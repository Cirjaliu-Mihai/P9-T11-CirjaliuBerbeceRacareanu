using Application.Features.Loans.CreateLoan;
using Application.Features.Loans.GetMyLoans;
using Application.Features.Loans.GetMyPenalties;
using Application.Features.Loans.RenewLoan;
using Application.Features.Loans.ReturnLoan;
using Application.Features.Loans.SearchActiveLoans;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace API.Controllers;

[ApiController]
[Route("loans")]
public class LoansController : ControllerBase
{
    private readonly IMediator _mediator;

    public LoansController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Roles = "Reader")]
    public async Task<IActionResult> CreateLoan([FromBody] CreateLoanRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var loan = await _mediator.Send(new CreateLoanQuery(request.CopyId, userId), cancellationToken);
        return CreatedAtAction(nameof(GetMyLoans), new { }, loan);
    }

    [HttpPost("{id}/renew")]
    [Authorize(Roles = "Reader")]
    public async Task<IActionResult> RenewLoan(int id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var loan = await _mediator.Send(new RenewLoanQuery(id, userId), cancellationToken);
        return Ok(loan);
    }

    [HttpPost("{id}/return")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> ReturnLoan(int id, CancellationToken cancellationToken)
    {
        var loan = await _mediator.Send(new ReturnLoanQuery(id), cancellationToken);
        return Ok(loan);
    }

    [HttpGet("active")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> SearchActiveLoans([FromQuery] string username, CancellationToken cancellationToken)
    {
        var results = await _mediator.Send(new SearchActiveLoansQuery(username), cancellationToken);
        return Ok(results);
    }

    [HttpGet("my")]
    [Authorize(Roles = "Reader")]
    public async Task<IActionResult> GetMyLoans(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var loans = await _mediator.Send(new GetMyLoansQuery(userId), cancellationToken);
        return Ok(loans);
    }

    [HttpGet("my-fines")]
    [Authorize(Roles = "Reader")]
    public async Task<IActionResult> GetMyFines(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var fines = await _mediator.Send(new GetMyPenaltiesQuery(userId), cancellationToken);
        return Ok(fines);
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

public record CreateLoanRequest(int CopyId);
