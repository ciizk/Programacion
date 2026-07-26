/* =====================================================================
   Clínica Dental · Capa UX compartida (sin dependencias, file:// friendly)
   Tema, paleta ⌘K, campana (con ir-a / marcar leída), perfil, tour por rol,
   máscaras, foco atrapado, nav inferior, export CSV/impresión, reset demo.
   ===================================================================== */
(function () {
    'use strict';
    var UX = window.UX = {};
    var K_THEME = 'dc_theme';

    /* ---------------- Tema claro / oscuro ---------------- */
    function systemDark() { return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches; }
    function savedTheme() { try { return localStorage.getItem(K_THEME); } catch (e) { return null; } }
    function apply(t) { document.documentElement.setAttribute('data-theme', t); }
    apply(savedTheme() || (systemDark() ? 'dark' : 'light'));
    function updateThemeIcons() {
        var dark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.querySelectorAll('[data-theme-icon]').forEach(function (i) {
            i.className = 'fa-solid ' + (dark ? 'fa-lightbulb' : 'fa-moon');
            if (i.parentNode && i.parentNode.setAttribute) i.parentNode.title = dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
        });
    }
    UX.setTheme = function (t) { apply(t); try { localStorage.setItem(K_THEME, t); } catch (e) {} updateThemeIcons(); };
    UX.toggleTheme = function () { UX.setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); };

    /* ---------------- Sesión (demo) ----------------
       Identidad del usuario para autorrellenar formularios y limitar
       lo que el asistente puede responder según el rol.               */
    var K_USER = 'dc_user';
    UX.session = function () { try { return JSON.parse(localStorage.getItem(K_USER) || 'null'); } catch (e) { return null; } };
    UX.setSession = function (u) { try { localStorage.setItem(K_USER, JSON.stringify(u)); } catch (e) {} };
    UX.clearSession = function () { try { localStorage.removeItem(K_USER); } catch (e) {} };
    function wireLogout() {
        document.querySelectorAll('.sidebar-foot a, [data-logout]').forEach(function (a) {
            a.addEventListener('click', function () { UX.clearSession(); });
        });
    }

    /* ---------------- Reiniciar demo ---------------- */
    UX.reset = function () {
        try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf('dc_') === 0 && k !== K_THEME) localStorage.removeItem(k); }); } catch (e) {}
        location.reload();
    };

    /* ---------------- Export CSV + impresión ---------------- */
    UX.downloadCSV = function (filename, rows) {
        var csv = rows.map(function (r) { return r.map(function (c) { c = String(c == null ? '' : c); return /[",\n;]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(';'); }).join('\r\n');
        var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
        document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); URL.revokeObjectURL(a.href); }, 100);
    };
    UX.print = function (title) {
        if (title) {
            var el = document.querySelector('.print-title');
            if (!el) { el = document.createElement('div'); el.className = 'print-title'; var pc = document.querySelector('.panel-content'); if (pc) pc.insertBefore(el, pc.firstChild); }
            el.textContent = title;
        }
        window.print();
    };

    /* ---------------- Skeletons ---------------- */
    UX.skeletonLines = function (n) { var s = ''; for (var i = 0; i < (n || 3); i++) s += '<div class="skeleton sk-line" style="width:' + (60 + Math.random() * 35).toFixed(0) + '%"></div>'; return s; };
    UX.withSkeleton = function (el, placeholder, render, delay) { el.innerHTML = placeholder; setTimeout(render, delay || 320); };

    /* ---------------- Máscara de teléfono ---------------- */
    function maskInit() {
        document.querySelectorAll('input[data-mask="tel"]').forEach(function (inp) {
            inp.addEventListener('input', function () {
                var plus = inp.value.replace(/^\s+/, '').charAt(0) === '+';
                var d = inp.value.replace(/\D/g, '').slice(0, 12);
                var groups = d.match(/.{1,3}/g);
                inp.value = (plus ? '+' : '') + (groups ? groups.join(' ') : '');
            });
        });
    }

    /* ---------------- Validación de formularios en vivo ----------------
       Marca los campos con data-validate="required|email|tel|num" y valida
       al salir del campo y mientras se corrige.                          */
    var REGLAS = {
        required: { test: function (v) { return v.trim().length > 0; }, msg: 'Este campo es obligatorio.' },
        email:    { test: function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()); }, msg: 'Escribe un email válido (nombre@dominio.com).' },
        tel:      { test: function (v) { return v.replace(/\D/g, '').length >= 9; }, msg: 'El teléfono necesita al menos 9 dígitos.' },
        num:      { test: function (v) { return v !== '' && !isNaN(+v) && +v >= 0; }, msg: 'Introduce un número válido.' },
        nombre:   { test: function (v) { return v.trim().length >= 2 && /^[^0-9]+$/.test(v); }, msg: 'Escribe un nombre válido (sin números).' }
    };
    UX.validarCampo = function (inp) {
        var tipos = (inp.dataset.validate || '').split('|').filter(Boolean);
        if (!tipos.length) return true;
        var field = inp.closest('.field') || inp.parentNode;
        var v = inp.value, ok = true, msg = '';
        // Un campo vacío no obligatorio no es un error
        if (!v.trim() && tipos.indexOf('required') < 0) { field.classList.remove('invalid', 'valid'); return true; }
        tipos.some(function (t) {
            var r = REGLAS[t];
            if (r && !r.test(v)) { ok = false; msg = r.msg; return true; }
            return false;
        });
        var err = field.querySelector('.field-err');
        if (!err) { err = document.createElement('span'); err.className = 'field-err'; field.appendChild(err); }
        err.textContent = msg;
        if (!field.querySelector('.ok-tick')) {
            var tick = document.createElement('i'); tick.className = 'fa-solid fa-check ok-tick'; field.appendChild(tick);
        }
        field.classList.toggle('invalid', !ok);
        field.classList.toggle('valid', ok && !!v.trim());
        return ok;
    };
    UX.initValidation = function (root) {
        (root || document).querySelectorAll('[data-validate]').forEach(function (inp) {
            if (inp.dataset.vwired) return; inp.dataset.vwired = '1';
            inp.addEventListener('blur', function () { UX.validarCampo(inp); });
            inp.addEventListener('input', function () {
                var f = inp.closest('.field') || inp.parentNode;
                if (f.classList.contains('invalid')) UX.validarCampo(inp);   // corrige en vivo
            });
        });
    };
    UX.validarTodo = function (root) {
        var ok = true, primero = null;
        (root || document).querySelectorAll('[data-validate]').forEach(function (inp) {
            if (!UX.validarCampo(inp)) { ok = false; primero = primero || inp; }
        });
        if (primero) { primero.focus(); Toast.show('Revisa los campos marcados en rojo.', 'err'); }
        return ok;
    };

    /* ---------------- Estado "ocupado" en acciones ----------------
       Evita el doble clic y da feedback mientras se guarda. */
    UX.busy = function (btn, texto) {
        if (!btn) return function () {};
        var original = btn.innerHTML, ancho = btn.offsetWidth;
        btn.disabled = true; btn.style.minWidth = ancho + 'px';
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> ' + (texto || 'Guardando…');
        return function (okTexto) {
            if (okTexto) {
                btn.innerHTML = '<i class="fa-solid fa-check"></i> ' + okTexto;
                setTimeout(function () { btn.innerHTML = original; btn.disabled = false; btn.style.minWidth = ''; }, 900);
            } else { btn.innerHTML = original; btn.disabled = false; btn.style.minWidth = ''; }
        };
    };
    /* Ejecuta una acción con feedback (simula la latencia del servidor) */
    UX.conFeedback = function (btn, fn, texto, okTexto) {
        var fin = UX.busy(btn, texto);
        setTimeout(function () { try { fn(); } finally { fin(okTexto); } }, 420);
    };

    /* ---------------- Foco atrapado en modales ---------------- */
    function focusables(root) { return [].slice.call(root.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(function (x) { return x.offsetParent !== null; }); }
    function modalA11y() {
        document.querySelectorAll('.modal-back').forEach(function (mb) {
            var modal = mb.querySelector('.modal'); if (modal) { modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); }
            var last = null;
            new MutationObserver(function () {
                if (mb.classList.contains('open')) { last = document.activeElement; var f = focusables(mb); if (f.length) setTimeout(function () { f[0].focus(); }, 30); }
                else if (last && last.focus) { last.focus(); last = null; }
            }).observe(mb, { attributes: true, attributeFilter: ['class'] });
            mb.addEventListener('keydown', function (e) {
                if (e.key !== 'Tab' || !mb.classList.contains('open')) return;
                var f = focusables(mb); if (!f.length) return;
                var first = f[0], lastf = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastf.focus(); }
                else if (!e.shiftKey && document.activeElement === lastf) { e.preventDefault(); first.focus(); }
            });
        });
    }

    /* ---------------- Campana (ir-a / marcar leída) ---------------- */
    UX.bell = function (items) {
        var tools = document.querySelector('.topbar-tools'); if (!tools) return;
        items = items.slice();
        var wrap = document.createElement('div'); wrap.className = 'bell-wrap';
        var btn = document.createElement('button'); btn.className = 'icon-btn'; btn.setAttribute('aria-label', 'Notificaciones');
        var menu = document.createElement('div'); menu.className = 'bell-menu';
        function go(n) { menu.classList.remove('open'); if (!n) return; if (n.href) { if (n.href.charAt(0) === '#') { var t = document.querySelector(n.href); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } else location.href = n.href; } }
        function draw() {
            btn.innerHTML = '<i class="fa-solid fa-bell"></i>' + (items.length ? '<span class="bell-badge">' + items.length + '</span>' : '');
            menu.innerHTML = '<h4>Notificaciones' + (items.length ? ' <button class="notif-all" type="button">Marcar todas</button>' : '') + '</h4>' +
                (items.length ? items.map(function (n, i) {
                    return '<div class="notif" data-go="' + i + '"><i class="fa-solid ' + (n.icon || 'fa-circle-info') + '"></i>' +
                        '<div class="notif-body"><b>' + n.title + '</b><span>' + (n.sub || '') + '</span></div>' +
                        '<button class="notif-read" data-read="' + i + '" aria-label="Marcar como leída" title="Marcar como leída"><i class="fa-solid fa-check"></i></button></div>';
                }).join('') : '<div class="bell-empty"><i class="fa-regular fa-bell-slash" style="font-size:1.4rem"></i><br>Sin notificaciones</div>');
            menu.querySelectorAll('[data-go]').forEach(function (el) { el.addEventListener('click', function (e) { if (e.target.closest('[data-read]')) return; go(items[+el.dataset.go]); }); });
            menu.querySelectorAll('[data-read]').forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); items.splice(+b.dataset.read, 1); draw(); }); });
            var all = menu.querySelector('.notif-all'); if (all) all.addEventListener('click', function (e) { e.stopPropagation(); items.length = 0; draw(); Toast.show('Notificaciones marcadas como leídas.'); });
        }
        draw();
        wrap.appendChild(btn); wrap.appendChild(menu);
        btn.addEventListener('click', function (e) { e.stopPropagation(); menu.classList.toggle('open'); });
        document.addEventListener('click', function () { menu.classList.remove('open'); });
        tools.insertBefore(wrap, tools.firstChild);
    };

    /* ---------------- Perfil (clic en el nombre) ---------------- */
    UX.profile = function (details) { UX._profile = details || {}; };
    function buildProfile() {
        var mb = document.createElement('div'); mb.className = 'modal-back'; mb.id = 'profile-modal';
        mb.innerHTML = '<div class="modal" style="max-width:420px"></div>';
        document.body.appendChild(mb);
        var user = document.querySelector('.topbar .user');
        if (user) {
            user.style.cursor = 'pointer'; user.setAttribute('role', 'button'); user.setAttribute('tabindex', '0'); user.title = 'Ver mi perfil';
            user.addEventListener('click', openProfile);
            user.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProfile(); } });
        }
    }
    function openProfile() {
        var d = UX._profile || {};
        var nameEl = document.querySelector('.topbar .user > div:last-child');
        var name = d.name || (nameEl ? nameEl.textContent.trim() : 'Usuario');
        var chip = document.querySelector('.role-chip');
        var role = d.role || (chip ? chip.textContent.trim() : '');
        var ini = name.split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();
        var rows = [];
        if (d.email) rows.push(['Email', d.email]);
        if (d.phone) rows.push(['Teléfono', d.phone]);
        (d.extra || []).forEach(function (x) { rows.push([x.k, x.v]); });
        var m = document.querySelector('#profile-modal .modal');
        m.innerHTML = '<div style="text-align:center;margin-bottom:1rem"><div class="prof-av">' + ini + '</div>' +
            '<h3 style="margin:.7rem 0 .2rem">' + name + '</h3><span class="prof-role">' + role + '</span></div>' +
            '<div class="prof-rows">' + (rows.length ? rows.map(function (r) { return '<div class="prof-row"><span class="text-muted">' + r[0] + '</span><b>' + r[1] + '</b></div>'; }).join('') : '<p class="text-muted text-center">Cuenta de demostración.</p>') + '</div>' +
            '<p class="text-muted" style="font-size:.8rem;text-align:center;margin:.8rem 0 0"><i class="fa-solid fa-circle-info"></i> Edición de perfil y cambio de contraseña — próximamente.</p>' +
            '<div class="flex" style="gap:.5rem;margin-top:1rem"><button class="btn btn-ghost btn-block" id="prof-theme"><i class="fa-solid fa-circle-half-stroke"></i> Tema</button>' +
            '<a class="btn btn-ghost btn-block" href="index.html" style="color:var(--c-danger)"><i class="fa-solid fa-arrow-right-from-bracket"></i> Salir</a></div>' +
            '<button class="btn btn-primary btn-block" id="prof-close" style="margin-top:.5rem">Cerrar</button>';
        Modal.open('profile-modal');
        document.getElementById('prof-close').onclick = function () { Modal.close('profile-modal'); };
        document.getElementById('prof-theme').onclick = UX.toggleTheme;
    }

    /* ---------------- NAVEGACIÓN POR VISTAS ----------------
       El panel deja de ser una página infinita: el menú lateral cambia
       de vista y solo se muestra una sección cada vez (como los SaaS
       clínicos). La cabecera, las migas y el título se actualizan solos. */
    var VIEWS = { actual: null, mapa: {}, links: [] };
    UX.goView = function (v, silencioso) {
        if (!VIEWS.mapa[v]) return false;
        VIEWS.actual = v;
        Object.keys(VIEWS.mapa).forEach(function (k) {
            VIEWS.mapa[k].forEach(function (el) { el.hidden = (k !== v); });
        });
        VIEWS.links.forEach(function (a) { a.classList.toggle('active', a.dataset.view === v); });
        var link = VIEWS.links.filter(function (a) { return a.dataset.view === v; })[0];
        var titulo = link ? (link.dataset.title || link.textContent.replace(/SOON/i, '').trim()) : v;
        var h1 = document.querySelector('.topbar h1'); if (h1) h1.textContent = titulo;
        var mig = document.querySelector('.breadcrumbs .current'); if (mig) mig.textContent = titulo;
        var desc = document.getElementById('view-desc');
        if (desc && link) {
            var d = link.dataset.desc || '';
            desc.innerHTML = d ? '<i class="fa-solid ' + (link.dataset.icon || 'fa-circle-info') + '"></i><p>' + d + '</p>' : '';
            desc.hidden = !d;
        }
        document.title = titulo + ' · Clínica Dental Raquel Virgüez';
        if (UX.syncBottomNav) UX.syncBottomNav(v);
        if (!silencioso) {
            try { history.replaceState(null, '', '#' + v); } catch (e) {}
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // Cierra el menú lateral en móvil tras elegir
        var sb = document.getElementById('sidebar'), bd = document.getElementById('backdrop');
        if (sb) sb.classList.remove('open'); if (bd) bd.classList.remove('open');
        return true;
    };
    UX.viewActual = function () { return VIEWS.actual; };
    function initViews() {
        var nav = document.querySelector('.sidebar nav'); if (!nav) return;
        document.querySelectorAll('[data-view]').forEach(function (el) {
            (VIEWS.mapa[el.dataset.view] = VIEWS.mapa[el.dataset.view] || []).push(el);
        });
        if (!Object.keys(VIEWS.mapa).length) return;          // página sin vistas: nada que hacer
        VIEWS.links = [].slice.call(nav.querySelectorAll('a[href^="#"]')).map(function (a) {
            a.dataset.view = a.getAttribute('href').slice(1); return a;
        });
        VIEWS.links.forEach(function (a) {
            a.addEventListener('click', function (e) { e.preventDefault(); UX.goView(a.dataset.view); });
        });
        // Cabecera de vista (descripción contextual)
        var content = document.querySelector('.panel-content');
        if (content && !document.getElementById('view-desc')) {
            var d = document.createElement('div'); d.className = 'page-intro'; d.id = 'view-desc';
            var bc = content.querySelector('.breadcrumbs');
            content.insertBefore(d, bc ? bc.nextSibling : content.firstChild);
        }
        var inicial = (location.hash || '').slice(1);
        UX.goView(VIEWS.mapa[inicial] ? inicial : VIEWS.links[0].dataset.view, true);
        window.addEventListener('hashchange', function () {
            var v = location.hash.slice(1); if (VIEWS.mapa[v] && v !== VIEWS.actual) UX.goView(v, true);
        });
    }

    /* ---------------- Barra inferior (móvil) ---------------- */
    function buildBottomNav() {
        var nav = document.querySelector('.sidebar nav'); if (!nav) return;
        var links = [].slice.call(nav.querySelectorAll('a')).filter(function (a) { return !a.classList.contains('soon'); }).slice(0, 4);
        if (!links.length) return;
        var bn = document.createElement('nav'); bn.className = 'bottomnav'; bn.setAttribute('aria-label', 'Navegación');
        bn.innerHTML = links.map(function (a) {
            var ic = a.querySelector('i'); var icon = ic ? ic.className : 'fa-solid fa-circle';
            var label = (a.dataset.short || a.textContent.replace(/SOON/i, '').trim().split(' ')[0]);
            return '<a href="' + a.getAttribute('href') + '" data-bn="' + (a.dataset.view || '') + '"><i class="' + icon + '"></i>' + label + '</a>';
        }).join('');
        document.body.appendChild(bn);
        // Sincroniza la barra inferior con la vista activa
        bn.querySelectorAll('[data-bn]').forEach(function (a) {
            a.addEventListener('click', function (e) {
                if (!a.dataset.bn) return;
                e.preventDefault(); UX.goView(a.dataset.bn);
                bn.querySelectorAll('[data-bn]').forEach(function (x) { x.classList.toggle('active', x === a); });
            });
        });
        UX.syncBottomNav = function (v) { bn.querySelectorAll('[data-bn]').forEach(function (x) { x.classList.toggle('active', x.dataset.bn === v); }); };
    }

    /* ---------------- Herramientas de la topbar / landing ---------------- */
    function iconBtn(label, iconHtml, onclick) {
        var b = document.createElement('button'); b.className = 'icon-btn'; b.setAttribute('aria-label', label); b.title = label; b.innerHTML = iconHtml; b.onclick = onclick; return b;
    }
    function injectTools() {
        var topbar = document.querySelector('.topbar');
        if (topbar) {
            var tools = document.createElement('div'); tools.className = 'topbar-tools';
            tools.appendChild(iconBtn('Buscar (⌘/Ctrl + K)', '<i class="fa-solid fa-magnifying-glass"></i>', function () { UX.palette(true); }));
            tools.appendChild(iconBtn('Cambiar tema', '<i data-theme-icon class="fa-solid fa-moon"></i>', UX.toggleTheme));
            var user = topbar.querySelector('.user');
            topbar.insertBefore(tools, user || null);
        }
        var actions = document.querySelector('.site-header .nav-actions');
        if (actions) {
            var t = document.createElement('button'); t.className = 'theme-toggle'; t.setAttribute('aria-label', 'Cambiar tema'); t.title = 'Tema';
            t.innerHTML = '<i data-theme-icon class="fa-solid fa-moon"></i>'; t.onclick = UX.toggleTheme;
            actions.insertBefore(t, actions.firstChild);
        }
    }

    /* ---------------- Paleta de comandos (⌘K) ---------------- */
    /* La búsqueda es PERSONAL: solo muestra lo que este rol puede ver y
       nunca permite saltar al panel de otro usuario. */
    function buildIndex() {
        var ses = UX.session() || {}, rol = ses.role || 'publico';
        var items = [];
        function nav(t, view, icon, s) { items.push({ g: 'Ir a', t: t, s: s, icon: icon, act: function () { UX.goView(view); } }); }

        // Secciones del propio panel (nunca de otros)
        (document.querySelectorAll('.sidebar nav a[href^="#"]') || []).forEach(function (a) {
            nav(a.dataset.title || a.textContent.replace(/SOON/i, '').trim(), a.getAttribute('href').slice(1),
                (a.querySelector('i') || {}).className || 'fa-solid fa-circle', a.dataset.desc ? a.dataset.desc.slice(0, 60) : '');
        });

        items.push({ g: 'Acciones', t: 'Mi perfil', icon: 'fa-id-badge', act: function () { openProfile(); } });
        items.push({ g: 'Acciones', t: 'Alternar modo oscuro', icon: 'fa-circle-half-stroke', act: UX.toggleTheme });
        items.push({ g: 'Acciones', t: 'Ver tour de bienvenida', icon: 'fa-wand-magic-sparkles', act: function () { runTour(true); } });
        items.push({ g: 'Acciones', t: 'Abrir asistente', icon: 'fa-robot', act: function () { if (window.Assistant) Assistant.open(); } });

        if (!window.DEMO) return items;
        var D = window.DEMO;

        if (rol === 'paciente') {
            // Solo SUS datos: nada de otros pacientes ni de la clínica
            (D.patient ? D.patient.upcoming : []).forEach(function (c) {
                items.push({ g: 'Mis citas', t: c.trat + ' · ' + c.ini, s: (window.fmtFecha ? fmtFecha(c.fecha) : c.fecha) + ' · ' + c.doctor,
                    icon: 'fa-calendar-check', act: function () { UX.goView('inicio'); } });
            });
            (D.patient ? D.patient.history : []).forEach(function (c) {
                items.push({ g: 'Mi historial', t: c.trat, s: (window.fmtFecha ? fmtFecha(c.fecha) : c.fecha), icon: 'fa-clock-rotate-left',
                    kw: c.notas || '', act: function () { UX.goView('timeline'); } });
            });
            (D.treatments || []).forEach(function (t) {
                items.push({ g: 'Pedir cita', t: t.name, s: t.min + ' min', icon: t.icon, kw: t.category + ' ' + t.desc, href: 'pedir-cita.html' });
            });
            return items;
        }

        // Personal de la clínica
        if (rol === 'doctor' || rol === 'secretaria' || rol === 'raquel') {
            (D.patientsList || []).forEach(function (p) {
                items.push({ g: 'Pacientes', t: p.nombre, s: p.tel + ' · ' + p.visitas + ' visitas', icon: 'fa-user',
                    kw: p.tel + ' ficha historial', act: function () { UX.goView('pacientes') || UX.goView('agenda'); if (window.abrirFichaPaciente) abrirFichaPaciente(p.nombre); } });
            });
            var citas = [];
            if (rol === 'doctor') citas = (D.doctor ? D.doctor.pending : []);
            else if (rol === 'raquel') citas = (D.raquel ? D.raquel.pending : []).concat(D.secretary ? D.secretary.upcoming : []);
            else citas = (D.secretary ? D.secretary.upcoming : []);
            citas.forEach(function (c) {
                items.push({ g: 'Citas', t: c.paciente + ' · ' + c.ini, s: (window.fmtFecha ? fmtFecha(c.fecha) : c.fecha) + ' · ' + c.trat,
                    icon: 'fa-calendar-day', kw: [c.trat, c.doctor, c.fecha, c.estado].join(' '), act: function () { UX.goView('agenda'); } });
            });
            (D.treatments || []).forEach(function (t) {
                items.push({ g: 'Tratamientos', t: t.name, s: t.min + ' min · $' + t.precio, icon: t.icon, kw: t.category });
            });
        }
        if (rol === 'secretaria' || rol === 'raquel') {
            (D.budgets || []).forEach(function (b) {
                items.push({ g: 'Presupuestos', t: b.id + ' · ' + b.paciente, s: b.estado, icon: 'fa-file-invoice-dollar', act: function () { UX.goView('presupuestos'); } });
            });
            (D.doctors || []).forEach(function (d) {
                items.push({ g: 'Equipo', t: d.name, s: d.specialty, icon: 'fa-user-doctor', kw: d.colegiado, act: function () { UX.goView('equipo') || UX.goView('doctores'); } });
            });
        }
        return items;
    }
    /* Búsqueda tolerante: sin tildes, por palabras sueltas y con puntuación */
    function normq(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
    function puntuaItem(it, palabras) {
        var heno = normq(it.t + ' ' + (it.s || '') + ' ' + (it.kw || '') + ' ' + it.g);
        var titulo = normq(it.t);
        var total = 0;
        for (var i = 0; i < palabras.length; i++) {
            var p = palabras[i];
            if (heno.indexOf(p) < 0) return 0;                 // deben aparecer todas
            total += titulo.indexOf(p) === 0 ? 3 : titulo.indexOf(p) >= 0 ? 2 : 1;
        }
        return total;
    }
    function buildPalette() {
        var back = document.createElement('div'); back.className = 'cmdk-back'; back.id = 'cmdk';
        back.innerHTML = '<div class="cmdk"><div class="cmdk-input"><i class="fa-solid fa-magnifying-glass"></i>' +
            '<input type="text" placeholder="Buscar pacientes, secciones, acciones…" aria-label="Buscar"><kbd>Esc</kbd></div>' +
            '<div class="cmdk-list" id="cmdk-list"></div></div>';
        document.body.appendChild(back);
        var input = back.querySelector('input'), list = back.querySelector('#cmdk-list');
        var all = [], filtered = [], sel = 0;   // se construye al abrir (ya con la sesión del rol)
        function draw() {
            if (!filtered.length) { list.innerHTML = '<div class="cmdk-empty">Sin resultados</div>'; return; }
            var groups = {}, order = [];
            filtered.forEach(function (it) { if (!groups[it.g]) { groups[it.g] = []; order.push(it.g); } groups[it.g].push(it); });
            var html = '', idx = 0;
            order.forEach(function (g) {
                html += '<div class="cmdk-group">' + g + '</div>';
                groups[g].forEach(function (it) { html += '<div class="cmdk-item' + (idx === sel ? ' sel' : '') + '" data-i="' + idx + '"><span class="ci"><i class="fa-solid ' + it.icon + '"></i></span><div>' + it.t + '</div>' + (it.s ? '<small>' + it.s + '</small>' : '') + '</div>'; idx++; });
            });
            list.innerHTML = html;
            list.querySelectorAll('.cmdk-item').forEach(function (el) {
                el.onmouseenter = function () { sel = +el.dataset.i; markSel(); };
                el.onclick = function () { exec(filtered[+el.dataset.i]); };
            });
        }
        function markSel() { list.querySelectorAll('.cmdk-item').forEach(function (el) { el.classList.toggle('sel', +el.dataset.i === sel); }); var s = list.querySelector('.cmdk-item.sel'); if (s) s.scrollIntoView({ block: 'nearest' }); }
        function filter() {
            var palabras = normq(input.value).split(/\s+/).filter(function (w) { return w.length > 0; });
            if (!palabras.length) { filtered = all; sel = 0; return draw(); }
            filtered = all.map(function (it) { return { it: it, s: puntuaItem(it, palabras) }; })
                          .filter(function (x) { return x.s > 0; })
                          .sort(function (a, b) { return b.s - a.s; })
                          .map(function (x) { return x.it; });
            sel = 0; draw();
        }
        function exec(it) { if (!it) return; UX.palette(false); if (it.act) it.act(); else if (it.href) location.href = it.href; }
        input.addEventListener('input', filter);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, filtered.length - 1); markSel(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); markSel(); }
            else if (e.key === 'Enter') { e.preventDefault(); exec(filtered[sel]); }
        });
        back.addEventListener('click', function (e) { if (e.target === back) UX.palette(false); });
        UX.palette = function (open) {
            if (open) {
                all = buildIndex();                     // índice personal del rol actual
                back.classList.add('open'); input.value = ''; filter();
                setTimeout(function () { input.focus(); }, 20);
            } else back.classList.remove('open');
        };
        document.addEventListener('keydown', function (e) {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); UX.palette(!back.classList.contains('open')); }
            else if (e.key === 'Escape' && back.classList.contains('open')) { UX.palette(false); }
        });
    }

    /* ---------------- Tour de bienvenida (personalizado por rol) ---------------- */
    UX.tour = function (steps) {
        var i = 0;
        var spot = document.createElement('div'); spot.className = 'tour-spot';
        var pop = document.createElement('div'); pop.className = 'tour-pop';
        function renderPop(st) {
            pop.innerHTML = (st.badge ? '<div class="tour-badge">' + st.badge + '</div>' : '') +
                '<h4>' + st.title + '</h4><p>' + st.text + '</p>' +
                '<div class="tour-foot"><div class="tour-dots">' + steps.map(function (_, j) { return '<i class="' + (j === i ? 'on' : '') + '"></i>'; }).join('') + '</div>' +
                '<div class="flex" style="gap:.4rem">' + (i > 0 ? '<button class="btn btn-ghost btn-sm" data-t="prev">Atrás</button>' : '') +
                '<button class="btn btn-ghost btn-sm" data-t="skip">Saltar</button>' +
                '<button class="btn btn-primary btn-sm" data-t="next">' + (i === steps.length - 1 ? '¡Empezar!' : 'Siguiente') + '</button></div></div>';
            var n = pop.querySelector('[data-t="next"]'); if (n) n.onclick = next;
            var p = pop.querySelector('[data-t="prev"]'); if (p) p.onclick = function () { i = Math.max(0, i - 1); place(); };
            var s = pop.querySelector('[data-t="skip"]'); if (s) s.onclick = end;
        }
        function place() {
            var st = steps[i], el = st.sel ? document.querySelector(st.sel) : null;
            if (st.sel && !el) { return next(); }
            if (!el) { // paso centrado (bienvenida)
                spot.style.width = '0'; spot.style.height = '0'; spot.style.top = '50%'; spot.style.left = '50%';
                pop.classList.add('tour-center'); pop.style.top = ''; pop.style.left = '';
                renderPop(st); return;
            }
            pop.classList.remove('tour-center');
            el.scrollIntoView({ block: 'center', behavior: 'smooth' });
            setTimeout(function () {
                var r = el.getBoundingClientRect(), pad = 8;
                spot.style.top = (window.scrollY + r.top - pad) + 'px'; spot.style.left = (window.scrollX + r.left - pad) + 'px';
                spot.style.width = (r.width + pad * 2) + 'px'; spot.style.height = (r.height + pad * 2) + 'px';
                renderPop(st);
                var top = window.scrollY + r.bottom + 12;
                if (top + 190 > window.scrollY + window.innerHeight) top = window.scrollY + r.top - 190;
                pop.style.top = Math.max(window.scrollY + 8, top) + 'px';
                pop.style.left = Math.min(window.scrollX + window.innerWidth - 322, Math.max(12, window.scrollX + r.left)) + 'px';
            }, 300);
        }
        function next() { i++; if (i >= steps.length) return end(); place(); }
        function end() { spot.remove(); pop.remove(); }
        document.body.appendChild(spot); document.body.appendChild(pop); place();
    };

    var TOURS = {
        paciente: [
            { badge: '👋 Bienvenid@', title: 'Este es tu espacio de paciente', text: 'En 20 segundos te enseñamos lo esencial: tus citas, tu ficha, tu odontograma y tus fotos de progreso.' },
            { sel: '.sidebar nav', title: 'Tu menú', text: 'Inicio, solicitar cita, tu perfil médico y tus archivos. Siempre a mano.' },
            { sel: 'a[href="pedir-cita.html"]', title: 'Pide cita sin llamar', text: 'Reserva online en 3 pasos, como invitado o con tu cuenta.' },
            { sel: '#ficha-sec', title: 'Tu ficha médica', text: 'Consúltala y edítala con seguridad (te avisamos antes de cambiar nada).' },
            { sel: '.topbar-tools', title: 'Búsqueda y tema', text: 'Pulsa ⌘/Ctrl + K para buscar y el botón de la luna para el modo oscuro. ¡Listo!' }
        ],
        doctora: [
            { badge: '🩺 Hola, doctor/a', title: 'Tu agenda de trabajo', text: 'Confirma, completa y cobra citas, y gestiona la ficha clínica de tus pacientes.' },
            { sel: '#calendario', title: 'Calendario semanal', text: 'Tu semana de un vistazo. Clic en una cita para ver el detalle; desliza para cambiar de semana.' },
            { sel: '#pacientes', title: 'Fichas y odontograma', text: 'Abre un paciente para ver su ficha, editar su odontograma y generar recetas o informes.' },
            { sel: '.topbar-tools', title: 'Notificaciones y búsqueda', text: 'La campana te avisa de tus citas; ⌘/Ctrl + K busca al instante.' }
        ],
        secretaria: [
            { badge: '🗓️ Bienvenid@ a recepción', title: 'La clínica al completo', text: 'Gestionas la agenda global, das de alta pacientes y autorizas cambios de ficha.' },
            { sel: '#solicitudes', title: 'Autoriza cambios', text: 'Los doctores proponen cambios en las fichas; tú los apruebas o rechazas aquí.' },
            { sel: '#alta', title: 'Alta de pacientes', text: 'Registra nuevos pacientes en segundos.' },
            { sel: '.topbar-tools', title: 'Todo más rápido', text: 'Campana de avisos y ⌘/Ctrl + K para buscar cualquier cosa.' }
        ],
        propietaria: [
            { badge: '👑 Bienvenida, Raquel', title: 'Tu panel de dirección', text: 'Controlas la clínica: tu agenda, las finanzas y el equipo. Cada cita cobrada suma a caja.' },
            { sel: '#resumen', title: 'Tus números', text: 'Ingresos de hoy, del mes y totales, siempre actualizados.' },
            { sel: '#finanzas', title: 'Finanzas', text: 'Vista mensual y diaria, tarjeta vs. efectivo, y export a CSV o impresión.' },
            { sel: '#calendario', title: 'Calendario', text: 'Tu semana de trabajo con detalle de cada cita.' }
        ]
    };
    function runTour(force) {
        var chip = document.querySelector('.role-chip');
        if (!chip) return;
        // "Secretaría" → "secretaria": quitamos tildes ANTES de filtrar letras
        var role = chip.textContent.trim().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z]/g, '');
        var steps = TOURS[role] || TOURS.paciente;
        if (force) { UX.tour(steps); return; }
        try { if (localStorage.getItem('dc_tour_' + role)) return; localStorage.setItem('dc_tour_' + role, '1'); } catch (e) {}
        setTimeout(function () { UX.tour(steps); }, 700);
    }

    // Inicialización inmediata (script al final del <body>).
    injectTools(); updateThemeIcons(); initViews(); buildBottomNav(); buildPalette(); buildProfile(); maskInit(); modalA11y(); wireLogout();
    if (document.querySelector('.role-chip')) runTour(false);
})();
