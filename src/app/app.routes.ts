import { Routes } from '@angular/router';
import { Login } from './modules/auth/pages/login/login';
import { Portal } from './modules/auth/pages/portal/portal';
import { Registro } from './modules/auth/pages/registro/registro';
import { Seleccion } from './modules/hotel/pages/seleccion/seleccion';
import { Suscripcion } from './modules/hotel/pages/suscripcion/suscripcion';
import { NuevoHotel } from './modules/hotel/pages/nuevo/nuevo';
import { GestionHabitacionesComponent } from './modules/hotel/pages/gestion-habitaciones/gestion-habitaciones';
import { CheckinComponent } from './modules/operaciones/pages/checkin/checkin';

// 🚨 1. IMPORTA EL COMPONENTE DE CHECK-OUT
import { CheckoutComponent } from './modules/operaciones/pages/checkout/checkout';
import { DashboardComponent } from './modules/hotel/pages/dashboard/dashboard';
import { PerfilComponent } from './modules/auth/pages/perfil/perfil';
// (Asegúrate de que esta ruta coincida con la carpeta donde creaste el checkout.ts)

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'portal', component: Portal },
  { path: 'seleccion-hotel', component: Seleccion },
  { path: 'suscripcion', component: Suscripcion },
  { path: 'nuevo-hotel', component: NuevoHotel },
  { path: 'gestion-pisos', component: GestionHabitacionesComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'perfil', component: PerfilComponent },

  // Módulo de Operaciones
  { path: 'checkin/:id', component: CheckinComponent },

  // 🚨 2. AQUÍ ESTÁ LA NUEVA RUTA PARA EL CHECK-OUT
  { path: 'checkout/:id', component: CheckoutComponent },

  // Redirección por defecto al login si no se escribe nada
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
