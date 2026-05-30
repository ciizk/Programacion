# Arquitectura de la aplicación

```
+-----------------+      HTTP (REST)     +------------------+
|   Navegador     |  <----------------> |  servidorREST    |
|  Aplicacion.html|     POST /f/<f>     |  (Express)       |
|  + logicaFake/  |                     |                  |
+-----------------+                     |  cargarReglas... |
                                        |                  |
                                        |       |          |
                                        |       v          |
                                        |   logica.js      |
                                        |   (cargador)     |
                                        |       |          |
                                        |       v          |
                                        | funciones/*      |
                                        |       |          |
                                        |       v          |
                                        |  sqlite3 (BD)    |
                                        |  bd/datos.bd     |
                                        +------------------+
```

## 1. Esquema de la base de datos

| Tabla       | Columnas                        | Clave primaria | Claves ajenas                                   |
| ----------- | ------------------------------- | -------------- | ----------------------------------------------- |
| `Persona`   | dni, nombre, apellidos          | dni            | -                                               |
| `Asignatura`| codigo, nombre                  | codigo         | -                                               |
| `Matricula` | dni, codigo                     | (dni, codigo)  | dni → Persona(dni), codigo → Asignatura(codigo) |

## 2. Lógica del negocio (logica/funciones/)

Cada fichero del directorio `funciones/` exporta una función asíncrona. El
módulo `cargador.js` las descubre dinámicamente e inyecta la conexión a la BD.

| Función                                    | Entrada                          | Salida                           |
| ------------------------------------------ | -------------------------------- | -------------------------------- |
| `prueba`                                   | -                                | texto                            |
| `borrarFilasDeTodasLasTablas`              | -                                | -                                |
| `insertarPersona`                          | {dni, nombre, apellidos}         | -                                |
| `buscarPersonaConDNI`                      | {dni}                            | [{dni, nombre, apellidos}]       |
| `insertarAsignatura`                       | {codigo, nombre}                 | -                                |
| `matricular`                               | {dni, codigo}                    | -                                |
| `buscarAsignaturasDePersonaPorApellidos`   | {apellidos}                      | [{codigo, nombre}]               |
| `cerrarConexion`                           | -                                | -                                |

## 3. Reglas REST (servidorREST/mainServidorREST.js)

| Verbo + recurso        | Acción                                                              |
| ---------------------- | ------------------------------------------------------------------- |
| GET  /prueba           | Comprobación rápida: devuelve "¡Funciona!"                          |
| POST /f/<nombreFuncion>| Invoca la función `<nombreFuncion>` de la lógica con el JSON body   |

Esta regla universal evita tener que escribir una ruta REST por cada método.

## 4. Programa web de usuario (ux/)

- `Aplicacion.html`: formularios + botones para invocar cada función.
- `logicaFake/llamar.js`: proxy genérico que hace `POST /f/<nombre>` por
  `XMLHttpRequest`.
- `logicaFake/<nombreFuncion>.js`: stubs con la misma firma que los métodos
  de la lógica original, redirigiendo a `llamar()`.
