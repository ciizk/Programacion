/*--------------------------------------------------------------------------------------------
Fichero: calcularIntegral.js
Autor: Francisco Indriago
Fecha: 11/02/2026
Descripción: Función que recibe una Integral y calcula el area de esta
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
const miFuncion = function(x){          // f(x)
    return x * x;                       // Definimos la función x^2
}

const a1 = -5                          // Definimos los limites de la integral y los 'trozos'
const b1 = 15
const n = 100000

integralTrozos(a1, b1, n , miFuncion, function(resultado){
    if (resultado != 1166.6466667999923){
        console.log("Algo va mal");
    }
});







/* ----------------------------------------- EXPLICACIÓN -------------------------------------------------

La Estructura de la Función
    function calcularIntegral(a, b, n, f, callback)
Necesitamos todos los datos matemáticos (a, b, n, f) para hacer la cuenta.
Pero lo más importante aquí es el parámetro extra callback.
Como la función va a tardar un tiempo (por el setTimeout), no puede devolver el valor inmediatamente con return.
El callback es como decirle: "Cuando termines, llama a este número (función) y dame el dato".


    setTimeout(function() { ... }, 1000);
Esto convierte nuestra función en asíncrona.
En JavaScript, si tienes un cálculo matemático gigante (millones de rectángulos), 
la página web se congelaría y el usuario no podría hacer clic en nada.
setTimeout saca este cálculo del flujo principal, permitiendo que el resto del programa siga funcionando
mientras el cálculo "se cocina" en segundo plano.

El Cálculo de dx y x
    const dx = (b - a) / n; → Esto es el ancho de cada trozo.
    let x = a + i * dx; → Esto ubica dónde empieza cada rectángulo.
Si i=0 (primer rectángulo), x es a.
Si i=1 (segundo rectángulo), x es a + un ancho.
Si i=2 (tercer rectángulo), x es a + dos anchos.


    callback(areaTotal);
Esta es la línea clave de la asincronía.
Justo cuando el bucle termina, en lugar de return areaTotal (que se perdería dentro del setTimeout),
ejecutamos la función que nos pasaron (callback) y le "inyectamos" el resultado.
*/