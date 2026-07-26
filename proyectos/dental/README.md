# Proyecto Web DOA / GTI

Este proyecto corresponde al desarrollo de una plataforma web educativa formada por dos áreas principales:

* **GTI**: parte pública del proyecto, donde se presenta el producto DOA y se gestionan acciones como el acceso, registro y compra.
* **DOA**: plataforma educativa privada, con funcionalidades diferentes según el tipo de usuario.

## Tecnologías utilizadas

* HTML5
* CSS3
* JavaScript
* PHP
* MySQL / MariaDB
* XAMPP para el desarrollo local
* Plesk para el despliegue web

## Estructura principal del proyecto

```text
config/                         Configuración general de la aplicación.
src/php/bbdd/                   Conexión, consultas y lógica relacionada con la base de datos.
src/php/gti/                    Páginas públicas de GTI.
src/php/doa/                    Páginas privadas de la plataforma DOA.
src/php/doa/includes/           Componentes reutilizables, como headers y sidebars.
src/assets/css/                 Hojas de estilo organizadas por módulos.
src/assets/js/                  Archivos JavaScript de cada página o funcionalidad.
src/assets/img/                 Imágenes, iconos y recursos visuales.
storage/uploads/                Archivos subidos desde la aplicación.
```

## Roles de usuario

La plataforma DOA dispone de diferentes tipos de usuario, cada uno con sus propias pantallas y funcionalidades:

* Alumno
* Profesor
* Secretaría

## Organización del código

Las páginas se han separado por módulos y roles para facilitar el mantenimiento del proyecto.

Los elementos comunes, como cabeceras y menús laterales, se reutilizan mediante archivos `include`, evitando repetir el mismo código en varias páginas.

Los archivos CSS y JavaScript también se organizan según la sección o funcionalidad a la que pertenecen.