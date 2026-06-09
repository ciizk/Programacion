/* ---------------------------------------------------------------------
   app.js — Único JavaScript del sitio (mínimo).
   Se carga al final de <body>, por lo que NO usa DOMContentLoaded.

   1) En MÓVIL, el botón "Reserva ya" redirige directo a la tienda
      (iOS -> App Store · Android -> Play Store). En ESCRITORIO se deja
      el modal con el QR (comportamiento por CSS :target).
   2) Carrusel Horario/Tarifas: flechas laterales (el deslizamiento táctil
      ya funciona de forma nativa con scroll-snap).
   --------------------------------------------------------------------- */
(function () {

  /* === 1) Enlaces de las tiendas (TODO: pon aquí las URLs reales) === */
  var APP_STORE  = '#';  // iOS  — https://apps.apple.com/...
  var PLAY_STORE = '#';  // Android — https://play.google.com/store/apps/...

  // Rellena los botones del modal (escritorio) desde estas constantes.
  document.querySelectorAll('[data-store="ios"]').forEach(function (a) {
    if (APP_STORE !== '#') a.href = APP_STORE;
  });
  document.querySelectorAll('[data-store="android"]').forEach(function (a) {
    if (PLAY_STORE !== '#') a.href = PLAY_STORE;
  });

  // En móvil/tablet: redirección directa a la tienda según el sistema.
  var ua = navigator.userAgent || '';
  var isIOS = /iphone|ipad|ipod/i.test(ua);
  var isAndroid = /android/i.test(ua);
  if (isIOS || isAndroid) {
    var dest = isIOS ? APP_STORE : PLAY_STORE;
    if (dest && dest !== '#') {        // si aún no hay URL, se conserva el modal
      document.querySelectorAll('a[href="#descargar"]').forEach(function (a) {
        a.setAttribute('href', dest);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
      });
    }
  }

  /* === 2) Carrusel Horario/Tarifas: flechas izquierda y derecha (con bucle) ===
     El deslizamiento táctil ya funciona de forma nativa (scroll-snap). */
  var track = document.getElementById('hcar-track');
  if (track) {
    var cards = track.querySelectorAll('.info-card');
    var n = cards.length;

    // Tarjeta actualmente más a la izquierda dentro del carrusel
    var actual = function () {
      var ref = track.getBoundingClientRect().left;
      var best = 0, bestD = Infinity;
      cards.forEach(function (c, i) {
        var d = Math.abs(c.getBoundingClientRect().left - ref);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    };

    // Ir a una tarjeta (con bucle: -1 -> última, n -> primera)
    var irA = function (i) {
      i = (i % n + n) % n;
      cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    };

    var prev = document.querySelector('.hcar__arrow--prev');
    var next = document.querySelector('.hcar__arrow--next');
    if (prev) prev.addEventListener('click', function () { irA(actual() - 1); });
    if (next) next.addEventListener('click', function () { irA(actual() + 1); });
  }

})();
