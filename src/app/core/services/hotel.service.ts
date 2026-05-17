import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HotelService {
  private API_URL = 'http://localhost:8080/api/hoteles';

  constructor(private http: HttpClient) {}

  /**
   * 🔍 Obtiene la lista de hoteles vinculados al usuario logueado.
   * Usamos el Token para que el Backend sepa quién hace la consulta.
   */
  obtenerMisHoteles(): Observable<any[]> {
    const token = localStorage.getItem('token');

    // Logs de depuración
    console.log('--- 🛰️ CONSULTA DE HOTELES ---');
    if (!token) {
      console.error('❌ Error Crítico: No se encontró el Token en el localStorage.');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Llamamos al endpoint /mio que configuramos en Java
    return this.http.get<any[]>(`${this.API_URL}/mio`, { headers });
  }

  /**
   * 🏗️ Registra un nuevo hotel y lo vincula al administrador.
   */
  registrarHotel(hotel: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    console.log('🏗️ Enviando registro de hotel:', hotel.nombre);

    // Apunta a /registrar (@PostMapping("/registrar") en tu Java)
    return this.http.post(`${this.API_URL}/registrar`, hotel, { headers });
  }
}
