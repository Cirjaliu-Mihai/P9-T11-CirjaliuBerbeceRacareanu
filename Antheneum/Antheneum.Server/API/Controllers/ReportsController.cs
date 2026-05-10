using Application.DTOs.Books;
using Application.DTOs.Reports;
using Application.Features.Reports.GetBlacklistReport;
using Application.Features.Reports.GetInventoryReport;
using Application.Features.Reports.GetOverdueReport;
using Application.Features.Reports.GetTransactionsReport;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("reports")]
public class ReportsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReportsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("inventory")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> GetInventory(
        [FromQuery] int? branchId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        PagedResult<InventoryReportDto> result = await _mediator.Send(
            new GetInventoryReportQuery(branchId, page, pageSize),
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("overdue")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> GetOverdue(
        [FromQuery] int? branchId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        PagedResult<OverdueReportDto> result = await _mediator.Send(
            new GetOverdueReportQuery(branchId, page, pageSize),
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("blacklist")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> GetBlacklist(
        [FromQuery] int? branchId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        PagedResult<BlacklistReportDto> result = await _mediator.Send(
            new GetBlacklistReportQuery(branchId, page, pageSize),
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("transactions")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> GetTransactions(
        [FromQuery] DateOnly from,
        [FromQuery] DateOnly to,
        [FromQuery] int? branchId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        PagedResult<TransactionReportDto> result = await _mediator.Send(
            new GetTransactionsReportQuery(from, to, branchId, page, pageSize),
            cancellationToken);

        return Ok(result);
    }
}