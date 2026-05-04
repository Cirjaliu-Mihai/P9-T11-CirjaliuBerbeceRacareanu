using Domain.Exceptions;
using System.Net;
using System.Text.Json;

namespace API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception for {Method} {Path}: {Message}",
                context.Request.Method, context.Request.Path, ex.Message);

            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        object response;

        switch (exception)
        {
            case DomainException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = new { status = (int)HttpStatusCode.BadRequest, message = exception.Message };
                break;

            case ConflictException:
                context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                response = new { status = (int)HttpStatusCode.Conflict, message = exception.Message };
                break;

            case UnauthorizedAccessException:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                response = new { status = (int)HttpStatusCode.Unauthorized, message = exception.Message };
                break;

            case KeyNotFoundException:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response = new { status = (int)HttpStatusCode.NotFound, message = exception.Message };
                break;

            case ArgumentException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = new { status = (int)HttpStatusCode.BadRequest, message = exception.Message };
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response = new { status = (int)HttpStatusCode.InternalServerError, message = "An unexpected error occurred." };
                break;
        }

        await context.Response.WriteAsync(
            JsonSerializer.Serialize(response, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    }
}
