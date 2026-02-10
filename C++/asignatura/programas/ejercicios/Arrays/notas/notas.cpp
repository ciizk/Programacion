#include <iostream>
using namespace std;



double calculateAverageGrade(int grades[], int size) {
    // Revisamos si el array esta vacio
    if (size == 0){
        return 0.0;
    }
    // Calculamos la suma de las notas
    double sum = 0;
    for( int i =0; i< size; i++){
        sum += grades[i];
    }
    // calculamos y regresamos
    return sum/size;
}

int main() {
    int n;

    cout << "Introduce 6 calificaciones" << endl;

    cin >> n;
    cin.ignore();
    int arr[n];

    for (int i = 0; i < n; i++) {
        int val;
        cin >> val;
        arr[i] = val;
    }


    double averageGrade = calculateAverageGrade(arr, n);
    cout << "Average grade: " << averageGrade << std::endl;
    return 0;
}