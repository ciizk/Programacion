# Práctica 6 — Bases de datos relacionales, lógica del negocio y servidor REST

Esta carpeta contiene la práctica 6 completa, organizada por las dos grandes
fases del enunciado.

```
db/p6/
├── 01-sql/          ← Sección 1: SQL puro con sqlite3
└── 02-aplicacion/   ← Secciones 2-3-Final: lógica + servidor REST + UX
```

---

## 01-sql/ — Bases de datos relacionales y SQL

Contiene los scripts SQL de la primera parte de la práctica, junto con el
binario `sqlite3` y una base de datos `datos.bd` ya construida.

| Fichero                  | Para qué sirve                                              |
| ------------------------ | ----------------------------------------------------------- |
| `crearPersona.sql`       | `CREATE TABLE Persona`                                      |
| `crearAsignatura.sql`    | `CREATE TABLE Asignatura`                                   |
| `crearMatricula.sql`     | `CREATE TABLE Matricula` (con claves ajenas)                |
| `insertarPersonas.sql`   | Inserta las cuatro personas del ejemplo                     |
| `insertarAsignaturas.sql`| Inserta 3 asignaturas                                       |
| `insertarMatricula.sql`  | Matrículas de ejemplo (incl. "matricularse en Programacion 2") |
| `consultas.sql`          | Consultas básicas (1 tabla y 2 tablas)                      |
| `consultaTresTablas.sql` | Ejercicio: nombre de los matriculados en Programación 2     |
| `otrasOperaciones.sql`   | `DELETE`, `UPDATE`, `DROP`                                  |

### Reproducir el proceso

```bash
cd 01-sql
rm -f datos.bd
./sqlite3 datos.bd < crearPersona.sql
./sqlite3 datos.bd < crearAsignatura.sql
./sqlite3 datos.bd < crearMatricula.sql
./sqlite3 datos.bd < insertarPersonas.sql
./sqlite3 datos.bd < insertarAsignaturas.sql
./sqlite3 datos.bd < insertarMatricula.sql

# Ejemplo de consultas
./sqlite3 datos.bd < consultas.sql
./sqlite3 datos.bd < consultaTresTablas.sql
```

---

## 02-aplicacion/ — Aplicación completa

```
02-aplicacion/
├── docs/arquitectura.md     ← Diseño (BD, lógica, REST, UX)
├── bd/                       ← Misma base de datos para la app
├── logica/                   ← Sección 2: lógica del negocio
│   ├── logica.js / cargador.js
│   ├── funciones/            ← una función por fichero
│   └── test/                 ← mainTest1.js .. mainTest4.js (mocha)
├── servidorREST/             ← Sección 3: API REST sobre la lógica
│   ├── mainServidorREST.js
│   └── test/                 ← mainTest1.js + mainTest2.js
└── ux/                       ← Ejercicio final: cliente web (SPA)
    ├── Aplicacion.html
    └── logicaFake/           ← proxy REST con la misma firma que la lógica
```

### Reproducir el proceso

```bash
# 1. instalar dependencias
cd 02-aplicacion/logica && npm install
cd ../servidorREST && npm install

# 2. probar la lógica de forma aislada (sin servidor)
cd ../logica && npm test
#   → 22 passing

# 3. arrancar el servidor
cd ../servidorREST && npm run servidor

# 4. en OTRA terminal, lanzar los tests del servidor REST
cd 02-aplicacion/servidorREST && npm test
#   → 10 passing

# 5. abrir la interfaz web
#    http://localhost:8080/Aplicacion.html
```

### Mapa de qué ejercicio resuelve qué fichero

| Ejercicio del PDF                                              | Resuelto en                                          |
| -------------------------------------------------------------- | ---------------------------------------------------- |
| Sección 1, SQL básico                                          | `01-sql/`                                            |
| Sección 2, lógica + `mainTest1`                                | `02-aplicacion/logica/funciones/{prueba, insertarPersona, buscarPersonaConDNI, borrarFilasDeTodasLasTablas, cerrarConexion}` + `logica/test/mainTest1.js` |
| Sección 2, alta de asignaturas (`mainTest2`)                   | `funciones/insertarAsignatura` + `logica/test/mainTest2.js` |
| Sección 2, matrícula (`mainTest3`)                             | `funciones/matricular` + `logica/test/mainTest3.js`  |
| Sección 2, asignaturas matriculadas por apellidos (`mainTest4`)| `funciones/buscarAsignaturasDePersonaPorApellidos` + `logica/test/mainTest4.js` |
| Sección 3, servidor REST + reglas + tests                      | `servidorREST/mainServidorREST.js` (regla universal `POST /f/<funcion>`) + `servidorREST/test/mainTest1.js` y `mainTest2.js` |
| Ejercicio Final, SPA con proxy de la lógica                    | `ux/Aplicacion.html` + `ux/logicaFake/`              |

### Sobre la regla REST "universal"

En lugar de escribir una ruta REST por cada método de la lógica
(`GET /persona/:dni`, `POST /alta`, ...), se ha adoptado el convenio:

```
POST /f/<nombreFuncion>
body: <argumentos JSON>
```

Esto rompe ligeramente la "filosofía REST" pero permite que **cada nueva
función de la lógica quede expuesta automáticamente** sin tocar el servidor.
La aplicación web (`ux/logicaFake/`) usa esa misma convención.
