#include <iostream>
using namespace std;


int main(){
    cout << "" << endl;
    cout << "Este programa hace operaciones con 2 valores que introduzcas" << endl;
    cout << "" << endl;

    double a;
    double b;

    cout << "Intoduce el primer valor." << endl;
    cin >> a;
    cout << "Introduce el segundo valor." << endl;
    cin >> b;

    double suma = a + b;
    double resta= a - b;
    double multiplicacion= a * b;
    double division= a / b;


    cout << "La suma de " << a << " y " << b << " es " << suma << endl;
    cout << "La resta de " << a << " y " << b << " es " << resta << endl; 
    cout << "La multiplicacion de " << a << " y " << b << " es " << multiplicacion << endl;
    cout << "La division de " << a << " y " << b << " es " << division << endl;
    cout << "" << endl;
    cout << "Gracias por usar el programa" << endl;
    cout << "Hasta la proxima!" << endl;
    cout << "" << endl;
    
}