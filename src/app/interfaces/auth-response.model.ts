// src/app/interfaces/auth-response.model.ts

export interface HotelDTO {
  id: number;
  nombre: string;
}

export interface AuthResponse {
  token: string;
  nombre: string;
  rol: string;
  hoteles: HotelDTO[]; // Fíjate que sea hoteles (en plural)
}
