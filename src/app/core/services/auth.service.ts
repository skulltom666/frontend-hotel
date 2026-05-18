import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse } from '../../interfaces/auth-response.model';
import { environment } from '../../../environments/environment';
// Si el servicio está en una carpeta 'services', usa '../'
// Si el servicio está suelto en 'app', usa './'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {
    console.log('API URL configurada:', this.apiUrl); // Para debug
  }

  registro(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/registro`, data);
  }

  login(credenciales: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/login`, credenciales);
  }

  registrar(usuario: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/registro`, usuario);
  }
}
