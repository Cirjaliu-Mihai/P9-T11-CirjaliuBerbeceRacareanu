namespace API.Requests;

public record UpdateMyProfileRequest(
    string? Phone,
    string? Address,
    string? CurrentPassword,
    string? NewPassword);
