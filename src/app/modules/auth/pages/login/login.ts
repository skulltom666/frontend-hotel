import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  credenciales = { email: '', password: '' };

  constructor(
    private authService: AuthService,
    public router: Router,
  ) {}

  iniciarSesion() {
    this.authService.login(this.credenciales).subscribe({
      next: (res) => {
        // 1. Guardamos los datos de identidad básicos siempre
        localStorage.setItem('token', res.token);
        localStorage.setItem('nombre', res.nombre);
        localStorage.setItem('rol', res.rol);

        // 2. Lógica de Navegación Flexibilizada
        if (res.hoteles && res.hoteles.length === 1) {
          // SI TIENE SOLO 1: Entra directo al portal
          const hotelUnico = res.hoteles[0];
          localStorage.setItem('hotelId', hotelUnico.id.toString());
          localStorage.setItem('hotelNombre', hotelUnico.nombre);

          this.router.navigate(['/portal']);
        } else {
          // SI TIENE 0 o MUCHOS:
          localStorage.setItem('listaHoteles', JSON.stringify(res.hoteles || []));

          // 🚨 ASEGÚRATE DE QUE DIGA 'seleccion-hotel' (con el guion)
          this.router.navigate(['/seleccion-hotel']);
        }
      },
      error: (err) => {
        console.error('Error en login:', err);
        alert('Credenciales incorrectas o error de conexión.');
      },
    });
  }
}
