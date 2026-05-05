/*--------------------------------------------------------------------------------------------
Fichero: json.js
Autor: Francisco Indriago
Fecha: 31/03/2026
Descripción: Diseña e implementa una estructura con objetos de JavaScript 
para representar tu horario de clases, Añadiendo la hora de inicio de cada asignatura.
--------------------------------------------------------------------------------------------*/

//------------------------------------------------------------------------------------------
// 1. OBJETO PERSONA + JSON
//------------------------------------------------------------------------------------------
var persona = {
    dni: "Z0911953P",
    nombre: "Francisco",
    apellidos: "Indriago Valenzuela",
    edad: 19,
    telefonos: [658620632, 676767677]
};

console.log("///////// PERSONA /////////");

// Convertir a JSON
var textoJSON = JSON.stringify(persona);
console.log("JSON:", textoJSON);

// Convertir de JSON a objeto
var personaObjeto = JSON.parse(textoJSON);
console.log("Objeto:", personaObjeto);


//------------------------------------------------------------------------------------------
// 2. HORARIO DE CLASES
//------------------------------------------------------------------------------------------
var horario = {
    lunes: [
        { asignatura: "proyecto web", hora: "08:45" },
        { asignatura: "redes", hora: "11:30" },
        
    ],
    martes: [
        { asignatura: "proyecto web", hora: "08:30" },
        { asignatura: "programacion", hora: "10:45" },

    ],
    miercoles: [
        { asignatura: "redes", hora: "09:00" },
        { asignatura: "proyecto", hora: "11:15" },
        { asignatura: "diseño UX", hora: "13:15" }
    ],
    jueves: [
        { asignatura: "programacion", hora: "08:30" },
        { asignatura: "diseño UX", hora: "10:45" },
    ],
    viernes: [
        { asignatura: "programación", hora: "08:30" },
        { asignatura: "diseño UX", hora: "09:45" },
        { asignatura: "proyecto web", hora: "12:30" }
    ]
};

console.log("///////// HORARIO /////////");
console.log(horario);

// Convertir horario a JSON
var horarioJSON = JSON.stringify(horario);
// console.log("Horario en JSON:", horarioJSON);


//------------------------------------------------------------------------------------------
// 3. FUNCIÓN BUSCAR ASIGNATURA
//------------------------------------------------------------------------------------------
function buscarAsignatura(horario, nombreAsignatura) {
    var resultado = [];

    for (var dia in horario) {
        var clases = horario[dia];

        for (var i = 0; i < clases.length; i++) {
            if (clases[i].asignatura === nombreAsignatura) {
                resultado.push({
                    dia: dia,
                    hora: clases[i].hora
                });
            }
        }
    }

    return resultado;
}

console.log("///////// BUSCAR ASIGNATURA /////////");

// Prueba
var resultadoBusqueda = buscarAsignatura(horario, "programacion");
console.log("Resultado:", resultadoBusqueda);