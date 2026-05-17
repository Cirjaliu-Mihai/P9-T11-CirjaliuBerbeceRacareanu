using Domain.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Copies.UpdateCopyStatus;

public class UpdateCopyStatusHandler : IRequestHandler<UpdateCopyStatusQuery>
{
    private const decimal LostCopyFineAmount = 50m;

    private static readonly HashSet<string> AllowedStatuses =
        new(StringComparer.OrdinalIgnoreCase) { "Available", "Borrowed", "Lost" };

    private readonly IBookRepository _bookRepository;
    private readonly ILoanRepository _loanRepository;

    public UpdateCopyStatusHandler(IBookRepository bookRepository, ILoanRepository loanRepository)
    {
        _bookRepository = bookRepository;
        _loanRepository = loanRepository;
    }

    public async Task Handle(UpdateCopyStatusQuery request, CancellationToken cancellationToken)
    {
        if (!AllowedStatuses.Contains(request.Status))
            throw new DomainException($"Invalid status '{request.Status}'. Allowed values: Available, Borrowed, Lost.");

        var exists = await _bookRepository.CopyExistsAsync(request.CopyId, cancellationToken);
        if (!exists)
            throw new KeyNotFoundException($"Copy with id {request.CopyId} was not found.");

        if (request.Status.Equals("Lost", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var activeLoan = await _loanRepository.GetActiveLoanByCopyIdAsync(request.CopyId, cancellationToken);
                if (activeLoan is not null)
                {
                    var today = DateOnly.FromDateTime(DateTime.UtcNow);
                    await _loanRepository.MarkLoanReturnedAsync(activeLoan.LoanId, today, cancellationToken);
                    await _loanRepository.AddFineAsync(
                        activeLoan.LoanId,
                        activeLoan.ReaderId,
                        LostCopyFineAmount,
                        "Book copy reported as lost.",
                        cancellationToken);
                }
            }
            catch
            {
                // Fine/loan update failure must not block marking the copy as lost.
            }
        }

        await _bookRepository.UpdateCopyStatusAsync(request.CopyId, request.Status, cancellationToken);
    }
}
