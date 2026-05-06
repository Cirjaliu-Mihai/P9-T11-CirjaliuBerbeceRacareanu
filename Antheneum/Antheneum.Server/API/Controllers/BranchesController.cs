using Application.Features.Branches.CreateBranch;
using Application.Features.Branches.DeleteBranch;
using Application.Features.Branches.GetBranches;
using Application.Features.Branches.UpdateBranch;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("[controller]")]
public class BranchesController : ControllerBase
{
    private readonly IMediator _mediator;

    public BranchesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetBranches(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetBranchesQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> CreateBranch(
        [FromBody] CreateBranchQuery request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(request, cancellationToken);
        return Created($"/branches/{result.BranchId}", result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> UpdateBranch(
        int id,
        [FromBody] UpdateBranchQuery request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(request with { BranchId = id }, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> DeleteBranch(int id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteBranchQuery(id), cancellationToken);
        return NoContent();
    }
}
