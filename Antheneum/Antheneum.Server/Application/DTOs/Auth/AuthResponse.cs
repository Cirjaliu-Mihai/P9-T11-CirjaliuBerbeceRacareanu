namespace Application.DTOs.Auth;

public sealed record AuthResponse(string Token, string RefreshToken, string Username, string Role);
