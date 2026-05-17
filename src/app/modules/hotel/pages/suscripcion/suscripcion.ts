// suscripcion.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-suscripcion',
  standalone: true,
  templateUrl: './suscripcion.html',
})
export class Suscripcion {
  planes = [
    {
      nombre: 'BASIC',
      precio: 50,
      habitaciones: 10,
      beneficios: ['Gestión de Huéspedes', 'Pisos ilimitados', 'Reportes básicos'],
    },
    {
      nombre: 'PREMIUM',
      precio: 120,
      habitaciones: 50,
      beneficios: [
        'Todo el Plan Basic',
        'Dashboard de KPIs',
        'Soporte prioritario',
        'Múltiples sedes',
      ],
    },
  ];

  planSeleccionado: any = null;
  metodoPago: string = 'qr';

  constructor(private router: Router) {}

  seleccionarPlan(plan: any) {
    this.planSeleccionado = plan;
  }

  confirmarPago() {
    if (this.planSeleccionado) {
      // 1. Guardamos la elección para que el siguiente componente sepa qué plan se pagó
      localStorage.setItem(
        'plan_pendiente',
        JSON.stringify({
          nombre: this.planSeleccionado.nombre,
          habitaciones: this.planSeleccionado.habitaciones,
        }),
      );

      alert('¡Pago procesado con éxito! Ahora registra los datos de tu hotel.');

      // 2. Navegamos al formulario final
      this.router.navigate(['/nuevo-hotel']);
    }
  }
}
