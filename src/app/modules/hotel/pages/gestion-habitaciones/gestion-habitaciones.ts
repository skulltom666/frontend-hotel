import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_CONFIG } from '../../../../config/api.config';

@Component({
  selector: 'app-gestion-habitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-habitaciones.html',
  styleUrls: ['./gestion-habitaciones.css'],
})
export class GestionHabitacionesComponent implements OnInit {
  // --- PROPIEDADES DE VISUALIZACIÓN (Las que faltaban) ---
  nombreUsuario: string = '';
  nombreHotel: string = '';

  // --- PROPIEDADES OPERATIVAS ---
  habitaciones: any[] = [];
  pisosDisponibles = [1, 2, 3, 4, 5];
  idHotel: number = 0;

  filtroSeleccionado: string = 'TODOS';
  habSeleccionada: any = null;

  nuevaHabitacion: any = {
    piso: 1,
    numero: '',
    descripcion: '',
    limitePersonas: 2,
    camasSimples: 1,
    camasDobles: 1,
    horasMinimas: 6,
    precioMinimo: 0,
    precio12Horas: 0,
    precio24Horas: 0,
    precioHoraExtra: 0,
    hotelId: 0,
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    public router: Router, // 🚨 Cambiado a PUBLIC para que el HTML pueda usar router.navigate
  ) {}

  ngOnInit() {
    // 1. Cargamos datos para el Header y Sidebar
    this.nombreUsuario = localStorage.getItem('nombre') || 'Admin';
    this.nombreHotel = localStorage.getItem('hotelNombre') || 'Sede';

    // 2. Obtenemos el ID del hotel seleccionado
    const storedId = localStorage.getItem('hotelId');

    if (storedId) {
      this.idHotel = Number(storedId);

      if (Number.isNaN(this.idHotel) || this.idHotel <= 0) {
        console.warn('⚠️ El hotelId almacenado no es válido. Redirigiendo...');
        this.router.navigate(['/seleccion-hotel']);
        return;
      }

      this.nuevaHabitacion.hotelId = this.idHotel;
      this.listarHabitaciones();
    } else {
      console.warn('⚠️ No se detectó hotel activo, redirigiendo...');
      this.router.navigate(['/seleccion-hotel']);
    }
  }

  // --- LÓGICA DE DATOS ---

  listarHabitaciones() {
    this.http.get<any[]>(`${API_CONFIG.BASE_URL}/api/habitaciones/hotel/${this.idHotel}`).subscribe({
      next: (data) => {
        this.habitaciones = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('❌ Error al listar habitaciones:', err),
    });
  }

  guardarHabitacion() {
    if (!this.idHotel || this.idHotel <= 0) {
      alert('No hay un hotel válido seleccionado. Vuelve a elegir la sede.');
      this.router.navigate(['/seleccion-hotel']);
      return;
    }

    const payload = {
      ...this.nuevaHabitacion,
      hotelId: this.idHotel,
    };

    this.http.post(`${API_CONFIG.BASE_URL}/api/habitaciones`, payload).subscribe({
      next: () => {
        alert('✅ Habitación guardada exitosamente.');
        this.listarHabitaciones();
        this.limpiarFormulario();
      },
      error: (err) => {
        const mensajeBackend =
          typeof err?.error === 'string'
            ? err.error
            : err?.error?.message || err?.message || 'Error desconocido';

        alert('Error al guardar: ' + mensajeBackend);
      },
    });
  }

  // --- MÉTODOS DE VISTA Y FILTRO ---

  contarPorEstado(estado: string): number {
    return this.habitaciones.filter((h) => h.estadoActual === estado).length;
  }

  setFiltro(estado: string) {
    this.filtroSeleccionado = this.filtroSeleccionado === estado ? 'TODOS' : estado;
  }

  obtenerHabitacionesPorPiso(piso: number) {
    let filtradas = this.habitaciones.filter((h) => h.piso == piso);
    if (this.filtroSeleccionado !== 'TODOS') {
      filtradas = filtradas.filter((h) => h.estadoActual === this.filtroSeleccionado);
    }
    return filtradas;
  }

  verDetalle(hab: any) {
    this.habSeleccionada = hab;
  }

  cerrarDetalle() {
    this.habSeleccionada = null;
  }

  limpiarFormulario() {
    this.nuevaHabitacion = {
      ...this.nuevaHabitacion,
      numero: '',
      descripcion: '',
      precioMinimo: 0,
      precio12Horas: 0,
      precio24Horas: 0,
      precioHoraExtra: 0,
    };
  }

  // --- NAVEGACIÓN Y SESIÓN (Para que el Sidebar funcione) ---

  irACheckIn(idHabitacion: number) {
    this.router.navigate(['/checkin', idHabitacion]);
  }

  irACheckOut(idHabitacion: number) {
    this.cerrarDetalle();
    this.router.navigate(['/checkout', idHabitacion]);
  }

  cambiarSede() {
    this.router.navigate(['/seleccion-hotel']);
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  // --- OPERACIONES DE ESTADO ---

  eliminarHabitacion(id: number) {
    const confirmar = confirm('¿Estás seguro de eliminar esta habitación?');
    if (confirmar) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http
        .delete(`${API_CONFIG.BASE_URL}/api/habitaciones/${id}`, { headers, responseType: 'text' })
        .subscribe({
          next: () => {
            alert('✅ Habitación eliminada.');
            this.cerrarDetalle();
            this.listarHabitaciones();
          },
          error: (err) =>
            alert('❌ No se pudo eliminar. Es posible que tenga historial vinculado.'),
        });
    }
  }

  cambiarEstado(idHabitacion: number, nuevoEstado: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .post(
        `${API_CONFIG.BASE_URL}/api/habitaciones/${idHabitacion}/estado`,
        { estado: nuevoEstado },
        { headers, responseType: 'text' },
      )
      .subscribe({
        next: () => {
          this.cerrarDetalle();
          this.listarHabitaciones();
        },
        error: (err) => alert('❌ Error al actualizar estado.'),
      });
  }
}
