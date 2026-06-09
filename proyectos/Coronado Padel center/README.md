# Coronado Padel Center — Sitio web

Sitio web estático (HTML + CSS) de **Coronado Padel Center**, codificado a partir
de los mockups finales del prototipo de Axure (vistas *mobile-first* y escritorio)
y de su libro de estilo.

La web es un **embudo de conversión**: centraliza la información del club y dirige
el tráfico a **reservar/descargar la App**.

## Stack y decisiones

- **HTML + CSS estático.** Se abre directamente en el navegador o se sube a
  cualquier hosting (no necesita PHP ni base de datos).
- **Casi todo sin JavaScript** (requisito "lo menos de JS posible", "sin `DOMContentLoaded`"):
  - Menú móvil (con animación) → *checkbox* CSS · Acordeón FAQ → `<details>`
  - Modal QR → CSS `:target` · Scroll suave → CSS · Slider de frases → animación CSS
  - Deslizamiento del carrusel → `scroll-snap` CSS · Iconos → sprite SVG en línea
  - **Único JS** ([assets/js/app.js](assets/js/app.js), al final de `<body>`, sin `DOMContentLoaded`):
    1. flechas del carrusel Horario/Tarifas (el *swipe* ya es nativo);
    2. en **móvil**, "Reserva ya" redirige directo a la tienda (iOS→App Store / Android→Play Store);
       en **escritorio** se mantiene el modal con el QR.
- **SEO:** una `<h1>` por página, HTML5 semántico, `meta description`, `canonical`,
  Open Graph, Twitter Card, **JSON-LD** (`SportsActivityLocation`, `FAQPage`,
  `ItemList`, `Course`), `robots.txt`, `sitemap.xml`, `alt` en imágenes.
- **Libro de estilo aplicado** (del style guide del prototipo): tipografía
  **Montserrat**; paleta `#589BD4 #1A2E3E #76EFD0 #85A54E #DFF155` (+ secundarios y
  terciarios); CTA1 lima · CTA2 azul · CTA3 blanco.

## Páginas

| Archivo | Contenido |
|---------|-----------|
| [index.html](index.html) | Landing: Hero → Horarios y tarifas → Academia → Ubicación → FAQ → Contacto → Footer |
| [academias.html](academias.html) | Listado de la academia con los 4 niveles |
| [nivel-principiante.html](nivel-principiante.html) | Ficha de clase (–50 %: ~~$40~~ $20) |
| [nivel-intermedio.html](nivel-intermedio.html) | Ficha de clase ($40) |
| [nivel-avanzado.html](nivel-avanzado.html) | Ficha de clase ($40) |
| [nivel-profesional.html](nivel-profesional.html) | Ficha de clase ($60) |

```
assets/css/styles.css   Hoja de estilos (libro de estilo)
assets/js/app.js        Carrusel + redirección móvil a la tienda (único JS)
assets/img/             (vacía) coloca aquí tus imágenes
_design_extract/        Texto + fotos extraídos del prototipo (referencia)
```

## Cómo verlo

- Doble clic en `index.html`, **o**
- servirlo: `npx serve` / `php -S localhost:8000` / XAMPP, **o**
- está configurado el preview de Claude Code (`.claude/launch.json`).

## Qué falta por completar (marcado con `src="#"` y `// TODO`)

1. **Imágenes** — todas usan `src="#"`. Reemplaza el `#` por la ruta real (logo,
   hero, fotos de pistas, academia, fichas de nivel, avatares de instructores, QR,
   og:image, favicon). Truco: busca y reemplaza `src="#"` por la ruta del archivo.
   *Algunas fotos del club ya están extraídas en `_design_extract/mock_A` y `mock_B`.*
2. **Enlaces de tiendas** — define `APP_STORE` y `PLAY_STORE` en
   [assets/js/app.js](assets/js/app.js) (sirven tanto para el modal del QR en
   escritorio como para la redirección directa en móvil).
3. **Redes** — URLs reales de TikTok y Facebook (Instagram ya apunta a
   `@coronadopadelcenter`).
4. **Dominio** — ajusta `canonical`/Open Graph en cada página y en `sitemap.xml`/`robots.txt`.

> Datos ya tomados de los mockups: dirección (Manzana 130408 5-24, Coloncito,
> Panamá Oeste), correo `coronadopadel@center.com`, teléfono `+507 6843-2476`,
> horario 7:00–21:00 y tarifas (Pádel $40/$10 p.p · Pickleball $20/$5 p.p · 90 min).
