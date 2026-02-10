#include <iostream>
using namespace std;

int main() {
    // Initialize variables
    int sum = 0;
    int number = 1;

    // Your code here

    cout << "Este programa hara un sumatorio hasta 50, Incrementara el numero por 2 y lo sumara" << endl;
    
    do{
        sum += number;
        number += 2;

        cout << "El numero es: " << sum << endl;
        cout << "La suma es: " << number << endl;
        
        
    } while (number <= 50);

    // Print the final sum
    cout << "La suma Final es: " << sum << endl;
    return 0;

}