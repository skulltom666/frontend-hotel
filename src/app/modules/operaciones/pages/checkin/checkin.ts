import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 👈 Se agregó ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkin.html',
  styleUrls: ['./checkin.css'],
})
export class CheckinComponent implements OnInit {
  idHabitacion: number = 0;
  buscandoDni: boolean = false;

  // 👈 NUEVA VARIABLE: Para saber si mostramos el texto de "Nuevo"
  esNuevoHuesped: boolean = false;

  // Objeto Huesped
  huesped = {
    dni: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    email: '',
  };

  // Datos extra de la operación
  operacion = {
    adelanto: 0,
    observacion: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef, // 👈 Agrégalo aquí
  ) {}

  ngOnInit() {
    // Capturamos el ID de la URL
    this.route.params.subscribe((params) => {
      this.idHabitacion = +params['id'];
    });
  }

  // --- LÓGICA: Se dispara cada vez que tecleas un número ---
  onDniChange(nuevoValor: string) {
    // Si borras números y hay menos de 8, limpiamos
    if (nuevoValor.length < 8) {
      this.huesped.nombres = '';
      this.huesped.apellidos = '';
      this.huesped.telefono = '';
      this.huesped.email = '';
      this.esNuevoHuesped = false;
      return;
    }

    // 🚨 MODIFICADO: Disparamos la búsqueda si tiene 8 o 9 dígitos
    if (nuevoValor.length === 8 || nuevoValor.length === 9) {
      this.buscarDni();
    }
  }

  // --- LÓGICA DE AUTO-LLENADO ACTUALIZADA ---
  buscarDni() {
    this.buscandoDni = true;
    this.esNuevoHuesped = false;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .get<any>(`http://localhost:8080/api/operaciones/huesped/${this.huesped.dni}`, { headers })
      .subscribe({
        next: (data) => {
          this.huesped.nombres = data.nombre || data.nombres || '';
          this.huesped.apellidos = data.apellido || data.apellidos || '';
          this.huesped.telefono = data.telefono || data.celular || '';
          this.huesped.email = data.email || data.correo || '';

          this.buscandoDni = false;
          this.esNuevoHuesped = false;

          // 🚨 EL PELLIZCO: Fuerza a la pantalla a actualizarse YA
          this.cdr.detectChanges();
        },
        error: (err) => {
          if (err.status === 404) {
            this.huesped.nombres = '';
            this.huesped.apellidos = '';
            this.huesped.telefono = '';
            this.huesped.email = '';
            this.esNuevoHuesped = true;
          } else {
            console.error('❌ Error en la búsqueda:', err);
            alert('Hubo un problema al buscar el DNI.');
          }
          this.buscandoDni = false;

          // 🚨 EL PELLIZCO TAMBIÉN AQUÍ: Para que muestre el aviso "¡Nuevo!" al instante
          this.cdr.detectChanges();
        },
      });
  }

  // --- LÓGICA PARA CONFIRMAR EL INGRESO ---
  confirmarCheckIn() {
    // 🚨 EL TRUCO: Formateamos el huésped para que coincida EXACTAMENTE con Java
    const huespedFormateado = {
      dni: this.huesped.dni,
      nombre: this.huesped.nombres, // 👈 Forzamos a singular
      apellido: this.huesped.apellidos, // 👈 Forzamos a singular
      telefono: this.huesped.telefono,
      email: this.huesped.email,
    };

    const dataFinal = {
      idHabitacion: this.idHabitacion,
      habitacionId: this.idHabitacion, // 👈 Lo enviamos doble por si Java usa este nombre
      huesped: huespedFormateado,
      adelanto: this.operacion.adelanto,
      observacion: this.operacion.observacion,
    };

    console.log('Enviando datos de Check-In a Java:', dataFinal);

    // Recuperamos el Token
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Petición POST a Java
    this.http
      .post('http://localhost:8080/api/operaciones/checkin', dataFinal, {
        headers,
        responseType: 'text', // 🚨 ESTA ES LA CLAVE: Le decimos que recibirá texto, no JSON
      })
      .subscribe({
        next: (res) => {
          console.log('Respuesta del servidor:', res);
          alert('✅ Check-In exitoso');
          this.router.navigate(['/gestion-pisos']);
        },
        error: (err) => {
          console.error('Error del servidor:', err);
          alert('❌ Error al procesar el Check-In. Revisa la consola.');
        },
      });
  }

  regresar() {
    this.router.navigate(['/gestion-pisos']);
  }
}
