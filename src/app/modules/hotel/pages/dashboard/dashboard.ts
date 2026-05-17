import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 🚨 1. AGREGA ESTA LÍNEA
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // 🚨 2. AGREGA ESTO AQUÍ
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  // ... resto del código igual ...
  nombreUsuario: string = '';
  nombreHotel: string = '';
  idHotel: number = 0;
  historial: any[] = [];

  habitaciones: any[] = [];
  idHabitacionSeleccionada: string = '';

  constructor(
    private http: HttpClient,
    public router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.nombreUsuario = localStorage.getItem('nombre') || 'Admin';
    this.nombreHotel = localStorage.getItem('hotelNombre') || 'Sede';

    const idSede = localStorage.getItem('hotelId');
    if (idSede) {
      this.idHotel = Number(idSede);
      this.cargarHistorial();
      this.cargarHabitaciones();
    }
  }

  cargarHabitaciones() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http
      .get<any[]>(`http://localhost:8080/api/habitaciones/hotel/${this.idHotel}`, { headers })
      .subscribe((data) => {
        this.habitaciones = data;
        this.cdr.detectChanges();
      });
  }

  get historialFiltrado() {
    if (!this.idHabitacionSeleccionada || this.idHabitacionSeleccionada === '') {
      return this.historial;
    }
    return this.historial.filter((reg) => reg.habitacionId == this.idHabitacionSeleccionada);
  }

  cargarHistorial() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http
      .get<any[]>(`http://localhost:8080/api/historial/hotel/${this.idHotel}`, { headers })
      .subscribe({
        next: (data) => {
          this.historial = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al cargar historial:', err),
      });
  }

  cambiarSede() {
    this.router.navigate(['/seleccion-hotel']);
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  irAPerfil() {
    this.router.navigate(['/perfil']);
  }
}
