/* =====================================================================
   Clínica Dental · Reserva de cita: INVITADO o CUENTA (stepper, sin BD)
   Paso 1 Tratamiento · 2 Fecha y hora · 3 Tus datos · 4 Confirmación
   Invitado: solo Nombre + Apellidos + Teléfono. Cuenta: + Email + Contraseña.
   ===================================================================== */
(function () {
    'use strict';
    var D = window.DEMO;

    var state = { mode: 'guest', trat: null, doc: 0, date: null, slot: null, nombre: '', apellido: '', tel: '', email: '', pass: '' };
    var step = 1, TOTAL = 4;
    var $ = function (id) { return document.getElementById(id); };

    // ¿Hay sesión de paciente? Entonces no volvemos a pedir los datos.
    var sesion = (window.UX && UX.session && UX.session()) || null;
    var logueado = !!(sesion && sesion.role === 'paciente');
    if (logueado) {
        state.mode = 'cuenta';
        state.nombre = sesion.nombre || '';
        state.apellido = sesion.apellido || '';
        state.tel = sesion.tel || '';
        state.email = sesion.email || '';
    }

    /* ---------- Paso 1: tratamientos + doctores ---------- */
    function renderTreatments() {
        $('trat-grid').innerHTML = D.treatments.map(function (t) {
            return '<button type="button" class="pick" data-trat="' + t.id + '">' +
                '<span class="ic"><i class="fa-solid ' + t.icon + '"></i></span>' +
                '<span><span class="t">' + t.name + '</span><span class="s">' + t.min + ' min · ' + t.category + '</span></span>' +
                '<i class="fa-solid fa-circle-check check"></i></button>';
        }).join('');
        $('trat-grid').querySelectorAll('.pick').forEach(function (b) {
            b.addEventListener('click', function () { state.trat = +b.dataset.trat; mark($('trat-grid'), b); updateSummary(); });
        });
    }
    function renderDoctors() {
        var any = '<button type="button" class="pick sel" data-doc="0">' +
            '<span class="ic"><i class="fa-solid fa-shuffle"></i></span>' +
            '<span><span class="t">Cualquier doctor/a</span><span class="s">El primero disponible</span></span>' +
            '<i class="fa-solid fa-circle-check check"></i></button>';
        $('doc-grid').innerHTML = any + D.doctors.map(function (d) {
            return '<button type="button" class="pick" data-doc="' + d.id + '">' +
                '<span class="ic"><i class="fa-solid fa-user-doctor"></i></span>' +
                '<span><span class="t">' + d.name + '</span><span class="s">' + d.specialty + '</span></span>' +
                '<i class="fa-solid fa-circle-check check"></i></button>';
        }).join('');
        $('doc-grid').querySelectorAll('.pick').forEach(function (b) {
            b.addEventListener('click', function () { state.doc = +b.dataset.doc; mark($('doc-grid'), b); updateSummary(); });
        });
    }
    function mark(grid, btn) { grid.querySelectorAll('.pick').forEach(function (x) { x.classList.remove('sel'); }); btn.classList.add('sel'); }

    /* ---------- Paso 2: días + horarios ---------- */
    function renderDays() {
        var today = new Date(2026, 6, 23);
        var html = '', count = 0, i = 0;
        while (count < 12 && i < 30) {
            var d = new Date(today.getTime()); d.setDate(today.getDate() + i); i++;
            var dow = d.getDay();
            if (dow === 0 || dow === 6) continue;
            var iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            html += '<button type="button" class="day" data-date="' + iso + '"><div class="dow">' + window.dowCorto(dow) + '</div>' +
                '<div class="dnum">' + d.getDate() + '</div><div class="mon">' + window.mesCorto(d.getMonth()) + '</div></button>';
            count++;
        }
        $('day-bar').innerHTML = html;
        $('day-bar').querySelectorAll('.day').forEach(function (b) {
            b.addEventListener('click', function () {
                state.date = b.dataset.date; state.slot = null;
                $('day-bar').querySelectorAll('.day').forEach(function (x) { x.classList.remove('sel'); });
                b.classList.add('sel'); renderSlots(); updateSummary();
            });
        });
    }
    function seeded(str) { var h = 0; for (var i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) | 0; } return Math.abs(h); }
    function renderSlots() {
        if (!state.date) { $('slot-grid').innerHTML = '<p class="text-muted">Elige primero un día.</p>'; return; }
        var horas = [];
        [[8, 13], [15, 17]].forEach(function (r) { for (var h = r[0]; h < r[1]; h++) { horas.push(h + ':00'); horas.push(h + ':20'); horas.push(h + ':40'); } });
        var seed = seeded(state.date + '|' + state.doc), libres = 0;
        $('slot-grid').innerHTML = horas.map(function (hhmm, idx) {
            var parts = hhmm.split(':'); var label = parts[0].padStart(2, '0') + ':' + parts[1];
            var free = ((seed >> (idx % 24)) & 1) === 1 || idx % 5 === 0;
            if (free) libres++;
            return '<button type="button" class="slot" data-hora="' + label + '"' + (free ? '' : ' disabled') + '>' + label + '</button>';
        }).join('');
        if (!libres) { $('slot-grid').innerHTML = '<div class="empty" style="width:100%"><i class="fa-regular fa-calendar-xmark"></i> Sin huecos ese día. Prueba otra fecha.</div>'; }
        $('slot-grid').querySelectorAll('.slot:not([disabled])').forEach(function (b) {
            b.addEventListener('click', function () {
                state.slot = b.dataset.hora;
                $('slot-grid').querySelectorAll('.slot').forEach(function (x) { x.classList.remove('sel'); });
                b.classList.add('sel'); updateSummary();
            });
        });
    }

    /* ---------- Resumen ---------- */
    function tratObj() { return D.treatments.filter(function (t) { return t.id === state.trat; })[0]; }
    function docName() { if (!state.doc) return 'Cualquier doctor/a'; var d = D.doctors.filter(function (x) { return x.id === state.doc; })[0]; return d ? d.name : '—'; }
    function updateSummary() {
        var t = tratObj();
        set('sum-trat', t ? t.name : null);
        set('sum-doc', state.trat ? docName() : null);
        set('sum-fecha', state.date ? window.fmtFecha(state.date) : null);
        set('sum-hora', state.slot || null);
        set('sum-dur', t ? t.min + ' min' : null);
    }
    function set(id, val) {
        var e = $(id); if (!e) return;
        if (val) { e.textContent = val; e.classList.remove('pending'); }
        else { e.textContent = 'Por elegir'; e.classList.add('pending'); }
    }

    /* ---------- Modo invitado / cuenta ---------- */
    function initToggle() {
        $('guest-toggle').querySelectorAll('button').forEach(function (b) {
            b.addEventListener('click', function () {
                $('guest-toggle').querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
                b.classList.add('on'); state.mode = b.dataset.mode;
                $('account-fields').style.display = state.mode === 'account' ? 'block' : 'none';
            });
        });
    }

    /* ---------- Navegación ---------- */
    function updateStepper() {
        document.querySelectorAll('.step').forEach(function (s) {
            var n = +s.dataset.step; s.classList.toggle('active', n === step); s.classList.toggle('done', n < step);
        });
        document.querySelectorAll('.step-panel').forEach(function (p) { p.classList.toggle('active', +p.dataset.step === step); });
        $('btn-back').style.visibility = step === 1 ? 'hidden' : 'visible';
        var esUltimo = step === 3 || (step === 2 && logueado);
        $('btn-next').innerHTML = esUltimo ? '<i class="fa-solid fa-circle-check"></i> Confirmar cita' : 'Continuar <i class="fa-solid fa-arrow-right"></i>';
        $('step-nav').style.display = step === TOTAL ? 'none' : 'flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function validate() {
        if (step === 1 && !state.trat) { Toast.show('Elige un tratamiento para continuar.', 'err'); return false; }
        if (step === 2) {
            if (!state.date) { Toast.show('Elige un día.', 'err'); return false; }
            if (!state.slot) { Toast.show('Elige una hora disponible.', 'err'); return false; }
        }
        if (step === 3) {
            state.nombre = $('g-nombre').value.trim();
            state.apellido = $('g-apellido').value.trim();
            state.tel = $('g-tel').value.trim();
            if (!state.nombre) { Toast.show('Dinos tu nombre.', 'err'); return false; }
            if (!state.apellido) { Toast.show('Dinos tus apellidos.', 'err'); return false; }
            if (!state.tel) { Toast.show('Necesitamos un teléfono de contacto.', 'err'); return false; }
            if (state.mode === 'account') {
                state.email = $('g-email').value.trim();
                state.pass = $('g-pass').value;
                if (!state.email) { Toast.show('Para crear cuenta, indica tu email.', 'err'); return false; }
                if (state.pass.length < 4) { Toast.show('Elige una contraseña (mín. 4 caracteres).', 'err'); return false; }
            }
        }
        return true;
    }
    function next() {
        if (!validate()) return;
        if (step === 3) { confirmar(); return; }
        // Con sesión iniciada saltamos el paso "Tus datos": ya los conocemos.
        if (step === 2 && logueado) { confirmar(); return; }
        step++; if (step === 2) renderSlots(); updateStepper();
    }
    function back() { if (step > 1) { step--; updateStepper(); } }

    /* ---------- Confirmación ---------- */
    function confirmar() {
        var t = tratObj();
        var nombreCompleto = state.nombre + ' ' + state.apellido;
        var ref = 'CD-' + (seeded(state.date + state.slot + nombreCompleto) % 100000).toString().padStart(5, '0');
        $('ok-nombre').textContent = nombreCompleto;
        $('ok-ref').textContent = ref;
        var extra = state.mode === 'account' ? '<div class="sum-row"><span class="lab">Cuenta</span><span class="val">' + state.email + '</span></div>' : '';
        $('ok-detalle').innerHTML =
            '<div class="sum-row"><span class="lab">Tratamiento</span><span class="val">' + t.name + '</span></div>' +
            '<div class="sum-row"><span class="lab">Doctor/a</span><span class="val">' + docName() + '</span></div>' +
            '<div class="sum-row"><span class="lab">Día</span><span class="val">' + window.fmtFecha(state.date) + '</span></div>' +
            '<div class="sum-row"><span class="lab">Hora</span><span class="val">' + state.slot + '</span></div>' +
            '<div class="sum-row"><span class="lab">Contacto</span><span class="val">' + state.tel + '</span></div>' + extra;
        step = TOTAL; updateStepper();
        Toast.show(state.mode === 'account' ? '¡Cuenta creada y cita solicitada!' : '¡Solicitud de cita enviada!', 'ok');
    }

    /* ---------- Sesión iniciada: datos ya conocidos ---------- */
    function initSesion() {
        if (!logueado) { initToggle(); return; }
        // El paso 3 desaparece del indicador de progreso
        var s3 = document.querySelector('.step[data-step="3"]');
        if (s3) s3.style.display = 'none';
        // Rellenamos igualmente los campos por si vuelve atrás
        ['nombre', 'apellido', 'tel'].forEach(function (k) { var el = $('g-' + k); if (el) el.value = state[k] || ''; });
        var em = $('g-email'); if (em) em.value = state.email || '';
        // Aviso claro de con qué cuenta reserva
        var head = document.querySelector('.booking-head');
        var sub = head && head.querySelector('p');
        if (sub) sub.innerHTML = 'Solo <b>2 pasos</b>: ya tenemos tus datos.';
        if (head) {
            var b = document.createElement('div');
            b.className = 'logged-banner';
            b.innerHTML = '<i class="fa-solid fa-circle-check"></i> Reservas como <b>' + state.nombre + ' ' + state.apellido + '</b>' +
                ' · <span class="text-muted">' + (state.tel || '') + '</span>' +
                ' <button type="button" id="btn-otros">Usar otros datos</button>';
            head.appendChild(b);
            $('btn-otros').onclick = function () {
                logueado = false;
                if (s3) s3.style.display = '';
                if (sub) sub.innerHTML = 'Reserva en 3 pasos, como invitado y <b>sin crear cuenta</b>.';
                var gt2 = $('guest-toggle'); if (gt2) gt2.style.display = '';
                b.remove(); initToggle(); updateStepper();
                Toast.show('Puedes introducir otros datos de contacto.');
            };
        }
        var gt = $('guest-toggle'); if (gt) gt.style.display = 'none';
    }

    document.addEventListener('DOMContentLoaded', function () {
        renderTreatments(); renderDoctors(); renderDays(); renderSlots(); initSesion(); updateSummary(); updateStepper();
        $('btn-next').addEventListener('click', next);
        $('btn-back').addEventListener('click', back);
    });
})();
