import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
})
export class PerfilComponent implements OnInit {
  nombreUsuario: string = '';
  nombreHotel: string = '';
  idHotel: number = 0;

  perfilCompleto = {
    dni: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    email: '',
  };

  buscandoDni: boolean = false;

  constructor(
    private http: HttpClient,
    public router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // 1. Carga visual inmediata de lo que tenemos en el navegador
    this.nombreUsuario = localStorage.getItem('nombre') || 'Usuario';
    this.nombreHotel = localStorage.getItem('hotelNombre') || 'Sede';
    this.idHotel = Number(localStorage.getItem('hotelId'));

    // 2. 🚨 LA CLAVE: Pedimos al servidor la "verdad" de la cuenta
    this.cargarInformacionDeCuenta();
  }

  cargarInformacionDeCuenta() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Consultamos los datos básicos del Usuario (Tabla usuario)
    this.http.get<any>('http://localhost:8080/api/perfil/actual', { headers }).subscribe({
      next: (data) => {
        // Llenamos lo que sabemos del usuario
        this.perfilCompleto.email = data.email || '';
        this.perfilCompleto.nombres = data.nombreUsuario || this.nombreUsuario;
        this.nombreUsuario = data.nombreUsuario;

        // 🚨 SI YA TIENE DNI VINCULADO, RECICLAMOS EL MÉTODO DE BÚSQUEDA
        if (data.dni) {
          this.perfilCompleto.dni = data.dni;
          console.log('✅ DNI detectado, autocompletando datos de cliente...');
          this.buscarDatosPorDni(); // 👈 Llamada automática
        }

        this.cdr.detectChanges();
      },
      error: (err) => console.log('No se pudo cargar la cuenta o no hay DNI vinculado.'),
    });
  }

  buscarDatosPorDni() {
    if (!this.perfilCompleto.dni || this.perfilCompleto.dni.length < 8) return;

    this.buscandoDni = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .get<any>(`http://localhost:8080/api/operaciones/huesped/${this.perfilCompleto.dni}`, {
        headers,
      })
      .subscribe({
        next: (data) => {
          // Extraemos los datos de la tabla 'huesped'
          this.perfilCompleto.nombres = data.nombres || data.nombre;
          this.perfilCompleto.apellidos = data.apellidos || data.apellido;
          this.perfilCompleto.telefono = data.telefono;
          // Actualizamos el email solo si el registro de huésped tiene uno diferente
          this.perfilCompleto.email = data.email || this.perfilCompleto.email;

          this.buscandoDni = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.buscandoDni = false;
          console.log('DNI no registrado como cliente todavía.');
          this.cdr.detectChanges();
        },
      });
  }

  guardarPerfil() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const datosParaEnviar = {
      dni: this.perfilCompleto.dni,
      nombre: this.perfilCompleto.nombres,
      apellido: this.perfilCompleto.apellidos,
      telefono: this.perfilCompleto.telefono,
    };

    this.http
      .post('http://localhost:8080/api/perfil/vincular', datosParaEnviar, {
        headers,
        responseType: 'text',
      })
      .subscribe({
        next: (res) => {
          alert('✅ ' + res);
          // Actualizamos el nombre en el storage para que persista en toda la app
          localStorage.setItem('nombre', this.perfilCompleto.nombres);
          this.router.navigate(['/portal']);
        },
        error: (err) => alert('❌ ' + (err.error || 'Error al vincular')),
      });
  }

  cambiarSede() {
    this.router.navigate(['/seleccion-hotel']);
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
