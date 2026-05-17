import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  // Ajusta esta URL a la de tu backend en Java
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // --- MÉTODOS DE TRAZABILIDAD Y ESTADOS ---

  // Obtiene el historial de movimientos de una habitación específica
  getHistory(habitacionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/habitaciones/${habitacionId}/historial`);
  }

  // --- MÉTODOS DE HUÉSPEDES ---

  // Busca un huésped por DNI/CE en la base de datos
  buscarHuesped(documento: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/huespedes/buscar/${documento}`);
  }

  // Registra un nuevo huésped
  guardarHuesped(huesped: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/huespedes`, huesped);
  }

  // --- MÉTODOS OPERATIVOS (CHECK-IN / OUT) ---

  // Realiza el ingreso a una habitación
  checkIn(habitacionId: number, huespedId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/habitaciones/${habitacionId}/check-in`, { huespedId });
  }

  // Realiza la salida y registra el pago
  checkOut(
    habitacionId: number,
    total: number,
    metodoPago: string,
    tiempo: string,
  ): Observable<any> {
    const payload = { total, metodoPago, tiempoUso: tiempo };
    return this.http.post(`${this.apiUrl}/habitaciones/${habitacionId}/check-out`, payload);
  }

  // --- MÉTODOS DE LIMPIEZA ---

  iniciarLimpieza(habitacionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/habitaciones/${habitacionId}/limpieza-inicio`, {});
  }

  finalizarLimpieza(habitacionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/habitaciones/${habitacionId}/limpieza-fin`, {});
  }

  // Obtiene todas las habitaciones de un hotel específico
  getHabitacionesPorHotel(hotelId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/habitaciones/hotel/${hotelId}`);
  }

  // Envía la nueva habitación a Java para guardarla
  crearHabitacion(habitacion: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/habitaciones`, habitacion);
  }
}
