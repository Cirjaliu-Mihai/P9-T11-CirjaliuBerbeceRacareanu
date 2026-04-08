import { HttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { OnInit } from '@angular/core';
import { WeatherForecast } from '../interfaces/weather-forecast';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {
  public forecasts: WeatherForecast[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getForecasts();
  }

  getForecasts() {
    this.http.get<WeatherForecast[]>('https://localhost:7293/weatherforecast').subscribe(
      (result) => {
        this.forecasts = result;
        console.log(this.forecasts);
      },
      (error) => {
        console.error(error);
      }
    );
    
  }

  protected readonly title = signal('antheneum.client');
}
