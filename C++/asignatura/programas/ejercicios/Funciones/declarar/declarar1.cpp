#include <iostream>
using namespace std;

// Method declaration
void sumNumbers() {
    // Complete Method
   int res = 0;
   for(int i = 1; i <= 1000; i++) {
    res += i;
   }
    cout << res << endl;
}

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        // Call the method n times
        sumNumbers();
    }
    return 0;
}