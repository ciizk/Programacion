/* =====================================================================
   Clínica Dental · Calendario semanal reutilizable (sin dependencias)
   Uso: ClinicCalendar({ el, events:[{fecha,ini,fin,title,sub,estado}], skeleton })
   Clic/Enter en una cita = detalle. Swipe lateral / ‹ Hoy › = cambiar semana.
   ===================================================================== */
window.ClinicCalendar = function (opts) {
    var el = opts.el;
    var events = opts.events || [];
    var cfg = (window.DEMO && DEMO.settings) || {};
    var startH = opts.startHour || (cfg.maniana ? cfg.maniana.desde : 8);
    var endH   = opts.endHour   || (cfg.tarde ? cfg.tarde.hasta + 1 : 18);
    var HH = 44, DAYS = 6;
    /* Permisos: un doctor solo ve SU agenda; dirección y secretaría ven todas. */
    var soloDoctor = opts.soloDoctor || null;
    var DOWN = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    var LBL = { programada: 'Programada', confirmada: 'Confirmada', completada: 'Completada', cancelada: 'Cancelada', no_asistio: 'No asistió' };

    function pad(n) { return String(n).padStart(2, '0'); }
    function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
    function mondayOf(d) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
    function toMin(hhmm) { var p = String(hhmm).split(':'); return (+p[0]) * 60 + (+p[1]); }
    function addMin(hhmm, m) { var t = toMin(hhmm) + m; return pad(Math.floor(t / 60)) + ':' + pad(t % 60); }

    var todayISO = (window.DEMO && window.DEMO.today) || iso(new Date());
    var monday = mondayOf(opts.weekOf ? window.parseISO(opts.weekOf) : (window.DEMO ? window.parseISO(todayISO) : new Date()));
    var pop = null;

    /* ----- Popover de detalle ----- */
    function closePop() { if (pop) { pop.remove(); pop = null; document.removeEventListener('click', onDoc, true); } }
    function onDoc(e) { if (pop && !pop.contains(e.target) && !e.target.classList.contains('cal-ev')) closePop(); }
    function showPop(ev, anchor) {
        closePop();
        pop = document.createElement('div'); pop.className = 'cal-pop';
        pop.innerHTML = '<button class="cp-close" aria-label="Cerrar">✕</button>' +
            '<h5><i class="fa-solid fa-user"></i> ' + ev.title + '</h5>' +
            '<div class="cp-time"><i class="fa-regular fa-clock"></i> ' + window.fmtFecha(ev.fecha) + ' · ' + ev.ini + (ev.fin ? '–' + ev.fin : '') + '</div>' +
            (ev.sub ? '<div class="cp-row"><i class="fa-solid fa-tooth" style="color:var(--c-muted)"></i> ' + ev.sub + '</div>' : '') +
            '<div class="cp-row" style="margin-top:.4rem">' + (window.badge ? window.badge(ev.estado) : (LBL[ev.estado] || ev.estado)) + '</div>';
        document.body.appendChild(pop);
        var r = anchor.getBoundingClientRect();
        var left = r.right + 8; if (left + 240 > window.innerWidth) left = r.left - 248; if (left < 8) left = 8;
        var top = Math.min(r.top, window.innerHeight - 150);
        pop.style.top = Math.max(8, top) + 'px'; pop.style.left = left + 'px';
        pop.querySelector('.cp-close').onclick = closePop;
        setTimeout(function () { document.addEventListener('click', onDoc, true); }, 0);
    }

    /* ---------- Vista DÍA: una columna por doctor ---------- */
    var modo = 'semana', diaSel = todayISO, docFiltro = soloDoctor || '';
    function doctoresDelDia(di) {
        if (soloDoctor) return [soloDoctor];                    // el doctor solo se ve a sí mismo
        var d = (window.DEMO && DEMO.doctors) ? DEMO.doctors.map(function (x) { return x.name; }) : [];
        var conCitas = events.filter(function (e) { return e.fecha === di && e.doctor; }).map(function (e) { return e.doctor; });
        var lista = d.filter(function (n) { return conCitas.indexOf(n) >= 0; });
        return lista.length ? lista : (d.length ? d.slice(0, 3) : ['Consulta']);
    }
    function renderDia(host) {
        var docs = doctoresDelDia(diaSel).filter(function (n) { return !docFiltro || n === docFiltro; });
        var d = window.parseISO ? parseISO(diaSel) : new Date();
        var titulo = DOWN[(d.getDay() + 6) % 7] + ' ' + d.getDate() + ' ' + window.mesCorto(d.getMonth()) + ' ' + d.getFullYear();
        var gutter = '';
        for (var h = startH; h < endH; h++) gutter += '<div class="cal-hour">' + h + ':00</div>';
        var cols = '', map = {}, ei = 0;
        docs.forEach(function (nom) {
            var blocks = events.filter(function (e) { return e.fecha === diaSel && (e.doctor === nom || (!e.doctor && docs.length === 1)); }).map(function (e) {
                var fin = e.fin || addMin(e.ini, 30);
                var top = Math.max(0, Math.min((toMin(e.ini) - startH * 60) / 60 * HH, (endH - startH) * HH - 20));
                var hgt = Math.max(22, (toMin(fin) - toMin(e.ini)) / 60 * HH);
                map[ei] = e;
                return '<div class="cal-ev ' + e.estado + '" role="button" tabindex="0" data-ei="' + (ei++) + '" style="top:' + top + 'px;height:' + hgt + 'px">' +
                    '<b>' + e.ini + ' ' + e.title + '</b><span>' + (e.sub || '') + '</span></div>';
            }).join('');
            cols += '<div class="cal-day" style="height:' + (endH - startH) * HH + 'px">' + blocks + '</div>';
        });
        var heads = docs.map(function (n) {
            var ini = n.replace(/^Dra?\.\s*/, '').split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();
            return '<div class="cal-dhead doc"><span class="cal-doc-av">' + ini + '</span>' + n.replace(/^Dra?\.\s*/, '') + '</div>';
        }).join('');
        var grid = 'grid-template-columns:52px repeat(' + docs.length + ', minmax(120px,1fr))';
        host.innerHTML =
            '<div class="cal-scroll"><div class="cal-head" style="' + grid + '"><div></div>' + heads + '</div>' +
            '<div class="cal-body" style="' + grid + '"><div class="cal-gutter">' + gutter + '</div>' + cols + '</div></div>';
        host.querySelectorAll('.cal-ev').forEach(function (b) {
            b.addEventListener('click', function (e) { e.stopPropagation(); showPop(map[b.dataset.ei], b); });
            b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showPop(map[b.dataset.ei], b); } });
        });
        return titulo;
    }

    function render() {
        closePop();
        var end = addDays(monday, DAYS - 1);
        var title = monday.getDate() + ' ' + window.mesCorto(monday.getMonth()) + ' – ' + end.getDate() + ' ' + window.mesCorto(end.getMonth()) + ' ' + end.getFullYear();
        var head = '<div></div>', gutter = '', map = {};
        for (var h = startH; h < endH; h++) gutter += '<div class="cal-hour">' + h + ':00</div>';
        var body = '<div class="cal-gutter">' + gutter + '</div>', ei = 0;

        for (var i = 0; i < DAYS; i++) {
            var d = addDays(monday, i), di = iso(d), isToday = di === todayISO;
            head += '<div class="cal-dhead' + (isToday ? ' today' : '') + '">' + DOWN[i] + '<b>' + d.getDate() + '</b></div>';
            var blocks = events.filter(function (e) { return e.fecha === di && (!docFiltro || e.doctor === docFiltro); }).map(function (e) {
                var fin = e.fin || addMin(e.ini, 30);
                var top = (toMin(e.ini) - startH * 60) / 60 * HH;
                var hgt = Math.max(22, (toMin(fin) - toMin(e.ini)) / 60 * HH);
                top = Math.max(0, Math.min(top, (endH - startH) * HH - 20));
                map[ei] = e;
                return '<div class="cal-ev ' + e.estado + '" role="button" tabindex="0" data-ei="' + (ei++) + '" style="top:' + top + 'px;height:' + hgt + 'px">' +
                    '<b>' + e.ini + ' ' + e.title + '</b><span>' + (e.sub || '') + '</span></div>';
            }).join('');
            body += '<div class="cal-day' + (isToday ? ' today' : '') + '" style="height:' + (endH - startH) * HH + 'px">' + blocks + '</div>';
        }

        var docs = (window.DEMO && DEMO.doctors) ? DEMO.doctors : [];
        var controles =
            '<div class="cal-modes">' +
              '<button class="' + (modo === 'semana' ? 'on' : '') + '" data-modo="semana"><i class="fa-solid fa-calendar-week"></i> Semana</button>' +
              '<button class="' + (modo === 'dia' ? 'on' : '') + '" data-modo="dia"><i class="fa-solid fa-calendar-day"></i> Día</button>' +
            '</div>' +
            (soloDoctor
                ? '<span class="cal-solo"><i class="fa-solid fa-user-doctor"></i> ' + soloDoctor + '</span>'
                : (docs.length ? '<select class="input cal-doc" id="cal-doc" aria-label="Filtrar por doctor"><option value="">Todos los doctores</option>' +
                    docs.map(function (d) { return '<option' + (docFiltro === d.name ? ' selected' : '') + '>' + d.name + '</option>'; }).join('') + '</select>' : ''));

        el.innerHTML =
            '<div class="cal">' +
                '<div class="cal-nav"><div class="cal-title" id="cal-title">' + title + '</div>' +
                '<div class="cal-btns">' + controles +
                    '<button class="btn btn-ghost btn-sm" data-cal="prev" aria-label="Anterior"><i class="fa-solid fa-chevron-left"></i></button>' +
                    '<button class="btn btn-ghost btn-sm" data-cal="today">Hoy</button>' +
                    '<button class="btn btn-ghost btn-sm" data-cal="next" aria-label="Siguiente"><i class="fa-solid fa-chevron-right"></i></button>' +
                '</div></div>' +
                '<div id="cal-cuerpo">' +
                  (modo === 'semana'
                    ? '<div class="cal-scroll"><div class="cal-head">' + head + '</div><div class="cal-body">' + body + '</div></div>'
                    : '') +
                '</div>' +
            '</div>' +
            '<div class="cal-legend"><span><span class="dot programada"></span>Programada</span>' +
            '<span><span class="dot confirmada"></span>Confirmada</span>' +
            '<span><span class="dot completada"></span>Completada</span>' +
            (modo === 'dia' ? '<span class="cal-hint"><i class="fa-solid fa-circle-info"></i> Una columna por doctor/a</span>' : '') + '</div>';

        if (modo === 'dia') {
            var t = renderDia(el.querySelector('#cal-cuerpo'));
            el.querySelector('#cal-title').textContent = t;
        }
        el.querySelectorAll('[data-modo]').forEach(function (b) {
            b.onclick = function () { modo = b.dataset.modo; if (modo === 'dia' && !diaSel) diaSel = todayISO; render(); };
        });
        var selDoc = el.querySelector('#cal-doc');
        if (selDoc) selDoc.onchange = function () { docFiltro = selDoc.value; render(); };

        function saltar(dir) {
            if (modo === 'dia') {
                var d = addDays(window.parseISO ? parseISO(diaSel) : new Date(), dir);
                while (d.getDay() === 0) d = addDays(d, dir);     // salta domingos
                diaSel = iso(d);
            } else monday = addDays(monday, dir * 7);
            render();
        }
        el.querySelector('[data-cal="prev"]').onclick = function () { saltar(-1); };
        el.querySelector('[data-cal="next"]').onclick = function () { saltar(1); };
        el.querySelector('[data-cal="today"]').onclick = function () {
            diaSel = todayISO; monday = mondayOf(window.parseISO ? parseISO(todayISO) : new Date()); render();
        };
        el.querySelectorAll('.cal-ev').forEach(function (b) {
            b.addEventListener('click', function (e) { e.stopPropagation(); showPop(map[b.dataset.ei], b); });
            b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showPop(map[b.dataset.ei], b); } });
        });

        // Swipe (solo si la rejilla no tiene scroll interno, para no interferir)
        var scroll = el.querySelector('.cal-scroll'), x0 = null;
        scroll.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
        scroll.addEventListener('touchend', function (e) {
            if (x0 === null || scroll.scrollWidth > scroll.clientWidth + 4) { x0 = null; return; }
            var dx = e.changedTouches[0].clientX - x0; x0 = null;
            if (Math.abs(dx) > 60) { monday = addDays(monday, dx < 0 ? 7 : -7); render(); }
        }, { passive: true });
    }

    if (opts.skeleton) { el.innerHTML = '<div class="skeleton sk-block" style="height:260px"></div>'; setTimeout(render, 320); }
    else render();
    return { render: render };
};
