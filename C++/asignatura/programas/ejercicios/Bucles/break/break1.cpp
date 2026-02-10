#include <iostream>
using namespace std;

int main(){

    // introduzco al usuario al programa
    cout << "" << endl;
    cout << "Introduce un valor, el sistema contara hasta llegar a tu valor (maximo 100)" << endl;

    // Defino las variables
    int j;
    cin >> j;

    // confirmo el valor de la variable
    cout << "" << endl;
    cout << "El numero introducido es el " << j << ", contare hasta " << j << endl;

    // bucle para contar hasta 100
    for( int i =1; i <= 100; i++){
        cout << i << endl;
        if( i == j){
            break; // break para detener de contar en la variable establecida
        }

    }
}