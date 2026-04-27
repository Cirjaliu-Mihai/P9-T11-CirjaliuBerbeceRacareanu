import { HttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { OnInit } from '@angular/core';
import { WeatherForecast } from '../interfaces/weather-forecast';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {
  public forecasts: WeatherForecast[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.getForecasts();
  }

  async getForecasts() {
    this.http.get<WeatherForecast[]>('https://localhost:7293/weatherforecast').subscribe(
      (result) => {
        this.forecasts = result;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error(error);
      }
    );
    
  }

  protected readonly title = signal('antheneum.client');
}
