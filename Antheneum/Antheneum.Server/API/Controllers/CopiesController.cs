using Application.Features.Copies.DeleteCopy;
using Application.Features.Copies.UpdateCopyStatus;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("[controller]")]
public class CopiesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CopiesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPatch("{copyId}/status")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> UpdateStatus(
        int copyId,
        [FromBody] string status,
        CancellationToken cancellationToken)
    {
        await _mediator.Send(new UpdateCopyStatusQuery(copyId, status), cancellationToken);
        return NoContent();
    }

    [HttpDelete("{copyId}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> Delete(int copyId, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteCopyCommand(copyId), cancellationToken);
        return NoContent();
    }
}
