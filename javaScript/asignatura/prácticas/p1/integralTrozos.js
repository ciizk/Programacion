/*--------------------------------------------------------------------------------------------
Fichero: integralTrozos.js
Autor: Francisco Indriago
Fecha: 11/02/2026
Descripción: Función que recibe una Integral y calcula el area de esta (muestra resultado)
--------------------------------------------------------------------------------------------*/

function integralTrozos(a, b, n, f, callback){  // Declaramos la función con sus variables
    setTimeout( function(){                      // Usamos timeout para simular una tarea que toma tiempo el cálculo
        const dx = (b-a) / n;                    // Creamos la constante de el ancho (base) de cada trozo siendo 'n' la cantidad de trozos
        let areaTotal = 0;                       // Aseguramos que inicializamos en el área 0

        for(let i=0; i<n; i++){                  // Bucle para la suma de'n' rectángulos
            let x = a + i * dx ;                 // Cálculamos la posición inicial de x, osea 'a' 

            let altura = f(x);                   //Cálculamos la altura

            let areaRectángulo= dx * altura;     // Cálculamos el área del rectángulo (base x altura)
            areaTotal = areaTotal + areaRectángulo;   // Suma Total del área
        }
        callback(areaTotal);                          //Usamos callback para entregar el resultado
    }, 1500);                                        
}
                       
// ------------- PRUEBA AUTOMÁTICA -----------------

const miFuncion = function(x){         // f(x)
    return x * x;  // Definimos la función x^2
}

const a1 = -5         // Definimos los limites de la integral
const b1 = 15
const n = 100000       // Definimos La cantidad de 'trozos' para la aproximación

console.log("El cálculo de la integral entre " + a1 + " y " + b1 + " es: " )

integralTrozos(a1, b1, n, miFuncion, function(resultado){    // Llamamos a la función, y miFuncion siendo la f(x) a integrar
    
    if (resultado !=1166.6466667999923){         //Comprobamos si coincide con lo que queremos
        console.log("Algo va mal");
    } else {
        console.log(resultado);
        console.log("Todas las pruebas han pasado")
    }    
});






