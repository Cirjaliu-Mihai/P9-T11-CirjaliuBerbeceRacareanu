using Application.Interfaces;
using Domain.Enums;
using Domain.Interfaces;
using Infrastructure.Services;
using Infrastructure.Persistence;
using Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment env)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration["PostgresConnection"]));

        services.AddMemoryCache();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IBookRepository, BookRepository>();
        services.AddScoped<ILoanRepository, LoanRepository>();
        services.AddScoped<IBranchRepository, BranchRepository>();
        services.AddScoped<IReaderRepository, ReaderRepository>();
        services.AddScoped<IReportRepository, ReportRepository>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IPasswordHashingService, PasswordHashingService>();
        services.AddSingleton<ILoginAttemptTracker, LoginAttemptTracker>();
        services.AddSingleton<IFileStorageService>(_ => new LocalFileStorageService(env));

        var authenticationBuilder = services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme);
        var secret = configuration["Jwt:Secret"];
        var authBypassEnabled = env.IsDevelopment() && configuration.GetValue<bool>("Authentication:BypassEnabled");

        if (!string.IsNullOrWhiteSpace(secret))
        {
            authenticationBuilder.AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
                    ValidateIssuer = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = configuration["Jwt:Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });
        }
        else if (!authBypassEnabled)
        {
            throw new InvalidOperationException("JWT secret is not configured.");
        }

        services.AddAuthorizationBuilder()
            .AddPolicy("ReaderOnly", policy => policy.RequireRole(nameof(Role.Reader)))
            .AddPolicy("AdministratorOnly", policy => policy.RequireRole(nameof(Role.Administrator)));

        return services;
}

}
