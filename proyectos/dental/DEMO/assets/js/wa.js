/* =====================================================================
   Clínica Dental · WhatsApp: recordatorios y confirmaciones
   Genera el mensaje ya redactado y abre WhatsApp con el borrador.
   Nunca envía solo: el usuario revisa el texto y pulsa enviar en WhatsApp.
   ===================================================================== */
(function () {
    'use strict';
    var WA = window.WA = {};

    function clinica() { return (window.DEMO && DEMO.clinic) || { name: 'Clínica Dental', address: '', phone: '' }; }
    function nombreCorto(n) { return String(n || '').replace(/^Invitado · /, '').split(' ')[0]; }
    WA.digits = function (tel) { return String(tel || '').replace(/\D/g, ''); };
    WA.link = function (tel, msg) { return 'https://wa.me/' + WA.digits(tel) + '?text=' + encodeURIComponent(msg); };

    /* ---------- Plantillas ---------- */
    WA.tpl = {
        recordatorio: function (c) {
            return '¡Hola ' + nombreCorto(c.paciente) + '! 👋\n\n' +
                'Te recordamos tu cita en *' + clinica().name + '*:\n' +
                '🦷 ' + (c.trat || 'Consulta') + '\n' +
                '👩‍⚕️ ' + (c.doctor || 'Tu doctor/a') + '\n' +
                '📅 ' + (c.fechaTxt || '') + ' a las ' + (c.ini || '') + '\n' +
                '📍 ' + clinica().address + '\n\n' +
                'Responde *SÍ* para confirmar o *NO* si necesitas cambiarla.\n¡Te esperamos! 😊';
        },
        confirmacion: function (c) {
            return '¡Hola ' + nombreCorto(c.paciente) + '! ✅\n\n' +
                'Tu cita ha quedado *confirmada*:\n' +
                '🦷 ' + (c.trat || 'Consulta') + '\n' +
                '📅 ' + (c.fechaTxt || '') + ' a las ' + (c.ini || '') + '\n' +
                '👩‍⚕️ ' + (c.doctor || '') + '\n📍 ' + clinica().address + '\n\n' +
                'Si necesitas cambiarla, escríbenos por aquí. ¡Gracias!';
        },
        reprogramar: function (c, opciones) {
            return '¡Hola ' + nombreCorto(c.paciente) + '! 🗓️\n\n' +
                'Necesitamos *reprogramar* tu cita del ' + (c.fechaTxt || '') + ' a las ' + (c.ini || '') + '.\n\n' +
                'Tenemos estos huecos disponibles:\n' + (opciones || []).map(function (o, i) { return (i + 1) + '. ' + o; }).join('\n') +
                '\n\nRespóndenos con el número que prefieras y la reservamos. ¡Gracias!';
        },
        postvisita: function (c, indicaciones) {
            return '¡Hola ' + nombreCorto(c.paciente) + '! 🦷\n\n' +
                'Gracias por tu visita de hoy (' + (c.trat || 'consulta') + ').\n\n' +
                '*Recomendaciones:*\n' + (indicaciones || 'Mantén tu higiene habitual y evita alimentos muy fríos o calientes las próximas horas.') +
                '\n\nCualquier molestia, escríbenos por aquí. ¡Cuídate!';
        },
        huecoLibre: function (c, hueco) {
            return '¡Hola ' + nombreCorto(c.paciente) + '! 😃\n\n' +
                'Se ha liberado un hueco antes de lo previsto: *' + hueco + '*.\n' +
                '¿Te viene bien adelantar tu cita? Responde *SÍ* y la cambiamos sin coste.';
        }
    };

    /* ---------- Vista previa editable ---------- */
    WA.preview = function (o) {
        var mb = document.getElementById('wa-modal');
        if (!mb) {
            mb = document.createElement('div'); mb.className = 'modal-back'; mb.id = 'wa-modal';
            mb.innerHTML = '<div class="modal" style="max-width:520px"><h3><i class="fa-brands fa-whatsapp" style="color:#25d366"></i> Mensaje de WhatsApp</h3>' +
                '<p class="text-muted" id="wa-dest" style="margin-top:-.4rem"></p>' +
                '<div class="wa-bubble"><textarea id="wa-text" class="wa-text" rows="10"></textarea></div>' +
                '<p class="text-muted" style="font-size:.8rem"><i class="fa-solid fa-circle-info"></i> Se abrirá WhatsApp con el mensaje escrito. <b>Tú decides cuándo pulsar enviar.</b></p>' +
                '<div class="wa-sim" id="wa-sim"></div>' +
                '<div class="flex justify-between wrap" style="gap:.5rem;margin-top:.6rem">' +
                '<button class="btn btn-ghost" id="wa-close">Cancelar</button>' +
                '<div class="flex" style="gap:.5rem"><button class="btn btn-ghost" id="wa-copy"><i class="fa-solid fa-copy"></i> Copiar</button>' +
                '<a class="btn btn-primary" id="wa-open" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> Abrir WhatsApp</a></div></div></div>';
            document.body.appendChild(mb);
        }
        document.getElementById('wa-dest').innerHTML = 'Para <b>' + (o.nombre || '') + '</b> · ' + (o.tel || 'sin teléfono');
        var ta = document.getElementById('wa-text');
        ta.value = o.msg;
        function refresh() { document.getElementById('wa-open').href = WA.link(o.tel, ta.value); }
        refresh(); ta.oninput = refresh;
        document.getElementById('wa-close').onclick = function () { Modal.close('wa-modal'); };
        document.getElementById('wa-copy').onclick = function () {
            ta.select();
            try { document.execCommand('copy'); Toast.show('Mensaje copiado.', 'ok'); } catch (e) { Toast.show('Copia manualmente el texto.', 'err'); }
        };
        document.getElementById('wa-open').onclick = function () { setTimeout(function () { Modal.close('wa-modal'); }, 200); };

        /* Simulación de la respuesta del paciente: en producción la traería la
           API de WhatsApp Business y actualizaría la cita automáticamente. */
        var sim = document.getElementById('wa-sim');
        if (o.cita && window.Clinic) {
            sim.innerHTML = '<span class="mini"><i class="fa-solid fa-flask"></i> Demo · simula la respuesta del paciente:</span>' +
                '<div class="flex" style="gap:.4rem;margin-top:.4rem">' +
                '<button class="btn btn-ghost btn-sm" data-r="si"><i class="fa-solid fa-check"></i> Responde «SÍ»</button>' +
                '<button class="btn btn-ghost btn-sm" data-r="no">Responde «NO»</button></div>';
            sim.querySelectorAll('[data-r]').forEach(function (b) {
                b.onclick = function () {
                    Modal.close('wa-modal');
                    setTimeout(function () { Clinic.respuestaPaciente(o.cita, b.dataset.r, o.onRespuesta); }, 250);
                };
            });
        } else { sim.innerHTML = ''; }

        Modal.open('wa-modal');
    };

    /* Atajos (el recordatorio permite simular la respuesta del paciente) */
    WA.recordatorio = function (c, onRespuesta) { WA.preview({ nombre: c.paciente, tel: c.tel, msg: WA.tpl.recordatorio(c), cita: c, onRespuesta: onRespuesta }); };
    WA.confirmacion = function (c) { WA.preview({ nombre: c.paciente, tel: c.tel, msg: WA.tpl.confirmacion(c) }); };
    WA.postvisita = function (c, ind) { WA.preview({ nombre: c.paciente, tel: c.tel, msg: WA.tpl.postvisita(c, ind) }); };

    /* ---------- Envío por lotes (recordatorios del día siguiente) ---------- */
    WA.bulk = function (citas, titulo) {
        var mb = document.getElementById('wa-bulk');
        if (!mb) {
            mb = document.createElement('div'); mb.className = 'modal-back'; mb.id = 'wa-bulk';
            mb.innerHTML = '<div class="modal" style="max-width:560px"><h3><i class="fa-brands fa-whatsapp" style="color:#25d366"></i> <span id="wab-title"></span></h3>' +
                '<p class="text-muted" id="wab-sub" style="margin-top:-.4rem"></p><div id="wab-list"></div>' +
                '<div class="flex justify-between" style="margin-top:.8rem"><button class="btn btn-ghost" id="wab-close">Cerrar</button></div></div>';
            document.body.appendChild(mb);
            document.getElementById('wab-close').onclick = function () { Modal.close('wa-bulk'); };
        }
        document.getElementById('wab-title').textContent = titulo || 'Recordatorios por WhatsApp';
        document.getElementById('wab-sub').textContent = citas.length + (citas.length === 1 ? ' paciente' : ' pacientes') + ' · revisa y envía uno a uno';
        document.getElementById('wab-list').innerHTML = citas.length ? citas.map(function (c, i) {
            return '<div class="wa-row"><div class="wa-av"><i class="fa-solid fa-user"></i></div>' +
                '<div style="flex:1;min-width:0"><b>' + c.paciente + '</b><span>' + (c.fechaTxt || '') + ' · ' + c.ini + ' · ' + (c.trat || '') + '</span></div>' +
                '<button class="btn btn-primary btn-sm" data-wa="' + i + '"><i class="fa-brands fa-whatsapp"></i> Enviar</button></div>';
        }).join('') : '<div class="empty">No hay citas para recordar.</div>';
        document.querySelectorAll('#wab-list [data-wa]').forEach(function (b) {
            b.onclick = function () { var c = citas[+b.dataset.wa]; Modal.close('wa-bulk'); WA.recordatorio(c); };
        });
        Modal.open('wa-bulk');
    };
})();
