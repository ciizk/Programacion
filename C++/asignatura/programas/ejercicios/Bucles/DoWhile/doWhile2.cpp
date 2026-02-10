#include <iostream>
using namespace std;

int main() {

    int limite;
    int sum = 0;
    int number = 1;

    cout << "Introduce un numero que determine el limite del sumatorio: ";
    cin >> limite;

    cout << "Este programa hara un sumatorio hasta " << limite 
         << ", incrementando el numero por 2 y sumandolo." << endl;

    do {
        cout << "El numero es: " << number << endl;
        sum += number;
        number += 2;
        
    } while (number <= limite);

    cout << "La suma final es: " << sum << endl;

    return 0;
}
