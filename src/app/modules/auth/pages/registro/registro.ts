import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // 1. IMPORTA HTTP CLIENT

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], // 2. AGREGAR A IMPORTS
  templateUrl: './registro.html',
  styleUrls: ['./registro.css'],
})
export class Registro {
  // 3. AÑADIMOS EL ROL AL OBJETO
  usuario = {
    nombre: '',
    email: '',
    password: '',
    rol: 'HUESPED', // o 'USER', 'RECEPCIONISTA' (Depende de cómo se llame en tu Java)
  };

  // 4. INYECTAMOS HTTPCLIENT EN EL CONSTRUCTOR
  constructor(
    public router: Router,
    private http: HttpClient,
  ) {}

  registrar() {
    console.log('Enviando datos reales a Java:', this.usuario);

    // 5. LA MAGIA REAL: Llamada POST a tu backend de Spring Boot
    // (Asegúrate de que la ruta /api/auth/register sea la correcta en tu AuthController de Java)
    this.http.post('http://localhost:8080/api/auth/registro', this.usuario).subscribe({
      next: (respuesta) => {
        // Si Java responde que TODO OK (Status 200 o 201)
        alert('¡Usuario guardado REALMENTE en la base de datos!');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        // Si Java rechaza los datos (ej. falta el rol, o el correo ya existe)
        console.error('Error del servidor Java:', error);
        alert('Error al registrar. Revisa la consola F12.');
      },
    });
  }
}
