#include <iostream>
using namespace std;
//---------------------------------------------------------------


//----------------

int main() {
    int month;
    cout << "Put a number from 1-12 for each month" << endl; 
    cin >> month;
    string season = "";
    
    //----------------------------------------------------
    switch (month) {
        case 12:
        season = "Winter";
        case 1: 
        season = "Winter";
        case 2:
        season = "Winter";
        break;
        case 3:
        season = "Spring";
        case 4:
        season = "Spring";
        case 5:
        season = "Spring";
        break;
        case 6:
        season = "Summer";
        case 7:
        season = "Summer";
        case 8:
        season = "Summer";
        break;
        case 9: 
        season = "Autumn";
        case 10:
        season = "Autumn";
        case 11:
        season = "Autumn";
        
        break;

        default:
        season = "An invalid month";

    }
    
    cout << "Your month is on " << season << endl;
    return 0;
}