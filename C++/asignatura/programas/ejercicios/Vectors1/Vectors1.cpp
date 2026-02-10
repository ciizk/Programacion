#include <iostream>
#include <vector>
using namespace std;

int main(){

    cout << "Cuantos elementos quieres que tenga el vector? " << endl;

    int elementos = 0;

    cin >> elementos;

    vector <int> records (elementos);


    for (int i=0; i<elementos; i++){

        cout << "Introduce el valor del vector n'o " << i+1 << endl;

        cin >> records[i];

    }

    cout << "A continuacion te muestro el vector" << endl;

    for (int j=0; j<records.size(); j++){

    cout << records[j] << endl;

    }

}










