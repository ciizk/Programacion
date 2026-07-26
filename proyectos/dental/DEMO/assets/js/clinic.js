/* =====================================================================
   Clínica Dental · Módulos de gestión compartidos
   Clinic.rules      · reglas de cancelación / reprogramación
   Clinic.nuevaCita  · alta de cita (teléfono o presencial) — secretaría
   Clinic.waitlist   · lista de espera funcional
   Clinic.timeline   · línea de tiempo del paciente
   ===================================================================== */
(function () {
    'use strict';
    var C = window.Clinic = {};
    function D() { return window.DEMO || {}; }
    function esc(s) { return String(s == null ? '' : s).replace(/[<>]/g, function (c) { return c === '<' ? '&lt;' : '&gt;'; }); }
    function pad(n) { return String(n).padStart(2, '0'); }
    function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function fFecha(i) { return window.fmtFecha ? fmtFecha(i) : i; }
    function money(n) { return window.fmtMoney ? fmtMoney(n) : ('$' + n); }

    /* =====================================================================
       1 · REGLAS DE CANCELACIÓN Y REPROGRAMACIÓN
       ===================================================================== */
    C.rules = {
        get cancelH() { return (D().rules || {}).cancelHoras || 2; },
        get reprogH() { return (D().rules || {}).reprogramarHoras || 24; },
        // Horas que faltan para la cita (la demo usa DEMO.today como "ahora", a las 08:00)
        horasHasta: function (cita) {
            var ahora = window.parseISO ? parseISO(D().today) : new Date();
            ahora.setHours(8, 0, 0, 0);
            var p = (cita.ini || '00:00').split(':');
            var f = window.parseISO ? parseISO(cita.fecha) : new Date(cita.fecha);
            f.setHours(+p[0], +p[1], 0, 0);
            return (f - ahora) / 3600000;
        },
        puedeCancelar: function (c) { return C.rules.horasHasta(c) >= C.rules.cancelH; },
        puedeReprogramar: function (c) { return C.rules.horasHasta(c) >= C.rules.reprogH; },
        aviso: function () {
            return 'Puedes <b>cancelar</b> hasta <b>' + C.rules.cancelH + " h</b> antes y <b>reprogramar</b> hasta <b>" +
                C.rules.reprogH + ' h</b> antes. Pasado ese plazo, llámanos y lo resolvemos contigo.';
        },
        motivo: function (c, accion) {
            var h = Math.max(0, C.rules.horasHasta(c));
            var lim = accion === 'cancelar' ? C.rules.cancelH : C.rules.reprogH;
            return 'Faltan <b>' + h.toFixed(0) + ' h</b> para tu cita y el plazo para ' + accion +
                ' online es de <b>' + lim + ' h</b>. Escríbenos por WhatsApp y lo gestionamos.';
        }
    };

    /* =====================================================================
       1b · SEGURIDAD DE LA AGENDA: solapamientos y duplicados
       ===================================================================== */
    function aMin(h) { var p = String(h || '0:00').split(':'); return (+p[0]) * 60 + (+p[1]); }
    function finDe(c) { return c.fin || (function () { var t = aMin(c.ini) + 30; return pad(Math.floor(t / 60)) + ':' + pad(t % 60); })(); }

    /* Devuelve las citas que chocan con la propuesta (mismo doctor u mismo paciente) */
    C.conflictos = function (prop, ignorarId) {
        var ini = aMin(prop.ini), fin = aMin(prop.fin || finDe(prop));
        return C.todasCitas().filter(function (c) {
            if (ignorarId && c.id === ignorarId) return false;
            if (c.fecha !== prop.fecha) return false;
            if (c.estado === 'cancelada') return false;
            var solapa = aMin(c.ini) < fin && aMin(finDe(c)) > ini;
            if (!solapa) return false;
            return (prop.doctor && c.doctor === prop.doctor) || (prop.paciente && c.paciente === prop.paciente);
        }).map(function (c) {
            return { cita: c, motivo: (prop.doctor && c.doctor === prop.doctor) ? 'doctor' : 'paciente' };
        });
    };
    /* El paciente ya tiene otra cita ese mismo día (aunque no se solape) */
    C.mismoDia = function (prop, ignorarId) {
        return C.todasCitas().filter(function (c) {
            return (!ignorarId || c.id !== ignorarId) && c.fecha === prop.fecha &&
                   c.paciente === prop.paciente && c.estado !== 'cancelada' && c.ini !== prop.ini;
        });
    };
    /* Pinta el aviso de conflicto dentro de un contenedor */
    C.avisoConflicto = function (el, prop, ignorarId) {
        if (!el) return true;
        var ch = C.conflictos(prop, ignorarId), mismo = C.mismoDia(prop, ignorarId);
        if (!ch.length && !mismo.length) { el.innerHTML = ''; return true; }
        var html = '';
        ch.forEach(function (x) {
            html += '<div class="conflicto"><i class="fa-solid fa-triangle-exclamation"></i><div>' +
                (x.motivo === 'doctor'
                    ? '<b>Esa hora ya está ocupada</b>' + (prop.doctor ? ' para ' + esc(prop.doctor) : '') + ': ' +
                      esc(x.cita.paciente) + ' a las ' + x.cita.ini + '–' + finDe(x.cita) + '.'
                    : '<b>' + esc(prop.paciente) + ' ya tiene una cita a esa hora</b> (' + esc(x.cita.trat || '') + ').') +
                '<span class="mini">Elige otro hueco o cambia de doctor/a para evitar el solapamiento.</span></div></div>';
        });
        mismo.forEach(function (c) {
            html += '<div class="conflicto leve"><i class="fa-solid fa-circle-info"></i><div>' +
                '<b>' + esc(prop.paciente) + ' ya tiene otra cita ese día</b> a las ' + c.ini + ' (' + esc(c.trat || '') + ').' +
                '<span class="mini">Puede ser correcto, pero confírmalo con el paciente.</span></div></div>';
        });
        el.innerHTML = html;
        return !ch.length;                       // los solapamientos bloquean; el mismo día solo avisa
    };

    /* --- Duplicados de paciente --- */
    function normTxt(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').trim(); }
    function soloDigitos(s) { return String(s || '').replace(/\D/g, ''); }
    C.buscarSimilares = function (nombre, tel) {
        var n = normTxt(nombre), d = soloDigitos(tel);
        if (n.length < 3 && d.length < 6) return [];
        var palabras = n.split(/\s+/).filter(function (w) { return w.length > 2; });
        return (D().patientsList || []).map(function (p) {
            var pn = normTxt(p.nombre), pd = soloDigitos(p.tel);
            var score = 0, razon = '';
            if (d.length >= 6 && pd.slice(-7) === d.slice(-7)) { score = 100; razon = 'mismo teléfono'; }
            else if (n && pn === n) { score = 95; razon = 'mismo nombre'; }
            else if (palabras.length) {
                var coinc = palabras.filter(function (w) { return pn.indexOf(w) >= 0; }).length;
                if (coinc) { score = Math.round(coinc / palabras.length * 80); razon = coinc > 1 ? 'nombre muy parecido' : 'nombre parecido'; }
            }
            return { p: p, score: score, razon: razon };
        }).filter(function (x) { return x.score >= 40; }).sort(function (a, b) { return b.score - a.score; }).slice(0, 3);
    };
    /* Pinta el aviso de posible duplicado con botón para reutilizar la ficha */
    C.avisoDuplicado = function (el, nombre, tel, onUsar) {
        if (!el) return;
        var sim = C.buscarSimilares(nombre, tel);
        if (!sim.length) { el.innerHTML = ''; return; }
        el.innerHTML = '<div class="dup"><i class="fa-solid fa-user-check"></i><div style="flex:1">' +
            '<b>¿Es este paciente?</b> <span class="mini">Evita crear una ficha duplicada.</span>' +
            sim.map(function (x, i) {
                return '<div class="dup-row"><div><b>' + esc(x.p.nombre) + '</b><span class="mini"> · ' + esc(x.p.tel || '') +
                    ' · ' + x.p.visitas + ' visitas</span><br><span class="mini">Coincide por ' + x.razon + '</span></div>' +
                    '<button type="button" class="btn btn-primary btn-sm" data-dup="' + i + '">Usar esta ficha</button></div>';
            }).join('') + '</div></div>';
        el.querySelectorAll('[data-dup]').forEach(function (b) {
            b.onclick = function () { onUsar(sim[+b.dataset.dup].p); el.innerHTML = ''; };
        });
    };

    /* =====================================================================
       2 · NUEVA CITA (secretaría: llamada o presencial)
       ===================================================================== */
    C.nuevaCita = function (opts) {
        opts = opts || {};
        var onCreate = opts.onCreate || function () {};
        var seleccion = { slot: null };
        var mb = document.getElementById('nc-modal');
        if (!mb) {
            mb = document.createElement('div'); mb.className = 'modal-back'; mb.id = 'nc-modal';
            mb.innerHTML = '<div class="modal" style="max-width:640px;max-height:90vh;overflow:auto" id="nc-inner"></div>';
            document.body.appendChild(mb);
        }
        var hoy = D().today;
        var pacientes = (D().patientsList || []);
        document.getElementById('nc-inner').innerHTML =
            '<h3><i class="fa-solid fa-calendar-plus" style="color:var(--c-primary)"></i> Nueva cita</h3>' +
            '<p class="text-muted" style="margin-top:-.4rem">Registra una cita recibida <b>por teléfono</b> o <b>en el mostrador</b>.</p>' +

            '<div class="field"><label>¿Cómo llega la cita?</label><div class="seg-lite" id="nc-origen">' +
              '<button type="button" class="on" data-o="telefono"><i class="fa-solid fa-phone"></i> Por teléfono</button>' +
              '<button type="button" data-o="presencial"><i class="fa-solid fa-person-walking"></i> En el mostrador</button>' +
            '</div></div>' +

            '<div class="field"><label for="nc-pac">Paciente <span class="req">*</span></label>' +
              '<input id="nc-pac" class="input" list="nc-pacs" placeholder="Escribe el nombre (o uno nuevo)" data-validate="required">' +
              '<datalist id="nc-pacs">' + pacientes.map(function (p) { return '<option value="' + esc(p.nombre) + '">'; }).join('') + '</datalist>' +
              '<span class="hint">Si no existe, se creará como paciente nuevo.</span></div>' +

            '<div class="grid" style="grid-template-columns:1fr 1fr">' +
              '<div class="field"><label for="nc-tel">Teléfono <span class="req">*</span></label><input id="nc-tel" data-mask="tel" class="input" placeholder="+58 …" data-validate="tel"></div>' +
              '<div class="field"><label for="nc-trat">Tratamiento</label><select id="nc-trat" class="input">' +
                (D().treatments || []).map(function (t) { return '<option value="' + t.id + '">' + esc(t.name) + ' (' + t.min + ' min)</option>'; }).join('') +
              '</select></div>' +
            '</div>' +

            '<div class="grid" style="grid-template-columns:1fr 1fr">' +
              '<div class="field"><label for="nc-doc">Doctor/a</label><select id="nc-doc" class="input">' +
                (D().doctors || []).map(function (d) { return '<option value="' + d.id + '">' + esc(d.name) + '</option>'; }).join('') +
              '</select></div>' +
              '<div class="field"><label for="nc-fecha">Día</label><input type="date" id="nc-fecha" class="input" value="' + hoy + '" min="' + hoy + '"></div>' +
            '</div>' +

            '<div id="nc-dup"></div>' +
            '<div class="field"><label>Hora disponible <span class="req">*</span></label><div class="slots" id="nc-slots"></div></div>' +
            '<div id="nc-conflicto"></div>' +
            '<div class="field"><label for="nc-nota">Nota (opcional)</label><input id="nc-nota" class="input" placeholder="Ej.: viene acompañada, urgencia…"></div>' +

            '<div class="flex justify-between wrap" style="gap:.5rem;margin-top:.6rem">' +
              '<button class="btn btn-ghost" id="nc-cancel">Cancelar</button>' +
              '<div class="flex" style="gap:.5rem">' +
                '<button class="btn btn-ghost" id="nc-wait"><i class="fa-solid fa-clock"></i> A lista de espera</button>' +
                '<button class="btn btn-primary" id="nc-ok"><i class="fa-solid fa-check"></i> Crear cita</button>' +
              '</div></div>';

        var origen = 'telefono';
        document.querySelectorAll('#nc-origen button').forEach(function (b) {
            b.onclick = function () {
                origen = b.dataset.o;
                document.querySelectorAll('#nc-origen button').forEach(function (x) { x.classList.toggle('on', x === b); });
            };
        });
        // Autorrellenar y avisar de posibles duplicados mientras se escribe
        var elPac = document.getElementById('nc-pac'), elTel = document.getElementById('nc-tel');
        function chequeaDuplicado() {
            var exacto = pacientes.filter(function (x) { return x.nombre === elPac.value; })[0];
            if (exacto) { elTel.value = exacto.tel; document.getElementById('nc-dup').innerHTML = ''; return; }
            C.avisoDuplicado(document.getElementById('nc-dup'), elPac.value, elTel.value, function (p) {
                elPac.value = p.nombre; elTel.value = p.tel || '';
                Toast.show('Usando la ficha de ' + p.nombre + '.', 'ok');
                chequeaConflicto();
            });
        }
        elPac.addEventListener('input', chequeaDuplicado);
        elTel.addEventListener('blur', chequeaDuplicado);

        // Aviso de solapamiento con la hora elegida
        function chequeaConflicto() {
            if (!seleccion.slot) { document.getElementById('nc-conflicto').innerHTML = ''; return true; }
            var t = (D().treatments || []).filter(function (x) { return x.id === +document.getElementById('nc-trat').value; })[0];
            var d = (D().doctors || []).filter(function (x) { return x.id === +document.getElementById('nc-doc').value; })[0];
            var p2 = seleccion.slot.split(':'), f = new Date(0, 0, 0, +p2[0], +p2[1] + (t ? t.min : 30));
            return C.avisoConflicto(document.getElementById('nc-conflicto'), {
                fecha: document.getElementById('nc-fecha').value, ini: seleccion.slot,
                fin: pad(f.getHours()) + ':' + pad(f.getMinutes()),
                doctor: d ? d.name : '', paciente: elPac.value.trim()
            });
        }
        C._ncChequeo = chequeaConflicto;
        function pintaSlots() {
            var f = document.getElementById('nc-fecha').value;
            var libres = C.slotsLibres(f, +document.getElementById('nc-doc').value);
            seleccion.slot = null;
            document.getElementById('nc-slots').innerHTML = libres.length
                ? libres.map(function (h) { return '<button type="button" class="slot" data-h="' + h + '">' + h + '</button>'; }).join('')
                : '<div class="empty-mini"><i class="fa-regular fa-calendar-xmark"></i> Sin huecos ese día con ese doctor/a</div>';
            document.querySelectorAll('#nc-slots .slot').forEach(function (s) {
                s.onclick = function () {
                    seleccion.slot = s.dataset.h;
                    document.querySelectorAll('#nc-slots .slot').forEach(function (x) { x.classList.remove('sel'); });
                    s.classList.add('sel');
                    if (C._ncChequeo) C._ncChequeo();
                };
            });
        }
        document.getElementById('nc-fecha').addEventListener('change', pintaSlots);
        document.getElementById('nc-doc').addEventListener('change', pintaSlots);
        pintaSlots();
        // Si venimos desde la ficha de un paciente, ya sabemos quién es
        if (opts.paciente) {
            document.getElementById('nc-pac').value = opts.paciente.nombre || '';
            document.getElementById('nc-tel').value = opts.paciente.tel || '';
        }
        if (window.UX && UX.initValidation) UX.initValidation(document.getElementById('nc-inner'));

        document.getElementById('nc-cancel').onclick = function () { Modal.close('nc-modal'); };
        document.getElementById('nc-wait').onclick = function () {
            var nom = document.getElementById('nc-pac').value.trim();
            if (!nom) { Toast.show('Indica el nombre del paciente.', 'err'); return; }
            C.addWaitlist({ paciente: nom, tel: document.getElementById('nc-tel').value.trim(),
                trat: document.getElementById('nc-trat').selectedOptions[0].textContent.replace(/ \(.*\)$/, ''),
                pref: 'Cualquiera', prioridad: 'media', nota: document.getElementById('nc-nota').value.trim() });
            Modal.close('nc-modal');
            Toast.show('«' + nom + '» añadido a la lista de espera.', 'ok');
            if (opts.onWait) opts.onWait();
        };
        document.getElementById('nc-ok').onclick = function () {
            var nom = document.getElementById('nc-pac').value.trim();
            var tel = document.getElementById('nc-tel').value.trim();
            if (!nom) { Toast.show('Indica el paciente.', 'err'); return; }
            if (!tel) { Toast.show('Indica un teléfono de contacto.', 'err'); return; }
            if (!seleccion.slot) { Toast.show('Elige una hora disponible.', 'err'); return; }
            if (!chequeaConflicto()) { Toast.show('Esa hora se solapa con otra cita. Elige otro hueco.', 'err'); return; }
            var tratOpt = document.getElementById('nc-trat').selectedOptions[0];
            var trat = (D().treatments || []).filter(function (t) { return t.id === +document.getElementById('nc-trat').value; })[0];
            var doc = (D().doctors || []).filter(function (d) { return d.id === +document.getElementById('nc-doc').value; })[0];
            var p = seleccion.slot.split(':'), fin = new Date(0, 0, 0, +p[0], +p[1] + (trat ? trat.min : 30));
            var cita = {
                id: Date.now(), fecha: document.getElementById('nc-fecha').value, ini: seleccion.slot,
                fin: pad(fin.getHours()) + ':' + pad(fin.getMinutes()),
                paciente: nom, tel: tel, doctor: doc ? doc.name : '', trat: trat ? trat.name : tratOpt.textContent,
                estado: 'programada', origen: origen, nota: document.getElementById('nc-nota').value.trim()
            };
            Modal.close('nc-modal');
            onCreate(cita);
            Toast.show('Cita creada para ' + nom + ' · ' + fFecha(cita.fecha) + ' ' + cita.ini, 'ok',
                { label: 'Confirmar por WhatsApp', fn: function () { if (window.WA) WA.confirmacion(Object.assign({ fechaTxt: fFecha(cita.fecha) }, cita)); } });
        };
        Modal.open('nc-modal');
    };

    /* Huecos libres reales: respeta los ajustes de la clínica (horario,
       duración de franja, días laborables y festivos) y descuenta las citas. */
    C.slotsLibres = function (fechaIso, semilla) {
        var st = D().settings || { maniana: { desde: 8, hasta: 13 }, tarde: { desde: 15, hasta: 17 }, franjaMin: 20, dias: [1, 2, 3, 4, 5, 6], festivos: [] };
        if ((st.festivos || []).indexOf(fechaIso) >= 0) return [];                    // festivo: cerrado
        var dow = (window.parseISO ? parseISO(fechaIso) : new Date(fechaIso)).getDay();
        if ((st.dias || []).indexOf(dow) < 0) return [];                              // día no laborable
        var horas = [], paso = st.franjaMin || 20;
        [[st.maniana.desde, st.maniana.hasta], [st.tarde.desde, st.tarde.hasta]].forEach(function (r) {
            for (var m = r[0] * 60; m < r[1] * 60; m += paso) horas.push(pad(Math.floor(m / 60)) + ':' + pad(m % 60));
        });
        var s = 0, k = fechaIso + '|' + (semilla || 0);
        for (var i = 0; i < k.length; i++) s = (s * 31 + k.charCodeAt(i)) | 0;
        s = Math.abs(s);
        var ocup = C.todasCitas().filter(function (c) { return c.fecha === fechaIso; }).map(function (c) { return c.ini; });
        return horas.filter(function (h, i) { return ocup.indexOf(h) < 0 && (((s >> (i % 24)) & 1) === 1 || i % 5 === 0); });
    };
    C.todasCitas = function () {
        var d = D(), out = [];
        (d.secretary ? d.secretary.upcoming : []).forEach(function (c) { out.push(c); });
        (d.doctor ? d.doctor.pending : []).forEach(function (c) { out.push(c); });
        (d.raquel ? d.raquel.pending : []).forEach(function (c) { out.push(c); });
        return out;
    };

    /* =====================================================================
       3 · LISTA DE ESPERA
       ===================================================================== */
    var K_WAIT = 'dc_waitlist';
    C.getWaitlist = function () {
        var extra = [];
        try { extra = JSON.parse(localStorage.getItem(K_WAIT) || '[]'); } catch (e) {}
        return (D().waitlist || []).concat(extra);
    };
    C.addWaitlist = function (item) {
        item.id = Date.now(); item.desde = D().today;
        try { var a = JSON.parse(localStorage.getItem(K_WAIT) || '[]'); a.push(item); localStorage.setItem(K_WAIT, JSON.stringify(a)); } catch (e) {}
    };
    C.removeWaitlist = function (id) {
        try {
            var a = JSON.parse(localStorage.getItem(K_WAIT) || '[]').filter(function (x) { return x.id !== id; });
            localStorage.setItem(K_WAIT, JSON.stringify(a));
        } catch (e) {}
        var seed = D().waitlist || [];
        for (var i = 0; i < seed.length; i++) if (seed[i].id === id) { seed.splice(i, 1); break; }
    };
    C.explicacionEspera = 'Cuando una cita se <b>cancela</b> o queda un <b>hueco libre</b>, el sistema avisa por WhatsApp a los pacientes de esta lista, ' +
        'por orden de <b>prioridad</b> y según su preferencia horaria. El primero que responda se queda el hueco. ' +
        'Así se rellenan las bajas de última hora sin llamar uno a uno.';

    C.renderWaitlist = function (el, opts) {
        opts = opts || {};
        var lista = C.getWaitlist();
        if (!lista.length) {
            el.innerHTML = '<div class="empty"><i class="fa-regular fa-clock" style="font-size:1.6rem"></i>' +
                '<p style="margin:.6rem 0 .2rem"><b>La lista de espera está vacía</b></p>' +
                '<p class="mini">Cuando un paciente no encuentre hueco, añádelo aquí y le avisaremos en cuanto se libere uno.</p></div>';
            return;
        }
        el.innerHTML = '<div class="table-wrap"><table class="appts cards-sm">' +
            '<thead><tr><th>Paciente</th><th>Tratamiento</th><th>Preferencia</th><th>Prioridad</th><th>Desde</th><th>Acciones</th></tr></thead><tbody>' +
            lista.map(function (w, i) {
                return '<tr>' +
                    '<td data-l="Paciente"><b>' + esc(w.paciente) + '</b><br><span class="text-muted" style="font-size:.8rem">' + esc(w.tel) + '</span></td>' +
                    '<td data-l="Tratamiento">' + esc(w.trat) + (w.nota ? '<br><span class="text-muted" style="font-size:.78rem">' + esc(w.nota) + '</span>' : '') + '</td>' +
                    '<td data-l="Preferencia">' + esc(w.pref) + '</td>' +
                    '<td data-l="Prioridad"><span class="prio prio-' + w.prioridad + '">' + w.prioridad + '</span></td>' +
                    '<td data-l="Desde">' + fFecha(w.desde) + '</td>' +
                    '<td data-l="Acciones"><div class="flex wrap" style="gap:.4rem">' +
                      '<button class="btn btn-primary btn-sm" data-w="ofrecer" data-i="' + i + '"><i class="fa-brands fa-whatsapp"></i> Ofrecer hueco</button>' +
                      '<button class="btn btn-ghost btn-sm" data-w="quitar" data-i="' + i + '" style="color:var(--c-danger)">Quitar</button>' +
                    '</div></td></tr>';
            }).join('') + '</tbody></table></div>';

        el.querySelectorAll('[data-w]').forEach(function (b) {
            b.onclick = function () {
                var w = lista[+b.dataset.i];
                if (b.dataset.w === 'quitar') {
                    C.removeWaitlist(w.id);
                    Toast.show('«' + w.paciente + '» quitado de la lista.', undefined,
                        { label: 'Deshacer', fn: function () { C.addWaitlist(w); C.renderWaitlist(el, opts); } });
                    C.renderWaitlist(el, opts);
                } else {
                    var libres = C.slotsLibres(D().today, 1);
                    var hueco = libres[0] || '09:00';
                    if (window.WA) WA.preview({ nombre: w.paciente, tel: w.tel, msg: WA.tpl.huecoLibre({ paciente: w.paciente }, hueco + ' h de hoy') });
                }
            };
        });
    };

    /* =====================================================================
       4 · PACIENTES: buscar, filtrar y CORREGIR datos (error humano)
       ===================================================================== */
    function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
    C.buscarPacientes = function (q, filtro) {
        var lista = (D().patientsList || []).slice();
        var hoy = D().today;
        var conCita = {};
        C.todasCitas().forEach(function (c) { if (c.fecha >= hoy) conCita[c.paciente] = true; });
        if (q) {
            var palabras = norm(q).split(/\s+/).filter(Boolean);
            lista = lista.filter(function (p) {
                var heno = norm([p.nombre, p.tel, p.email, p.dni, p.ficha && p.ficha.seguro].join(' '));
                return palabras.every(function (w) { return heno.indexOf(w) >= 0; });
            });
        }
        if (filtro === 'con') lista = lista.filter(function (p) { return conCita[p.nombre]; });
        if (filtro === 'sin') lista = lista.filter(function (p) { return !conCita[p.nombre]; });
        if (filtro === 'alergias') lista = lista.filter(function (p) { return p.ficha && p.ficha.alergias && norm(p.ficha.alergias).indexOf('ninguna') !== 0; });
        if (filtro === 'incompletos') lista = lista.filter(function (p) { return !p.email || !p.dni || !p.tel; });
        return lista.map(function (p) { return Object.assign({ _cita: !!conCita[p.nombre] }, p); });
    };

    C.renderPacientes = function (el, opts) {
        opts = opts || {};
        var estado = C._pacFiltro || { q: '', f: '' };
        function pinta() {
            var lista = C.buscarPacientes(estado.q, estado.f);
            var cuerpo = lista.length
                ? '<div class="table-wrap"><table class="appts cards-sm"><thead><tr><th>Paciente</th><th>Contacto</th><th>Documento</th><th>Última visita</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>' +
                    lista.map(function (p, i) {
                        var falta = [];
                        if (!p.email) falta.push('email'); if (!p.dni) falta.push('documento'); if (!p.tel) falta.push('teléfono');
                        var alerg = p.ficha && p.ficha.alergias && norm(p.ficha.alergias).indexOf('ninguna') !== 0;
                        return '<tr><td data-l="Paciente"><div class="pac-cell">' + C.avatarHTML(p) +
                            '<div><b>' + esc(p.nombre) + '</b>' +
                            (alerg ? ' <span class="tag-alerg" title="Alergia: ' + esc(p.ficha.alergias) + '"><i class="fa-solid fa-triangle-exclamation"></i></span>' : '') +
                            '<br><span class="text-muted" style="font-size:.78rem">' + p.visitas + ' visitas · alta ' + fFecha(p.alta || '—') + '</span></div></div></td>' +
                            '<td data-l="Contacto">' + esc(p.tel || '—') + '<br><span class="text-muted" style="font-size:.78rem">' + esc(p.email || 'sin email') + '</span></td>' +
                            '<td data-l="Documento">' + esc(p.dni || '—') + '</td>' +
                            '<td data-l="Última visita">' + fFecha(p.ultima) + '</td>' +
                            '<td data-l="Estado">' + (p._cita ? '<span class="badge badge-confirmada">Con cita</span>' : '<span class="badge badge-programada">Sin cita</span>') +
                            (falta.length ? '<br><span class="tag-falta">Falta ' + falta.join(', ') + '</span>' : '') + '</td>' +
                            '<td data-l="Acciones"><div class="acciones">' +
                              '<button class="btn btn-primary btn-sm" data-pac-ver="' + i + '"><i class="fa-solid fa-folder-open"></i> Abrir ficha</button>' +
                              C.menuHTML(i, [
                                  { k: 'edit', ic: 'fa-pen', t: 'Editar datos' },
                                  { k: 'cita', ic: 'fa-calendar-plus', t: 'Nueva cita' },
                                  { k: 'wa', ic: 'fa-brands fa-whatsapp', t: 'Escribir por WhatsApp' },
                                  { k: 'odo', ic: 'fa-teeth', t: 'Ver odontograma' }
                              ]) +
                            '</div></td></tr>';
                    }).join('') + '</tbody></table></div>'
                : '<div class="empty"><i class="fa-regular fa-face-frown" style="font-size:1.6rem"></i>' +
                  '<p style="margin:.6rem 0 .2rem"><b>Ningún paciente coincide</b></p>' +
                  '<p class="mini">Prueba con otro nombre, teléfono o documento, o quita los filtros.</p></div>';

            el.innerHTML =
                '<div class="pac-toolbar">' +
                  '<div class="pac-search"><i class="fa-solid fa-magnifying-glass"></i>' +
                  '<input id="pac-q" class="input" placeholder="Buscar por nombre, teléfono, email o documento…" value="' + esc(estado.q) + '">' +
                  (estado.q ? '<button id="pac-clear" aria-label="Limpiar"><i class="fa-solid fa-xmark"></i></button>' : '') + '</div>' +
                  '<div class="pac-filtros">' +
                    [['', 'Todos'], ['con', 'Con cita'], ['sin', 'Sin cita'], ['alergias', 'Con alergias'], ['incompletos', 'Datos incompletos']]
                      .map(function (f) { return '<button class="chip' + (estado.f === f[0] ? ' on' : '') + '" data-f="' + f[0] + '">' + f[1] + '</button>'; }).join('') +
                  '</div>' +
                '</div>' +
                '<p class="text-muted" style="font-size:.85rem;margin:.2rem 0 .8rem">' + lista.length + ' de ' + (D().patientsList || []).length + ' pacientes</p>' +
                cuerpo;

            var q = el.querySelector('#pac-q');
            q.addEventListener('input', function () { estado.q = q.value; C._pacFiltro = estado; var pos = q.selectionStart; pinta(); var n = el.querySelector('#pac-q'); n.focus(); n.setSelectionRange(pos, pos); });
            var cl = el.querySelector('#pac-clear'); if (cl) cl.onclick = function () { estado.q = ''; pinta(); };
            el.querySelectorAll('[data-f]').forEach(function (b) { b.onclick = function () { estado.f = b.dataset.f; pinta(); }; });
            el.querySelectorAll('[data-pac-ver]').forEach(function (b) {
                b.onclick = function () {
                    C.ficha360(lista[+b.dataset.pacVer], {
                        onSave: function () { pinta(); if (opts.onSave) opts.onSave(); },
                        onCita: opts.onCita
                    });
                };
            });
            C.wireMenus(el, function (i, accion) {
                var p = lista[i];
                if (accion === 'edit') C.editarPaciente(p, function () { pinta(); if (opts.onSave) opts.onSave(); });
                else if (accion === 'cita') C.nuevaCita({ paciente: p, onCreate: opts.onCita || function () {} });
                else if (accion === 'odo') C.ficha360(p, { tab: 'odonto' });
                else if (accion === 'wa' && window.WA) WA.preview({ nombre: p.nombre, tel: p.tel, msg: '¡Hola ' + p.nombre.split(' ')[0] + '! Te escribimos desde ' + (D().clinic || {}).name + '.' });
            });
        }
        pinta();
    };

    /* Editar ficha del paciente — corrige errores de tecleo con seguridad */
    C.editarPaciente = function (p, onSave) {
        var mb = document.getElementById('pe-modal');
        if (!mb) {
            mb = document.createElement('div'); mb.className = 'modal-back'; mb.id = 'pe-modal';
            mb.innerHTML = '<div class="modal" style="max-width:640px;max-height:90vh;overflow:auto" id="pe-inner"></div>';
            document.body.appendChild(mb);
        }
        var f = p.ficha || {};
        document.getElementById('pe-inner').innerHTML =
            '<h3><i class="fa-solid fa-user-pen" style="color:var(--c-primary)"></i> Editar paciente</h3>' +
            '<p class="text-muted" style="margin-top:-.4rem">Corrige aquí cualquier dato mal introducido. Se guarda un registro del cambio.</p>' +
            '<div class="grid" style="grid-template-columns:1fr 1fr">' +
              '<div class="field"><label for="pe-nom">Nombre y apellidos <span class="req">*</span></label><input id="pe-nom" class="input" value="' + esc(p.nombre) + '" data-validate="required|nombre"></div>' +
              '<div class="field"><label for="pe-tel">Teléfono <span class="req">*</span></label><input id="pe-tel" class="input" data-mask="tel" value="' + esc(p.tel || '') + '" data-validate="required|tel"></div>' +
            '</div>' +
            '<div class="grid" style="grid-template-columns:1fr 1fr">' +
              '<div class="field"><label for="pe-email">Email</label><input id="pe-email" class="input" value="' + esc(p.email || '') + '" data-validate="email"></div>' +
              '<div class="field"><label for="pe-dni">Documento (cédula)</label><input id="pe-dni" class="input" value="' + esc(p.dni || '') + '"></div>' +
            '</div>' +
            '<div class="grid" style="grid-template-columns:1fr 1fr">' +
              '<div class="field"><label for="pe-nac">Fecha de nacimiento</label><input id="pe-nac" type="date" class="input" value="' + esc(p.nacimiento || '') + '"></div>' +
              '<div class="field"><label for="pe-seg">Seguro</label><input id="pe-seg" class="input" value="' + esc(f.seguro || '') + '"></div>' +
            '</div>' +
            '<div class="pe-med"><b><i class="fa-solid fa-triangle-exclamation" style="color:var(--c-warning)"></i> Datos clínicos sensibles</b>' +
            '<p class="mini">Un error aquí puede afectar al tratamiento. Cámbialos solo si estás seguro.</p>' +
            '<div class="grid" style="grid-template-columns:1fr 1fr">' +
              '<div class="field"><label for="pe-alerg">Alergias</label><input id="pe-alerg" class="input" value="' + esc(f.alergias || '') + '"></div>' +
              '<div class="field"><label for="pe-grupo">Grupo sanguíneo</label><select id="pe-grupo" class="input">' +
                (D().bloodTypes || []).map(function (b) { return '<option' + (b === f.grupo ? ' selected' : '') + '>' + b + '</option>'; }).join('') + '</select></div>' +
            '</div></div>' +
            '<div class="flex justify-between wrap" style="gap:.5rem;margin-top:.8rem">' +
              '<button class="btn btn-ghost" id="pe-cancel">Cancelar</button>' +
              '<button class="btn btn-primary" id="pe-ok"><i class="fa-solid fa-check"></i> Guardar cambios</button>' +
            '</div>';
        if (window.UX && UX.initValidation) UX.initValidation(document.getElementById('pe-inner'));
        document.getElementById('pe-cancel').onclick = function () { Modal.close('pe-modal'); };
        document.getElementById('pe-ok').onclick = function () {
            if (window.UX && !UX.validarTodo(document.getElementById('pe-inner'))) return;
            var cambios = [];
            function set(campo, nuevo, etiqueta, obj) {
                obj = obj || p;
                if ((obj[campo] || '') !== nuevo) { cambios.push(etiqueta + ': «' + (obj[campo] || '—') + '» → «' + nuevo + '»'); obj[campo] = nuevo; }
            }
            set('nombre', document.getElementById('pe-nom').value.trim(), 'Nombre');
            set('tel', document.getElementById('pe-tel').value.trim(), 'Teléfono');
            set('email', document.getElementById('pe-email').value.trim(), 'Email');
            set('dni', document.getElementById('pe-dni').value.trim(), 'Documento');
            set('nacimiento', document.getElementById('pe-nac').value, 'Nacimiento');
            p.ficha = p.ficha || {};
            set('seguro', document.getElementById('pe-seg').value.trim(), 'Seguro', p.ficha);
            set('alergias', document.getElementById('pe-alerg').value.trim(), 'Alergias', p.ficha);
            set('grupo', document.getElementById('pe-grupo').value, 'Grupo sanguíneo', p.ficha);
            Modal.close('pe-modal');
            if (!cambios.length) { Toast.show('No había nada que cambiar.'); return; }
            C.registrarCambio(p.nombre, cambios);
            Toast.show(cambios.length + ' dato(s) corregido(s) en ' + p.nombre.split(' ')[0] + '.', 'ok');
            if (onSave) onSave(cambios);
        };
        Modal.open('pe-modal');
    };

    /* Registro de cambios (auditoría básica: quién, qué y cuándo) */
    var K_LOG = 'dc_audit';
    C.registrarCambio = function (sobre, cambios) {
        var ses = (window.UX && UX.session && UX.session()) || {};
        try {
            var log = JSON.parse(localStorage.getItem(K_LOG) || '[]');
            log.unshift({ fecha: D().today, quien: (ses.nombre || 'Usuario') + ' ' + (ses.apellido || ''), sobre: sobre, cambios: cambios });
            localStorage.setItem(K_LOG, JSON.stringify(log.slice(0, 50)));
        } catch (e) {}
    };
    C.getAuditoria = function () { try { return JSON.parse(localStorage.getItem(K_LOG) || '[]'); } catch (e) { return []; } };

    /* Corregir una cita mal creada (día, hora, doctor o tratamiento) */
    C.editarCita = function (cita, onSave) {
        var mb = document.getElementById('ce-modal');
        if (!mb) {
            mb = document.createElement('div'); mb.className = 'modal-back'; mb.id = 'ce-modal';
            mb.innerHTML = '<div class="modal" style="max-width:600px;max-height:90vh;overflow:auto" id="ce-inner"></div>';
            document.body.appendChild(mb);
        }
        var sel = { slot: cita.ini };
        document.getElementById('ce-inner').innerHTML =
            '<h3><i class="fa-solid fa-pen-to-square" style="color:var(--c-primary)"></i> Corregir cita</h3>' +
            '<p class="text-muted" style="margin-top:-.4rem">Paciente: <b>' + esc(cita.paciente) + '</b> · actualmente el <b>' + fFecha(cita.fecha) + ' a las ' + cita.ini + '</b></p>' +
            '<div class="grid" style="grid-template-columns:1fr 1fr">' +
              '<div class="field"><label for="ce-trat">Tratamiento</label><select id="ce-trat" class="input">' +
                (D().treatments || []).map(function (t) { return '<option value="' + t.id + '"' + (cita.trat && cita.trat.indexOf(t.name) === 0 ? ' selected' : '') + '>' + esc(t.name) + '</option>'; }).join('') + '</select></div>' +
              '<div class="field"><label for="ce-doc">Doctor/a</label><select id="ce-doc" class="input">' +
                (D().doctors || []).map(function (d) { return '<option value="' + d.id + '"' + (cita.doctor === d.name ? ' selected' : '') + '>' + esc(d.name) + '</option>'; }).join('') + '</select></div>' +
            '</div>' +
            '<div class="field"><label for="ce-fecha">Día</label><input type="date" id="ce-fecha" class="input" value="' + cita.fecha + '"></div>' +
            '<div class="field"><label>Hora</label><div class="slots" id="ce-slots"></div></div>' +
            '<div id="ce-conflicto"></div>' +
            '<div class="field"><label for="ce-motivo">Motivo de la corrección</label>' +
            '<input id="ce-motivo" class="input" placeholder="Ej.: se apuntó mal el día al teléfono"></div>' +
            '<div class="flex justify-between" style="margin-top:.6rem">' +
              '<button class="btn btn-ghost" id="ce-cancel">Cancelar</button>' +
              '<button class="btn btn-primary" id="ce-ok"><i class="fa-solid fa-check"></i> Guardar corrección</button></div>';

        function pintaSlots() {
            var f = document.getElementById('ce-fecha').value;
            var libres = C.slotsLibres(f, +document.getElementById('ce-doc').value);
            if (f === cita.fecha && libres.indexOf(cita.ini) < 0) libres.unshift(cita.ini);   // su hora actual sigue siendo válida
            document.getElementById('ce-slots').innerHTML = libres.map(function (h) {
                return '<button type="button" class="slot' + (h === sel.slot ? ' sel' : '') + '" data-h="' + h + '">' + h + '</button>';
            }).join('') || '<div class="empty-mini">Sin huecos ese día</div>';
            document.querySelectorAll('#ce-slots .slot').forEach(function (s) {
                s.onclick = function () {
                    sel.slot = s.dataset.h;
                    document.querySelectorAll('#ce-slots .slot').forEach(function (x) { x.classList.remove('sel'); });
                    s.classList.add('sel'); chequeaCE();
                };
            });
            chequeaCE();
        }
        function chequeaCE() {
            if (!sel.slot) { document.getElementById('ce-conflicto').innerHTML = ''; return true; }
            var t = (D().treatments || []).filter(function (x) { return x.id === +document.getElementById('ce-trat').value; })[0];
            var d = (D().doctors || []).filter(function (x) { return x.id === +document.getElementById('ce-doc').value; })[0];
            var p2 = sel.slot.split(':'), f = new Date(0, 0, 0, +p2[0], +p2[1] + (t ? t.min : 30));
            return C.avisoConflicto(document.getElementById('ce-conflicto'), {
                fecha: document.getElementById('ce-fecha').value, ini: sel.slot,
                fin: pad(f.getHours()) + ':' + pad(f.getMinutes()),
                doctor: d ? d.name : cita.doctor, paciente: cita.paciente
            }, cita.id);
        }
        document.getElementById('ce-fecha').addEventListener('change', function () { sel.slot = null; pintaSlots(); });
        document.getElementById('ce-doc').addEventListener('change', pintaSlots);
        pintaSlots();
        document.getElementById('ce-cancel').onclick = function () { Modal.close('ce-modal'); };
        document.getElementById('ce-ok').onclick = function () {
            if (!sel.slot) { Toast.show('Elige una hora.', 'err'); return; }
            if (!chequeaCE()) { Toast.show('Esa hora se solapa con otra cita.', 'err'); return; }
            var t = (D().treatments || []).filter(function (x) { return x.id === +document.getElementById('ce-trat').value; })[0];
            var d = (D().doctors || []).filter(function (x) { return x.id === +document.getElementById('ce-doc').value; })[0];
            var antes = { fecha: cita.fecha, ini: cita.ini, doctor: cita.doctor, trat: cita.trat };
            var nf = document.getElementById('ce-fecha').value;
            var cambios = [];
            if (antes.fecha !== nf) cambios.push('Día: ' + fFecha(antes.fecha) + ' → ' + fFecha(nf));
            if (antes.ini !== sel.slot) cambios.push('Hora: ' + antes.ini + ' → ' + sel.slot);
            if (d && antes.doctor !== d.name) cambios.push('Doctor/a: ' + (antes.doctor || '—') + ' → ' + d.name);
            if (t && antes.trat !== t.name) cambios.push('Tratamiento: ' + (antes.trat || '—') + ' → ' + t.name);
            var motivo = document.getElementById('ce-motivo').value.trim();
            cita.fecha = nf; cita.ini = sel.slot;
            var p2 = sel.slot.split(':'), fin = new Date(0, 0, 0, +p2[0], +p2[1] + (t ? t.min : 30));
            cita.fin = pad(fin.getHours()) + ':' + pad(fin.getMinutes());
            if (d) cita.doctor = d.name; if (t) cita.trat = t.name;
            Modal.close('ce-modal');
            if (!cambios.length) { Toast.show('La cita no ha cambiado.'); return; }
            C.registrarCambio('Cita de ' + cita.paciente, cambios.concat(motivo ? ['Motivo: ' + motivo] : []));
            Toast.show('Cita corregida.', 'ok', { label: 'Avisar al paciente', fn: function () {
                if (window.WA) WA.preview({ nombre: cita.paciente, tel: cita.tel, msg: WA.tpl.confirmacion(Object.assign({ fechaTxt: fFecha(cita.fecha) }, cita)) });
            } });
            if (onSave) onSave(cambios);
        };
        Modal.open('ce-modal');
    };

    /* =====================================================================
       4a · MENÚ "⋯" — una acción principal + el resto agrupadas
       ===================================================================== */
    C.menuHTML = function (idx, items) {
        return '<div class="menu-wrap"><button class="menu-btn" data-menu="' + idx + '" aria-label="Más acciones" title="Más acciones">' +
            '<i class="fa-solid fa-ellipsis"></i></button>' +
            '<div class="menu-pop">' + items.map(function (it) {
                return '<button data-mi="' + idx + '" data-acc="' + it.k + '"><i class="' +
                    (it.ic.indexOf('fa-brands') === 0 ? it.ic : 'fa-solid ' + it.ic) + '"></i> ' + it.t + '</button>';
            }).join('') + '</div></div>';
    };
    C.wireMenus = function (root, onAccion) {
        function cerrarTodos() { root.querySelectorAll('.menu-pop.open').forEach(function (m) { m.classList.remove('open'); }); }
        root.querySelectorAll('[data-menu]').forEach(function (b) {
            b.onclick = function (e) {
                e.stopPropagation();
                var pop = b.nextElementSibling, abierto = pop.classList.contains('open');
                cerrarTodos(); if (!abierto) pop.classList.add('open');
            };
        });
        root.querySelectorAll('[data-mi]').forEach(function (b) {
            b.onclick = function (e) { e.stopPropagation(); cerrarTodos(); onAccion(+b.dataset.mi, b.dataset.acc); };
        });
        if (!C._menuDoc) { C._menuDoc = true; document.addEventListener('click', function () { document.querySelectorAll('.menu-pop.open').forEach(function (m) { m.classList.remove('open'); }); }); }
    };

    /* =====================================================================
       4b · FICHA 360° DEL PACIENTE (todo en una pantalla)
       ===================================================================== */
    var K_FOTOS = 'dc_fotos';
    function fotos() { try { return JSON.parse(localStorage.getItem(K_FOTOS) || '{}'); } catch (e) { return {}; } }
    C.fotoDe = function (nombre) { return fotos()[nombre] || null; };
    C.guardarFoto = function (nombre, dataUrl) {
        try { var f = fotos(); f[nombre] = dataUrl; localStorage.setItem(K_FOTOS, JSON.stringify(f)); } catch (e) {}
    };
    function iniciales(n) { return String(n || '').split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase(); }
    C.avatarHTML = function (p, cls) {
        var f = C.fotoDe(p.nombre);
        return f ? '<span class="pav ' + (cls || '') + '" style="background-image:url(' + f + ')"></span>'
                 : '<span class="pav ' + (cls || '') + '">' + iniciales(p.nombre) + '</span>';
    };

    C.ficha360 = function (p, opts) {
        opts = opts || {};
        var mb = document.getElementById('f360');
        if (!mb) {
            mb = document.createElement('div'); mb.className = 'modal-back'; mb.id = 'f360';
            mb.innerHTML = '<div class="modal f360-modal" id="f360-inner"></div>';
            document.body.appendChild(mb);
        }
        var tab = opts.tab || 'datos';
        var citas = C.todasCitas().filter(function (c) { return c.paciente === p.nombre; });
        var hist = (function () {
            var h = [];
            if (D().doctor) h = h.concat(D().doctor.history.filter(function (c) { return c.paciente === p.nombre; }));
            if (p.nombre === 'Lucía Torres Marí' && D().patient) h = h.concat(D().patient.history);
            return h;
        })();
        var planes = (D().plans || []).filter(function (x) { return x.paciente === p.nombre; });
        var presus = (D().budgets || []).filter(function (x) { return x.paciente === p.nombre; });
        var pagos = (D().finances || []).filter(function (x) { return p.nombre.indexOf(x.paciente) === 0 || x.paciente === p.nombre; });

        function pinta() {
            var f = p.ficha || {};
            var alerg = f.alergias && f.alergias.toLowerCase().indexOf('ninguna') !== 0;
            var cuerpo = '';

            if (tab === 'datos') {
                cuerpo = '<div class="f360-grid">' +
                    [['Teléfono', p.tel], ['Email', p.email], ['Documento', p.dni],
                     ['Nacimiento', p.nacimiento ? fFecha(p.nacimiento) : ''], ['Alta', p.alta ? fFecha(p.alta) : ''],
                     ['Seguro', f.seguro], ['Grupo sanguíneo', f.grupo], ['Alergias', f.alergias],
                     ['Crónicas', f.cronicas], ['Medicación', f.medicacion], ['Emergencia', f.emergencia]]
                    .map(function (x) { return '<div class="f360-dato"><span>' + x[0] + '</span><b>' + esc(x[1] || '—') + '</b></div>'; }).join('') +
                    '</div>' +
                    '<div class="f360-notas"><label for="f360-nota">Notas de recepción</label>' +
                    '<textarea id="f360-nota" class="input" style="min-height:70px" placeholder="Ej.: prefiere mañanas, viene acompañada, muy nervioso…">' + esc(C.notaDe(p.nombre)) + '</textarea>' +
                    '<button class="btn btn-ghost btn-sm" id="f360-nota-save" style="margin-top:.4rem"><i class="fa-solid fa-floppy-disk"></i> Guardar nota</button></div>';
            } else if (tab === 'historial') {
                cuerpo = citas.length || hist.length
                    ? '<ol class="tl">' +
                        citas.map(function (c) {
                            return '<li class="tl-item futuro"><span class="tl-dot"><i class="fa-solid fa-calendar-check"></i></span><div class="tl-body">' +
                                '<div class="tl-head"><b>' + esc(c.trat) + '</b>' + (window.badge ? ' ' + badge(c.estado) : '') + '</div>' +
                                '<span class="tl-date">' + fFecha(c.fecha) + ' · ' + c.ini + ' · próxima</span></div></li>';
                        }).join('') +
                        hist.map(function (c) {
                            return '<li class="tl-item ' + (c.estado === 'completada' ? 'tratamiento' : '') + '">' +
                                '<span class="tl-dot"><i class="fa-solid ' + (c.estado === 'completada' ? 'fa-tooth' : 'fa-calendar-xmark') + '"></i></span><div class="tl-body">' +
                                '<div class="tl-head"><b>' + esc(c.trat) + '</b>' + (window.badge ? ' ' + badge(c.estado) : '') + '</div>' +
                                '<span class="tl-date">' + fFecha(c.fecha) + (c.ini ? ' · ' + c.ini : '') + '</span>' +
                                (c.notas && c.notas !== '—' ? '<div class="tl-note">“' + esc(c.notas) + '”</div>' : '') + '</div></li>';
                        }).join('') + '</ol>'
                    : '<div class="empty-mini">Sin visitas registradas todavía.</div>';
            } else if (tab === 'odonto') {
                cuerpo = '<div id="f360-odo"></div>';
            } else if (tab === 'docs') {
                cuerpo = (presus.length
                    ? presus.map(function (b) {
                        var tot = b.lineas.reduce(function (a, l) { return a + l.u * l.p; }, 0) * (1 - (b.dto || 0) / 100);
                        return '<div class="f360-doc"><i class="fa-solid fa-file-invoice-dollar"></i><div style="flex:1">' +
                            '<b>' + b.id + '</b><span>Presupuesto · ' + fFecha(b.fecha) + ' · ' + money(tot) + '</span></div>' +
                            '<span class="bud-estado bud-' + b.estado + '">' + b.estado + '</span></div>';
                    }).join('') : '') +
                    '<div class="f360-doc-new"><button class="btn btn-primary btn-sm" id="f360-doc"><i class="fa-solid fa-file-prescription"></i> Generar documento</button>' +
                    '<span class="mini">Receta, informe, presupuesto o justificante</span></div>' +
                    (presus.length ? '' : '<div class="empty-mini" style="margin-top:.6rem">Sin documentos guardados.</div>');
            } else if (tab === 'plan') {
                cuerpo = '<div id="f360-planes"></div>';
            } else {
                var totalPag = pagos.reduce(function (a, x) { return a + x.importe; }, 0);
                var deuda = planes.reduce(function (a, pl) { return a + (pl.total - pl.pagado); }, 0);
                cuerpo = '<div class="f360-pagos-kpi">' +
                    '<div><span>Pagado histórico</span><b>' + money(totalPag) + '</b></div>' +
                    '<div><span>Pendiente</span><b class="' + (deuda > 0 ? 'plan-debe' : 'plan-ok') + '">' + money(deuda) + '</b></div>' +
                    '<div><span>Movimientos</span><b>' + pagos.length + '</b></div></div>' +
                    (pagos.length
                        ? '<div class="table-wrap"><table class="appts cards-sm"><thead><tr><th>Fecha</th><th>Tratamiento</th><th>Método</th><th style="text-align:right">Importe</th></tr></thead><tbody>' +
                          pagos.slice().sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; }).map(function (x) {
                              return '<tr><td data-l="Fecha">' + fFecha(x.fecha) + '</td><td data-l="Tratamiento">' + esc(x.trat) + '</td>' +
                                  '<td data-l="Método"><span class="pay pay-' + x.metodo + '">' + x.metodo + '</span></td>' +
                                  '<td data-l="Importe" class="amount" style="text-align:right">' + money(x.importe) + '</td></tr>';
                          }).join('') + '</tbody></table></div>'
                        : '<div class="empty-mini">Sin pagos registrados.</div>');
            }

            document.getElementById('f360-inner').innerHTML =
                '<div class="f360-head">' +
                  '<label class="f360-foto" title="Cambiar foto">' + C.avatarHTML(p, 'big') +
                    '<span class="f360-cam"><i class="fa-solid fa-camera"></i></span>' +
                    '<input type="file" accept="image/*" id="f360-file" hidden></label>' +
                  '<div style="flex:1;min-width:0"><h3 style="margin:0">' + esc(p.nombre) + '</h3>' +
                    '<span class="f360-sub">' + esc(p.tel || '') + ' · ' + p.visitas + ' visitas · última ' + fFecha(p.ultima) + '</span>' +
                    (alerg ? '<span class="f360-alerg"><i class="fa-solid fa-triangle-exclamation"></i> Alergia a ' + esc(f.alergias) + '</span>' : '') +
                  '</div>' +
                  '<button class="hbtn-x" id="f360-close" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>' +
                '</div>' +
                '<div class="f360-tabs">' +
                  [['datos', 'Datos', 'fa-id-card'], ['historial', 'Historial', 'fa-clock-rotate-left'],
                   ['odonto', 'Odontograma', 'fa-teeth'], ['docs', 'Documentos', 'fa-file-lines'],
                   ['plan', 'Plan', 'fa-list-check'], ['pagos', 'Pagos', 'fa-sack-dollar']]
                  .map(function (t) { return '<button class="' + (tab === t[0] ? 'on' : '') + '" data-tab="' + t[0] + '"><i class="fa-solid ' + t[2] + '"></i> ' + t[1] + '</button>'; }).join('') +
                '</div>' +
                '<div class="f360-body">' + cuerpo + '</div>' +
                '<div class="f360-foot">' +
                  '<button class="btn btn-ghost btn-sm" id="f360-edit"><i class="fa-solid fa-pen"></i> Editar datos</button>' +
                  '<div class="flex wrap" style="gap:.4rem">' +
                    '<button class="btn btn-ghost btn-sm" id="f360-wa" style="color:#25d366"><i class="fa-brands fa-whatsapp"></i></button>' +
                    '<button class="btn btn-primary btn-sm" id="f360-cita"><i class="fa-solid fa-calendar-plus"></i> Nueva cita</button>' +
                  '</div></div>';

            document.querySelectorAll('#f360-inner [data-tab]').forEach(function (b) {
                b.onclick = function () { tab = b.dataset.tab; pinta(); };
            });
            if (tab === 'odonto' && window.Odontograma) {
                p.odonto = p.odonto || {};
                Odontograma({ el: document.getElementById('f360-odo'), state: p.odonto, editable: !!opts.editarOdonto });
            }
            if (tab === 'plan') C.renderPlanes(document.getElementById('f360-planes'), { paciente: p.nombre, onCita: opts.onCita });
            if (tab === 'datos') {
                document.getElementById('f360-nota-save').onclick = function () {
                    var btn = this;
                    UX.conFeedback(btn, function () {
                        C.guardarNota(p.nombre, document.getElementById('f360-nota').value);
                        Toast.show('Nota guardada.', 'ok');
                    }, 'Guardando…', 'Guardado');
                };
            }
            if (tab === 'docs') {
                document.getElementById('f360-doc').onclick = function () {
                    if (!window.Reports) return Toast.show('Los documentos se generan desde el panel clínico.');
                    Modal.close('f360');
                    Reports.open({ paciente: p.nombre, ficha: p.ficha || {}, odonto: p.odonto || {},
                        doctor: 'Dra. Raquel Virgüez', colegiado: 'COEV-3001' });
                };
            }
            document.getElementById('f360-close').onclick = function () { Modal.close('f360'); };
            document.getElementById('f360-edit').onclick = function () { C.editarPaciente(p, function () { pinta(); if (opts.onSave) opts.onSave(); }); };
            document.getElementById('f360-cita').onclick = function () { Modal.close('f360'); C.nuevaCita({ paciente: p, onCreate: opts.onCita || function () {} }); };
            document.getElementById('f360-wa').onclick = function () {
                if (window.WA) WA.preview({ nombre: p.nombre, tel: p.tel, msg: '¡Hola ' + p.nombre.split(' ')[0] + '! Te escribimos desde ' + (D().clinic || {}).name + '.' });
            };
            var file = document.getElementById('f360-file');
            file.onchange = function () {
                var fl = file.files[0]; if (!fl) return;
                var rd = new FileReader();
                rd.onload = function (e) { C.guardarFoto(p.nombre, e.target.result); pinta(); Toast.show('Foto actualizada.', 'ok'); if (opts.onSave) opts.onSave(); };
                rd.readAsDataURL(fl);
            };
        }
        pinta();
        Modal.open('f360');
    };

    /* Notas rápidas de recepción por paciente */
    var K_NOTAS = 'dc_notas';
    function notas() { try { return JSON.parse(localStorage.getItem(K_NOTAS) || '{}'); } catch (e) { return {}; } }
    C.notaDe = function (n) { return notas()[n] || ''; };
    C.guardarNota = function (n, txt) { try { var o = notas(); o[n] = txt; localStorage.setItem(K_NOTAS, JSON.stringify(o)); } catch (e) {} };

    /* =====================================================================
       4c · IMPRIMIR LA AGENDA DEL DÍA
       ===================================================================== */
    C.imprimirAgenda = function (citas, fecha, titulo) {
        var c = D().clinic || {};
        var lista = citas.filter(function (x) { return !fecha || x.fecha === fecha; })
                         .sort(function (a, b) { return a.ini < b.ini ? -1 : 1; });
        var html = '<div class="doc-head"><div><div class="doc-brand"><i class="fa-solid fa-tooth"></i> ' + esc(c.name) + '</div>' +
            '<div class="doc-clinic">' + esc(c.address) + ' · ' + esc(c.phone) + '</div></div>' +
            '<div class="doc-folio">Agenda<b>' + fFecha(fecha || D().today) + '</b>' + lista.length + ' cita(s)</div></div>' +
            '<h2 class="doc-title">' + esc(titulo || 'Agenda del día') + '</h2>' +
            (lista.length
                ? '<table class="doc-meds"><thead><tr><th>Hora</th><th>Paciente</th><th>Teléfono</th><th>Doctor/a</th><th>Tratamiento</th><th>Estado</th><th>✔</th></tr></thead><tbody>' +
                  lista.map(function (x) {
                      return '<tr><td><b>' + x.ini + '–' + (x.fin || '') + '</b></td><td>' + esc(x.paciente) + '</td>' +
                          '<td>' + esc(x.tel || '') + '</td><td>' + esc(x.doctor || '') + '</td>' +
                          '<td>' + esc(x.trat || '') + '</td><td>' + esc(x.estado) + '</td>' +
                          '<td style="font-weight:400">☐</td></tr>';
                  }).join('') + '</tbody></table>'
                : '<p>No hay citas ese día.</p>') +
            '<div class="doc-foot">Impreso el ' + fFecha(D().today) + ' · ' + esc(c.name) + '</div>';

        var old = document.getElementById('ag-print'); if (old) old.remove();
        var f = document.createElement('iframe'); f.id = 'ag-print';
        f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
        document.body.appendChild(f);
        var css = [].slice.call(document.querySelectorAll('link[rel="stylesheet"]')).map(function (l) { return '<link rel="stylesheet" href="' + l.href + '">'; }).join('');
        var d = f.contentWindow.document;
        d.open();
        d.write('<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Agenda</title>' + css +
            '<style>body{margin:0;background:#fff}.doc-paper{max-height:none;border:0;box-shadow:none;padding:12mm 14mm;overflow:visible}' +
            '@page{size:A4 landscape;margin:0}</style></head><body><div class="doc-paper">' + html + '</div></body></html>');
        d.close();
        setTimeout(function () { f.contentWindow.focus(); f.contentWindow.print(); }, 450);
    };

    /* =====================================================================
       5 · SIGUIENTE CITA AL TERMINAR (fidelización en un clic)
       ===================================================================== */
    /* Ojo al orden: lo específico manda sobre lo genérico
       ("Ortodoncia (revisión)" es ortodoncia, no una revisión cualquiera). */
    var SEGUIMIENTO = [
        { re: /ortodoncia|bracket|alineador/i, meses: 1,  trat: 'Ortodoncia (revisión)',     txt: 'control mensual de ortodoncia' },
        { re: /implante/i,                     meses: 3,  trat: 'Revisión y diagnóstico',    txt: 'control del implante' },
        { re: /blanquea/i,                     meses: 12, trat: 'Revisión y diagnóstico',    txt: 'revisión anual' },
        { re: /empaste|obturacion/i,           meses: 6,  trat: 'Revisión y diagnóstico',    txt: 'control del empaste' },
        { re: /limpieza|higiene/i,             meses: 6,  trat: 'Limpieza dental (higiene)', txt: 'higiene cada 6 meses' },
        { re: /revision|diagnostico/i,         meses: 6,  trat: 'Revisión y diagnóstico',    txt: 'revisión semestral' }
    ];
    C.sugerenciaSeguimiento = function (trat) {
        var s = SEGUIMIENTO.filter(function (x) { return x.re.test(normTxt(trat)); })[0];
        return s || { meses: 6, trat: 'Revisión y diagnóstico', txt: 'revisión semestral' };
    };
    /* Muestra la propuesta tras completar una cita y la agenda de un clic */
    C.proponerSeguimiento = function (cita, onCreate) {
        var s = C.sugerenciaSeguimiento(cita.trat || '');
        var base = window.parseISO ? parseISO(cita.fecha || D().today) : new Date();
        base.setMonth(base.getMonth() + s.meses);
        while (base.getDay() === 0 || base.getDay() === 6) base.setDate(base.getDate() + 1);
        var fecha = iso(base);
        var mb = document.getElementById('sg-modal');
        if (!mb) {
            mb = document.createElement('div'); mb.className = 'modal-back'; mb.id = 'sg-modal';
            mb.innerHTML = '<div class="modal" style="max-width:460px" id="sg-inner"></div>';
            document.body.appendChild(mb);
        }
        var libres = C.slotsLibres(fecha, 2).slice(0, 3);
        document.getElementById('sg-inner').innerHTML =
            '<div style="text-align:center"><div class="rx-done"><i class="fa-solid fa-calendar-check"></i></div>' +
            '<h3 style="margin:.7rem 0 .2rem">¿Agendamos la siguiente?</h3>' +
            '<p class="text-muted" style="font-size:.9rem">Para <b>' + esc(cita.paciente) + '</b> tocaría <b>' + s.txt + '</b>.<br>' +
            'Te propongo el <b>' + fFecha(fecha) + '</b>.</p></div>' +
            (libres.length
                ? '<div class="slots" id="sg-slots" style="justify-content:center;margin:.8rem 0">' +
                  libres.map(function (h) { return '<button type="button" class="slot" data-h="' + h + '">' + h + '</button>'; }).join('') + '</div>'
                : '<div class="empty-mini" style="margin:.8rem 0">Ese día está completo. Ábrelo en «Nueva cita» para elegir otro.</div>') +
            '<div class="flex justify-between wrap" style="gap:.5rem">' +
              '<button class="btn btn-ghost" id="sg-no">Ahora no</button>' +
              '<button class="btn btn-ghost" id="sg-otra">Elegir otro día</button>' +
            '</div>';
        document.querySelectorAll('#sg-slots .slot').forEach(function (b) {
            b.onclick = function () {
                var t = (D().treatments || []).filter(function (x) { return x.name === s.trat; })[0];
                var p2 = b.dataset.h.split(':'), f = new Date(0, 0, 0, +p2[0], +p2[1] + (t ? t.min : 30));
                var nueva = { id: Date.now(), fecha: fecha, ini: b.dataset.h, fin: pad(f.getHours()) + ':' + pad(f.getMinutes()),
                    paciente: cita.paciente, tel: cita.tel, doctor: cita.doctor, trat: s.trat, estado: 'programada', origen: 'seguimiento' };
                Modal.close('sg-modal');
                if (onCreate) onCreate(nueva);
                Toast.show('Siguiente cita agendada: ' + fFecha(fecha) + ' · ' + b.dataset.h, 'ok',
                    { label: 'Avisar por WhatsApp', fn: function () { if (window.WA) WA.confirmacion(Object.assign({ fechaTxt: fFecha(fecha) }, nueva)); } });
            };
        });
        document.getElementById('sg-no').onclick = function () { Modal.close('sg-modal'); };
        document.getElementById('sg-otra').onclick = function () {
            Modal.close('sg-modal');
            C.nuevaCita({ paciente: { nombre: cita.paciente, tel: cita.tel }, onCreate: onCreate });
        };
        Modal.open('sg-modal');
    };

    /* =====================================================================
       6 · PLANES DE TRATAMIENTO MULTI-SESIÓN
       ===================================================================== */
    C.progresoPlan = function (pl) {
        var hechas = pl.sesiones.filter(function (s) { return s.estado === 'completada'; }).length;
        return { hechas: hechas, total: pl.sesiones.length, pct: Math.round(hechas / pl.sesiones.length * 100),
                 pendiente: pl.total - pl.pagado };
    };
    C.renderPlanes = function (el, opts) {
        opts = opts || {};
        var planes = (D().plans || []).filter(function (p) { return !opts.paciente || p.paciente === opts.paciente; });
        if (!planes.length) {
            el.innerHTML = '<div class="empty"><i class="fa-regular fa-rectangle-list" style="font-size:1.6rem"></i>' +
                '<p style="margin:.6rem 0 .2rem"><b>Sin planes de tratamiento</b></p>' +
                '<p class="mini">Los tratamientos largos (ortodoncia, implantes) se agrupan aquí con sus sesiones y pagos.</p></div>';
            return;
        }
        el.innerHTML = planes.map(function (pl, i) {
            var pr = C.progresoPlan(pl);
            return '<div class="plan">' +
                '<div class="plan-head"><div><b>' + esc(pl.nombre) + '</b>' +
                  '<span class="plan-sub">' + esc(pl.paciente) + ' · ' + esc(pl.doctor) + ' · desde ' + fFecha(pl.inicio) + '</span></div>' +
                  '<span class="plan-badge">Sesión ' + pr.hechas + ' de ' + pr.total + '</span></div>' +
                '<div class="plan-bar"><div class="plan-fill" style="width:' + pr.pct + '%"></div></div>' +
                '<div class="plan-meta"><span>' + pr.pct + '% completado</span>' +
                  '<span>Pagado <b>' + money(pl.pagado) + '</b> de ' + money(pl.total) +
                  (pr.pendiente > 0 ? ' · <span class="plan-debe">pendiente ' + money(pr.pendiente) + '</span>' : ' · <span class="plan-ok">al día</span>') + '</span></div>' +
                '<ol class="plan-sesiones">' + pl.sesiones.map(function (s) {
                    var ic = s.estado === 'completada' ? 'fa-circle-check' : s.estado === 'no_asistio' ? 'fa-circle-xmark' : s.estado === 'programada' ? 'fa-clock' : 'fa-circle';
                    return '<li class="ps ' + s.estado + '"><i class="fa-solid ' + ic + '"></i>' +
                        '<span class="ps-t">' + esc(s.trat) + '</span>' +
                        '<span class="ps-f">' + (s.fecha ? fFecha(s.fecha) : 'sin fecha') + '</span>' +
                        (s.estado === 'pendiente' || s.estado === 'no_asistio'
                            ? '<button class="btn btn-ghost btn-sm" data-plan="' + i + '" data-ses="' + s.n + '"><i class="fa-solid fa-calendar-plus"></i> Agendar</button>' : '') +
                        '</li>';
                }).join('') + '</ol></div>';
        }).join('');
        el.querySelectorAll('[data-plan]').forEach(function (b) {
            b.onclick = function () {
                var pl = planes[+b.dataset.plan], ses = pl.sesiones.filter(function (s) { return s.n === +b.dataset.ses; })[0];
                var p = (D().patientsList || []).filter(function (x) { return x.nombre === pl.paciente; })[0] || { nombre: pl.paciente };
                C.nuevaCita({ paciente: p, onCreate: function (c) {
                    ses.fecha = c.fecha; ses.estado = 'programada';
                    C.renderPlanes(el, opts);
                    if (opts.onCita) opts.onCita(c);
                } });
            };
        });
    };

    /* =====================================================================
       7 · CONFIRMACIÓN DEL PACIENTE QUE VUELVE AL SISTEMA
       ===================================================================== */
    C.respuestaPaciente = function (cita, respuesta, onChange) {
        if (respuesta === 'si') {
            cita.estado = 'confirmada';
            C.registrarCambio('Cita de ' + cita.paciente, ['Confirmada por el paciente vía WhatsApp']);
            Toast.show('✅ ' + cita.paciente.split(' ')[0] + ' ha confirmado su cita.', 'ok');
        } else {
            C.registrarCambio('Cita de ' + cita.paciente, ['El paciente pide cambiar la cita (respuesta WhatsApp)']);
            Toast.show(cita.paciente.split(' ')[0] + ' pide cambiar la cita.', 'err',
                { label: 'Corregir cita', fn: function () { C.editarCita(cita, onChange); } });
        }
        if (onChange) onChange(respuesta);
    };

    /* =====================================================================
       8 · LÍNEA DE TIEMPO DEL PACIENTE
       ===================================================================== */
    C.timeline = function (el, o) {
        o = o || {};
        var eventos = [];
        (o.futuras || []).forEach(function (c) {
            eventos.push({ fecha: c.fecha, tipo: 'cita', icon: 'fa-calendar-check', titulo: c.trat,
                sub: (c.doctor || '') + ' · ' + c.ini, estado: c.estado, futuro: true });
        });
        (o.historial || []).forEach(function (c) {
            eventos.push({ fecha: c.fecha, tipo: c.estado === 'completada' ? 'tratamiento' : 'cita',
                icon: c.estado === 'completada' ? 'fa-tooth' : c.estado === 'cancelada' ? 'fa-calendar-xmark' : 'fa-calendar-day',
                titulo: c.trat, sub: (c.doctor || '') + (c.ini ? ' · ' + c.ini : ''), estado: c.estado, nota: c.notas });
        });
        (o.archivos || []).forEach(function (f) {
            eventos.push({ fecha: f.date, tipo: 'archivo', icon: 'fa-image', titulo: 'Foto de progreso', sub: f.name });
        });
        (o.documentos || []).forEach(function (d) {
            eventos.push({ fecha: d.fecha, tipo: 'doc', icon: 'fa-file-medical', titulo: d.titulo, sub: d.folio });
        });
        eventos.sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });

        if (!eventos.length) {
            el.innerHTML = '<div class="empty"><i class="fa-regular fa-clock" style="font-size:1.6rem"></i>' +
                '<p style="margin:.6rem 0 0"><b>Todavía no hay historia que contar</b></p>' +
                '<p class="mini">Aquí aparecerán tus visitas, tratamientos, fotos y documentos.</p></div>';
            return;
        }
        var hoy = D().today;
        el.innerHTML = '<ol class="tl">' + eventos.map(function (e) {
            var cls = e.futuro ? 'futuro' : e.tipo;
            return '<li class="tl-item ' + cls + '">' +
                '<span class="tl-dot"><i class="fa-solid ' + e.icon + '"></i></span>' +
                '<div class="tl-body"><div class="tl-head"><b>' + esc(e.titulo) + '</b>' +
                (e.estado && window.badge ? ' ' + badge(e.estado) : '') + '</div>' +
                '<span class="tl-date">' + fFecha(e.fecha) + (e.fecha > hoy ? ' · próxima' : '') + '</span>' +
                (e.sub ? '<div class="tl-sub">' + esc(e.sub) + '</div>' : '') +
                (e.nota && e.nota !== '—' ? '<div class="tl-note">“' + esc(e.nota) + '”</div>' : '') +
                '</div></li>';
        }).join('') + '</ol>';
    };
})();
