/* =====================================================================
   Clínica Dental · Odontograma multi-vista (FDI, sin dependencias)
   Vistas: Caras · Esquema · 2D realista · 3D genérico · Scan 3D
   Estado por diente:
     - string  → todo el diente ('sano','corona','ausente','caries'…)
     - objeto  → por caras { m,d,o,v,l } (mesial, distal, oclusal,
                 vestibular, lingual/palatino)
   ===================================================================== */
window.Odontograma = function (opts) {
    var el = opts.el;
    var state = opts.state || {};
    var editable = opts.editable !== false;
    var onChange = opts.onChange || function () {};
    var scan = opts.scan || null;
    var STATES = ['sano', 'caries', 'empaste', 'corona', 'ausente'];
    var CARA_STATES = ['sano', 'caries', 'empaste'];          // por cara solo tiene sentido esto
    var LBL = { sano: 'Sano', caries: 'Caries', empaste: 'Empaste', corona: 'Corona', ausente: 'Ausente' };
    var CARAS = { m: 'Mesial', d: 'Distal', o: 'Oclusal/Incisal', v: 'Vestibular', l: 'Lingual/Palatino' };
    var UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
    var LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
    var view = 'caras';

    /* ---------- helpers de estado ---------- */
    function esObj(n) { return state[n] && typeof state[n] === 'object'; }
    function caraDe(n, c) { return esObj(n) ? (state[n][c] || 'sano') : null; }
    // Estado "resumen" del diente (lo peor manda) para colorear las vistas simples
    function resumenDiente(n) {
        var v = state[n];
        if (!v) return 'sano';
        if (typeof v === 'string') return v;
        var orden = ['caries', 'corona', 'empaste', 'sano'];
        for (var i = 0; i < orden.length; i++) {
            for (var k in v) { if (v[k] === orden[i]) return orden[i]; }
        }
        return 'sano';
    }
    function tipo(n) { var d = n % 10; return d <= 2 ? 'incisivo' : d === 3 ? 'canino' : d <= 5 ? 'premolar' : 'molar'; }

    function rotarDiente(n) {
        var cur = typeof state[n] === 'string' ? state[n] : resumenDiente(n);
        state[n] = STATES[(STATES.indexOf(cur) + 1) % STATES.length];
        if (state[n] === 'sano') delete state[n];
        sync(); onChange(state, n, state[n]);
    }
    function rotarCara(n, c) {
        if (!esObj(n)) {
            var prev = typeof state[n] === 'string' ? state[n] : null;
            state[n] = {};
            // Un diente ausente o con corona no se marca por caras
            if (prev === 'ausente' || prev === 'corona') { state[n] = prev; sync(); return; }
            if (prev && prev !== 'sano') state[n].o = prev;
        }
        var cur = state[n][c] || 'sano';
        state[n][c] = CARA_STATES[(CARA_STATES.indexOf(cur) + 1) % CARA_STATES.length];
        if (state[n][c] === 'sano') delete state[n][c];
        if (!Object.keys(state[n]).length) delete state[n];
        sync(); onChange(state, n, c);
    }

    function sync() {
        el.querySelectorAll('[data-n]').forEach(function (t) {
            if (t.dataset.cara) t.setAttribute('data-st', caraDe(t.dataset.n, t.dataset.cara) || 'sano');
            else t.dataset.st = resumenDiente(t.dataset.n);
        });
        el.querySelectorAll('.fdi-tooth').forEach(function (g) {
            g.setAttribute('data-whole', typeof state[g.dataset.n] === 'string' ? state[g.dataset.n] : '');
        });
        var res = el.querySelector('[data-odo-resumen]');
        if (res) res.innerHTML = resumenHTML();
    }
    function resumenHTML() {
        var c = { caries: 0, empaste: 0, corona: 0, ausente: 0 }, caras = 0;
        Object.keys(state).forEach(function (k) {
            var v = state[k];
            if (typeof v === 'string') { if (c[v] !== undefined) c[v]++; }
            else { Object.keys(v).forEach(function (x) { if (c[v[x]] !== undefined) { c[v[x]]++; caras++; } }); }
        });
        var p = [];
        if (c.caries) p.push('<b style="color:var(--c-danger)">' + c.caries + '</b> con caries');
        if (c.empaste) p.push('<b style="color:var(--c-primary-600)">' + c.empaste + '</b> con empaste');
        if (c.corona) p.push('<b style="color:var(--c-warning)">' + c.corona + '</b> con corona');
        if (c.ausente) p.push('<b>' + c.ausente + '</b> ausentes');
        return p.length ? 'Resumen: ' + p.join(' · ') + (caras ? ' <span class="text-muted">(' + caras + ' cara(s) marcada(s))</span>' : '') : 'Sin hallazgos registrados.';
    }

    /* ---------- Vista 1 · Caras (odontograma clínico) ---------- */
    function fdiTooth(n) {
        var whole = typeof state[n] === 'string' ? state[n] : '';
        function cara(c, pts, forma) {
            var st = caraDe(n, c) || 'sano';
            var t = 'Diente ' + n + ' · ' + CARAS[c] + ' · ' + LBL[st];
            return '<' + forma + ' class="cara" data-n="' + n + '" data-cara="' + c + '" data-st="' + st + '" ' + pts +
                (editable ? ' tabindex="0" role="button"' : '') + '><title>' + t + '</title></' + forma + '>';
        }
        return '<div class="fdi" data-n="' + n + '">' +
            '<svg viewBox="0 0 30 30" class="fdi-tooth" data-n="' + n + '" data-whole="' + whole + '">' +
                cara('v', 'points="0,0 30,0 20,10 10,10"', 'polygon') +
                cara('d', 'points="30,0 30,30 20,20 20,10"', 'polygon') +
                cara('l', 'points="0,30 30,30 20,20 10,20"', 'polygon') +
                cara('m', 'points="0,0 0,30 10,20 10,10"', 'polygon') +
                cara('o', 'x="10" y="10" width="10" height="10"', 'rect') +
                '<rect class="fdi-x" x="1" y="1" width="28" height="28"></rect>' +
            '</svg>' +
            '<span class="fdi-n">' + n + '</span>' +
            (editable ? '<button type="button" class="fdi-all" data-n="' + n + '" title="Marcar el diente completo (corona, ausente…)"><i class="fa-solid fa-circle-dot"></i></button>' : '') +
            '</div>';
    }
    function fdiArch(nums, cls) {
        return '<div class="fdi-arch ' + cls + '">' + nums.map(function (n, i) { return (i === 8 ? '<span class="fdi-mid"></span>' : '') + fdiTooth(n); }).join('') + '</div>';
    }

    /* ---------- Vista 2 · Esquema ---------- */
    function tooth(n) {
        var st = resumenDiente(n);
        return '<button type="button" class="tooth" data-n="' + n + '" data-st="' + st + '"' + (editable ? '' : ' disabled') +
            ' title="Diente ' + n + ' · ' + LBL[st] + '"><span class="ti"><i class="fa-solid fa-tooth"></i></span><span class="tn">' + n + '</span></button>';
    }
    function arch(nums, cls) { return '<div class="odo-arch ' + cls + '">' + nums.map(function (n, i) { return (i === 8 ? '<span class="odo-mid"></span>' : '') + tooth(n); }).join('') + '</div>'; }

    /* ---------- Vista 3 · Realista ---------- */
    var SVG = {
        incisivo: '<path class="root" d="M14,36 L26,36 L23,7 Q20,1 17,7 Z"/><path class="crown" d="M11,35 L29,35 L28,57 Q20,70 12,57 Z"/><circle class="spot" cx="20" cy="49" r="3.4"/>',
        canino:   '<path class="root" d="M14,36 L26,36 L23,3 Q20,-3 17,3 Z"/><path class="crown" d="M11,35 L29,35 L27,54 L20,69 L13,54 Z"/><circle class="spot" cx="20" cy="48" r="3.4"/>',
        premolar: '<path class="root" d="M15,36 L25,36 L23,9 Q20,3 17,9 Z"/><path class="crown" d="M10,35 L30,35 L29,53 Q25,63 20,58 Q15,63 11,53 Z"/><circle class="spot" cx="20" cy="47" r="3.6"/>',
        molar:    '<path class="root" d="M10,36 L17,36 L15,9 Q12,4 10,9 Z"/><path class="root" d="M23,36 L30,36 L30,9 Q28,4 25,9 Z"/><path class="crown" d="M7,35 L33,35 L32,51 Q28,61 24,55 Q20,61 16,55 Q12,61 8,51 Z"/><circle class="spot" cx="20" cy="46" r="3.8"/>'
    };
    function rtooth(n) {
        var st = resumenDiente(n);
        return '<button type="button" class="rt" data-n="' + n + '" data-st="' + st + '"' + (editable ? '' : ' disabled') +
            ' title="Diente ' + n + ' · ' + LBL[st] + '"><svg viewBox="0 0 40 72">' + SVG[tipo(n)] + '</svg><span class="tn">' + n + '</span></button>';
    }
    function rarch(nums, cls) { return '<div class="odo-realarch ' + cls + '">' + nums.map(function (n, i) { return (i === 8 ? '<span class="odo-mid"></span>' : '') + rtooth(n); }).join('') + '</div>'; }

    /* ---------- Vista 4 · 3D ---------- */
    function build3D(host) {
        var world = host.querySelector('.odo3d-world');
        function archHTML(nums, y, radius, flip) {
            var span = 150, step = span / (nums.length - 1), start = -span / 2;
            return '<div class="odo3d-arch" style="transform:translateY(' + y + 'px)">' + nums.map(function (n, i) {
                var a = start + step * i, st = resumenDiente(n);
                return '<div class="t3" data-n="' + n + '" data-st="' + st + '" title="Diente ' + n + ' · ' + LBL[st] + '" ' +
                    'style="transform:rotateY(' + a + 'deg) translateZ(' + radius + 'px)' + (flip ? ' rotateZ(180deg)' : '') + '"></div>';
            }).join('') + '</div>';
        }
        world.innerHTML = archHTML(UPPER, -46, 150, false) + archHTML(LOWER, 46, 150, true);
        var rx = -18, ry = 0, drag = false, lx = 0, ly = 0;
        function apply() { world.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)'; }
        apply();
        function down(e) { drag = true; var p = e.touches ? e.touches[0] : e; lx = p.clientX; ly = p.clientY; }
        function move(e) {
            if (!drag) return; var p = e.touches ? e.touches[0] : e;
            ry += (p.clientX - lx) * 0.4; rx = Math.max(-70, Math.min(35, rx - (p.clientY - ly) * 0.3));
            lx = p.clientX; ly = p.clientY; apply(); e.preventDefault();
        }
        function up() { drag = false; }
        var stage = host.querySelector('.odo3d-stage');
        stage.addEventListener('mousedown', down); window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
        stage.addEventListener('touchstart', down, { passive: true }); window.addEventListener('touchmove', move, { passive: false }); window.addEventListener('touchend', up);
        host.querySelector('[data-3d="left"]').onclick = function () { ry -= 25; apply(); };
        host.querySelector('[data-3d="right"]').onclick = function () { ry += 25; apply(); };
        host.querySelector('[data-3d="reset"]').onclick = function () { rx = -18; ry = 0; apply(); };
        if (editable) world.querySelectorAll('.t3').forEach(function (t) { t.onclick = function () { rotarDiente(t.dataset.n); }; });
    }

    /* ---------- Vista 5 · Scan ---------- */
    function scanCard(f) {
        return '<div class="scan-file"><div class="fi"><i class="fa-solid fa-cube"></i></div>' +
            '<div style="flex:1"><b>' + f.name + '</b><span>' + (f.size || '—') + ' · subido ' + (f.date || '') + '</span></div>' +
            '<span class="cs-badge">Visor próximamente</span></div>';
    }
    function scanHTML() {
        return '<div class="odo-scan"><label class="scan-drop" id="scan-drop"><i class="fa-solid fa-cube"></i>' +
            '<div><b>Sube el escaneo intraoral 3D</b> del paciente</div>' +
            '<div style="font-size:.8rem">Formatos .STL · .PLY · .OBJ — arrastra o haz clic</div>' +
            '<input type="file" id="scan-input" accept=".stl,.ply,.obj,model/*" hidden></label>' +
            '<div id="scan-list">' + (scan ? scanCard(scan) : '') + '</div>' +
            '<p class="text-muted" style="font-size:.8rem;margin:.9rem 0 0"><i class="fa-solid fa-circle-info"></i> ' +
            'El visor de mallas 3D se activará al conectar el módulo de imagen.</p></div>';
    }

    /* ---------- Render ---------- */
    function render() {
        el.innerHTML = '<div class="odo">' +
            '<div class="odo-tabs" role="tablist">' +
                '<button type="button" data-v="caras" class="on"><i class="fa-solid fa-grip"></i> Caras</button>' +
                '<button type="button" data-v="esquema"><i class="fa-solid fa-table-cells"></i> Esquema</button>' +
                '<button type="button" data-v="realista"><i class="fa-solid fa-tooth"></i> Realista</button>' +
                '<button type="button" data-v="tresd"><i class="fa-solid fa-cube"></i> 3D</button>' +
                '<button type="button" data-v="scan"><i class="fa-solid fa-file-arrow-up"></i> Scan</button>' +
            '</div>' +

            '<div class="odo-view on" data-view="caras">' +
                '<p class="odo-help"><i class="fa-solid fa-circle-info"></i> Cada diente se divide en <b>5 caras</b>: ' +
                'vestibular (arriba), lingual/palatino (abajo), mesial (izq.), distal (der.) y oclusal (centro). ' +
                (editable ? 'Haz clic en una cara para marcarla; el botón <i class="fa-solid fa-circle-dot"></i> marca el diente completo.' : 'Vista de solo lectura.') + '</p>' +
                '<div class="fdi-wrap">' + fdiArch(UPPER, 'upper') + fdiArch(LOWER, 'lower') + '</div>' +
            '</div>' +

            '<div class="odo-view" data-view="esquema">' + arch(UPPER, 'upper') + arch(LOWER, 'lower') + '</div>' +
            '<div class="odo-view" data-view="realista"><div class="odo-real">' + rarch(UPPER, 'upper') + rarch(LOWER, 'lower') + '</div></div>' +
            '<div class="odo-view" data-view="tresd">' +
                '<div class="odo3d-stage"><div class="odo3d-world"></div>' +
                '<span class="odo3d-hint"><i class="fa-solid fa-arrows-up-down-left-right"></i> Arrastra para girar</span></div>' +
                '<div class="odo3d-tools">' +
                    '<button type="button" class="btn btn-ghost btn-sm" data-3d="left"><i class="fa-solid fa-rotate-left"></i></button>' +
                    '<button type="button" class="btn btn-ghost btn-sm" data-3d="reset">Vista frontal</button>' +
                    '<button type="button" class="btn btn-ghost btn-sm" data-3d="right"><i class="fa-solid fa-rotate-right"></i></button>' +
                '</div></div>' +
            '<div class="odo-view" data-view="scan">' + scanHTML() + '</div>' +

            '<div class="odo-legend">' +
            '<span><span class="dot" style="background:var(--c-surface)"></span>Sano</span>' +
            '<span><span class="dot" style="background:var(--c-danger)"></span>Caries</span>' +
            '<span><span class="dot" style="background:var(--c-primary)"></span>Empaste</span>' +
            '<span><span class="dot" style="background:var(--c-warning)"></span>Corona</span>' +
            '<span><span class="dot" style="background:var(--c-muted);opacity:.5"></span>Ausente</span></div>' +
            '<p class="text-muted" style="font-size:.8rem;margin:.6rem 0 0" data-odo-resumen>' + resumenHTML() + '</p></div>';

        el.querySelectorAll('.odo-tabs button').forEach(function (b) {
            b.onclick = function () {
                view = b.dataset.v;
                el.querySelectorAll('.odo-tabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
                el.querySelectorAll('.odo-view').forEach(function (v) { v.classList.toggle('on', v.dataset.view === view); });
            };
        });

        if (editable) {
            el.querySelectorAll('.cara').forEach(function (c) {
                c.addEventListener('click', function () { rotarCara(c.dataset.n, c.dataset.cara); });
                c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rotarCara(c.dataset.n, c.dataset.cara); } });
            });
            el.querySelectorAll('.fdi-all').forEach(function (b) { b.onclick = function () { rotarDiente(b.dataset.n); }; });
            el.querySelectorAll('.tooth, .rt').forEach(function (b) { b.onclick = function () { rotarDiente(b.dataset.n); }; });
        }

        build3D(el.querySelector('[data-view="tresd"]'));

        var drop = el.querySelector('#scan-drop'), input = el.querySelector('#scan-input');
        if (drop && input) {
            input.addEventListener('change', function () { if (input.files[0]) addScan(input.files[0]); input.value = ''; });
            ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); }); });
            ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); }); });
            drop.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files[0]) addScan(e.dataTransfer.files[0]); });
        }
        function addScan(file) {
            scan = { name: file.name, size: (file.size / 1048576).toFixed(1) + ' MB', date: window.DEMO ? window.fmtFecha(DEMO.today) : '' };
            el.querySelector('#scan-list').innerHTML = scanCard(scan);
            if (window.Toast) Toast.show('Escaneo 3D «' + file.name + '» cargado.', 'ok');
        }
    }

    render();
    return { state: state, render: render, sync: sync, resumen: resumenHTML, getScan: function () { return scan; } };
};
