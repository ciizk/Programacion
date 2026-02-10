#include <iostream>
using namespace std;

int main() {
    cout << "Enter the password, NO HARD R's " << endl;
    string word;
    cin >> word;
    string result = "";

    // Case-sensitive check; add more options as needed.
    if (word == "nigga" || word == "Nigga" || word == "NIGGA") {
        result = "Access Granted! Welcome niggiri!";
    } else {
        result = "Incorrect password, try again";
    }

    cout << result << endl;
    return 0;
}
