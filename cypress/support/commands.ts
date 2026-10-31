/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Comando personalizado para simular una sesión activa en localStorage
       */
      loginMock(hotelId?: number, hotelNombre?: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loginMock', (hotelId = 1, hotelNombre = 'Hotel Central Plaza') => {
  localStorage.setItem('token', 'fake-jwt-token-hotel-123456');
  localStorage.setItem('nombre', 'Administrador Principal');
  localStorage.setItem('rol', 'ADMINISTRADOR');
  localStorage.setItem('hotelId', hotelId.toString());
  localStorage.setItem('hotelNombre', hotelNombre);
});

export {};