describe('Sistema Hotelero - Suite de Pruebas End-to-End (E2E)', () => {
  const testuser = {
    email: "admin@gmail.com",
    password: "4dm1n*"
  }

  beforeEach(() => {
    cy.fixture('auth-data.json').as('authData');
    cy.fixture('habitaciones-data.json').as('habitacionesData');
    cy.fixture('pre-checkout.json').as('preCheckoutData');
  });

  // 1. MÓDULO DE AUTENTICACIÓN
  describe('1. Módulo de Autenticación y Acceso', () => {
    it('1.1 Debe cargar la pantalla de login con sus componentes y enlaces', () => {
      cy.visit('/login');
      cy.contains('🏢 Sistema Hotelero').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]')
        .should('be.visible')
        .and('contain.text', 'Ingresar al Sistema');
    });

    it('1.2 Debe navegar a la pantalla de registro y permitir volver al login', () => {
      cy.visit('/login');
      cy.contains('Regístrate aquí').click();
      cy.url().should('include', '/registro');
      cy.contains('✨ Crear Cuenta').should('be.visible');

      // Volver a login
      cy.contains('Inicia sesión aquí').click();
      cy.url().should('include', '/login');
    });

    it('1.3 Debe autenticar al usuario y redirigir al portal de bienvenida', function () {
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 200,
        body: this.authData,
      }).as('loginRequest');

      cy.visit('/login');
      cy.get('input[name="email"]').type(testuser.email);
      cy.get('input[name="password"]').type(testuser.password);
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');

      cy.url().should('include', '/portal');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.equal('fake-jwt-token-hotel-123456');
        expect(win.localStorage.getItem('hotelId')).to.equal('1');
        expect(win.localStorage.getItem('hotelNombre')).to.equal('Hotel Central Plaza');
      });
    });
  });

  // 2. MÓDULO DE DASHBOARD Y NAVEGACIÓN
  describe('2. Módulo de Dashboard y Navegación', () => {
    beforeEach(() => {
      cy.loginMock(1, 'Hotel Central Plaza');
      cy.visit('/portal');
    });

    it('2.1 Debe mostrar el panel de bienvenida con datos del hotel y usuario', () => {
      cy.contains('Panel de Bienvenida: Hotel Central Plaza').should('be.visible');
      cy.contains('Hola, Administrador Principal').should('be.visible');
      cy.contains('Acciones Rápidas').should('be.visible');
    });

    it('2.2 Debe navegar a Pisos y Habitaciones desde la barra lateral', function () {
      cy.intercept('GET', '**/api/habitaciones/hotel/1', {
        statusCode: 200,
        body: this.habitacionesData,
      }).as('getHabitaciones');

      cy.get('.sidebar-nav').contains('Pisos y Habitaciones').click();
      cy.url().should('include', '/gestion-pisos');
      cy.wait('@getHabitaciones');
      cy.contains('Gestión de Operaciones: Hotel Central Plaza').should('be.visible');
    });
  });

  // 3. MÓDULO DE GESTIÓN DE PISOS Y HABITACIONES
  describe('3. Módulo de Gestión de Pisos y Habitaciones', () => {
    beforeEach(function () {
      cy.loginMock(1, 'Hotel Central Plaza');

      cy.intercept('GET', '**/api/habitaciones/hotel/1', {
        statusCode: 200,
        body: this.habitacionesData,
      }).as('getHabitaciones');

      cy.visit('/gestion-pisos');
      cy.wait('@getHabitaciones');
    });

    it('3.1 Debe mostrar el resumen de estados y permitir filtrar habitaciones', () => {
      // Validar resumen
      cy.get('.status-summary .total .count').should('contain.text', '3');
      cy.get('.status-summary .disponible .count').should('contain.text', '1');
      cy.get('.status-summary .ocupado .count').should('contain.text', '1');
      cy.get('.status-summary .sucio .count').should('contain.text', '1');

      // Filtrar por DISPONIBLE
      cy.get('.status-summary .disponible').click();
      cy.get('.hab-card').should('have.length', 1);
      cy.get('.hab-card').should('contain.text', '101');

      // Volver a TODOS
      cy.get('.status-summary .total').click();
      cy.get('.hab-card').should('have.length', 3);
    });

    it('3.2 Debe registrar una nueva habitación exitosamente', () => {
      cy.intercept('POST', '**/api/habitaciones', {
        statusCode: 201,
        body: { id: 103, numero: '103', mensaje: 'Creada con éxito' },
      }).as('createHabitacion');

      // Llenar formulario de habitación
      cy.get('select[name="piso"]').select('Nivel 1');
      cy.get('input[name="numero"]').clear().type('103');
      cy.get('input[name="limite"]').clear().type('2');
      cy.get('input[name="descripcion"]').clear().type('Habitación Matrimonial Deluxe');
      cy.get('input[name="camasS"]').clear().type('0');
      cy.get('input[name="camasD"]').clear().type('1');
      cy.get('input[name="horasMin"]').clear().type('6');
      cy.get('input[name="pMin"]').clear().type('70');
      cy.get('input[name="p12h"]').clear().type('110');
      cy.get('input[name="p24h"]').clear().type('160');
      cy.get('input[name="pExtra"]').clear().type('18');

      // Interceptar alert
      cy.on('window:alert', (text) => {
        expect(text).to.include('Habitación guardada exitosamente');
      });

      cy.get('.form-actions button[type="submit"]').click();
      cy.wait('@createHabitacion')
        .its('request.body')
        .should((body) => {
          expect(body.numero).to.equal('103');
          expect(body.hotelId).to.equal(1);
          expect(body.piso).to.equal(1);
        });
    });

    it('3.3 Debe abrir el modal con el detalle completo al hacer clic en una habitación', () => {
      cy.contains('.hab-card', '101').click();
      cy.get('.modal-content').should('be.visible');
      cy.get('.modal-header h2').should('contain.text', 'Habitación 101');
      cy.get('.tarifas-title').should('contain.text', 'Tarifario Completo');
      cy.get('.btn-checkin').should('be.visible').and('contain.text', 'IR A CHECK-IN');

      // Cerrar modal
      cy.get('.close-btn').click();
      cy.get('.modal-content').should('not.exist');
    });
  });

  // 4. MÓDULO OPERATIVO: FLUJO DE CHECK-IN
  describe('4. Módulo Operativo: Flujo de Check-In', () => {
    beforeEach(function () {
      cy.loginMock(1, 'Hotel Central Plaza');

      cy.intercept('GET', '**/api/habitaciones/hotel/1', {
        statusCode: 200,
        body: this.habitacionesData,
      }).as('getHabitaciones');

      cy.visit('/gestion-pisos');
      cy.wait('@getHabitaciones');
    });

    it('4.1 Debe registrar un Check-In completando datos de huésped y confirmando el ingreso', () => {
      // 1. Abrir detalle de habitación 101 (Disponible)
      cy.contains('.hab-card', '101').click();
      cy.get('.btn-checkin').click();

      // Validar navegación hacia checkin/101
      cy.url().should('include', '/checkin/101');
      cy.contains('Registro de Check-In').should('be.visible');
      cy.contains('Habitación #101').should('be.visible');

      // Simular búsqueda de DNI nuevo (404 para nuevo huésped)
      cy.intercept('GET', '**/api/operaciones/huesped/71234567', {
        statusCode: 404,
        body: { error: 'No encontrado' },
      }).as('buscarDni');

      // Interceptar confirmación de Check-in
      cy.intercept('POST', '**/api/operaciones/checkin', {
        statusCode: 200,
        body: 'OK',
      }).as('confirmarCheckin');

      // Escribir DNI
      cy.get('input[name="dni"]').type('71234567');
      cy.wait('@buscarDni');
      cy.contains('¡Nuevo!').should('be.visible');

      // Llenar datos de huésped
      cy.get('input[name="nombres"]').type('Alejandro');
      cy.get('input[name="apellidos"]').type('Mendoza Díaz');
      cy.get('input[name="telefono"]').type('987654321');
      cy.get('input[name="email"]').type('alejandro@gmail.com');

      // Operación
      cy.get('input[name="adelanto"]').clear().type('50');
      cy.get('textarea[name="observacion"]').type('Huésped solicita toalla extra.');

      // Validar alert de éxito
      cy.on('window:alert', (text) => {
        expect(text).to.include('Check-In exitoso');
      });

      // Confirmar Check-In
      cy.get('.card-footer .btn-primary').should('be.enabled').click();
      cy.wait('@confirmarCheckin')
        .its('request.body')
        .should((body) => {
          expect(body.idHabitacion).to.equal(101);
          expect(body.huesped.dni).to.equal('71234567');
          expect(body.huesped.nombres).to.equal('Alejandro');
          expect(body.adelanto).to.equal(50);
        });

      // Redirige de vuelta a gestión de habitaciones
      cy.url().should('include', '/gestion-pisos');
    });
  });

  // 5. MÓDULO OPERATIVO: FLUJO DE CHECK-OUT Y FACTURACIÓN
  describe('5. Módulo Operativo: Flujo de Check-Out', () => {
    beforeEach(function () {
      cy.loginMock(1, 'Hotel Central Plaza');

      cy.intercept('GET', '**/api/habitaciones/hotel/1', {
        statusCode: 200,
        body: this.habitacionesData,
      }).as('getHabitaciones');

      cy.visit('/gestion-pisos');
      cy.wait('@getHabitaciones');
    });

    it('5.1 Debe cargar el pre-checkout, seleccionar medio de pago y finalizar estadía', function () {
      // Interceptar pre-checkout de la habitación 102 (Ocupada)
      cy.intercept('GET', '**/api/operaciones/102/pre-checkout', {
        statusCode: 200,
        body: this.preCheckoutData,
      }).as('getPreCheckout');

      cy.intercept('POST', '**/api/operaciones/102/check-out', {
        statusCode: 200,
        body: 'Check-out exitoso',
      }).as('postCheckout');

      // Abrir detalle de habitación ocupada 102
      cy.contains('.hab-card', '102').click();
      cy.get('.btn-checkout').click();

      // Validar navegación
      cy.url().should('include', '/checkout/102');
      cy.wait('@getPreCheckout');

      // Validar resumen financiero en pantalla
      cy.contains('Resumen de Check-Out').should('be.visible');
      cy.contains('Carlos Ramírez Silva').should('be.visible');
      cy.contains('Total Bruto: S/ 100.00').should('be.visible');
      cy.contains('Adelanto: - S/ 30.00').should('be.visible');
      cy.contains('Cobrar: S/ 70.00').should('be.visible');

      // Seleccionar método de pago YAPE
      cy.get('select').select('YAPE');

      // Prevenir apertura de pestañas por window.open (jsPDF)
      cy.window().then((win) => {
        cy.stub(win, 'open').as('windowOpen');
      });

      cy.on('window:alert', (text) => {
        expect(text).to.include('Pago registrado y Check-Out exitoso');
      });

      // Confirmar pago
      cy.get('.card-footer .btn-primary').contains('Confirmar Pago').click();
      cy.wait('@postCheckout')
        .its('request.body')
        .should((body) => {
          expect(body.metodoPago).to.equal('YAPE');
          expect(body.total).to.equal(100.0);
        });

      // Verifica retorno a gestión de pisos
      cy.url().should('include', '/gestion-pisos');
    });
  });

  // 6. CIERRE DE SESIÓN
  describe('6. Cierre de Sesión', () => {
    it('6.1 Debe cerrar sesión, vaciar localStorage y redirigir a /login', () => {
      cy.loginMock(1, 'Hotel Central Plaza');
      cy.visit('/portal');

      cy.get('.sidebar-footer .btn-logout').click();

      cy.url().should('include', '/login');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
        expect(win.localStorage.getItem('hotelId')).to.be.null;
      });
    });
  });
});
