namespace Application.DTOs.Auth;

public record AuthResponse(string Token, string RefreshToken, string Username, string Role);
