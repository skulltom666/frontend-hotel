import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HotelService } from '../../../../core/services/hotel.service';

@Component({
  selector: 'app-nuevo-hotel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nuevo.html',
  styleUrls: ['./nuevo.css'],
})
export class NuevoHotel implements OnInit {
  hotel = {
    nombre: '',
    direccion: '',
    telefono: '',
  };
  guardando = false;
  usuarioNombre = 'Administrador';
  planNombre = 'BASIC';
  limiteHabitaciones = 10;

  constructor(
    private hotelService: HotelService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.usuarioNombre = localStorage.getItem('nombre') || 'Administrador';

    const planInfo = JSON.parse(localStorage.getItem('plan_pendiente') || '{}');
    this.planNombre = planInfo.nombre || 'BASIC';
    this.limiteHabitaciones = planInfo.habitaciones || 10;
  }

  guardarHotel() {
    if (this.guardando) {
      return;
    }

    this.guardando = true;

    // 1. Recuperamos el plan y el nombre del usuario logueado
    const planInfo = JSON.parse(localStorage.getItem('plan_pendiente') || '{}');
    const usuarioNombre = localStorage.getItem('nombre');

    // 2. Armamos el objeto completo para Java
    const hotelCompleto = {
      ...this.hotel,
      plan: planInfo.nombre || 'BASIC', // Valor por defecto si no hay plan
      limiteHabitaciones: planInfo.habitaciones || 10,
      propietario: usuarioNombre, // <--- IMPORTANTE: Así Java sabe de quién es el hotel
    };

    // 3. Enviamos a Java
    this.hotelService.registrarHotel(hotelCompleto).subscribe({
      next: (res) => {
        alert(`¡Sede "${res.nombre}" creada con éxito!`);
        this.guardando = false;

        // --- LIMPIEZA DE MEMORIA ---
        localStorage.removeItem('plan_pendiente');

        // 🚨 PASO MAESTRO: Borramos la lista de hoteles vieja del localStorage.
        // Al hacer esto, cuando volvamos a la pantalla de Selección, el sistema
        // verá que no hay lista y llamará a Java para traer la lista actualizada
        // donde ya aparecerá el nuevo hotel.
        localStorage.removeItem('listaHoteles');

        this.router.navigate(['/seleccion-hotel']);
      },
      error: (err) => {
        this.guardando = false;
        alert('Error al registrar el hotel. Inténtalo de nuevo.');
        console.error(err);
      },
    });
  }

  cancelarRegistro() {
    this.router.navigate(['/seleccion-hotel']);
  }
}
