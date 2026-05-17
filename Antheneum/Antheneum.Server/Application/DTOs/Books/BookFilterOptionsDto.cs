namespace Application.DTOs.Books;

public record BookFilterOptionsDto(
    IEnumerable<string> Authors,
    IEnumerable<string> Publishers);
