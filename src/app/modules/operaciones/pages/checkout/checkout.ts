import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css'], // Crea un checkout.css vacío si no lo tienes
})
export class CheckoutComponent implements OnInit {
  idHabitacion: number = 0;
  datos: any = null; // Guardará la info que manda Java
  metodoPago: string = 'EFECTIVO';
  procesando: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef, // 👈 Agrégalo aquí
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.idHabitacion = +params['id'];
      this.cargarDatosPreCheckout();
    });
  }

  // 1. Trae los cálculos matemáticos desde Java
  cargarDatosPreCheckout() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .get<any>(`http://localhost:8080/api/operaciones/${this.idHabitacion}/pre-checkout`, {
        headers,
      })
      .subscribe({
        next: (data) => {
          this.datos = data;
          this.cdr.detectChanges(); // 🚨 Obligamos a Angular a pintar la pantalla AHORA y no desaparecer
        },
        error: (err) => {
          console.error('Error al cargar datos:', err);
          this.datos = { errorFatal: true };
          const mensajeJava = typeof err.error === 'string' ? err.error : 'Error en el servidor';
          alert('❌ Falló el Check-Out: ' + mensajeJava);
          this.router.navigate(['/gestion-pisos']);
        },
      });
  }

  // 2. Finaliza la estadía y genera el PDF
  confirmarPagoYDescargar() {
    this.procesando = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Preparamos el paquete tal cual lo espera tu método de Java
    const payload = {
      total: this.datos.totalAPagar,
      metodoPago: this.metodoPago,
      tiempoUso: this.datos.horasTotales + ' horas',
    };

    this.http
      .post(`http://localhost:8080/api/operaciones/${this.idHabitacion}/check-out`, payload, {
        headers,
      })
      .subscribe({
        next: () => {
          // Si Java dice OK, descargamos el PDF y nos vamos
          this.generarBoletaPDF();
          alert('✅ Pago registrado y Check-Out exitoso. Habitación en limpieza.');
          this.router.navigate(['/gestion-pisos']);
        },
        error: (err) => {
          console.error('Error en el checkout:', err);
          alert('❌ Hubo un problema al procesar el pago.');
          this.procesando = false;
        },
      });
  }

  // 3. Diseño de la Boleta
  generarBoletaPDF() {
    const doc = new jsPDF();

    // 🏨 Obtenemos los datos reales del hotel desde el objeto cargado
    // Si por alguna razón no viniera el hotel, ponemos un nombre por defecto
    const hotel = this.datos.habitacion.hotel || {
      nombre: 'HOTEL DESCONOCIDO',
      ruc: '',
      direccion: '',
    };

    // Encabezado con datos REALES
    doc.setFontSize(18);
    doc.text(hotel.nombre.toUpperCase(), 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`RUC: ${hotel.ruc || 'Sin RUC registrado'}`, 105, 28, { align: 'center' });
    doc.text(hotel.direccion || 'Dirección no especificada', 105, 33, { align: 'center' });

    // Línea divisoria
    doc.line(10, 40, 200, 40);

    // Datos del Cliente
    const nombre = this.datos.huesped.nombre || this.datos.huesped.nombres;
    const apellido = this.datos.huesped.apellido || this.datos.huesped.apellidos;

    doc.text(`Cliente: ${nombre} ${apellido}`, 10, 50);
    doc.text(`DNI: ${this.datos.huesped.dni}`, 10, 55);
    doc.text(`Habitación: ${this.datos.habitacion.numero}`, 140, 50);
    doc.text(`Pago: ${this.metodoPago}`, 140, 55);

    // Tabla de consumo
    autoTable(doc, {
      startY: 65,
      head: [['Descripción', 'Ingreso', 'Salida', 'Horas', 'Total']],
      body: [
        [
          'Servicio de Alojamiento',
          new Date(this.datos.fechaIngreso).toLocaleString(),
          new Date(this.datos.fechaSalida).toLocaleString(),
          this.datos.horasTotales + ' h',
          'S/ ' + this.datos.totalAPagar.toFixed(2),
        ],
      ],
      headStyles: { fillColor: [44, 62, 80] }, // Un color azul oscuro profesional
    });

    // Totales Finales
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Total Bruto: S/ ${this.datos.totalAPagar.toFixed(2)}`, 140, finalY);
    doc.text(`Adelanto: S/ ${this.datos.adelanto.toFixed(2)}`, 140, finalY + 5);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`NETO PAGADO: S/ ${this.datos.saldoPendiente.toFixed(2)}`, 140, finalY + 12);

    // 🚨 LA MAGIA: Abrir en nueva pestaña sin descargar
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  regresar() {
    this.router.navigate(['/gestion-pisos']);
  }
}
