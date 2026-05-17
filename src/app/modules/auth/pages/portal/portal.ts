import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-portal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portal.html',
  styleUrls: ['./portal.css'],
})
export class Portal implements OnInit {
  nombreUsuario: string = '';
  nombreHotel: string = '';

  constructor(
    public router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // 1. Obtenemos la identidad del usuario
    this.nombreUsuario = localStorage.getItem('nombre') || 'Administrador';

    // 2. Intentamos obtener el hotel seleccionado
    const idHotel = localStorage.getItem('hotelId');
    const nombreH = localStorage.getItem('hotelNombre');

    if (!idHotel || !nombreH) {
      // SEGURIDAD: Si no hay hotel seleccionado, no puede estar en el portal
      console.warn('⚠️ Acceso al portal sin hotel seleccionado. Redirigiendo...');
      this.router.navigate(['/seleccion-hotel']);
      return;
    }

    this.nombreHotel = nombreH;

    console.log('✅ Sesión activa:', this.nombreUsuario, 'en sede:', this.nombreHotel);

    // Forzamos la detección de cambios para que el HTML se actualice
    this.cdr.detectChanges();
  }

  /**
   * Método para regresar a la lista de sedes sin cerrar sesión
   */
  cambiarSede() {
    // Limpiamos los datos de la sede actual del "baúl" (localStorage)
    localStorage.removeItem('hotelId');
    localStorage.removeItem('hotelNombre');
    localStorage.removeItem('hotel_limite');

    // Navegamos de vuelta a la selección
    this.router.navigate(['/seleccion-hotel']);
  }

  /**
   * Método opcional para cerrar sesión por completo
   */
  cerrarSesion() {
    localStorage.clear(); // Borra todo (token, nombre, hoteles)
    this.router.navigate(['/login']);
  }

  irADashboard() {
    console.log('🚀 Navegando al Panel de Control...');
    this.router.navigate(['/dashboard']);
  }

  irAPerfil() {
    this.router.navigate(['/perfil']);
  }
}
