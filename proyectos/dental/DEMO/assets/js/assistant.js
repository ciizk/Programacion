/* =====================================================================
   Clínica Dental · Asistente IA (demo funcional, sin servicios externos)
   Assistant.init({ role, name })  ·  roles: paciente | doctor | secretaria
                                              | raquel | publico
   SEGURIDAD: cada intención declara qué roles pueden usarla. Si un rol
   pregunta por algo que no le corresponde (p. ej. un paciente por la
   facturación), el asistente lo RECHAZA y ofrece lo que sí puede hacer.
   Un paciente solo accede a SUS datos; Raquel (dirección) lo ve todo.
   ===================================================================== */
(function () {
    'use strict';
    var A = window.Assistant = {};
    var cfg = { role: 'publico', name: '' };
    var log, panel, fab, input, sugg;
    var ctx = {};                                   // memoria corta

    /* ---------------- utilidades ---------------- */
    function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
    function D() { return window.DEMO || {}; }
    function money(n) { return window.fmtMoney ? fmtMoney(n) : ('$' + (n || 0)); }
    function pad(n) { return String(n).padStart(2, '0'); }
    function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function hoyD() { return window.parseISO ? parseISO(D().today) : new Date(); }
    function fFecha(i) { return window.fmtFecha ? fmtFecha(i) : i; }
    function seeded(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
    function esc(s) { return String(s == null ? '' : s).replace(/[<>]/g, function (c) { return c === '<' ? '&lt;' : '&gt;'; }); }
    var DOWS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    /* ---------------- datos ---------------- */
    function citasClinica() {
        var d = D(), out = [];
        (d.secretary ? d.secretary.upcoming : []).forEach(function (c) { out.push(Object.assign({}, c)); });
        (d.doctor ? d.doctor.pending : []).forEach(function (c) { out.push(Object.assign({ doctor: 'Dra. Laura Beltrán' }, c)); });
        (d.raquel ? d.raquel.pending : []).forEach(function (c) { out.push(Object.assign({ doctor: 'Dra. Raquel Virgüez' }, c)); });
        return out;
    }
    function misCitas() {
        var d = D();
        if (cfg.role === 'doctor') return (d.doctor ? d.doctor.pending : []).map(function (c) { return Object.assign({ doctor: 'Dra. Laura Beltrán' }, c); });
        if (cfg.role === 'raquel') return (d.raquel ? d.raquel.pending : []).map(function (c) { return Object.assign({ doctor: 'Dra. Raquel Virgüez' }, c); });
        if (cfg.role === 'secretaria') return citasClinica();
        if (cfg.role === 'paciente') return (d.patient ? d.patient.upcoming : []).map(function (c) { return Object.assign({ paciente: nombrePaciente() }, c); });
        return [];
    }
    function nombrePaciente() { var s = window.UX && UX.session && UX.session(); return s ? (s.nombre + ' ' + s.apellido) : 'Lucía Torres Marí'; }
    function miHistorial() { return (D().patient ? D().patient.history : []); }
    function historialClinica() {
        var d = D(), h = [];
        if (d.doctor) h = h.concat(d.doctor.history);
        if (d.patient) h = h.concat(d.patient.history.map(function (c) { return Object.assign({ paciente: nombrePaciente() }, c); }));
        return h;
    }

    /* ---------------- finanzas (solo dirección) ---------------- */
    function porMes() { var m = {}; (D().finances || []).forEach(function (f) { var k = f.fecha.slice(0, 7); m[k] = (m[k] || 0) + f.importe; }); return m; }
    function mesAnterior(k) { var d = new Date(+k.slice(0, 4), +k.slice(5, 7) - 2, 1); return d.getFullYear() + '-' + pad(d.getMonth() + 1); }
    function nombreMes(k) { return MESES[+k.slice(5, 7) - 1] + ' ' + k.slice(0, 4); }
    A.comparativa = function () {
        var m = porMes(), act = (D().today || '').slice(0, 7), ant = mesAnterior(act);
        var a = m[act] || 0, b = m[ant] || 0, diff = a - b, pct = b ? (diff / b * 100) : 0;
        var hoy = hoyD(), diaMes = hoy.getDate(), diasTot = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
        return { act: act, ant: ant, actTotal: a, antTotal: b, diff: diff, pct: pct, proyeccion: diaMes ? (a / diaMes) * diasTot : a, diasTot: diasTot, diaMes: diaMes };
    };
    function rankingTrat() {
        var r = {}; (D().finances || []).forEach(function (f) { r[f.trat] = (r[f.trat] || 0) + f.importe; });
        return Object.keys(r).map(function (k) { return { t: k, v: r[k] }; }).sort(function (x, y) { return y.v - x.v; });
    }

    /* ---------------- agenda ---------------- */
    function slotsLibres(fechaIso, semilla) {
        var horas = [];
        [[8, 13], [15, 17]].forEach(function (r) { for (var h = r[0]; h < r[1]; h++) { horas.push(pad(h) + ':00'); horas.push(pad(h) + ':20'); horas.push(pad(h) + ':40'); } });
        var seed = seeded(fechaIso + '|' + (semilla || 0));
        var ocupadas = citasClinica().filter(function (c) { return c.fecha === fechaIso; }).map(function (c) { return c.ini; });
        return horas.filter(function (h, i) { return ocupadas.indexOf(h) < 0 && (((seed >> (i % 24)) & 1) === 1 || i % 5 === 0); });
    }
    function huecosEntreCitas(fechaIso) {
        var cs = citasClinica().filter(function (c) { return c.fecha === fechaIso; }).sort(function (a, b) { return a.ini < b.ini ? -1 : 1; });
        var g = [];
        for (var i = 0; i < cs.length - 1; i++) {
            var fin = cs[i].fin || cs[i].ini, sig = cs[i + 1].ini;
            var m1 = +fin.slice(0, 2) * 60 + +fin.slice(3), m2 = +sig.slice(0, 2) * 60 + +sig.slice(3);
            if (m2 - m1 >= 40) g.push({ desde: fin, hasta: sig, min: m2 - m1 });
        }
        return g;
    }
    function tasaNoShow() {
        var h = historialClinica(), n = h.filter(function (c) { return c.estado === 'no_asistio'; }).length;
        return { n: n, total: h.length, pct: h.length ? (n / h.length * 100) : 0 };
    }
    function diasLibres(n) {
        var out = [], d = new Date(hoyD());
        for (var i = 0; i < (n || 14) && out.length < 6; i++) {
            d.setDate(d.getDate() + 1);
            if (d.getDay() === 0) continue;
            var k = iso(d);
            if (!misCitas().filter(function (c) { return c.fecha === k; }).length) out.push({ iso: k, dow: DOWS[d.getDay()], dia: d.getDate() });
        }
        return out;
    }

    /* ---------------- interpretación ---------------- */
    function parseFecha(t) {
        var base = hoyD();
        if (t.indexOf('pasado manana') >= 0) { var d2 = new Date(base); d2.setDate(d2.getDate() + 2); return iso(d2); }
        if (/\bmanana\b/.test(t) && !/(por|en|de) la manana/.test(t)) { var d1 = new Date(base); d1.setDate(d1.getDate() + 1); return iso(d1); }
        if (t.indexOf('hoy') >= 0) return iso(base);
        for (var i = 1; i <= 6; i++) {
            if (t.indexOf(DOWS[i]) >= 0) {
                var d = new Date(base), delta = (i - d.getDay() + 7) % 7 || 7;
                if (/proximo|que viene|siguiente/.test(t)) delta += 7;
                d.setDate(d.getDate() + delta); return iso(d);
            }
        }
        var m = t.match(/(\d{1,2})[\/\-](\d{1,2})/);
        return m ? base.getFullYear() + '-' + pad(+m[2]) + '-' + pad(+m[1]) : null;
    }
    function franja(t) {
        if (/(por|en|de) la tarde|tarde/.test(t)) return 'tarde';
        if (/(por|en|de) la manana|temprano|primera hora/.test(t)) return 'manana';
        return null;
    }
    function detectaTrat(t) {
        var tr = D().treatments || [];
        var found = tr.filter(function (x) { return t.indexOf(norm(x.name).split(' ')[0]) >= 0; })[0];
        if (found) return found;
        if (/limpieza|higiene|sarro|tartaro/.test(t)) return tr[1];
        if (/caries|empaste|obturacion|agujero/.test(t)) return tr[2];
        if (/brackets|ortodoncia|alineador|torcido/.test(t)) return tr[3];
        if (/blanquea|estetica|mas blanco|amarillo/.test(t)) return tr[4];
        if (/implante|falta un diente|perdi un diente/.test(t)) return tr[5];
        if (/revision|chequeo|dolor|duele|molestia|urgencia/.test(t)) return tr[0];
        return null;
    }
    function detectaPaciente(t) {
        var hit = null;
        (D().patientsList || []).forEach(function (p) {
            norm(p.nombre).split(' ').forEach(function (w) { if (w.length > 3 && t.indexOf(w) >= 0) hit = hit || p; });
        });
        return hit;
    }
    /* Resolución de referencias: "su tratamiento", "y sus alergias", "el mismo"…
       Si no se nombra a nadie pero venimos hablando de un paciente, se mantiene. */
    var PRONOMBRES = ['su ', 'sus ', 'le ', 'lo mismo', 'el mismo', 'ella', 'este paciente', 'ese paciente', 'y que', 'y cual', 'tambien'];
    function pacienteEnContexto(t) {
        var explicito = detectaPaciente(t);
        if (explicito) { ctx.paciente = explicito; return explicito; }
        // ¿La frase hace referencia a alguien de quien ya hablábamos?
        if (ctx.paciente) return ctx.paciente;
        return null;
    }
    function esSeguimiento(t) {
        return PRONOMBRES.some(function (p) { return t.indexOf(p) >= 0; }) || t.split(' ').length <= 4;
    }

    /* ---------------- render ---------------- */
    function push(who, html, chips) {
        var m = document.createElement('div');
        m.className = 'ai-msg ' + (who === 'me' ? 'me' : 'bot');
        m.innerHTML = '<div class="av">' + (who === 'me' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>') + '</div>' +
            '<div class="ai-bub">' + html + (chips && chips.length ? '<div class="ai-chips">' +
                chips.map(function (c, i) { return '<button class="ai-chip ' + (c.cls || '') + '" data-c="' + i + '">' + c.t + '</button>'; }).join('') + '</div>' : '') + '</div>';
        log.appendChild(m);
        if (chips) m.querySelectorAll('[data-c]').forEach(function (b) {
            b.onclick = function () { var c = chips[+b.dataset.c]; if (c.fn) c.fn(); else if (c.say) ask(c.say); };
        });
        log.scrollTop = log.scrollHeight;
    }
    function reply(html, chips, delay) {
        var t = document.createElement('div'); t.className = 'ai-msg bot';
        t.innerHTML = '<div class="av"><i class="fa-solid fa-robot"></i></div><div class="ai-bub"><span class="ai-typing"><i></i><i></i><i></i></span></div>';
        log.appendChild(t); log.scrollTop = log.scrollHeight;
        setTimeout(function () { t.remove(); push('bot', html, chips); }, delay || (400 + Math.random() * 300));
    }
    function card(filas) { return '<div class="ai-card">' + filas.map(function (f) { return '<div class="row"><span>' + f[0] + '</span><b>' + f[1] + '</b></div>'; }).join('') + '</div>'; }

    /* =====================================================================
       INTENCIONES  ·  roles: quién puede usarlas (control de acceso)
       ===================================================================== */
    var INTENTS = [
        { id: 'navegar',     roles: '*', kw: ['llevame a', 'llevame', 'abre', 'abrir', 'ir a', 'muestrame', 'ensename', 'ver la seccion', 'quiero ver'] },
        { id: 'saludo',      roles: '*', kw: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'que tal', 'hey'] },
        { id: 'gracias',     roles: '*', kw: ['gracias', 'genial', 'perfecto', 'estupendo', 'ok gracias'] },
        { id: 'ayuda',       roles: '*', kw: ['ayuda', 'que puedes hacer', 'que sabes', 'opciones', 'como funciona', 'que puedes'] },
        { id: 'contacto',    roles: '*', kw: ['telefono', 'direccion', 'donde estan', 'como llego', 'horario', 'contacto', 'whatsapp de la clinica', 'llamar'] },

        /* --- Paciente (solo sus datos) --- */
        { id: 'mis_citas',   roles: ['paciente'], kw: ['mi proxima cita', 'mis citas', 'cuando tengo', 'cuando es mi cita', 'tengo cita'] },
        { id: 'progreso',    roles: ['paciente'], kw: ['como va el mes', 'como van mis dientes', 'mi cambio', 'mi progreso', 'como voy', 'mi evolucion', 'he mejorado', 'mi sonrisa', 'mis dientes'] },
        { id: 'adelantar',   roles: ['paciente'], kw: ['adelantar', 'antes de', 'mas pronto', 'antes mi cita', 'cambiar mi cita', 'reprogramar mi cita'] },
        { id: 'cuidados',    roles: ['paciente'], kw: ['cuidados', 'que hago despues', 'puedo comer', 'me duele', 'molestia', 'recomendacion'] },

        /* --- Clínico (doctor y dirección) --- */
        { id: 'mis_pacientes', roles: ['doctor', 'raquel', 'secretaria'], kw: ['que pacientes', 'mis pacientes', 'pacientes de hoy', 'lista de pacientes', 'a quien atiendo'] },
        { id: 'resumen',       roles: ['doctor', 'raquel'], kw: ['resumen de', 'historial de', 'ficha de', 'antecedentes de', 'resumen'] },
        { id: 'nota',          roles: ['doctor', 'raquel'], kw: ['nota clinica', 'redacta', 'evolutivo', 'escribe la nota', 'nota de'] },
        { id: 'docs',          roles: ['doctor', 'raquel'], kw: ['receta', 'informe', 'justificante', 'prescribir', 'documento'] },
        { id: 'dias_libres',   roles: ['doctor', 'raquel'], kw: ['dias libres', 'dia libre', 'cuando estoy libre', 'sin citas', 'vacaciones'] },
        /* Preguntas de seguimiento sobre el paciente del que ya hablamos */
        { id: 'dato_pac',      roles: ['doctor', 'raquel'], kw: ['que tratamiento', 'sus alergias', 'que alergias', 'es alergico', 'que medicacion', 'esta tomando',
                                                                 'ultima visita', 'cuando vino', 'cuantas visitas', 'su telefono', 'como contacto', 'que tiene',
                                                                 'sus dientes', 'su odontograma', 'que le pasa', 'enfermedades'] },

        /* --- Operativa --- */
        { id: 'agenda',        roles: ['doctor', 'secretaria', 'raquel'], kw: ['mi agenda', 'que tengo hoy', 'citas de hoy', 'mi dia', 'agenda'] },
        { id: 'huecos',        roles: ['doctor', 'secretaria', 'raquel'], kw: ['huecos', 'horas libres', 'disponibilidad', 'que puedo llenar', 'slots'] },
        { id: 'optimizar',     roles: ['doctor', 'secretaria', 'raquel'], kw: ['optimiza', 'optimizar', 'mejorar la agenda', 'rellenar', 'productividad'] },
        { id: 'recordatorios', roles: ['doctor', 'secretaria', 'raquel'], kw: ['recordatorio', 'recordar', 'avisar a los pacientes', 'confirmaciones'] },
        { id: 'noshows',       roles: ['secretaria', 'raquel'], kw: ['no show', 'ausencia', 'no asistio', 'planton', 'faltan'] },

        /* --- Negocio: SOLO dirección --- */
        { id: 'finanzas',      roles: ['raquel'], kw: ['ingreso', 'ingresos', 'factura', 'facturacion', 'facturando', 'cuanto gana', 'cuanto gano', 'cuanto ganamos', 'cuanto ganais',
                                                      'caja', 'dinero', 'cierre de caja', 'beneficio', 'beneficios', 'ganancia', 'ganancias', 'cobrado', 'ventas', 'cuanto dinero',
                                                      'rentable', 'rentabilidad', 'presupuesto de la clinica', 'contabilidad', 'balance'] },
        { id: 'comparativa',   roles: ['raquel'], kw: ['como va el mes', 'comparativa', 'mes pasado', 'mes anterior', 'vamos mejor', 'proyeccion'] },
        { id: 'ranking',       roles: ['raquel'], kw: ['ranking', 'que mas factura', 'tratamiento top', 'rentabilidad', 'mas rentable'] },
        { id: 'equipo',        roles: ['raquel'], kw: ['equipo', 'mis doctores', 'personal', 'plantilla'] },

        /* --- Reservar (todos menos personal interno) --- */
        { id: 'reservar',      roles: ['paciente', 'publico', 'secretaria', 'raquel'], kw: ['cita', 'agendar', 'reservar', 'pedir hora', 'quiero', 'necesito', 'apuntar'] }
    ];
    function permitido(it) { return it.roles === '*' || it.roles.indexOf(cfg.role) >= 0; }
    /* Puntuación con tolerancia: además de la frase exacta, acepta que las
       palabras clave aparezcan separadas ("qué días tengo libres" → "dias libres"). */
    function puntua(t, kw) {
        var s = 0;
        kw.forEach(function (k) {
            if (t.indexOf(k) >= 0) { s = Math.max(s, k.length); return; }
            var ws = k.split(' ');
            if (ws.length > 1 && ws.every(function (w) { return w.length > 2 && t.indexOf(w) >= 0; })) s = Math.max(s, k.length * 0.7);
        });
        return s;
    }
    function elegir(t) {
        var mejorOk = { s: 0 }, mejorNo = { s: 0 };
        INTENTS.forEach(function (it) {
            var s = puntua(t, it.kw); if (!s) return;
            if (permitido(it)) { if (s > mejorOk.s) mejorOk = { s: s, it: it }; }
            else if (s > mejorNo.s) mejorNo = { s: s, it: it };
        });
        // Si lo más parecido es algo que este rol NO puede consultar → rechazo
        if (mejorNo.s > mejorOk.s) return { bloqueado: mejorNo.it };
        return { intent: mejorOk.it };
    }

    /* =====================================================================
       HABILIDADES
       ===================================================================== */
    /* --- Paciente --- */
    function skMisCitas() {
        var cs = misCitas();
        if (!cs.length) return reply('No tienes ninguna cita programada ahora mismo. ¿Quieres que te busque hueco? 🦷', [{ t: '🗓️ Pedir cita', say: 'quiero pedir cita', cls: 'solid' }]);
        var c = cs[0];
        reply('<p>Tu próxima cita:</p>' + card([['Tratamiento', esc(c.trat)], ['Día', fFecha(c.fecha)], ['Hora', c.ini + (c.fin ? '–' + c.fin : '')], ['Doctor/a', esc(c.doctor || '—')], ['Estado', c.estado === 'confirmada' ? '✅ Confirmada' : '⏳ Por confirmar']]),
            [{ t: '⏪ ¿Puedo adelantarla?', say: 'quiero adelantar mi cita' },
             { t: '📲 Escribir a la clínica', cls: 'wa', fn: contactoWA }]);
    }
    function skProgreso() {
        var hist = miHistorial().filter(function (c) { return c.estado === 'completada'; });
        var odo = (D().patient || {}).odonto || {};
        var caries = Object.keys(odo).filter(function (k) { return odo[k] === 'caries'; }).length;
        var tratadas = Object.keys(odo).filter(function (k) { return odo[k] === 'empaste' || odo[k] === 'corona'; }).length;
        var ultima = hist[0];
        var html = '<p><b>Cómo van tus dientes</b> 🦷</p>' +
            card([['Visitas completadas', hist.length], ['Última visita', ultima ? fFecha(ultima.fecha) : '—'],
                  ['Piezas ya tratadas', tratadas], ['Pendientes de tratar', caries]]);
        html += '<p><b>Tu evolución:</b></p><ul>' +
            hist.slice(0, 3).map(function (c) { return '<li>' + fFecha(c.fecha) + ' · ' + esc(c.trat) + (c.notas && c.notas !== '—' ? ' — <i>' + esc(c.notas) + '</i>' : '') + '</li>'; }).join('') + '</ul>';
        html += caries
            ? '<p class="mini">Vas por buen camino: ya tienes <b>' + tratadas + '</b> pieza(s) tratada(s). Queda <b>' + caries + '</b> por resolver — cuanto antes, más sencillo (y más barato) es. 😉</p>'
            : '<p class="mini">¡Enhorabuena! 🎉 No tienes caries pendientes. Con una <b>higiene cada 6 meses</b> mantendrás la sonrisa así.</p>';
        reply(html, [
            { t: '🗓️ Pedir revisión', say: 'quiero una revision', cls: 'solid' },
            { t: '🪥 Consejos de cuidado', say: 'consejos de cuidados' }
        ]);
    }
    function skAdelantar() {
        var cs = misCitas();
        if (!cs.length) return reply('No tienes cita que adelantar. ¿Te busco una? 🦷', [{ t: '🗓️ Pedir cita', say: 'quiero pedir cita', cls: 'solid' }]);
        var c = cs[0], antes = [], d = new Date(hoyD()), fin = window.parseISO ? parseISO(c.fecha) : null;
        for (var i = 0; i < 7 && antes.length < 3; i++) {
            var k = iso(d);
            if (fin && d >= fin) break;
            if (d.getDay() !== 0) slotsLibres(k, 3).slice(0, 2).forEach(function (h) { if (antes.length < 3) antes.push({ fecha: k, hora: h }); });
            d.setDate(d.getDate() + 1);
        }
        if (!antes.length) return reply('Ahora mismo no hay ningún hueco antes de tu cita del <b>' + fFecha(c.fecha) + ' a las ' + c.ini + '</b>. ' +
            '<span class="mini">Te apunto en la <b>lista de espera</b>: si alguien cancela, te aviso al momento. 🔔</span>',
            [{ t: '📅 Ver mi cita', say: 'cuando es mi cita' }, { t: '📲 Escribir a la clínica', cls: 'wa', fn: contactoWA }]);
        reply('<p>Tu cita es el <b>' + fFecha(c.fecha) + ' a las ' + c.ini + '</b>. He encontrado estos huecos <b>antes</b>:</p>' +
            '<p class="mini">Elige uno y solicito el cambio a recepción.</p>',
            antes.map(function (a) {
                return { t: '⏪ ' + fFecha(a.fecha) + ' · ' + a.hora, cls: 'solid', fn: function () {
                    reply('<p>✅ He solicitado adelantar tu cita al <b>' + fFecha(a.fecha) + ' a las ' + a.hora + '</b>.</p>' +
                          '<p class="mini">Recepción lo confirmará en breve; te avisamos por WhatsApp.</p>',
                          [{ t: '📲 Avisar a la clínica', cls: 'wa', fn: contactoWA }]);
                    if (window.Toast) Toast.show('Solicitud de cambio enviada a recepción.', 'ok');
                } };
            }));
    }
    function skCuidados() {
        var ultima = miHistorial()[0], trat = ultima ? ultima.trat : '';
        var tips = /limpieza|higiene/i.test(trat)
            ? ['Puede haber <b>sensibilidad leve</b> 24-48 h: es normal.', 'Evita bebidas muy frías o calientes el primer día.', 'Cepillado 3 veces al día + <b>seda dental</b>.']
            : /empaste|obtura/i.test(trat)
            ? ['No mastiques con esa zona las primeras 2 horas.', 'Si notas que el diente "choca" al morder, avísanos para ajustarlo.', 'Evita alimentos muy duros unos días.']
            : ['Cepillado 3 veces al día durante 2 minutos.', 'Usa <b>seda dental</b> o cepillos interproximales a diario.', 'Revisión cada 6 meses y limpieza profesional al año.'];
        reply('<p><b>Cuidados recomendados</b>' + (trat ? ' tras tu ' + esc(trat.toLowerCase()) : '') + ':</p><ul>' +
            tips.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
            '<p class="mini">⚠️ Esto son consejos generales. Si tienes dolor intenso, hinchazón o fiebre, contacta con la clínica.</p>',
            [{ t: '📲 Escribir a la clínica', cls: 'wa', fn: contactoWA }, { t: '🗓️ Pedir cita', say: 'quiero pedir cita' }]);
    }
    function contactoWA() {
        var c = D().clinic || {};
        if (window.WA) WA.preview({ nombre: c.name, tel: c.phone, msg: '¡Hola! Soy ' + (cfg.name || 'un paciente') + '. Quería consultaros sobre mi cita. Gracias.' });
        else reply('Puedes llamarnos al <b>' + (c.phone || '') + '</b>.');
    }
    function skContacto() {
        var c = D().clinic || {};
        reply('<p><b>' + esc(c.name) + '</b></p>' + card([['Teléfono', esc(c.phone)], ['Dirección', esc(c.address)], ['Horario', esc(c.hours)], ['Email', esc(c.email)]]),
            [{ t: '📲 Escribir por WhatsApp', cls: 'wa', fn: contactoWA }, { t: '🗓️ Pedir cita', say: 'quiero pedir cita' }]);
    }

    /* --- Doctor / operativa --- */
    function skAgenda() {
        var hoy = D().today, cs = misCitas().filter(function (c) { return c.fecha === hoy; });
        var prox = misCitas().filter(function (c) { return c.fecha > hoy; });
        var html = '<p><b>Tu agenda</b> · ' + fFecha(hoy) + '</p>';
        html += cs.length ? card(cs.map(function (c) { return [c.ini, esc(c.paciente || c.doctor)]; }))
                          : '<p class="mini">Hoy no tienes citas.</p>';
        if (prox.length) html += '<p class="mini">Siguientes: <b>' + prox.length + '</b> cita(s); la próxima el ' + fFecha(prox[0].fecha) + ' a las ' + prox[0].ini + '.</p>';
        reply(html, [{ t: '🔍 Optimizar', say: 'optimiza mi agenda' }, { t: '🕳️ Huecos', say: 'que huecos tengo' }, { t: '🔔 Recordatorios', say: 'enviar recordatorios' }]);
    }
    function skMisPacientes() {
        var hoy = D().today, hoyCs = misCitas().filter(function (c) { return c.fecha === hoy; });
        var lista = D().patientsList || [];
        var html = '<p><b>Tus pacientes de hoy</b></p>';
        html += hoyCs.length ? card(hoyCs.map(function (c) { return [c.ini, esc(c.paciente)]; })) : '<p class="mini">Hoy no tienes pacientes citados.</p>';
        html += '<p class="mini">En total gestionas <b>' + lista.length + '</b> pacientes. Toca uno para ver su ficha:</p>';
        reply(html, lista.slice(0, 5).map(function (p) { return { t: p.nombre.split(' ')[0], say: 'resumen de ' + p.nombre }; }));
    }
    function skHuecos() {
        var hoy = D().today, l = slotsLibres(hoy, 1);
        var manana = new Date(hoyD()); manana.setDate(manana.getDate() + 1);
        var l2 = slotsLibres(iso(manana), 1);
        reply('<p><b>Huecos que puedes llenar</b></p>' +
            card([['Hoy ' + fFecha(hoy), l.length + ' huecos'], ['Mañana ' + fFecha(iso(manana)), l2.length + ' huecos']]) +
            '<p class="mini">Hoy: <b>' + (l.slice(0, 6).join(' · ') || '—') + '</b></p>' +
            '<p class="mini">💡 Ofrecerlos a la lista de espera suele llenar 1 de cada 3.</p>',
            [{ t: '📲 Ofrecer por WhatsApp', cls: 'wa', fn: function () { ofrecerHueco(l); } }]);
    }
    function ofrecerHueco(libres) {
        var cand = citasClinica().filter(function (c) { return c.estado === 'programada'; })[0] || citasClinica()[0];
        if (!cand) return reply('No hay pacientes a quienes ofrecérselo ahora mismo.');
        push('bot', '<p>Preparo el mensaje para <b>' + esc(cand.paciente) + '</b> con el hueco de las <b>' + (libres[0] || '09:00') + '</b>.</p>');
        if (window.WA) WA.preview({ nombre: cand.paciente, tel: cand.tel, msg: WA.tpl.huecoLibre(cand, (libres[0] || '09:00') + ' h') });
    }
    function skDiasLibres() {
        var d = diasLibres(14);
        if (!d.length) return reply('No tienes ningún día completamente libre en las próximas 2 semanas. 💪');
        reply('<p><b>Días sin citas</b> (próximas 2 semanas)</p>' +
            card(d.map(function (x) { return [x.dow + ' ' + x.dia, fFecha(x.iso)]; })) +
            '<p class="mini">Puedes usarlos para bloquear formación, descanso o abrir agenda extra si hay demanda.</p>');
    }
    function skOptimizar() {
        var hoy = D().today, gaps = huecosEntreCitas(hoy), libres = slotsLibres(hoy, 1), ns = tasaNoShow();
        var html = '<p><b>Análisis de la agenda</b> · ' + fFecha(hoy) + '</p>' +
            card([['Huecos entre citas', gaps.length], ['Minutos improductivos', gaps.reduce(function (a, g) { return a + g.min; }, 0) + ' min'],
                  ['Slots libres hoy', libres.length], ['Tasa de ausencias', '<span class="' + (ns.pct > 15 ? 'ai-down' : 'ai-up') + '">' + ns.pct.toFixed(0) + '%</span>']]);
        html += '<p><b>Propuestas:</b></p><ul>';
        if (gaps.length) html += '<li>Compactar el hueco <b>' + gaps[0].desde + '–' + gaps[0].hasta + '</b> (' + gaps[0].min + ' min).</li>';
        if (libres.length) html += '<li>Ofrecer <b>' + libres.slice(0, 3).join(', ') + '</b> a la lista de espera.</li>';
        html += '<li>Recordatorio 24 h antes: reduce ausencias hasta un <b>40 %</b>.</li></ul>';
        reply(html, [{ t: '📲 Ofrecer huecos', cls: 'wa', fn: function () { ofrecerHueco(libres); } }, { t: '🔔 Recordatorios', say: 'enviar recordatorios' }]);
    }
    function skRecordatorios() {
        var hoy = D().today, m = new Date(hoyD()); m.setDate(m.getDate() + 1);
        var lista = citasClinica().filter(function (c) { return c.fecha === hoy || c.fecha === iso(m); })
            .map(function (c) { return Object.assign({ fechaTxt: fFecha(c.fecha) }, c); });
        if (!lista.length) return reply('No hay citas de hoy ni mañana que recordar. ✅');
        reply('<p>He preparado <b>' + lista.length + ' recordatorio(s)</b>:</p>' +
            card(lista.map(function (c) { return [c.ini + ' · ' + esc(c.paciente), c.estado === 'programada' ? '⏳ sin confirmar' : '✅ confirmada']; })) +
            '<p class="mini">Priorizo las <b>sin confirmar</b>: son las de mayor riesgo de ausencia.</p>',
            [{ t: '📲 Abrir envíos', cls: 'wa', fn: function () { if (window.WA) WA.bulk(lista, 'Recordatorios de hoy y mañana'); } }]);
    }
    function skResumen(nombre) {
        var p = (D().patientsList || []).filter(function (x) { return norm(x.nombre).indexOf(norm(nombre)) >= 0; })[0];
        if (!p) return reply('No encuentro a ese paciente. ¿Cuál de estos?', chipsPacientes());
        var visitas = historialClinica().filter(function (c) { return norm(c.paciente || '') === norm(p.nombre); });
        var odo = p.odonto || {}, hall = Object.keys(odo).filter(function (k) { return odo[k] !== 'sano'; });
        var html = '<p><b>' + esc(p.nombre) + '</b></p>' +
            card([['Visitas', p.visitas], ['Última', fFecha(p.ultima)], ['Alergias', esc(p.ficha.alergias || '—')],
                  ['Crónicas', esc(p.ficha.cronicas || '—')], ['Hallazgos', hall.length ? hall.length + ' piezas' : 'ninguno']]);
        if (visitas.length) html += '<p class="mini">Último: ' + esc(visitas[0].trat) + (visitas[0].notas && visitas[0].notas !== '—' ? ' · «' + esc(visitas[0].notas) + '»' : '') + '</p>';
        if (p.ficha.alergias && p.ficha.alergias.toLowerCase().indexOf('ninguna') !== 0)
            html += '<p class="mini">⚠️ <b>Alergia a ' + esc(p.ficha.alergias) + '</b> — lo tendré en cuenta en la receta.</p>';
        ctx.paciente = p;
        reply(html, [{ t: '📝 Nota clínica', say: 'redacta la nota de ' + p.nombre.split(' ')[0] }, { t: '💊 Receta / informe', fn: function () { abrirDocs(p); } }]);
    }
    function chipsPacientes() { return (D().patientsList || []).slice(0, 4).map(function (p) { return { t: p.nombre.split(' ')[0], say: 'resumen de ' + p.nombre }; }); }

    /* Responde preguntas sueltas sobre el paciente del contexto */
    function skDatoPaciente(t) {
        var p = pacienteEnContexto(t);
        if (!p) return reply('¿De qué paciente me hablas?', chipsPacientes());
        var f = p.ficha || {}, vis = historialClinica().filter(function (c) { return norm(c.paciente || '') === norm(p.nombre); });
        var pre = '<p class="mini">Sobre <b>' + esc(p.nombre) + '</b>:</p>';
        if (/tratamiento|que tiene|que le pasa/.test(t)) {
            var ult = vis[0];
            return reply(pre + (ult
                ? card([['Último tratamiento', esc(ult.trat)], ['Fecha', fFecha(ult.fecha)], ['Estado', ult.estado]]) +
                  (ult.notas && ult.notas !== '—' ? '<p class="mini">Notas: «' + esc(ult.notas) + '»</p>' : '')
                : '<p>No tiene tratamientos registrados todavía.</p>'),
                [{ t: '🧾 Ver resumen completo', say: 'resumen de ' + p.nombre }, { t: '📝 Nota clínica', say: 'redacta la nota de ' + p.nombre }]);
        }
        if (/alerg/.test(t)) {
            var tiene = f.alergias && f.alergias.toLowerCase().indexOf('ninguna') !== 0;
            return reply(pre + (tiene ? '<p>⚠️ Es alérgic@ a <b>' + esc(f.alergias) + '</b>. Evita esa familia de fármacos al recetar.</p>'
                                      : '<p>✅ No tiene alergias declaradas.</p>'),
                [{ t: '💊 Preparar receta', fn: function () { abrirDocs(p); } }]);
        }
        if (/medicacion|tomando/.test(t)) return reply(pre + card([['Medicación actual', esc(f.medicacion || 'Ninguna')], ['Crónicas', esc(f.cronicas || 'Ninguna')]]));
        if (/visita|vino|cuantas/.test(t)) return reply(pre + card([['Visitas', p.visitas], ['Última', fFecha(p.ultima)]]));
        if (/telefono|contacto/.test(t)) return reply(pre + card([['Teléfono', esc(p.tel)], ['Emergencia', esc(f.emergencia || '—')]]),
            [{ t: '📲 Escribirle', cls: 'wa', fn: function () { if (window.WA) WA.preview({ nombre: p.nombre, tel: p.tel, msg: '¡Hola ' + p.nombre.split(' ')[0] + '! Te escribimos desde ' + (D().clinic || {}).name + '.' }); } }]);
        if (/diente|odontograma/.test(t)) {
            var res = window.Reports ? Reports.resumenOdonto(p.odonto) : '';
            return reply(pre + '<p>' + esc(res || 'Sin hallazgos registrados.') + '</p>');
        }
        return skResumen(p.nombre);
    }
    function skNota(nombre, t) {
        var p = (nombre && (D().patientsList || []).filter(function (x) { return norm(x.nombre).indexOf(norm(nombre)) >= 0; })[0]) || ctx.paciente;
        if (!p) return reply('¿De qué paciente redacto la nota?', chipsPacientes());
        var trat = detectaTrat(t || '') || { name: 'Revisión y diagnóstico' };
        var odoTxt = window.Reports ? Reports.resumenOdonto(p.odonto) : '';
        var nota = 'Paciente acude para ' + trat.name.toLowerCase() + '. Exploración: ' + (odoTxt || 'sin hallazgos reseñables') +
            ' Se realiza el procedimiento sin incidencias, con buena tolerancia. ' +
            (p.ficha && p.ficha.alergias && p.ficha.alergias.toLowerCase().indexOf('ninguna') !== 0 ? 'Se evita medicación con ' + p.ficha.alergias + ' por alergia declarada. ' : '') +
            'Se dan indicaciones de higiene y se cita para revisión en 6 meses.';
        ctx.paciente = p;
        reply('<p><b>Borrador de nota</b> · ' + esc(p.nombre) + '</p><div class="ai-card"><span style="font-size:.84rem">' + esc(nota) + '</span></div>',
            [{ t: '📋 Copiar', cls: 'solid', fn: function () { copiar(nota); } }, { t: '💊 Generar receta', fn: function () { abrirDocs(p, trat.name); } }]);
    }
    function copiar(txt) {
        var ta = document.createElement('textarea'); ta.value = txt; ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); Toast.show('Copiado al portapapeles.', 'ok'); } catch (e) { Toast.show('No se pudo copiar.', 'err'); }
        ta.remove();
    }
    function abrirDocs(p, trat) {
        if (!window.Reports) return reply('Los documentos se generan desde el panel del doctor.');
        Reports.open({ paciente: p.nombre, ficha: p.ficha || {}, odonto: p.odonto || {},
            doctor: cfg.role === 'raquel' ? 'Dra. Raquel Virgüez' : 'Dra. Laura Beltrán',
            colegiado: cfg.role === 'raquel' ? 'COEV-3001' : 'COEV-4521', tratamiento: trat || '' });
    }
    function skDocs(t) {
        var p = detectaPaciente(t) || ctx.paciente;
        if (!p) return reply('¿Para qué paciente preparo el documento?', chipsPacientes());
        abrirDocs(p);
        reply('Te abro el generador de documentos para <b>' + esc(p.nombre) + '</b>. 📄<br><span class="mini">Elige receta, informe o justificante: el folio y la fecha se rellenan solos.</span>');
    }

    /* --- Negocio (solo dirección) --- */
    function skFinanzas(t) {
        var hoy = D().today;
        var pagos = (D().finances || []).filter(function (f) { return f.fecha === hoy; });
        var tot = pagos.reduce(function (a, p) { return a + p.importe; }, 0);
        var tar = pagos.filter(function (p) { return p.metodo === 'tarjeta'; }).reduce(function (a, p) { return a + p.importe; }, 0);
        if (/mes|comparativa|proyec/.test(t)) return skComparativa();
        reply('<p><b>Cierre de caja de hoy</b></p>' + card([['Total', money(tot)], ['Tarjeta', money(tar)], ['Efectivo', money(tot - tar)], ['Cobros', pagos.length]]),
            [{ t: '📊 ¿Cómo va el mes?', say: 'como va el mes' }, { t: '🏆 Top tratamientos', say: 'ranking de tratamientos' }]);
    }
    function skComparativa() {
        var c = A.comparativa(), up = c.diff >= 0;
        reply('<p><b>' + nombreMes(c.act) + '</b> vs <b>' + nombreMes(c.ant) + '</b></p>' +
            card([['Este mes', money(c.actTotal)], ['Mes anterior', money(c.antTotal)],
                  ['Variación', '<span class="' + (up ? 'ai-up' : 'ai-down') + '">' + (up ? '▲ +' : '▼ ') + c.pct.toFixed(1) + '%</span>'],
                  ['Proyección cierre', money(c.proyeccion)]]) +
            '<p class="mini">Día ' + c.diaMes + ' de ' + c.diasTot + '. ' + (up ? 'Buen ritmo: manteniendo la ocupación cerrarás por encima del mes pasado.' : 'Por debajo: activa recordatorios y ofrece los huecos libres.') + '</p>',
            [{ t: '🏆 Tratamientos top', say: 'ranking' }, { t: '📉 Ausencias', say: 'no shows' }, { t: '🔍 Optimizar', say: 'optimiza la agenda' }]);
    }
    function skRanking() {
        var r = rankingTrat(), tot = r.reduce(function (a, x) { return a + x.v; }, 0);
        reply('<p><b>Tratamientos que más facturan</b></p>' +
            card(r.slice(0, 5).map(function (x) { return [esc(x.t), money(x.v) + ' · ' + (x.v / tot * 100).toFixed(0) + '%']; })) +
            '<p class="mini">💡 Promociona <b>' + esc(r[0].t) + '</b> y crea packs con los de menor ticket para subir el valor medio por visita.</p>');
    }
    function skNoShows() {
        var ns = tasaNoShow(), coste = ns.n * 60;
        reply('<p><b>Ausencias (no-shows)</b></p>' +
            card([['Ausencias', ns.n + ' de ' + ns.total], ['Tasa', '<span class="' + (ns.pct > 15 ? 'ai-down' : 'ai-up') + '">' + ns.pct.toFixed(0) + '%</span>'], ['Coste estimado', money(coste)]]) +
            '<p class="mini">Plan: recordatorio 24 h antes + confirmación por WhatsApp + lista de espera para rellenar la baja.</p>',
            [{ t: '🔔 Enviar recordatorios', say: 'enviar recordatorios' }]);
    }
    function skEquipo() {
        var d = D().doctors || [];
        reply('<p><b>Equipo clínico</b></p>' + card(d.map(function (x) { return [esc(x.name), esc(x.specialty)]; })) +
            '<p class="mini">Total: <b>' + d.length + '</b> profesionales · ' + (D().patientsList || []).length + ' pacientes activos en la demo.</p>');
    }

    /* --- Reservar --- */
    function skAgendar(t) {
        var trat = detectaTrat(t) || ctx.trat, fecha = parseFecha(t) || ctx.fecha, fr = franja(t) || ctx.franja;
        ctx.trat = trat; ctx.fecha = fecha; ctx.franja = fr;
        if (!trat) return reply('¡Claro! ¿Qué necesitas?', (D().treatments || []).slice(0, 4).map(function (x) { return { t: x.name.split(' ')[0], say: 'quiero ' + x.name }; }));
        if (!fecha) return reply('Perfecto: <b>' + esc(trat.name) + '</b> (' + trat.min + ' min). ¿Qué día te viene bien?',
            [{ t: 'Hoy', say: 'hoy' }, { t: 'Mañana', say: 'manana' }, { t: 'Esta semana', say: 'el jueves' }, { t: 'Semana que viene', say: 'el lunes que viene' }]);
        var libres = slotsLibres(fecha, trat.id);
        if (fr === 'tarde') libres = libres.filter(function (h) { return +h.slice(0, 2) >= 15; });
        if (fr === 'manana') libres = libres.filter(function (h) { return +h.slice(0, 2) < 13; });
        if (!libres.length) return reply('No me quedan huecos ese día' + (fr ? ' por la ' + fr : '') + '. ¿Probamos otro?',
            [{ t: 'Otro día', say: 'manana' }, { t: 'Cualquier hora', fn: function () { ctx.franja = null; skAgendar(''); } }]);
        reply('<p>Para <b>' + esc(trat.name) + '</b> el <b>' + fFecha(fecha) + '</b>' + (fr ? ' por la ' + fr : '') + ' tengo:</p><p class="mini">Elige una hora y la reservo.</p>',
            libres.slice(0, 3).map(function (h) { return { t: '🕘 ' + h, cls: 'solid', fn: function () { confirmarCita(trat, fecha, h); } }; })
                .concat([{ t: 'Otro día', say: 'otro dia' }]));
    }
    function confirmarCita(trat, fecha, hora) {
        var ses = (window.UX && UX.session && UX.session()) || {};
        var quien = (ses.nombre ? ses.nombre + ' ' + (ses.apellido || '') : (cfg.name || 'Paciente')).trim();
        var ref = 'CD-' + (seeded(fecha + hora + trat.name) % 100000).toString().padStart(5, '0');
        var doc = (D().doctors || [])[1] || { name: 'Dra. Laura Beltrán' };
        var cita = { paciente: quien, tel: ses.tel || '+58 424 000 0000', trat: trat.name, ini: hora, fecha: fecha, fechaTxt: fFecha(fecha), doctor: doc.name };
        push('bot', '<p>✅ <b>¡Cita reservada!</b></p>' +
            card([['Tratamiento', esc(trat.name)], ['Día y hora', fFecha(fecha) + ' · ' + hora], ['Doctor/a', esc(doc.name)], ['A nombre de', esc(quien)], ['Referencia', ref]]) +
            '<p class="mini">Te enviaré un recordatorio 24 h antes.</p>',
            [{ t: '📲 Confirmar por WhatsApp', cls: 'wa', fn: function () { if (window.WA) WA.confirmacion(cita); } }]);
        if (window.Toast) Toast.show('Cita creada por el asistente: ' + fFecha(fecha) + ' ' + hora, 'ok');
        ctx.trat = ctx.fecha = ctx.franja = null;
    }

    /* =====================================================================
       ENRUTADOR
       ===================================================================== */
    function ask(texto) {
        push('me', esc(texto));
        if (sugg) sugg.innerHTML = '';
        var t = norm(texto);
        var r = elegir(t);

        if (r.bloqueado) return rechazo(r.bloqueado);

        var id = r.intent ? r.intent.id : null;
        switch (id) {
            case 'navegar':       return skNavegar(t);
            case 'saludo':        return reply(saludo(), sugerencias());
            case 'gracias':       return reply('¡A tu disposición! 😊 ¿Algo más?', sugerencias());
            case 'ayuda':         return reply(ayuda(), sugerencias());
            case 'contacto':      return skContacto();
            case 'mis_citas':     return skMisCitas();
            case 'progreso':      return skProgreso();
            case 'adelantar':     return skAdelantar();
            case 'cuidados':      return skCuidados();
            case 'mis_pacientes': return skMisPacientes();
            case 'resumen':       var p = pacienteEnContexto(t); return p ? skResumen(p.nombre) : reply('¿De qué paciente?', chipsPacientes());
            case 'nota':          var pn = pacienteEnContexto(t); return skNota(pn ? pn.nombre : null, t);
            case 'dato_pac':      return skDatoPaciente(t);
            case 'docs':          return skDocs(t);
            case 'dias_libres':   return skDiasLibres();
            case 'agenda':        return skAgenda();
            case 'huecos':        return skHuecos();
            case 'optimizar':     return skOptimizar();
            case 'recordatorios': return skRecordatorios();
            case 'noshows':       return skNoShows();
            case 'finanzas':      return skFinanzas(t);
            case 'comparativa':   return skComparativa();
            case 'ranking':       return skRanking();
            case 'equipo':        return skEquipo();
            case 'reservar':      return skAgendar(t);
        }
        // Sin intención clara: ¿es un seguimiento sobre el paciente del que hablábamos?
        if (ctx.paciente && esSeguimiento(t) && permitido({ roles: ['doctor', 'raquel'] })) return skDatoPaciente(t);
        // ¿hay pistas de reserva?
        if (detectaTrat(t) || parseFecha(t)) {
            if (permitido({ roles: ['paciente', 'publico', 'secretaria', 'raquel'] })) return skAgendar(t);
        }
        // ¿Menciona una sección del panel? (p. ej. «presupuestos»)
        var secs = seccionesPanel(), sec = null;
        secs.forEach(function (s) { norm(s.titulo).split(' ').forEach(function (w) { if (w.length > 4 && t.indexOf(w) >= 0) sec = s; }); });
        if (sec) return reply('Creo que buscas la sección <b>' + esc(sec.titulo) + '</b>.',
            [{ t: '👉 Ir a ' + sec.titulo, cls: 'solid', fn: function () { irA(sec); } }].concat(sugerencias().slice(0, 2)));

        reply('No estoy seguro de haberte entendido. 🤔 ' + (ctx.paciente ? 'Seguimos hablando de <b>' + esc(ctx.paciente.nombre) + '</b>. ' : '') +
              'Prueba con una de estas, o escríbelo con otras palabras:', sugerencias());
    }
    A.ask = ask;

    /* --- Rechazo por permisos (seguridad) --- */
    function rechazo(it) {
        var motivo = {
            finanzas: 'la facturación de la clínica',
            comparativa: 'los resultados económicos de la clínica',
            ranking: 'los datos de rentabilidad',
            noshows: 'las estadísticas internas de la clínica',
            equipo: 'la información interna del equipo',
            agenda: 'la agenda interna de la clínica',
            huecos: 'la ocupación interna de la agenda',
            optimizar: 'la gestión interna de la agenda',
            recordatorios: 'los envíos internos a pacientes',
            mis_pacientes: 'los datos de otros pacientes',
            resumen: 'las historias clínicas de otros pacientes',
            nota: 'la redacción de notas clínicas',
            docs: 'la emisión de documentos clínicos',
            dias_libres: 'la planificación interna del personal'
        }[it.id] || 'esa información';
        reply('<p>🔒 Lo siento, <b>no puedo darte ' + motivo + '</b>: es información reservada al personal de la clínica.</p>' +
              '<p class="mini">Solo tengo acceso a <b>tus propios datos</b>. Esto sí puedo hacerlo:</p>', sugerencias());
    }

    /* --- Textos por rol --- */
    function saludo() {
        var n = cfg.name ? ', ' + cfg.name : '';
        return {
            paciente: '¡Hola' + n + '! 👋 Soy tu asistente. Puedo <b>reservarte cita</b>, ver si puedes <b>adelantarla</b>, contarte <b>cómo van tus dientes</b> y ponerte en contacto con la clínica.',
            doctor: '¡Hola' + n + '! 🩺 Puedo decirte <b>qué pacientes tienes</b>, qué <b>huecos</b> puedes llenar, tus <b>días libres</b>, resumir historiales y redactar notas e informes.',
            secretaria: '¡Hola' + n + '! 🗓️ Me ocupo de <b>recordatorios por WhatsApp</b>, confirmaciones, huecos libres y reducir ausencias.',
            raquel: '¡Hola' + n + '! 👑 Tienes <b>control total</b>: ingresos, comparativa de meses, proyección, ranking de tratamientos, equipo, agenda y ficha de cualquier paciente.',
            publico: '¡Hola! 👋 Soy el asistente de la clínica. Pídeme cita en lenguaje natural, 24/7.'
        }[cfg.role] || '¡Hola! ¿En qué te ayudo?';
    }
    function ayuda() {
        return '<p><b>Puedo ayudarte con:</b></p><ul>' + {
            paciente: '<li>«Quiero una limpieza el jueves por la tarde»</li><li>«¿Puedo adelantar mi cita?»</li><li>«¿Cómo van mis dientes?»</li><li>«¿Qué cuidados debo seguir?»</li>',
            doctor: '<li>«¿Qué pacientes tengo hoy?»</li><li>«¿Qué huecos puedo llenar?»</li><li>«¿Qué días tengo libres?»</li><li>«Resumen de Lucía» · «Redacta la nota de Hugo»</li><li>«Receta para Elena»</li>',
            secretaria: '<li>«Enviar recordatorios»</li><li>«¿Qué huecos hay libres?»</li><li>«Optimiza la agenda»</li><li>«No shows»</li>',
            raquel: '<li>«¿Cómo va el mes?» · «Cierre de caja»</li><li>«Ranking de tratamientos» · «No shows»</li><li>«Resumen de Lucía» · «Receta para Elena»</li><li>«¿Qué huecos hay?» · «Mi equipo»</li>',
            publico: '<li>«Quiero cita para una revisión mañana»</li><li>«¿Dónde estáis? ¿Qué horario tenéis?»</li>'
        }[cfg.role] + '</ul>';
    }
    /* Sugerencias: las acciones más útiles de cada rol (rotan para no cansar) */
    function sugerencias() {
        var packs = {
            paciente: [
                { t: '🦷 Pedir cita', say: 'quiero pedir una cita' },
                { t: '📅 Mi próxima cita', say: 'cuando es mi cita' },
                { t: '📈 ¿Cómo van mis dientes?', say: 'como van mis dientes' },
                { t: '⏪ Adelantar mi cita', say: 'quiero adelantar mi cita' },
                { t: '🪥 Consejos de cuidado', say: 'consejos de cuidados' },
                { t: '📲 Escribir a la clínica', say: 'contacto de la clinica' },
                { t: '🕐 Horarios y dirección', say: 'donde estan y que horario tienen' }
            ],
            doctor: [
                { t: '📋 Mi día', say: 'que tengo hoy' },
                { t: '👥 Mis pacientes', say: 'que pacientes tengo hoy' },
                { t: '🕳️ Huecos que llenar', say: 'que huecos puedo llenar' },
                { t: '🧾 Resumen de un paciente', say: 'resumen de Lucia' },
                { t: '📝 Redactar nota clínica', say: 'redacta la nota de Lucia' },
                { t: '💊 Receta o informe', say: 'receta para Lucia' },
                { t: '🔍 Optimizar mi agenda', say: 'optimiza mi agenda' },
                { t: '🔔 Recordar a mis pacientes', say: 'enviar recordatorios' }
            ],
            secretaria: [
                { t: '📋 Agenda de hoy', say: 'que tenemos hoy' },
                { t: '🔔 Enviar recordatorios', say: 'enviar recordatorios' },
                { t: '🕳️ Huecos libres', say: 'que huecos hay libres' },
                { t: '🔍 Optimizar la agenda', say: 'optimiza la agenda' },
                { t: '📉 Ausencias', say: 'no shows' },
                { t: '👥 Buscar un paciente', say: 'llevame a pacientes' },
                { t: '⏳ Lista de espera', say: 'llevame a la lista de espera' }
            ],
            raquel: [
                { t: '📊 ¿Cómo va el mes?', say: 'como va el mes' },
                { t: '💰 Caja de hoy', say: 'cierre de caja' },
                { t: '🏆 Top tratamientos', say: 'ranking' },
                { t: '📉 Ausencias y coste', say: 'no shows' },
                { t: '👥 Mi equipo', say: 'mi equipo' },
                { t: '🔍 Optimizar la agenda', say: 'optimiza la agenda' },
                { t: '🧾 Ficha de un paciente', say: 'resumen de Lucia' },
                { t: '📈 Ir a finanzas', say: 'llevame a finanzas' }
            ],
            publico: [
                { t: '🦷 Pedir cita', say: 'quiero pedir cita' },
                { t: '📍 Dónde estáis', say: 'donde estan' },
                { t: '🕐 Horarios', say: 'que horario tienen' },
                { t: '💬 Hablar por WhatsApp', say: 'contacto' }
            ]
        };
        var lista = packs[cfg.role] || [];
        // Muestra 4 y va rotando el resto en cada respuesta: descubre más funciones
        if (lista.length <= 4) return lista;
        ctx.sugIdx = ((ctx.sugIdx || 0) + 4) % lista.length;
        var out = [];
        for (var i = 0; i < 4; i++) out.push(lista[(ctx.sugIdx + i) % lista.length]);
        return out;
    }

    /* --- Navegar por el panel hablando --- */
    function seccionesPanel() {
        return [].map.call(document.querySelectorAll('.sidebar nav a[href^="#"]'), function (a) {
            return { view: a.getAttribute('href').slice(1), titulo: (a.dataset.title || a.textContent).trim(), desc: a.dataset.desc || '' };
        });
    }
    function skNavegar(t) {
        var secs = seccionesPanel();
        if (!secs.length) return reply('Aquí no hay secciones a las que llevarte. 🙂', sugerencias());
        var hit = null, mejor = 0;
        secs.forEach(function (s) {
            var n = norm(s.titulo);
            n.split(' ').forEach(function (w) { if (w.length > 3 && t.indexOf(w) >= 0 && w.length > mejor) { mejor = w.length; hit = s; } });
            if (t.indexOf(norm(s.view)) >= 0 && s.view.length > mejor) { mejor = s.view.length; hit = s; }
        });
        if (!hit) {
            return reply('¿A qué sección quieres ir?', secs.map(function (s) { return { t: s.titulo, fn: function () { irA(s); } }; }));
        }
        irA(hit);
    }
    function irA(s) {
        if (window.UX && UX.goView) UX.goView(s.view);
        reply('Listo, te llevo a <b>' + esc(s.titulo) + '</b>. 👇' + (s.desc ? '<p class="mini">' + esc(s.desc) + '</p>' : ''));
    }

    /* ---------------- interfaz ---------------- */
    A.init = function (o) {
        cfg = Object.assign(cfg, o || {});
        var ses = (window.UX && UX.session && UX.session()) || null;
        if (ses && !o.name) cfg.name = ses.nombre;
        fab = document.createElement('button');
        fab.className = 'ai-fab'; fab.setAttribute('aria-label', 'Abrir asistente');
        fab.innerHTML = '<i class="fa-solid fa-robot"></i><span class="pip"></span>';
        panel = document.createElement('div');
        panel.className = 'ai-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Asistente de la clínica');
        panel.innerHTML =
            '<div class="ai-head"><div class="ava"><i class="fa-solid fa-robot"></i></div>' +
            '<div><b>Asistente de la clínica</b><span>Siempre disponible · 24/7</span></div>' +
            '<button class="hbtn" id="ai-min" aria-label="Cerrar"><i class="fa-solid fa-chevron-down"></i></button></div>' +
            '<div class="ai-log" id="ai-log"></div><div class="ai-sugg" id="ai-sugg"></div>' +
            '<div class="ai-input"><input id="ai-in" type="text" placeholder="Escribe lo que necesitas…" aria-label="Mensaje">' +
            '<button id="ai-send" aria-label="Enviar"><i class="fa-solid fa-paper-plane"></i></button></div>';
        document.body.appendChild(fab); document.body.appendChild(panel);
        log = panel.querySelector('#ai-log'); input = panel.querySelector('#ai-in'); sugg = panel.querySelector('#ai-sugg');

        function abrir() {
            panel.classList.add('open'); fab.classList.add('hide');
            if (!log.childElementCount) reply(saludo(), sugerencias(), 250);
            setTimeout(function () { input.focus(); }, 250);
        }
        function cerrar() { panel.classList.remove('open'); fab.classList.remove('hide'); }
        A.open = abrir; A.close = cerrar;
        fab.onclick = abrir;
        panel.querySelector('#ai-min').onclick = cerrar;
        panel.querySelector('#ai-send').onclick = enviar;
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') enviar(); });
        function enviar() { var v = input.value.trim(); if (!v) return; input.value = ''; ask(v); }
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('open')) cerrar(); });
    };
})();
