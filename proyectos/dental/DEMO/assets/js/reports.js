/* =====================================================================
   Clínica Dental · Recetas e informes médicos AUTOMATIZADOS
   Reports.open({ paciente, ficha, doctor, colegiado, cita, odonto })
   · Rellena solo: folio, fecha, datos del paciente y del doctor.
   · Plantillas clínicas con medicación precargada.
   · Detecta CONFLICTOS DE ALERGIA y propone alternativa.
   · Vista previa en papel + impresión / PDF (iframe, sin bloqueos de popup).
   ===================================================================== */
(function () {
    'use strict';
    var R = window.Reports = {};

    /* ---------- Plantillas clínicas (medicación precargada) ---------- */
    var TPL = {
        extraccion: {
            label: 'Post-extracción', icon: 'fa-tooth',
            meds: [
                { n: 'Amoxicilina 500 mg', d: '1 cáps.', p: 'cada 8 h', t: '7 días' },
                { n: 'Ibuprofeno 600 mg', d: '1 comp.', p: 'cada 8 h', t: '3 días' },
                { n: 'Clorhexidina 0,12% colutorio', d: '15 ml', p: '2 veces/día', t: '7 días' }
            ],
            ind: 'No enjuagar ni escupir las primeras 24 h. Dieta blanda y fría el primer día. No fumar ni realizar esfuerzos durante 48 h. Aplicar frío local 15 min cada hora el primer día.'
        },
        infeccion: {
            label: 'Infección / absceso', icon: 'fa-bacterium',
            meds: [
                { n: 'Amoxicilina/Ác. clavulánico 875/125 mg', d: '1 comp.', p: 'cada 8 h', t: '7 días' },
                { n: 'Ibuprofeno 600 mg', d: '1 comp.', p: 'cada 8 h', t: '5 días' }
            ],
            ind: 'Completar el ciclo antibiótico aunque mejoren los síntomas. Acudir a urgencias si aparece fiebre alta, dificultad para tragar o inflamación que progresa.'
        },
        dolor: {
            label: 'Dolor / inflamación', icon: 'fa-face-frown',
            meds: [
                { n: 'Ibuprofeno 600 mg', d: '1 comp.', p: 'cada 8 h', t: '3-5 días' },
                { n: 'Paracetamol 1 g', d: '1 comp.', p: 'cada 8 h si dolor', t: '3 días' }
            ],
            ind: 'Tomar siempre con alimento. Alternar ambos fármacos si el dolor es intenso. Evitar alimentos muy fríos o muy calientes.'
        },
        sensibilidad: {
            label: 'Sensibilidad', icon: 'fa-icicles',
            meds: [
                { n: 'Gel desensibilizante (nitrato potásico)', d: 'aplicar', p: '2 veces/día', t: '2 semanas' },
                { n: 'Pasta dentífrica para sensibilidad', d: 'cepillado', p: '3 veces/día', t: 'uso continuado' }
            ],
            ind: 'Evitar bebidas ácidas y cepillado agresivo. Usar cepillo de dureza suave.'
        },
        higiene: {
            label: 'Tras higiene', icon: 'fa-spray-can-sparkles',
            meds: [
                { n: 'Colutorio sin alcohol', d: '15 ml', p: '2 veces/día', t: '10 días' }
            ],
            ind: 'Puede notar sensibilidad leve 24-48 h. Cepillado 3 veces al día con seda dental o cepillos interproximales.'
        }
    };

    /* ---------- Motor de alergias ---------- */
    var ALERGIAS = [
        { key: ['penicilin', 'amoxicilin', 'betalact'], match: /(amoxicilin|penicilin|clavul[áa]nico|ampicilin)/i,
          alt: [{ n: 'Clindamicina 300 mg', d: '1 cáps.', p: 'cada 8 h', t: '7 días' }], nombre: 'penicilinas' },
        { key: ['ibuprofen', 'aine', 'aspirin', 'salicil'], match: /(ibuprofen|aspirin|[áa]cido acetilsalic|naproxen|diclofenac)/i,
          alt: [{ n: 'Paracetamol 1 g', d: '1 comp.', p: 'cada 8 h', t: '3 días' }], nombre: 'antiinflamatorios (AINE)' },
        { key: ['metamizol', 'nolotil'], match: /(metamizol|nolotil)/i,
          alt: [{ n: 'Paracetamol 1 g', d: '1 comp.', p: 'cada 8 h', t: '3 días' }], nombre: 'metamizol' }
    ];
    function conflictos(alergiasTexto, meds) {
        var a = (alergiasTexto || '').toLowerCase();
        if (!a || a.indexOf('ninguna') === 0) return [];
        var out = [];
        ALERGIAS.forEach(function (g) {
            if (!g.key.some(function (k) { return a.indexOf(k) >= 0; })) return;
            var choca = meds.filter(function (m) { return g.match.test(m.n); });
            if (choca.length) out.push({ grupo: g, meds: choca });
        });
        return out;
    }

    /* ---------- Utilidades ---------- */
    function folio(pref) {
        var n = 0; try { n = (+localStorage.getItem('dc_folio') || 1230) + 1; localStorage.setItem('dc_folio', n); } catch (e) { n = 1231; }
        return pref + '-' + new Date().getFullYear() + '-' + String(n).padStart(5, '0');
    }
    function hoyLargo() {
        var M = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        var iso = (window.DEMO && DEMO.today) || '';
        var d = iso ? window.parseISO(iso) : new Date();
        return d.getDate() + ' de ' + M[d.getMonth()] + ' de ' + d.getFullYear();
    }
    function esc(s) { return String(s == null ? '' : s).replace(/[<>&]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]; }); }
    function money(n) { return window.fmtMoney ? fmtMoney(n) : ('$' + (+n || 0).toFixed(2)); }
    function clinica() { return (window.DEMO && DEMO.clinic) || { name: 'Clínica Dental', address: '', phone: '', email: '' }; }

    /* ---------- Documento imprimible ---------- */
    function docHTML(o) {
        var c = clinica();
        var cab = '<div class="doc-head"><div><div class="doc-brand"><i class="fa-solid fa-tooth"></i> ' + esc(c.name) + '</div>' +
            '<div class="doc-clinic">' + esc(c.address) + '<br>' + esc(c.phone) + ' · ' + esc(c.email) + '</div></div>' +
            '<div class="doc-folio">Nº de documento<b>' + esc(o.folio) + '</b>' + esc(hoyLargo()) + '</div></div>';

        var datos = '<div class="doc-grid">' +
            '<div><span>Paciente:</span> <b>' + esc(o.paciente) + '</b></div>' +
            '<div><span>Doctor/a:</span> <b>' + esc(o.doctor) + '</b></div>' +
            '<div><span>Alergias:</span> <b>' + esc(o.alergias || 'No conocidas') + '</b></div>' +
            '<div><span>Nº colegiado:</span> <b>' + esc(o.colegiado || '—') + '</b></div>' +
            '</div>';

        var cuerpo = '';
        if (o.tipo === 'receta') {
            cuerpo = '<div class="doc-sec"><h4>Prescripción</h4><table class="doc-meds">' +
                '<thead><tr><th>Medicamento</th><th>Dosis</th><th>Pauta</th><th>Duración</th></tr></thead><tbody>' +
                o.meds.map(function (m) { return '<tr><td>' + esc(m.n) + '</td><td>' + esc(m.d) + '</td><td>' + esc(m.p) + '</td><td>' + esc(m.t) + '</td></tr>'; }).join('') +
                '</tbody></table>' + (o.alergias && o.alergias.toLowerCase().indexOf('ninguna') !== 0 ?
                '<div class="doc-warn"><b>⚠ Alergias declaradas:</b> ' + esc(o.alergias) + '. Prescripción revisada y compatible.</div>' : '') + '</div>' +
                (o.indicaciones ? '<div class="doc-sec"><h4>Indicaciones</h4><p>' + esc(o.indicaciones) + '</p></div>' : '');
        } else if (o.tipo === 'informe') {
            cuerpo = (o.motivo ? '<div class="doc-sec"><h4>Motivo de consulta</h4><p>' + esc(o.motivo) + '</p></div>' : '') +
                (o.exploracion ? '<div class="doc-sec"><h4>Exploración</h4><p>' + esc(o.exploracion) + '</p></div>' : '') +
                (o.odonto ? '<div class="doc-sec"><h4>Hallazgos del odontograma</h4><p>' + esc(o.odonto) + '</p></div>' : '') +
                (o.diagnostico ? '<div class="doc-sec"><h4>Diagnóstico</h4><p>' + esc(o.diagnostico) + '</p></div>' : '') +
                (o.tratamiento ? '<div class="doc-sec"><h4>Tratamiento realizado / propuesto</h4><p>' + esc(o.tratamiento) + '</p></div>' : '') +
                (o.meds && o.meds.length ? '<div class="doc-sec"><h4>Medicación pautada</h4><table class="doc-meds"><tbody>' +
                    o.meds.map(function (m) { return '<tr><td>' + esc(m.n) + '</td><td>' + esc(m.d) + ' ' + esc(m.p) + ' · ' + esc(m.t) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '');
        } else if (o.tipo === 'presupuesto') {
            var sub = o.lineas.reduce(function (a, l) { return a + l.u * l.p; }, 0);
            var dto = sub * (o.dto || 0) / 100, tot = sub - dto;
            cuerpo = '<div class="doc-sec"><h4>Tratamiento propuesto</h4><table class="doc-meds">' +
                '<thead><tr><th>Concepto</th><th style="text-align:center">Uds.</th><th style="text-align:right">Precio</th><th style="text-align:right">Importe</th></tr></thead><tbody>' +
                o.lineas.map(function (l) {
                    return '<tr><td>' + esc(l.c) + '</td><td style="text-align:center;font-weight:400">' + l.u + '</td>' +
                        '<td style="text-align:right">' + money(l.p) + '</td><td style="text-align:right">' + money(l.u * l.p) + '</td></tr>';
                }).join('') + '</tbody></table>' +
                '<div style="margin-top:.8rem;margin-left:auto;max-width:280px">' +
                '<div class="doc-tot"><span>Subtotal</span><span>' + money(sub) + '</span></div>' +
                (o.dto ? '<div class="doc-tot"><span>Descuento (' + o.dto + '%)</span><span>−' + money(dto) + '</span></div>' : '') +
                '<div class="doc-tot grand"><span>TOTAL</span><span>' + money(tot) + '</span></div></div>' +
                '<div class="doc-warn" style="background:#e0f2fe;border-color:#0369a1;color:#0c4a6e">' +
                '<b>Validez:</b> 30 días desde la fecha de emisión. Los precios incluyen materiales y revisiones de control. ' +
                'Consulta las <b>facilidades de pago</b> disponibles.</div></div>' +
                (o.observaciones ? '<div class="doc-sec"><h4>Observaciones</h4><p>' + esc(o.observaciones) + '</p></div>' : '') +
                '<div class="doc-sec"><h4>Aceptación del paciente</h4>' +
                '<p class="mini">Firmando este documento acepto el plan de tratamiento y el presupuesto detallado.</p>' +
                '<div style="display:flex;gap:2rem;margin-top:1.2rem"><div style="flex:1;border-top:1px solid #10202f;padding-top:.3rem;font-size:.78rem">Firma del paciente</div>' +
                '<div style="flex:1;border-top:1px solid #10202f;padding-top:.3rem;font-size:.78rem">Fecha</div></div></div>';
        } else {
            cuerpo = '<div class="doc-sec"><p>Se certifica que <b>' + esc(o.paciente) + '</b> ha acudido a consulta odontológica en este centro el día <b>' +
                esc(o.fechaCita || hoyLargo()) + '</b>' + (o.horaCita ? ', en horario de <b>' + esc(o.horaCita) + '</b>' : '') + '.</p>' +
                (o.observaciones ? '<p>' + esc(o.observaciones) + '</p>' : '') +
                '<p>Se expide el presente justificante a petición del interesado, a los efectos oportunos.</p></div>';
        }

        var firma = '<div class="doc-sign"><div></div><div class="sig"><div class="line"></div>' +
            '<b>' + esc(o.doctor) + '</b><span>Nº colegiado ' + esc(o.colegiado || '—') + '</span></div></div>';

        var pie = '<div class="doc-foot">' + esc(c.name) + ' · ' + esc(c.address) + ' · Documento generado electrónicamente el ' + esc(hoyLargo()) + '</div>';

        return cab + '<h2 class="doc-title">' + esc(o.titulo) + '</h2>' + datos + cuerpo + firma + pie;
    }

    /* ---------- Impresión aislada (iframe: sin popups bloqueados) ---------- */
    function imprimir(html, titulo) {
        var old = document.getElementById('rx-print-frame'); if (old) old.remove();
        var f = document.createElement('iframe'); f.id = 'rx-print-frame';
        f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
        document.body.appendChild(f);
        var css = [].slice.call(document.querySelectorAll('link[rel="stylesheet"]')).map(function (l) { return '<link rel="stylesheet" href="' + l.href + '">'; }).join('');
        var d = f.contentWindow.document;
        d.open();
        d.write('<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>' + esc(titulo) + '</title>' + css +
            '<style>body{margin:0;background:#fff}.doc-paper{max-height:none;border:0;box-shadow:none;padding:14mm 16mm;overflow:visible}' +
            '@page{size:A4;margin:0}</style></head><body><div class="doc-paper">' + html + '</div></body></html>');
        d.close();
        setTimeout(function () { f.contentWindow.focus(); f.contentWindow.print(); }, 450);
    }

    /* ---------- Sugerencia encadenada de documentos ---------- */
    var META = {
        receta:       { t: 'Receta médica',            icon: 'fa-prescription',    por: 'con la medicación de esta visita' },
        informe:      { t: 'Informe clínico',          icon: 'fa-file-medical',    por: 'con diagnóstico y hallazgos, para el paciente o su seguro' },
        presupuesto:  { t: 'Presupuesto',              icon: 'fa-file-invoice-dollar', por: 'cotización detallada del tratamiento propuesto' },
        justificante: { t: 'Justificante de asistencia', icon: 'fa-file-signature', por: 'para presentar en el trabajo o centro de estudios' }
    };
    R._hechos = {};                       // { 'Paciente': {receta:true, ...} }
    function sugerirSiguiente(tipoHecho) {
        var ctx = R._ctx || {}; var pac = ctx.paciente || '';
        R._hechos[pac] = R._hechos[pac] || {};
        R._hechos[pac][tipoHecho] = true;
        var faltan = Object.keys(META).filter(function (k) { return !R._hechos[pac][k]; });
        if (!faltan.length) return;
        var mb = document.getElementById('rx-next');
        if (!mb) {
            mb = document.createElement('div'); mb.className = 'modal-back'; mb.id = 'rx-next';
            mb.innerHTML = '<div class="modal" style="max-width:460px" id="rx-next-inner"></div>';
            document.body.appendChild(mb);
        }
        document.getElementById('rx-next-inner').innerHTML =
            '<div style="text-align:center"><div class="rx-done"><i class="fa-solid fa-check"></i></div>' +
            '<h3 style="margin:.7rem 0 .2rem">' + META[tipoHecho].t + ' generada</h3>' +
            '<p class="text-muted" style="font-size:.9rem">Para <b>' + esc(pac) + '</b>. ¿Necesitas algún documento más de esta visita?</p></div>' +
            '<div class="rx-next-list">' + faltan.map(function (k) {
                return '<button type="button" class="rx-type" data-next="' + k + '"><i class="fa-solid ' + META[k].icon + '"></i>' +
                    '<span><b>' + META[k].t + '</b><span>' + META[k].por + '</span></span>' +
                    '<i class="fa-solid fa-arrow-right" style="margin-left:auto;background:none;color:var(--c-muted);width:auto"></i></button>';
            }).join('') + '</div>' +
            '<button class="btn btn-ghost btn-block" id="rx-next-no" style="margin-top:.8rem">No, ya está todo</button>';
        document.querySelectorAll('#rx-next-inner [data-next]').forEach(function (b) {
            b.onclick = function () { Modal.close('rx-next'); R.open(Object.assign({}, R._ctx, { tipo: b.dataset.next })); };
        });
        document.getElementById('rx-next-no').onclick = function () { Modal.close('rx-next'); };
        Modal.open('rx-next');
    }

    /* ---------- Vista previa ---------- */
    function preview(o) {
        var html = docHTML(o);
        var mb = document.getElementById('doc-modal');
        if (!mb) {
            mb = document.createElement('div'); mb.className = 'modal-back doc-modal'; mb.id = 'doc-modal';
            mb.innerHTML = '<div class="modal"><h3 id="doc-h"></h3><div class="doc-paper" id="doc-body"></div>' +
                '<div class="doc-actions"><button class="btn btn-ghost" id="doc-back">Volver a editar</button>' +
                '<button class="btn btn-ghost" id="doc-close">Cerrar</button>' +
                '<button class="btn btn-primary" id="doc-print"><i class="fa-solid fa-print"></i> Imprimir / PDF</button></div></div>';
            document.body.appendChild(mb);
        }
        document.getElementById('doc-h').innerHTML = '<i class="fa-solid fa-file-medical" style="color:var(--c-primary)"></i> Vista previa · ' + esc(o.titulo);
        document.getElementById('doc-body').innerHTML = html;
        document.getElementById('doc-print').onclick = function () {
            imprimir(html, o.titulo + ' · ' + o.paciente);
            setTimeout(function () { Modal.close('doc-modal'); sugerirSiguiente(o.tipo); }, 900);
        };
        document.getElementById('doc-close').onclick = function () { Modal.close('doc-modal'); sugerirSiguiente(o.tipo); };
        document.getElementById('doc-back').onclick = function () { Modal.close('doc-modal'); Modal.open('rx-modal'); };
        Modal.close('rx-modal'); Modal.open('doc-modal');
    }

    /* ---------- Compositor ---------- */
    R.open = function (ctx) {
        ctx = ctx || {};
        R._ctx = ctx;                       // para encadenar documentos del mismo paciente
        var tipo = ctx.tipo || 'receta';
        var meds = [];

        var mb = document.getElementById('rx-modal');
        if (!mb) {
            mb = document.createElement('div'); mb.className = 'modal-back'; mb.id = 'rx-modal';
            mb.innerHTML = '<div class="modal" style="max-width:720px;max-height:90vh;overflow:auto" id="rx-inner"></div>';
            document.body.appendChild(mb);
        }
        var m = document.getElementById('rx-inner');
        m.innerHTML =
            '<h3><i class="fa-solid fa-file-prescription" style="color:var(--c-primary)"></i> Documentos clínicos</h3>' +
            '<p class="text-muted" style="margin-top:-.4rem">Para <b>' + esc(ctx.paciente) + '</b> · se rellenan solos el folio, la fecha y los datos.</p>' +

            '<div class="rx-types">' +
              '<button type="button" class="rx-type on" data-t="receta"><i class="fa-solid fa-prescription"></i><span><b>Receta</b><span>Medicación</span></span></button>' +
              '<button type="button" class="rx-type" data-t="informe"><i class="fa-solid fa-file-medical"></i><span><b>Informe médico</b><span>Diagnóstico</span></span></button>' +
              '<button type="button" class="rx-type" data-t="presupuesto"><i class="fa-solid fa-file-invoice-dollar"></i><span><b>Presupuesto</b><span>Cotización</span></span></button>' +
              '<button type="button" class="rx-type" data-t="justificante"><i class="fa-solid fa-file-signature"></i><span><b>Justificante</b><span>Asistencia</span></span></button>' +
            '</div>' +

            '<div id="rx-alert"></div>' +

            '<div id="rx-receta">' +
              '<label class="text-muted" style="font-size:.8rem;font-weight:600">Plantillas rápidas</label>' +
              '<div class="rx-tpl">' + Object.keys(TPL).map(function (k) {
                  return '<button type="button" data-tpl="' + k + '"><i class="fa-solid ' + TPL[k].icon + '"></i> ' + TPL[k].label + '</button>';
              }).join('') + '</div>' +
              '<div class="rx-medhead"><span>Medicamento</span><span>Dosis</span><span>Pauta</span><span>Duración</span><span></span></div>' +
              '<div id="rx-meds"></div>' +
              '<button type="button" class="btn btn-ghost btn-sm" id="rx-add"><i class="fa-solid fa-plus"></i> Añadir medicamento</button>' +
              '<div class="field" style="margin-top:.8rem"><label for="rx-ind">Indicaciones al paciente</label>' +
              '<textarea id="rx-ind" class="input" style="min-height:90px" placeholder="Cuidados, dieta, higiene…"></textarea></div>' +
            '</div>' +

            '<div id="rx-informe" style="display:none">' +
              '<div class="field"><label for="in-motivo">Motivo de consulta</label><input id="in-motivo" class="input"></div>' +
              '<div class="field"><label for="in-expl">Exploración</label><textarea id="in-expl" class="input" style="min-height:70px"></textarea></div>' +
              '<div class="field"><label for="in-diag">Diagnóstico</label><textarea id="in-diag" class="input" style="min-height:70px"></textarea></div>' +
              '<div class="field"><label for="in-trat">Tratamiento realizado / propuesto</label><textarea id="in-trat" class="input" style="min-height:70px"></textarea></div>' +
              '<label class="flex items-center" style="gap:.5rem;font-size:.88rem"><input type="checkbox" id="in-odo" checked> Incluir hallazgos del odontograma</label>' +
            '</div>' +

            '<div id="rx-presu" style="display:none">' +
              '<label class="text-muted" style="font-size:.8rem;font-weight:600">Añadir del catálogo</label>' +
              '<div class="rx-tpl">' + (window.DEMO ? (DEMO.treatments || []) : []).map(function (t) {
                  return '<button type="button" data-cat="' + t.id + '">+ ' + t.name.split(' (')[0] + ' · $' + t.precio + '</button>';
              }).join('') + '</div>' +
              '<div class="bud-head"><span>Concepto</span><span>Uds.</span><span>Precio</span><span></span></div>' +
              '<div id="rx-lineas"></div>' +
              '<button type="button" class="btn btn-ghost btn-sm" id="rx-addline"><i class="fa-solid fa-plus"></i> Añadir concepto</button>' +
              '<div class="grid" style="grid-template-columns:1fr 1fr;margin-top:.8rem">' +
                '<div class="field"><label for="rx-dto">Descuento (%)</label><input type="number" id="rx-dto" class="input" min="0" max="100" value="0" data-validate="num"></div>' +
                '<div class="field"><label>Total estimado</label><div class="input" id="rx-total" style="display:flex;align-items:center;font-weight:800">$0,00</div></div>' +
              '</div>' +
              '<div class="field"><label for="rx-obs">Observaciones</label><input id="rx-obs" class="input" placeholder="Ej.: incluye 2 revisiones de control"></div>' +
            '</div>' +

            '<div id="rx-justif" style="display:none">' +
              '<div class="field"><label for="ju-obs">Observaciones (opcional)</label><input id="ju-obs" class="input" placeholder="Ej.: precisa reposo el resto de la jornada"></div>' +
              '<p class="text-muted" style="font-size:.84rem"><i class="fa-solid fa-wand-magic-sparkles"></i> La fecha y la hora de la cita se toman automáticamente.</p>' +
            '</div>' +

            '<div class="flex justify-between" style="margin-top:1rem">' +
              '<button class="btn btn-ghost" id="rx-cancel">Cancelar</button>' +
              '<button class="btn btn-primary" id="rx-prev"><i class="fa-solid fa-eye"></i> Generar documento</button>' +
            '</div>';

        /* --- medicación --- */
        function drawMeds() {
            document.getElementById('rx-meds').innerHTML = meds.map(function (x, i) {
                return '<div class="rx-med"><input class="input" data-f="n" data-i="' + i + '" value="' + esc(x.n) + '" placeholder="Medicamento">' +
                    '<input class="input" data-f="d" data-i="' + i + '" value="' + esc(x.d) + '" placeholder="Dosis">' +
                    '<input class="input" data-f="p" data-i="' + i + '" value="' + esc(x.p) + '" placeholder="Pauta">' +
                    '<input class="input" data-f="t" data-i="' + i + '" value="' + esc(x.t) + '" placeholder="Duración">' +
                    '<button type="button" class="rx-del" data-del="' + i + '" aria-label="Quitar"><i class="fa-solid fa-trash"></i></button></div>';
            }).join('');
            document.querySelectorAll('#rx-meds [data-f]').forEach(function (inp) {
                inp.oninput = function () { meds[+inp.dataset.i][inp.dataset.f] = inp.value; if (inp.dataset.f === 'n') checkAlergias(); };
            });
            document.querySelectorAll('#rx-meds [data-del]').forEach(function (b) {
                b.onclick = function () { meds.splice(+b.dataset.del, 1); drawMeds(); checkAlergias(); };
            });
            checkAlergias();
        }
        function checkAlergias() {
            var box = document.getElementById('rx-alert');
            var cs = conflictos(ctx.ficha && ctx.ficha.alergias, meds);
            if (!cs.length) { box.innerHTML = ''; return; }
            box.innerHTML = cs.map(function (c, i) {
                return '<div class="rx-alert"><i class="fa-solid fa-triangle-exclamation"></i><div>' +
                    '<b>Conflicto con la alergia del paciente</b>' +
                    esc(ctx.paciente) + ' es alérgic@ a <b>' + esc(c.grupo.nombre) + '</b> y has prescrito: ' +
                    c.meds.map(function (m) { return '<b>' + esc(m.n) + '</b>'; }).join(', ') + '.' +
                    '<button type="button" data-fix="' + i + '"><i class="fa-solid fa-wand-magic-sparkles"></i> Sustituir por ' + esc(c.grupo.alt[0].n) + '</button>' +
                    '</div></div>';
            }).join('');
            box.querySelectorAll('[data-fix]').forEach(function (b) {
                b.onclick = function () {
                    var c = cs[+b.dataset.fix];
                    meds = meds.filter(function (m) { return !c.grupo.match.test(m.n); }).concat(c.grupo.alt.map(function (a) { return Object.assign({}, a); }));
                    drawMeds(); Toast.show('Medicación sustituida por una alternativa segura.', 'ok');
                };
            });
        }
        function applyTpl(k) {
            meds = TPL[k].meds.map(function (m) { return Object.assign({}, m); });
            document.getElementById('rx-ind').value = TPL[k].ind;
            drawMeds();
            Toast.show('Plantilla «' + TPL[k].label + '» aplicada.', 'ok');
        }
        m.querySelectorAll('[data-tpl]').forEach(function (b) { b.onclick = function () { applyTpl(b.dataset.tpl); }; });
        document.getElementById('rx-add').onclick = function () { meds.push({ n: '', d: '', p: '', t: '' }); drawMeds(); };

        /* --- tipo de documento --- */
        function setTipo(t) {
            tipo = t;
            m.querySelectorAll('.rx-type').forEach(function (x) { x.classList.toggle('on', x.dataset.t === t); });
            document.getElementById('rx-receta').style.display = t === 'receta' ? 'block' : 'none';
            document.getElementById('rx-informe').style.display = t === 'informe' ? 'block' : 'none';
            document.getElementById('rx-presu').style.display = t === 'presupuesto' ? 'block' : 'none';
            document.getElementById('rx-justif').style.display = t === 'justificante' ? 'block' : 'none';
        }

        /* --- presupuesto: líneas --- */
        var lineas = [];
        function totalPresu() {
            var sub = lineas.reduce(function (a, l) { return a + (+l.u || 0) * (+l.p || 0); }, 0);
            var dto = sub * ((+document.getElementById('rx-dto').value || 0) / 100);
            document.getElementById('rx-total').textContent = money(sub - dto);
        }
        function drawLineas() {
            document.getElementById('rx-lineas').innerHTML = lineas.map(function (l, i) {
                return '<div class="bud-row"><input class="input" data-b="c" data-i="' + i + '" value="' + esc(l.c) + '" placeholder="Concepto">' +
                    '<input class="input" type="number" min="1" data-b="u" data-i="' + i + '" value="' + l.u + '">' +
                    '<input class="input" type="number" min="0" step="0.01" data-b="p" data-i="' + i + '" value="' + l.p + '">' +
                    '<button type="button" class="rx-del" data-bdel="' + i + '" aria-label="Quitar"><i class="fa-solid fa-trash"></i></button></div>';
            }).join('');
            document.querySelectorAll('#rx-lineas [data-b]').forEach(function (inp) {
                inp.oninput = function () { lineas[+inp.dataset.i][inp.dataset.b] = inp.dataset.b === 'c' ? inp.value : +inp.value; totalPresu(); };
            });
            document.querySelectorAll('#rx-lineas [data-bdel]').forEach(function (b) {
                b.onclick = function () { lineas.splice(+b.dataset.bdel, 1); drawLineas(); };
            });
            totalPresu();
        }
        m.querySelectorAll('[data-cat]').forEach(function (b) {
            b.onclick = function () {
                var t = (window.DEMO.treatments || []).filter(function (x) { return x.id === +b.dataset.cat; })[0];
                if (t) { lineas.push({ c: t.name, u: 1, p: t.precio }); drawLineas(); }
            };
        });
        document.getElementById('rx-addline').onclick = function () { lineas.push({ c: '', u: 1, p: 0 }); drawLineas(); };
        document.getElementById('rx-dto').addEventListener('input', totalPresu);
        if (ctx.tratamiento) { var t0 = (window.DEMO.treatments || []).filter(function (x) { return ctx.tratamiento.indexOf(x.name) === 0; })[0]; if (t0) lineas.push({ c: t0.name, u: 1, p: t0.precio }); }
        drawLineas();
        m.querySelectorAll('.rx-type').forEach(function (b) { b.onclick = function () { setTipo(b.dataset.t); }; });
        setTipo(tipo);

        /* --- autorrelleno inicial según el tratamiento de la cita --- */
        var t = (ctx.tratamiento || '').toLowerCase();
        if (t.indexOf('empaste') >= 0 || t.indexOf('implante') >= 0 || t.indexOf('extrac') >= 0) applyTpl('extraccion');
        else if (t.indexOf('limpieza') >= 0 || t.indexOf('higiene') >= 0) applyTpl('higiene');
        else if (t.indexOf('blanque') >= 0) applyTpl('sensibilidad');
        else drawMeds();

        if (ctx.tratamiento) {
            document.getElementById('in-motivo').value = ctx.tratamiento;
            document.getElementById('in-trat').value = ctx.tratamiento + ' realizado sin incidencias.';
        }

        document.getElementById('rx-cancel').onclick = function () { Modal.close('rx-modal'); };
        document.getElementById('rx-prev').onclick = function () {
            var base = {
                tipo: tipo, paciente: ctx.paciente, doctor: ctx.doctor, colegiado: ctx.colegiado,
                alergias: (ctx.ficha && ctx.ficha.alergias) || 'No conocidas'
            };
            if (tipo === 'receta') {
                var validos = meds.filter(function (x) { return x.n.trim(); });
                if (!validos.length) { Toast.show('Añade al menos un medicamento.', 'err'); return; }
                if (conflictos(base.alergias, validos).length && !window.confirm('Hay un conflicto de alergia sin resolver. ¿Generar la receta igualmente?')) return;
                base.titulo = 'Receta médica'; base.folio = folio('RX');
                base.meds = validos; base.indicaciones = document.getElementById('rx-ind').value.trim();
            } else if (tipo === 'informe') {
                base.titulo = 'Informe clínico'; base.folio = folio('IN');
                base.motivo = document.getElementById('in-motivo').value.trim();
                base.exploracion = document.getElementById('in-expl').value.trim();
                base.diagnostico = document.getElementById('in-diag').value.trim();
                base.tratamiento = document.getElementById('in-trat').value.trim();
                base.meds = meds.filter(function (x) { return x.n.trim(); });
                if (document.getElementById('in-odo').checked) base.odonto = R.resumenOdonto(ctx.odonto);
                if (!base.motivo && !base.diagnostico) { Toast.show('Indica al menos el motivo o el diagnóstico.', 'err'); return; }
            } else if (tipo === 'presupuesto') {
                var val = lineas.filter(function (l) { return l.c.trim() && l.p > 0; });
                if (!val.length) { Toast.show('Añade al menos un concepto con precio.', 'err'); return; }
                base.titulo = 'Presupuesto'; base.folio = folio('PR');
                base.lineas = val; base.dto = +document.getElementById('rx-dto').value || 0;
                base.observaciones = document.getElementById('rx-obs').value.trim();
            } else {
                base.titulo = 'Justificante de asistencia'; base.folio = folio('JU');
                base.fechaCita = ctx.fechaCita || hoyLargo(); base.horaCita = ctx.horaCita || '';
                base.observaciones = document.getElementById('ju-obs').value.trim();
            }
            preview(base);
        };

        Modal.open('rx-modal');
    };

    /* Resumen textual del odontograma para el informe */
    R.resumenOdonto = function (odo) {
        if (!odo) return '';
        var g = {};
        Object.keys(odo).forEach(function (n) { if (odo[n] && odo[n] !== 'sano') { (g[odo[n]] = g[odo[n]] || []).push(n); } });
        var NOM = { caries: 'Caries', empaste: 'Obturaciones previas', corona: 'Coronas', ausente: 'Ausencias' };
        var out = Object.keys(g).map(function (k) { return (NOM[k] || k) + ' en piezas ' + g[k].sort().join(', '); });
        return out.length ? out.join('. ') + '.' : 'Sin hallazgos reseñables en el odontograma.';
    };
})();
