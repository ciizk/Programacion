/* =====================================================================
   Clínica Dental · UI compartida (sin dependencias, funciona en file://)
   Se auto-inicializa: cada página solo incluye este script y usa las
   clases/ids correspondientes. Expone helpers globales (Toast, fmt…).
   ===================================================================== */
(function () {
    'use strict';

    /* ---------- Helpers ---------- */
    var MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    var DOW = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

    window.fmtFecha = function (iso) {
        var p = String(iso).split('-'); if (p.length !== 3) return iso;
        return p[2] + '/' + p[1] + '/' + p[0];
    };
    window.parseISO = function (iso) { var p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
    window.mesCorto = function (i) { return MES[i]; };
    window.dowCorto = function (d) { return DOW[d]; };

    // 1234.5 -> "$1.234,50" (formato es-VE: miles con punto, decimales con coma)
    window.fmtMoney = function (n) {
        var s = (Math.round((+n || 0) * 100) / 100).toFixed(2).split('.');
        s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return (window.DEMO && window.DEMO.currency || '$') + s[0] + ',' + s[1];
    };

    var ESTADOS = { programada: 'Programada', confirmada: 'Confirmada', completada: 'Completada', cancelada: 'Cancelada', no_asistio: 'No asistió' };
    window.badge = function (estado) {
        return '<span class="badge badge-' + estado + '">' + (ESTADOS[estado] || estado) + '</span>';
    };

    /* ---------- Toasts ---------- */
    window.Toast = {
        // Toast.show(msg, type, action?) — action = { label, fn } añade un botón (p.ej. Deshacer)
        show: function (msg, type, action) {
            var stack = document.querySelector('.toast-stack');
            if (!stack) { stack = document.createElement('div'); stack.className = 'toast-stack'; document.body.appendChild(stack); }
            var t = document.createElement('div');
            t.className = 'toast ' + (type || '');
            var ico = type === 'ok' ? 'fa-circle-check' : type === 'err' ? 'fa-circle-exclamation' : 'fa-circle-info';
            var html = '<i class="fa-solid ' + ico + '"></i><div style="flex:1">' + msg + '</div>';
            if (action) html += '<button class="toast-action" type="button">' + action.label + '</button>';
            t.innerHTML = html;
            stack.appendChild(t);
            var done = false;
            function dismiss() { if (done) return; done = true; t.style.transition = 'opacity .3s, transform .3s'; t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; setTimeout(function () { t.remove(); }, 320); }
            var to = setTimeout(dismiss, action ? 6000 : 3200);
            if (action) t.querySelector('.toast-action').addEventListener('click', function () { clearTimeout(to); action.fn(); dismiss(); });
        }
    };

    /* ---------- Modal genérico ---------- */
    window.Modal = {
        open: function (id) { var m = document.getElementById(id); if (m) m.classList.add('open'); },
        close: function (id) { var m = document.getElementById(id); if (m) m.classList.remove('open'); }
    };

    document.addEventListener('DOMContentLoaded', function () {

        /* ----- Menú móvil landing ----- */
        var menuToggle = document.getElementById('menuToggle');
        var nav = document.getElementById('nav');
        if (menuToggle && nav) {
            menuToggle.addEventListener('click', function () { nav.classList.toggle('open'); });
            nav.querySelectorAll('.navlink').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });
        }

        /* ----- Barra de progreso de scroll ----- */
        var bar = document.querySelector('.scroll-progress');
        var toTop = document.querySelector('.to-top');
        function onScroll() {
            var h = document.documentElement;
            var scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
            if (bar) bar.style.width = (scrolled * 100) + '%';
            if (toTop) toTop.classList.toggle('show', h.scrollTop > 480);
        }
        if (bar || toTop) { window.addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
        if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

        /* ----- Scrollspy: resalta la sección actual en el nav ----- */
        var spyLinks = Array.prototype.slice.call(document.querySelectorAll('.nav .navlink[href^="#"]'));
        if (spyLinks.length && 'IntersectionObserver' in window) {
            var map = {};
            spyLinks.forEach(function (l) { var id = l.getAttribute('href').slice(1); if (id) map[id] = l; });
            var spy = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (en.isIntersecting) {
                        spyLinks.forEach(function (l) { l.classList.remove('active'); });
                        if (map[en.target.id]) map[en.target.id].classList.add('active');
                    }
                });
            }, { rootMargin: '-45% 0px -50% 0px' });
            Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
        }

        /* ----- Reveal on scroll ----- */
        var reveals = document.querySelectorAll('.reveal');
        if (reveals.length && 'IntersectionObserver' in window) {
            var rev = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); } });
            }, { threshold: 0.12 });
            reveals.forEach(function (r) { rev.observe(r); });
        } else { reveals.forEach(function (r) { r.classList.add('in'); }); }

        /* ----- Slider Antes/Después ----- */
        document.querySelectorAll('.ba-viewer').forEach(function (v) {
            var after = v.querySelector('.ba-after');
            var handle = v.querySelector('.ba-handle');
            var knob = v.querySelector('.ba-knob');
            function setPct(px) {
                var rect = v.getBoundingClientRect();
                var pct = Math.max(0, Math.min(100, ((px - rect.left) / rect.width) * 100));
                after.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
                handle.style.left = pct + '%'; knob.style.left = pct + '%';
            }
            var drag = false;
            function down(e) { drag = true; move(e); }
            function up() { drag = false; }
            function move(e) { if (!drag) return; var x = e.touches ? e.touches[0].clientX : e.clientX; setPct(x); e.preventDefault(); }
            v.addEventListener('mousedown', down); window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
            v.addEventListener('touchstart', down, { passive: false }); window.addEventListener('touchmove', move, { passive: false }); window.addEventListener('touchend', up);
        });

        /* ----- Drawer del panel (sidebar móvil) ----- */
        var sb = document.getElementById('sidebar');
        var bd = document.getElementById('backdrop');
        var hb = document.getElementById('hamburger');
        if (hb) hb.addEventListener('click', function () { sb.classList.toggle('open'); if (bd) bd.classList.toggle('open'); });
        if (bd) bd.addEventListener('click', function () { sb.classList.remove('open'); bd.classList.remove('open'); });

        /* ----- Cerrar modales al pulsar fuera / Esc ----- */
        document.querySelectorAll('.modal-back').forEach(function (m) {
            m.addEventListener('click', function (e) { if (e.target === m) m.classList.remove('open'); });
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') document.querySelectorAll('.modal-back.open').forEach(function (m) { m.classList.remove('open'); });
        });
    });
})();
