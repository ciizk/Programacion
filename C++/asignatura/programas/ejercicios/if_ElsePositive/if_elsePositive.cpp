#include <iostream>
using namespace std;

int main() {
    cout << "Enter a number, please" << endl;
    int number;
    cin >> number;
    string result = "";

    // Use the ternary operator with all three cases.
    result = (number < 0) ? "negative" : (number > 0) ? "positive" : "zero";

    cout << "The number is " << result << endl;
    return 0;
}