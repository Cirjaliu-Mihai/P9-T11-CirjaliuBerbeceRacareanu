using Domain.Entities;
using MediatR;
namespace Application.Features.Weather.GetWeatherForecast
{
    public record GetWeatherForecastQuery : IRequest<IEnumerable<WeatherForecast>>;
}
