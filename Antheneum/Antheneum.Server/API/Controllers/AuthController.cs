using Application.DTOs.Auth;
using Application.Features.Auth.Login;
using Application.Features.Auth.PromoteToAdministrator;
using Application.Features.Auth.RefreshToken;
using Application.Features.Auth.Register;
using Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginQuery query, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(query, cancellationToken);
        return Ok(response);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterQuery query, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(query, cancellationToken);
        return Created(string.Empty, response);
    }

    [HttpPost("users/{userId:int}/promote")]
    [Authorize(Roles = nameof(Role.Administrator))]
    public async Task<IActionResult> PromoteToAdministrator(int userId, CancellationToken cancellationToken)
    {
        await _mediator.Send(new PromoteToAdministratorQuery(userId), cancellationToken);
        return NoContent();
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenQuery query, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(query, cancellationToken);
        return Ok(response);
    }
}

