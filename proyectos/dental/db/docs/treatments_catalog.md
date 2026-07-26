# Catálogo de tratamientos — ideas (Coming soon)

> El **catálogo completo y los precios** son *Coming soon* para el MVP.
> La tabla `treatments` ya existe (las citas la referencian) con una selección
> mínima sembrada; `treatments.precio` es `NULL` a propósito hasta activar
> precios. Este documento es la lista de ideas para ir completándolo.

## Cómo encaja en el modelo

- `treatments(id_tratamiento, codigo, nombre, categoria, descripcion, duracion_min, precio, activo)`
- `appointments.id_tratamiento` → `treatments`. `duracion_min` alimenta el
  cálculo de huecos libres de agenda (autoservicio del paciente).
- `appointments.coste` guarda el importe **real** de la cita; `treatments.precio`
  será el importe **de referencia** del catálogo cuando se active.

## Categorías propuestas

| Categoría | Descripción |
|---|---|
| Preventiva | Revisiones, higienes, selladores, fluor. |
| Restauradora | Empastes, endodoncias, reconstrucciones. |
| Estética | Blanqueamientos, carillas, composite estético. |
| Prótesis | Coronas, puentes, prótesis removible. |
| Cirugía | Extracciones, implantes, injertos. |
| Ortodoncia | Brackets, alineadores, revisiones. |
| Periodoncia | Tratamiento de encías, curetajes. |
| Odontopediatría | Tratamientos infantiles. |

## Tratamientos (ideas) · duración y rango de precio orientativo

> Precios **orientativos** (Coming soon), no vinculantes. Duración = `duracion_min`.

| Código | Tratamiento | Categoría | Duración | Precio ref. (idea) |
|---|---|---|---:|---:|
| REV | Revisión y diagnóstico | Preventiva | 20 min | Gratis–20 € |
| HIG | Limpieza dental (higiene) | Preventiva | 30 min | 40–60 € |
| FLU | Fluorización / sellado | Preventiva | 20 min | 20–40 € |
| OBT | Empaste (obturación) | Restauradora | 45 min | 40–80 € |
| END | Endodoncia | Restauradora | 60 min | 120–250 € |
| REC | Reconstrucción | Restauradora | 60 min | 90–160 € |
| EST | Blanqueamiento | Estética | 60 min | 200–350 € |
| CAR | Carilla de composite | Estética | 60 min | 150–300 € |
| COR | Corona / funda | Prótesis | 45 min | 300–600 € |
| IMP | Implante dental | Cirugía | 60 min | 700–1200 € |
| CIR | Extracción simple | Cirugía | 40 min | 50–120 € |
| ORT | Ortodoncia (revisión) | Ortodoncia | 30 min | 50–90 € |
| PER | Curetaje periodontal | Periodoncia | 45 min | 60–120 € |

## Roadmap del módulo (fuera del MVP)

1. **Activar precios**: rellenar `treatments.precio` y mostrar catálogo público.
2. **Presupuestos**: líneas de tratamiento por paciente (nueva tabla `budgets`).
3. **Pagos**: cobros y estado de pago por cita/presupuesto (ligado a la visión de "pagos").
4. **Vincular a odontograma**: tratamiento por pieza/cuadrante.
