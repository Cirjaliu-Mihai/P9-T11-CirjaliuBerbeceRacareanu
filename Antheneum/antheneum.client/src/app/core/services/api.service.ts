import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(this.buildUrl(path));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.buildUrl(path), body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.buildUrl(path), body);
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.patch<T>(this.buildUrl(path), JSON.stringify(body), { headers });
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.buildUrl(path));
  }

  private buildUrl(path: string): string {
    return path.startsWith('/') ? path : `/${path}`;
  }
}
