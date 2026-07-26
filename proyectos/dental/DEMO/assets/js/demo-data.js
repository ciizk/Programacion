/* =====================================================================
   Clínica Dental · Datos de DEMO (sin base de datos)
   Todo vive en memoria. Fuente única para landing, paneles y reserva.
   ===================================================================== */
window.DEMO = {
    clinic: {
        name:    'Clínica Dental Raquel Virgüez',
        address: 'C.C. Plaza Real, Acarigua, Venezuela',
        phone:   '+58 255 621 0000',
        email:   'info@clinicaraquelvirguez.com',
        hours:   'Lunes a viernes, 8:00 a 17:00',
        mapsQuery: 'C.C. Plaza Real, Acarigua, Portuguesa, Venezuela'
    },
    currency: '$',            // Bs. digitalizados a USD, habitual en clínicas privadas VE
    today: '2026-07-24',

    treatments: [
        { id: 1, name: 'Revisión y diagnóstico', category: 'Preventiva', icon: 'fa-magnifying-glass-chart', min: 20, precio: 30, desc: 'Exploración completa y plan de tratamiento personalizado.' },
        { id: 2, name: 'Limpieza dental (higiene)', category: 'Preventiva', icon: 'fa-tooth', min: 30, precio: 50, desc: 'Eliminación de sarro y pulido para unas encías sanas.' },
        { id: 3, name: 'Empaste (obturación)', category: 'Conservadora', icon: 'fa-fill-drip', min: 40, precio: 80, desc: 'Reparación de caries con composite del color del diente.' },
        { id: 4, name: 'Ortodoncia (revisión)', category: 'Ortodoncia', icon: 'fa-teeth', min: 30, precio: 120, desc: 'Control y ajuste de brackets o alineadores invisibles.' },
        { id: 5, name: 'Blanqueamiento', category: 'Estética', icon: 'fa-wand-magic-sparkles', min: 50, precio: 200, desc: 'Devuelve el brillo a tu sonrisa de forma segura.' },
        { id: 6, name: 'Implante (valoración)', category: 'Cirugía', icon: 'fa-user-doctor', min: 45, precio: 40, desc: 'Estudio para reponer piezas perdidas con implantes.' }
    ],

    doctors: [
        { id: 10, name: 'Dra. Raquel Virgüez', specialty: 'Directora · Odontología', colegiado: 'COEV-3001', owner: true },
        { id: 11, name: 'Dra. Laura Beltrán', specialty: 'Odontología general', colegiado: 'COEV-4521' },
        { id: 12, name: 'Dr. Sergio Montesinos', specialty: 'Ortodoncia', colegiado: 'COEV-3987' },
        { id: 13, name: 'Dra. Natalia Sanchis', specialty: 'Estética dental', colegiado: 'COEV-5102' }
    ],

    // Dueña / doctora / administradora
    owner: { name: 'Raquel', surname: 'Virgüez', role: 'Propietaria · Doctora · Admin' },

    // Paciente demo (Lucía)
    patient: {
        name: 'Lucía', surname: 'Torres Marí',
        profile: {
            grupo: 'O+', alergias: 'Penicilina', cronicas: 'Ninguna',
            medicacion: 'Ninguna', emergencia: 'Marcos Torres · +58 424 000 0000', seguro: 'Seguros Caracas'
        },
        upcoming: [
            { fecha: '2026-07-24', ini: '09:00', fin: '09:20', doctor: 'Dra. Laura Beltrán', spec: 'Odontología general', trat: 'Revisión y diagnóstico', estado: 'confirmada' }
        ],
        history: [
            { fecha: '2026-07-31', ini: '09:00', doctor: 'Dra. Laura Beltrán', trat: 'Limpieza dental (higiene)', estado: 'completada', notas: 'Higiene realizada. Sin caries.' },
            { fecha: '2026-07-22', ini: '12:00', doctor: 'Dra. Laura Beltrán', trat: 'Empaste (obturación)', estado: 'cancelada', notas: '—' },
            { fecha: '2026-07-20', ini: '09:30', doctor: 'Dra. Laura Beltrán', trat: 'Limpieza dental (higiene)', estado: 'completada', notas: 'Tartrectomía completa. Buena higiene. Próxima revisión en 6 meses.' }
        ],
        // Fotos de progreso (semilla; el paciente puede subir más en la demo)
        files: [
            { name: 'antes-frontal.jpg', date: '2026-05-20', kind: 'img', tint: '#64748b' },
            { name: 'despues-frontal.jpg', date: '2026-07-20', kind: 'img', tint: '#0891b2' }
        ],
        // Por diente completo ('corona','ausente') o por caras:
        // m=mesial · d=distal · o=oclusal/incisal · v=vestibular · l=lingual/palatino
        odonto: { 16: { o: 'empaste', m: 'caries' }, 11: 'corona', 36: { o: 'caries', d: 'caries' }, 47: 'ausente', 24: { v: 'empaste' } }
    },

    // Agenda del doctor demo (Dra. Laura)
    doctor: {
        name: 'Laura', surname: 'Beltrán Ferrer',
        pending: [
            { id: 101, fecha: '2026-07-24', ini: '09:00', fin: '09:20', paciente: 'Elena Císcar Blai', tel: '+58 414 111 2233', trat: 'Revisión y diagnóstico', estado: 'confirmada' },
            { id: 102, fecha: '2026-07-24', ini: '10:00', fin: '10:40', paciente: 'Hugo Escrivá Pons', tel: '+58 412 555 8899', trat: 'Empaste (obturación)', estado: 'programada' },
            { id: 103, fecha: '2026-07-25', ini: '11:30', fin: '12:00', paciente: 'Andrés Molina Gil', tel: '+58 424 777 1010', trat: 'Limpieza dental (higiene)', estado: 'programada' }
        ],
        history: [
            { fecha: '2026-07-20', ini: '09:30', paciente: 'Lucía Torres Marí', trat: 'Limpieza dental (higiene)', estado: 'completada', notas: 'Tartrectomía completa. Buena higiene.' },
            { fecha: '2026-07-18', ini: '12:00', paciente: 'Carmen Ruiz Server', trat: 'Blanqueamiento', estado: 'completada', notas: 'Sesión 1/2 completada. Buen resultado.' },
            { fecha: '2026-07-15', ini: '10:00', paciente: 'Hugo Escrivá Pons', trat: 'Revisión', estado: 'no_asistio', notas: '—' }
        ]
    },

    // Agenda de la propietaria (Dra. Raquel) — al completar, alimenta finanzas
    raquel: {
        pending: [
            { id: 301, fecha: '2026-07-24', ini: '12:00', fin: '12:30', paciente: 'Marta Gil Roldán', tel: '+58 424 909 1122', trat: 'Limpieza dental (higiene)', estado: 'confirmada' },
            { id: 302, fecha: '2026-07-24', ini: '16:00', fin: '16:40', paciente: 'José Díaz Peña', tel: '+58 412 707 3040', trat: 'Empaste (obturación)', estado: 'programada' },
            { id: 303, fecha: '2026-07-25', ini: '10:30', fin: '11:20', paciente: 'Ana Bravo León', tel: '+58 416 505 6070', trat: 'Blanqueamiento', estado: 'confirmada' }
        ]
    },

    // Agenda global de secretaría
    secretary: {
        name: 'Marta', surname: 'Recepción',
        patientsCount: 128,
        upcoming: [
            { id: 201, fecha: '2026-07-24', ini: '09:00', fin: '09:20', paciente: 'Elena Císcar Blai', tel: '+58 414 111 2233', doctor: 'Dra. Laura Beltrán', trat: 'Revisión y diagnóstico', estado: 'confirmada' },
            { id: 202, fecha: '2026-07-24', ini: '10:00', fin: '10:40', paciente: 'Hugo Escrivá Pons', tel: '+58 412 555 8899', doctor: 'Dra. Laura Beltrán', trat: 'Empaste (obturación)', estado: 'programada' },
            { id: 203, fecha: '2026-07-24', ini: '11:00', fin: '11:30', paciente: 'Invitado · Pedro Ramos', tel: '+58 416 222 3344', doctor: 'Dr. Sergio Montesinos', trat: 'Ortodoncia (revisión)', estado: 'programada' },
            { id: 204, fecha: '2026-07-25', ini: '11:30', fin: '12:00', paciente: 'Andrés Molina Gil', tel: '+58 424 777 1010', doctor: 'Dra. Laura Beltrán', trat: 'Limpieza dental (higiene)', estado: 'programada' }
        ]
    },

    // Tipos de sangre (para el desplegable de la ficha)
    bloodTypes: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Desconocido'],

    // Pacientes de la clínica (con su ficha médica, para el apartado "Pacientes" del doctor)
    patientsList: [
        { nombre: 'Lucía Torres Marí', email: 'lucia.torres@example.com', dni: 'V-18.442.101', nacimiento: '1991-03-14', alta: '2023-02-10', tel: '+58 424 000 0000', ultima: '2026-07-20', visitas: 4,
          ficha: { grupo: 'O+', alergias: 'Penicilina', cronicas: 'Ninguna', medicacion: 'Ninguna', emergencia: 'Marcos Torres · +58 424 000 0000', seguro: 'Seguros Caracas' },
          // Por diente completo ('corona','ausente') o por caras:
        // m=mesial · d=distal · o=oclusal/incisal · v=vestibular · l=lingual/palatino
        odonto: { 16: { o: 'empaste', m: 'caries' }, 11: 'corona', 36: { o: 'caries', d: 'caries' }, 47: 'ausente', 24: { v: 'empaste' } } },
        { nombre: 'Elena Císcar Blai', email: 'elena.ciscar@example.com', dni: 'V-20.115.998', nacimiento: '1988-11-02', alta: '2024-06-21', tel: '+58 414 111 2233', ultima: '2026-07-24', visitas: 2,
          ficha: { grupo: 'A+', alergias: 'Ninguna', cronicas: 'Hipertensión', medicacion: 'Enalapril', emergencia: 'Rosa Blai · +58 414 222 3344', seguro: 'Mercantil Seguros' } },
        { nombre: 'Hugo Escrivá Pons', email: 'hugo.escriva@example.com', dni: 'V-16.780.334', nacimiento: '1985-07-30', alta: '2022-09-05', tel: '+58 412 555 8899', ultima: '2026-07-15', visitas: 3,
          ficha: { grupo: 'O-', alergias: 'Ninguna', cronicas: 'Ninguna', medicacion: 'Ninguna', emergencia: 'Luis Pons · +58 412 000 1111', seguro: '—' } },
        { nombre: 'Andrés Molina Gil', email: 'andres.molina@example.com', dni: 'V-24.903.177', nacimiento: '1996-01-19', alta: '2026-05-02', tel: '+58 424 777 1010', ultima: '2026-07-25', visitas: 1,
          ficha: { grupo: 'B+', alergias: 'Látex', cronicas: 'Diabetes tipo 2', medicacion: 'Metformina', emergencia: 'Sofía Gil · +58 424 888 9999', seguro: 'Seguros Caracas' },
          odonto: { 26: 'caries', 46: 'empaste' } },
        { nombre: 'Carmen Ruiz Server', email: 'carmen.ruiz@example.com', dni: 'V-12.556.740', nacimiento: '1979-05-08', alta: '2021-11-17', tel: '+58 416 333 4455', ultima: '2026-07-18', visitas: 5,
          ficha: { grupo: 'AB+', alergias: 'Aspirina', cronicas: 'Ninguna', medicacion: 'Ninguna', emergencia: 'Pedro Ruiz · +58 416 111 2222', seguro: 'Mapfre' } }
    ],

    // Reglas de la clínica (se muestran al paciente y las aplica la interfaz)
    rules: {
        cancelHoras: 2,        // cancelar con 2 h de antelación
        reprogramarHoras: 24   // reprogramar con 24 h de antelación
    },

    // Ajustes editables desde el panel de dirección
    settings: {
        maniana: { desde: 8, hasta: 13 },     // franja de mañana
        tarde:   { desde: 15, hasta: 17 },    // franja de tarde
        franjaMin: 20,                        // duración del hueco base
        dias: [1, 2, 3, 4, 5, 6],             // 1=lunes … 6=sábado (0=domingo cerrado)
        festivos: ['2026-08-15', '2026-10-12'],
        avisoHoras: 24                        // recordatorio automático X h antes
    },

    // Lista de espera: pacientes que quieren adelantar o esperan hueco
    waitlist: [
        { id: 1, paciente: 'Carmen Ruiz Server', tel: '+58 416 333 4455', trat: 'Blanqueamiento', pref: 'Tardes', desde: '2026-07-20', prioridad: 'alta', nota: 'Puede venir con 1 h de aviso' },
        { id: 2, paciente: 'Hugo Escrivá Pons', tel: '+58 412 555 8899', trat: 'Empaste (obturación)', pref: 'Mañanas', desde: '2026-07-22', prioridad: 'media', nota: 'Solo lunes y miércoles' },
        { id: 3, paciente: 'Marta Gil Roldán', tel: '+58 424 909 1122', trat: 'Limpieza dental (higiene)', pref: 'Cualquiera', desde: '2026-07-23', prioridad: 'baja', nota: '' }
    ],

    // Planes de tratamiento multi-sesión (ortodoncia, implantes, blanqueamiento…)
    plans: [
        { id: 'PL-001', paciente: 'Carmen Ruiz Server', nombre: 'Blanqueamiento completo', doctor: 'Dra. Natalia Sanchis',
          inicio: '2026-07-18', total: 200, pagado: 100,
          sesiones: [
            { n: 1, trat: 'Blanqueamiento (sesión 1)', fecha: '2026-07-18', estado: 'completada' },
            { n: 2, trat: 'Blanqueamiento (sesión 2)', fecha: '2026-08-01', estado: 'programada' },
            { n: 3, trat: 'Revisión de resultado', fecha: '', estado: 'pendiente' }
          ] },
        { id: 'PL-002', paciente: 'Andrés Molina Gil', nombre: 'Implante unitario 46', doctor: 'Dra. Raquel Virgüez',
          inicio: '2026-07-10', total: 1270, pagado: 400,
          sesiones: [
            { n: 1, trat: 'Valoración y radiografía', fecha: '2026-07-10', estado: 'completada' },
            { n: 2, trat: 'Colocación del implante', fecha: '2026-07-25', estado: 'programada' },
            { n: 3, trat: 'Control de cicatrización', fecha: '', estado: 'pendiente' },
            { n: 4, trat: 'Colocación de la corona', fecha: '', estado: 'pendiente' }
          ] },
        { id: 'PL-003', paciente: 'Hugo Escrivá Pons', nombre: 'Ortodoncia con alineadores', doctor: 'Dr. Sergio Montesinos',
          inicio: '2026-03-05', total: 2400, pagado: 900,
          sesiones: [
            { n: 1, trat: 'Estudio y escaneo', fecha: '2026-03-05', estado: 'completada' },
            { n: 2, trat: 'Entrega de alineadores', fecha: '2026-04-02', estado: 'completada' },
            { n: 3, trat: 'Control mensual', fecha: '2026-05-07', estado: 'completada' },
            { n: 4, trat: 'Control mensual', fecha: '2026-07-15', estado: 'no_asistio' },
            { n: 5, trat: 'Control mensual', fecha: '', estado: 'pendiente' },
            { n: 6, trat: 'Retirada y retenedores', fecha: '', estado: 'pendiente' }
          ] }
    ],

    // Presupuestos / cotizaciones
    budgets: [
        { id: 'PR-2026-0041', paciente: 'Andrés Molina Gil', fecha: '2026-07-18', estado: 'pendiente',
          lineas: [{ c: 'Implante unitario', u: 1, p: 850 }, { c: 'Corona de porcelana', u: 1, p: 420 }], dto: 5 },
        { id: 'PR-2026-0040', paciente: 'Carmen Ruiz Server', fecha: '2026-07-10', estado: 'aceptado',
          lineas: [{ c: 'Blanqueamiento (2 sesiones)', u: 1, p: 200 }, { c: 'Férula de descarga', u: 1, p: 150 }], dto: 0 }
    ],

    // Solicitudes de cambio de ficha (las crea el doctor, las autoriza secretaría)
    changeRequests: [
        { id: 1, paciente: 'Hugo Escrivá Pons', campo: 'Alergias', actual: 'Ninguna', nuevo: 'Ibuprofeno', doctor: 'Dra. Laura Beltrán', motivo: 'Reacción leve en la última visita' },
        { id: 2, paciente: 'Andrés Molina Gil', campo: 'Medicación actual', actual: 'Metformina', nuevo: 'Metformina + Insulina', doctor: 'Dra. Laura Beltrán', motivo: 'Ajuste indicado por su endocrino' }
    ],

    // Movimientos de caja (ingresos por citas completadas)
    finances: [
        { fecha: '2026-02-10', paciente: 'Lucía Torres', trat: 'Limpieza dental', metodo: 'efectivo', importe: 50 },
        { fecha: '2026-02-14', paciente: 'Carmen Ruiz', trat: 'Empaste', metodo: 'tarjeta', importe: 80 },
        { fecha: '2026-02-20', paciente: 'Hugo Escrivá', trat: 'Revisión', metodo: 'efectivo', importe: 30 },
        { fecha: '2026-03-05', paciente: 'Elena Císcar', trat: 'Blanqueamiento', metodo: 'tarjeta', importe: 200 },
        { fecha: '2026-03-12', paciente: 'Andrés Molina', trat: 'Limpieza dental', metodo: 'efectivo', importe: 50 },
        { fecha: '2026-03-19', paciente: 'Pedro Ramos', trat: 'Empaste', metodo: 'tarjeta', importe: 80 },
        { fecha: '2026-03-27', paciente: 'Lucía Torres', trat: 'Revisión', metodo: 'efectivo', importe: 30 },
        { fecha: '2026-04-08', paciente: 'Carmen Ruiz', trat: 'Ortodoncia', metodo: 'tarjeta', importe: 120 },
        { fecha: '2026-04-15', paciente: 'Hugo Escrivá', trat: 'Empaste', metodo: 'efectivo', importe: 80 },
        { fecha: '2026-04-22', paciente: 'Elena Císcar', trat: 'Limpieza dental', metodo: 'tarjeta', importe: 50 },
        { fecha: '2026-05-06', paciente: 'Andrés Molina', trat: 'Implante (valoración)', metodo: 'tarjeta', importe: 40 },
        { fecha: '2026-05-13', paciente: 'Lucía Torres', trat: 'Limpieza dental', metodo: 'efectivo', importe: 50 },
        { fecha: '2026-05-21', paciente: 'Pedro Ramos', trat: 'Blanqueamiento', metodo: 'tarjeta', importe: 200 },
        { fecha: '2026-05-28', paciente: 'Carmen Ruiz', trat: 'Revisión', metodo: 'efectivo', importe: 30 },
        { fecha: '2026-06-03', paciente: 'Hugo Escrivá', trat: 'Ortodoncia', metodo: 'tarjeta', importe: 120 },
        { fecha: '2026-06-11', paciente: 'Elena Císcar', trat: 'Empaste', metodo: 'efectivo', importe: 80 },
        { fecha: '2026-06-18', paciente: 'Andrés Molina', trat: 'Limpieza dental', metodo: 'tarjeta', importe: 50 },
        { fecha: '2026-06-25', paciente: 'Lucía Torres', trat: 'Blanqueamiento', metodo: 'tarjeta', importe: 200 },
        { fecha: '2026-07-06', paciente: 'Carmen Ruiz', trat: 'Empaste', metodo: 'efectivo', importe: 80 },
        { fecha: '2026-07-14', paciente: 'Pedro Ramos', trat: 'Limpieza dental', metodo: 'tarjeta', importe: 50 },
        { fecha: '2026-07-23', paciente: 'Lucía Torres', trat: 'Limpieza dental', metodo: 'efectivo', importe: 50 },
        { fecha: '2026-07-23', paciente: 'Hugo Escrivá', trat: 'Revisión', metodo: 'tarjeta', importe: 30 },
        { fecha: '2026-07-24', paciente: 'Elena Císcar', trat: 'Blanqueamiento', metodo: 'tarjeta', importe: 200 },
        { fecha: '2026-07-24', paciente: 'Andrés Molina', trat: 'Empaste', metodo: 'efectivo', importe: 80 }
    ],

    cases: [
        { title: 'Blanqueamiento dental', desc: 'Dos sesiones · resultado en 2 semanas.' },
        { title: 'Ortodoncia invisible', desc: 'Alineadores · corrección en 9 meses.' },
        { title: 'Carillas de composite', desc: 'Estética en una sola visita.' }
    ]
};
