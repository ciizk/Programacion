/*--------------------------------------------------------------------------------------------
Fichero: vector.js
Autor: Francisco Indriago
Fecha: 05/05/2026
Descripción: Apartado 3 del 2° Examen de Programación 2
--------------------------------------------------------------------------------------------*/

//------------------------------------------------------------------------------------------
//  Función
//------------------------------------------------------------------------------------------
import Punto from '../../prácticas/p5/exportar-clase/Punto' // Me confundí y lo escribí mal en el examen


// Creo que no borré un constructor de la clase Punto

class Vector {
    constructor(p1, p2){
        this.dx = p2.x - p1.x;
        this.dy = p2.y - p1.y;
    }
}

function sumar(vec1, vec2){
    return {
        dx: vec1.dx + vec2.dx,
        dy: vec1.dy + vec2.dy
    }
}

function pEscalar(vec1, vec2){
    return vec1.dx * vec2.dx + vec1.dy * vec2.dy
}

function modulo(vec1){
    return Math.sqrt(vec1.dx * vec1.dx + vec1.dy * vec1.dy)
}

//------------------------------------------------------------------------------------------
//  Prueba automática
//------------------------------------------------------------------------------------------

let p3 = new Punto(3,0);
let p4 = new Punto(5,0);

let vec3 = new Vector(p3, p4);
let vec4 = new Vector(p4, p3);

//------------------------------------------------------------------------------------------
//  Test
//------------------------------------------------------------------------------------------
// Tuve errores con los resultados, aquí estan los valores de res correctos
let resSuma = {dx: 0, dy: 0};
if(sumar(vec3,vec4) != resSuma){ console.log('va mal') } else { console.log('va bien')}
/* if (JSON.stringify(sumar(vec3,vec4)) != JSON.stringify(resSuma)){
    console.log('va mal') 
} else { console.log('va bien')} */

let resEsc = (2 * -2) + (0 * 0); 
if(pEscalar(vec3,vec4) != resEsc){ console.log('va mal') } else { console.log('va bien')}

let resModulo = 2; 
if(modulo(vec3) != resModulo){ console.log('va mal') } else { console.log('va bien')}