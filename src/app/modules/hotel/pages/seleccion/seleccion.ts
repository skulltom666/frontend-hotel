// 1. Corregimos la procedencia de los miembros core
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HotelService } from '../../../../core/services/hotel.service';

@Component({
  selector: 'app-seleccion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seleccion.html',
})
export class Seleccion implements OnInit {
  public hoteles: any[] = [];

  constructor(
    private hotelService: HotelService,
    private cdr: ChangeDetectorRef,
    public router: Router,
  ) {}

  ngOnInit() {
    this.cargarHoteles();
  }

  cargarHoteles() {
    console.log('🛰️ Solicitando lista fresca de hoteles al servidor...');

    this.hotelService.obtenerMisHoteles().subscribe({
      next: (data) => {
        this.hoteles = data;
        localStorage.setItem('listaHoteles', JSON.stringify(data));
        console.log('🏨 Hoteles recuperados:', this.hoteles);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al cargar hoteles:', err);
        const guardados = localStorage.getItem('listaHoteles');
        if (guardados) {
          this.hoteles = JSON.parse(guardados);
        }
      },
    });
  }

  gestionarHotel(id: number) {
    const hotelSeleccionado = this.hoteles.find((h) => h.id === id);

    if (hotelSeleccionado) {
      localStorage.setItem('hotelId', id.toString());
      localStorage.setItem('hotelNombre', hotelSeleccionado.nombre);

      let limitePlan = 10;
      if (hotelSeleccionado.plan === 'PREMIUM' || hotelSeleccionado.plan === 'PRO') {
        limitePlan = 50;
      }

      localStorage.setItem('hotel_limite', limitePlan.toString());
      console.log(`✅ Entrando a: ${hotelSeleccionado.nombre} (ID: ${id})`);
      this.router.navigate(['/portal']);
    }
  }
}
