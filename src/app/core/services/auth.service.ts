import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse } from '../../interfaces/auth-response.model';
// Si el servicio está en una carpeta 'services', usa '../'
// Si el servicio está suelto en 'app', usa './'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private API_URL = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  login(credenciales: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credenciales);
  }

  registrar(usuario: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/registro`, usuario);
  }
}
