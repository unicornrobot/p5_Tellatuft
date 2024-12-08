// Sensor0 Touch T0 = I04  - ORANGE WIRE
// Sensor1 Touch T6 = IO14 - not used
// Sensor2 Touch T3 = IO15 - BLUE WIRE
// Sensor3 Touch T5 = IO12 - ACTIVE
// Sensor4 Touch T4 = IO13 - 
// Sensor5 Touch T9 = IO32   

String handStatus = "0";


/////BLUETOOTH

#include "BluetoothSerial.h"

#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
#error Bluetooth is not enabled! Please run `make menuconfig` to and enable it
#endif

BluetoothSerial SerialBT;


#include <Adafruit_NeoPixel.h>
//#include <WiFi.h>
//#include <esp_wifi.h>

//LED pin
#define PIN 18 //gpio

String serialData = "0,0,0,0,0,0,0,0";

int range0,range1,range2,range3,range4,range5,range6,range7 = 0;
 
// When we setup the NeoPixel library, we tell it how many pixels, and which pin to use to send signals.
// Note that for older NeoPixel strips you might need to change the third parameter--see the strandtest
Adafruit_NeoPixel pixels = Adafruit_NeoPixel(175, PIN, NEO_GRB + NEO_KHZ800);
 


#include <TouchLib.h>
/*
 * Code generated by TouchLib SemiAutoTuning.
 *
 * Hardware configuration:
 *   sensor 0: type: capacitive (touchRead()) method), pin 4
 */

/*
 *  Number of sensors. For capacitive sensors: needs to be a minimum of 2. When
 * using only one sensor, set N_SENSORS to 2 and use an unused analog input pin for the second
 * sensor. For 2 or more sensors you don't need to add an unused analog input.
 */
#define N_SENSORS                       8

/*
 * Number of measurements per sensor to take in one cycle. More measurements
 * means more noise reduction / spreading, but is also slower.
 */
#define N_MEASUREMENTS_PER_SENSOR       16

/* tlSensors is the actual object that contains all the sensors */
TLSensors<N_SENSORS, N_MEASUREMENTS_PER_SENSOR> tlSensors;

// Define the number of samples to keep for the moving average
#define AVERAGE_SAMPLES 10 // 10 is good for smoothing

// Arrays to store the last AVERAGE_SAMPLES readings for each sensor
int sensorReadings[8][AVERAGE_SAMPLES];
int readingIndex = 0;

void setup() {

  //adc_power_off();
  //  WiFi.disconnect(true);  // Disconnect from the network
  // WiFi.mode(WIFI_OFF);    // Switch WiFi off

  
  // put your setup code here, to run once:
Serial.begin(9600); //9600 is the deafult for p5.serialserver/webserial

//BLUETOOTH
SerialBT.begin("ESP32LITEBT"); //Bluetooth device name
//Serial.println("The device started, now you can pair it with bluetooth!");


pixels.begin(); // This initializes the NeoPixel library.
pixels.setBrightness(10);
pixels.clear();

         
        /*
         * Configuration for sensor 0:
         * Type: capacitive (touchRead() method)
         * Pin: 4
         */
        tlSensors.initialize(0, TLSampleMethodTouchRead);
        tlSensors.data[0].tlStructSampleMethod.touchRead.pin =         27;
        tlSensors.data[0].releasedToApproachedThreshold =              267;
        tlSensors.data[0].approachedToReleasedThreshold =              240;
        tlSensors.data[0].approachedToPressedThreshold =               19914;
        tlSensors.data[0].pressedToApproachedThreshold =               17923;
        tlSensors.data[0].calibratedMaxDelta =                         41101;
        tlSensors.data[0].filterType = TLStruct::filterTypeAverage;

        /*
         * Configuration for sensor 1:
         * Type: capacitive (touchRead() method)
         * Pin: 15
         */
        tlSensors.initialize(1, TLSampleMethodTouchRead);
        tlSensors.data[1].tlStructSampleMethod.touchRead.pin =         32;
        tlSensors.data[1].releasedToApproachedThreshold =              488;
        tlSensors.data[1].approachedToReleasedThreshold =              439;
        tlSensors.data[1].approachedToPressedThreshold =               14106;
        tlSensors.data[1].pressedToApproachedThreshold =               12695;
        tlSensors.data[1].calibratedMaxDelta =                         28923;
        tlSensors.data[1].filterType = TLStruct::filterTypeAverage;

        /*
         * Configuration for sensor 2:
         * Type: capacitive (touchRead() method)
         * Pin: 13
         */
        tlSensors.initialize(2, TLSampleMethodTouchRead);
        tlSensors.data[2].tlStructSampleMethod.touchRead.pin =         12;
        tlSensors.data[2].releasedToApproachedThreshold =              636;
        tlSensors.data[2].approachedToReleasedThreshold =              573;
        tlSensors.data[2].approachedToPressedThreshold =               13292;
        tlSensors.data[2].pressedToApproachedThreshold =               11963;
        tlSensors.data[2].calibratedMaxDelta =                         27379;
        tlSensors.data[2].filterType = TLStruct::filterTypeAverage;

        /*
         * Configuration for sensor 3:
         * Type: capacitive (touchRead() method)
         * Pin: 12
         */
        tlSensors.initialize(3, TLSampleMethodTouchRead);
        tlSensors.data[3].tlStructSampleMethod.touchRead.pin =         4;
        tlSensors.data[3].releasedToApproachedThreshold =              483;
        tlSensors.data[3].approachedToReleasedThreshold =              435;
        tlSensors.data[3].approachedToPressedThreshold =               12659;
        tlSensors.data[3].pressedToApproachedThreshold =               11393;
        tlSensors.data[3].calibratedMaxDelta =                         25866;
        tlSensors.data[3].filterType = TLStruct::filterTypeAverage;

        /*
         * Configuration for sensor 4:
         * Type: capacitive (touchRead() method)
         * Pin: 14
         */
        tlSensors.initialize(4, TLSampleMethodTouchRead);
        tlSensors.data[4].tlStructSampleMethod.touchRead.pin =         13;
        tlSensors.data[4].releasedToApproachedThreshold =              258;
        tlSensors.data[4].approachedToReleasedThreshold =              233;
        tlSensors.data[4].approachedToPressedThreshold =               13593;
        tlSensors.data[4].pressedToApproachedThreshold =               12234;
        tlSensors.data[4].calibratedMaxDelta =                         27944;
        tlSensors.data[4].filterType = TLStruct::filterTypeAverage;

        /*
         * Configuration for sensor 5:
         * Type: capacitive (touchRead() method)
         * Pin: 27
         */
        tlSensors.initialize(5, TLSampleMethodTouchRead);
        tlSensors.data[5].tlStructSampleMethod.touchRead.pin =         14;
        tlSensors.data[5].releasedToApproachedThreshold =              520;
        tlSensors.data[5].approachedToReleasedThreshold =              468;
        tlSensors.data[5].approachedToPressedThreshold =               12104;
        tlSensors.data[5].pressedToApproachedThreshold =               10894;
        tlSensors.data[5].calibratedMaxDelta =                         25198;
        tlSensors.data[5].filterType = TLStruct::filterTypeAverage;

        /*
         * Configuration for sensor 6:
         * Type: capacitive (touchRead() method)
         * Pin: 33
         */
        tlSensors.initialize(6, TLSampleMethodTouchRead);
        tlSensors.data[6].tlStructSampleMethod.touchRead.pin =         15;
        tlSensors.data[6].releasedToApproachedThreshold =              61;
        tlSensors.data[6].approachedToReleasedThreshold =              55;
        tlSensors.data[6].approachedToPressedThreshold =               13631;
        tlSensors.data[6].pressedToApproachedThreshold =               12268;
        tlSensors.data[6].calibratedMaxDelta =                         27847;
        tlSensors.data[6].filterType = TLStruct::filterTypeAverage;

        /*
         * Configuration for sensor 7:
         * Type: capacitive (touchRead() method)
         * Pin: 32
         */
        tlSensors.initialize(7, TLSampleMethodTouchRead);
        tlSensors.data[7].tlStructSampleMethod.touchRead.pin =         33;
        tlSensors.data[7].releasedToApproachedThreshold =              168;
        tlSensors.data[7].approachedToReleasedThreshold =              152;
        tlSensors.data[7].approachedToPressedThreshold =               14903;
        tlSensors.data[7].pressedToApproachedThreshold =               13413;
        tlSensors.data[7].calibratedMaxDelta =                         30380;
        tlSensors.data[7].filterType = TLStruct::filterTypeAverage;

       
        if (tlSensors.error) {
                Serial.println("Error detected during initialization of TouchLib. This is "
                       "probably a bug; please notify the author.");
                while (1);
        }
/*
        Serial.println("Calibrating sensors...");
        while(tlSensors.anyButtonIsCalibrating()) {
                tlSensors.sample();
        }
        Serial.println("Calibration done...");
*/
}

void loop() {

//int var1 = int(random(100));

tlSensors.sample(); // <-- Take a series of new samples for all sensors //
/*
Serial.print(tlSensors.getDelta(0));Serial.print(",");
Serial.print(tlSensors.getDelta(1));Serial.print(",");
Serial.print(tlSensors.getDelta(2));Serial.print(",");
Serial.print(tlSensors.getDelta(3));Serial.print(",");
Serial.println(tlSensors.getDelta(4));

Serial.print(tlSensors.getRaw(0));Serial.print(",");
Serial.print(tlSensors.getRaw(1));Serial.print(",");
Serial.print(tlSensors.getRaw(2));Serial.print(",");
Serial.print(tlSensors.getRaw(3));Serial.print(",");
Serial.print(tlSensors.getRaw(4));Serial.print("          ");
*/

//change values to between 0 and 360
//** calibrated from raw data - released/pressed

int rangeMax = 360; //HSB range (0-360)
//int rangeMax = 100; //brightness

//RAW ESP32 SETTINGS (NO CONDUCTIVE CONNECTIONS)


int range0 = map(tlSensors.getRaw(0), 3400, 1000, 0, rangeMax);//ORANGE // (input, min, max, rangemin, rangemax)

int range1 = map(tlSensors.getRaw(1), 4000, 1000, 0, rangeMax);//BLUE

int range2 = map(tlSensors.getRaw(2), 3600, 600, 0, rangeMax);//PLANT1

int range3 = map(tlSensors.getRaw(3), 4800, 1500, 0, rangeMax);//PLANT2

int range4 = map(tlSensors.getRaw(4), 3800, 1500, 0, rangeMax);//WHITE

int range5 = map(tlSensors.getRaw(5), 3800, 1500, 0, rangeMax);//BLACK

int range6 = map(tlSensors.getRaw(6), 3800, 1500, 0, rangeMax);//BROWN

int range7 = map(tlSensors.getRaw(7), 4200, 2000, 0, rangeMax);//RED



//cap min and max 
if (range0 < 10) {range0 = 0;}; if (range0 >rangeMax) {range0 = rangeMax;}
if (range1 < 10) {range1 = 0;}; if (range1 >rangeMax) {range1 = rangeMax;}
if (range2 < 10) {range2 = 0;}; if (range2 >rangeMax) {range2 = rangeMax;}
if (range3 < 10) {range3 = 0;}; if (range3 >rangeMax) {range3 = rangeMax;}
if (range4 < 11) {range4 = 0;}; if (range4 >rangeMax) {range4 = rangeMax;}
if (range5 < 11) {range5 = 0;}; if (range5 >rangeMax) {range5 = rangeMax;}
if (range6 < 11) {range6 = 0;}; if (range6 >rangeMax) {range6 = rangeMax;}
if (range7 < 11) {range7 = 0;}; if (range7 >rangeMax) {range7 = rangeMax;}

//output RAW sensor values
/*
Serial.print(tlSensors.getRaw(0));Serial.print(",");
Serial.print(tlSensors.getRaw(1));Serial.print(",");
Serial.print(tlSensors.getRaw(2));Serial.print(",");
Serial.print(tlSensors.getRaw(3));Serial.print(",");
Serial.print(tlSensors.getRaw(4));Serial.print(",");
Serial.print(tlSensors.getRaw(5));Serial.print(",");
Serial.print(tlSensors.getRaw(6));Serial.print(",");
Serial.println(tlSensors.getRaw(7));
*/


//pixels.clear();

//LEDS
/*
int ledBar0 = map(range0, 0,100, 0,17); 
int ledBar1 = map(range1, 0,100, 17,33);
int ledBar2 = map(range2, 0,100, 33,49);
int ledBar3 = map(range3, 0,100, 49,66);
int ledBar4 = map(range4, 0,100, 66,83);
*/

//Serial.print(ledBar0);Serial.print(" ");
/*
pixels.clear();

for (int i = 0; i < 17 ; i++){
  pixels.setPixelColor(i, pixels.Color(255,102,0)); // ORANGE
  pixels.setBrightness(range0);
}
for (int j = 17; j < 33 ; j++){
  pixels.setPixelColor(j, pixels.Color(255,0,0)); // RED
  pixels.setBrightness(range1);
}
for (int k = 33; k < 49 ; k++){
  pixels.setPixelColor(k, pixels.Color(0,81,82)); // blue 
  pixels.setBrightness(range2);
}
for (int l = 49; l < 66 ; l++){
 pixels.setPixelColor(l, pixels.Color(75,100,0)); // lime 
 pixels.setBrightness(range3);
}
for (int m = 66; m < 83 ; m++){
  pixels.setPixelColor(m, pixels.Color(255,77,208)); // lime 
  pixels.setBrightness(range4);
}
pixels.show();
*/

    // Store the current readings in the arrays
    sensorReadings[0][readingIndex] = range0;
    sensorReadings[1][readingIndex] = range1;
    sensorReadings[2][readingIndex] = range2;
    sensorReadings[3][readingIndex] = range3;
    sensorReadings[4][readingIndex] = range4;
    sensorReadings[5][readingIndex] = range5;
    sensorReadings[6][readingIndex] = range6;
    sensorReadings[7][readingIndex] = range7;

    // Increment the reading index and wrap around if necessary
    readingIndex = (readingIndex + 1) % AVERAGE_SAMPLES;


    // Calculate the averages
    int avgRange0 = calculateAverage(sensorReadings[0]);
    int avgRange1 = calculateAverage(sensorReadings[1]);
    int avgRange2 = calculateAverage(sensorReadings[2]);
    int avgRange3 = calculateAverage(sensorReadings[3]);
    int avgRange4 = calculateAverage(sensorReadings[4]);
    int avgRange5 = calculateAverage(sensorReadings[5]);
    int avgRange6 = calculateAverage(sensorReadings[6]);
    int avgRange7 = calculateAverage(sensorReadings[7]);


    // Update the serialData string with the averaged values
 /* serialData = String(avgRange0) + "," + String(avgRange1) + "," + String(avgRange2) + "," + 
                 String(avgRange3) + "," + String(avgRange4) + "," + String(avgRange5) + "," + 
                 String(avgRange6) + "," + String(avgRange7);
                 */

 // Update the serialData string with the normal raw values
    serialData = String(range0) + "," + String(range1) + "," + String(range2) + "," + 
                 String(range3) + "," + String(range4) + "," + String(range5) + "," + 
                 String(range6) + "," + String(range7);


//LEDS
// pixels.Color takes RGB values, from 0,0,0 up to 255,255,255


//175 pixels
//10 buffer at either end
//20 pixels per segment (x8)
/*
for (int s0 = 10; s0 < 30; s0++){
  //NICE GREEN
  pixels.setBrightness(avgRange0);
  pixels.setPixelColor(s0, pixels.Color(27, 179, 15));
 
  //Serial.print(pixels.getBrightness()); Serial.print(" ");
}
for (int s1 = 30; s1 < 50; s1++){
  pixels.setBrightness(avgRange1);
  pixels.setPixelColor(s1, pixels.Color(27, 179, 15));
}
for (int s2 = 50; s2 < 70; s2++){
    pixels.setBrightness(avgRange2);
    pixels.setPixelColor(s2, pixels.Color(27, 179, 15));
}
for (int s3 = 70; s3 < 90; s3++){
    pixels.setBrightness(avgRange3);
    pixels.setPixelColor(s3, pixels.Color(27, 179, 15));
}
for (int s4 = 90; s4 < 110; s4++){
    pixels.setBrightness(avgRange4);
    pixels.setPixelColor(s4, pixels.Color(27, 179, 15));
}
for (int s5 = 110; s5 < 130; s5++){
    pixels.setBrightness(avgRange5);
    pixels.setPixelColor(s5, pixels.Color(27, 179, 15));
}
for (int s6 = 130; s6 < 150; s6++){
    pixels.setBrightness(avgRange6);
    pixels.setPixelColor(s6, pixels.Color(27, 179, 15));
}
for (int s7 = 150; s7 < 170; s7++){
    pixels.setBrightness(avgRange7);
    pixels.setPixelColor(s7, pixels.Color(27, 179, 15));
}
pixels.show();
*/

// Set a base color (nice green)
uint32_t baseColor = pixels.Color(27, 179, 15);



// Set colors for each section
for (int s0 = 10; s0 < 30; s0++) {
  pixels.setPixelColor(s0, applyBrightness(baseColor, avgRange7));
}
for (int s1 = 30; s1 < 50; s1++) {
  pixels.setPixelColor(s1, applyBrightness(baseColor, avgRange6));
}
for (int s2 = 50; s2 < 70; s2++) {
  pixels.setPixelColor(s2, applyBrightness(baseColor, avgRange5));
}
for (int s3 = 70; s3 < 90; s3++) {
  pixels.setPixelColor(s3, applyBrightness(baseColor, avgRange4));
}
for (int s4 = 90; s4 < 110; s4++) {
  pixels.setPixelColor(s4, applyBrightness(baseColor, avgRange3));
}
for (int s5 = 110; s5 < 130; s5++) {
  pixels.setPixelColor(s5, applyBrightness(baseColor, avgRange2));
}
for (int s6 = 130; s6 < 150; s6++) {
  pixels.setPixelColor(s6, applyBrightness(baseColor, avgRange1));
}
for (int s7 = 150; s7 < 170; s7++) {
  pixels.setPixelColor(s7, applyBrightness(baseColor, avgRange0));
}

pixels.show();



//////////ONLY OUTPUT THIS BELOW FOR TELLATUFT USB CONNECTION/////////////

//output scaled (0-360)
////
//****** MUST USE ONLY 1 Serial.println STEATEMENT FOR P5.SerialServer to work properly
//** Otherwise it seems to only read the last data
Serial.println(serialData);
//BLUETOOTH//
SerialBT.println(serialData);

delay(100);
}

// Function to apply brightness to a color
uint32_t applyBrightness(uint32_t color, int brightness) {
  uint8_t r = (uint8_t)(color >> 16);
  uint8_t g = (uint8_t)(color >> 8);
  uint8_t b = (uint8_t)color;
  
  r = (r * brightness) / 100;
  g = (g * brightness) / 100;
  b = (b * brightness) / 100;
  
  return pixels.Color(r, g, b);
}


// Function to calculate the average of an array
int calculateAverage(int* array) {
    long sum = 0;
    for (int i = 0; i < AVERAGE_SAMPLES; i++) {
        sum += array[i];
    }
    return sum / AVERAGE_SAMPLES;
}
