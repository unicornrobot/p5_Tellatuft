#include "AiEsp32RotaryEncoder.h"
#include "Arduino.h"

/*
connecting Rotary encoder

Rotary encoder side    MICROCONTROLLER side  
-------------------    ---------------------------------------------------------------------
CLK (A pin)            any microcontroler intput pin with interrupt -> in this example pin 32
DT (B pin)             any microcontroler intput pin with interrupt -> in this example pin 21
SW (button pin)        any microcontroler intput pin with interrupt -> in this example pin 25
GND - to microcontroler GND
VCC                    microcontroler VCC (then set ROTARY_ENCODER_VCC_PIN -1) 

***OR in case VCC pin is not free you can cheat and connect:***
VCC                    any microcontroler output pin - but set also ROTARY_ENCODER_VCC_PIN 25 
                        in this example pin 25

*/
#if defined(ESP8266)
#define ROTARY_ENCODER_A_PIN D6
#define ROTARY_ENCODER_B_PIN D5
#define ROTARY_ENCODER_BUTTON_PIN D7
#else
#define ROTARY_ENCODER1_A_PIN 22 //orange
#define ROTARY_ENCODER1_B_PIN 23 //green
#define ROTARY_ENCODER1_BUTTON_PIN 21 //brown

#define ROTARY_ENCODER2_A_PIN 19 //blue
#define ROTARY_ENCODER2_B_PIN 18 //green
#define ROTARY_ENCODER2_BUTTON_PIN 17 //purple

#define ROTARY_ENCODER3_A_PIN 39 //brown
#define ROTARY_ENCODER3_B_PIN 34 //red
#define ROTARY_ENCODER3_BUTTON_PIN 35 //orange
#endif
#define ROTARY_ENCODER_VCC_PIN -1 /* 27 put -1 of Rotary encoder Vcc is connected directly to 3,3V; else you can use declared output pin for powering rotary encoder */

//depending on your encoder - try 1,2 or 4 to get expected behaviour
//#define ROTARY_ENCODER_STEPS 1
//#define ROTARY_ENCODER_STEPS 2
#define ROTARY_ENCODER_STEPS 4

//instead of changing here, rather change numbers above
AiEsp32RotaryEncoder rotaryEncoder1 = AiEsp32RotaryEncoder(ROTARY_ENCODER1_A_PIN, ROTARY_ENCODER1_B_PIN, ROTARY_ENCODER1_BUTTON_PIN, ROTARY_ENCODER_VCC_PIN, ROTARY_ENCODER_STEPS);
AiEsp32RotaryEncoder rotaryEncoder2 = AiEsp32RotaryEncoder(ROTARY_ENCODER2_A_PIN, ROTARY_ENCODER2_B_PIN, ROTARY_ENCODER2_BUTTON_PIN, ROTARY_ENCODER_VCC_PIN, ROTARY_ENCODER_STEPS);
AiEsp32RotaryEncoder rotaryEncoder3 = AiEsp32RotaryEncoder(ROTARY_ENCODER3_A_PIN, ROTARY_ENCODER3_B_PIN, ROTARY_ENCODER3_BUTTON_PIN, ROTARY_ENCODER_VCC_PIN, ROTARY_ENCODER_STEPS);

void rotary_onButtonClick(int btnNum)
{
	static unsigned long lastTimePressed = 0;
	//ignore multiple press in that time milliseconds
	if (millis() - lastTimePressed < 500)
	{
		return;
	}
	lastTimePressed = millis();
	//Serial.print("button " + String(btnNum) + " pressed ");
	//Serial.print(millis());
	//Serial.println(" milliseconds after restart");
}

void rotary_loop()
{
	//dont print anything unless value changed
	if (rotaryEncoder1.encoderChanged())
	{
		//Serial.print("Value1: ");
		//Serial.println(rotaryEncoder1.readEncoder());
	}
	if (rotaryEncoder1.isEncoderButtonClicked())
	{
		rotary_onButtonClick(1);
	}
  if (rotaryEncoder2.encoderChanged())
	{
		//Serial.print("Value2: ");
		//Serial.println(rotaryEncoder2.readEncoder());
	}
	if (rotaryEncoder2.isEncoderButtonClicked())
	{
		rotary_onButtonClick(2);
	}
  //rot 3
  if (rotaryEncoder3.encoderChanged())
	{
		//Serial.print("Value3: ");
		//Serial.println(rotaryEncoder3.readEncoder());
	}
	if (rotaryEncoder3.isEncoderButtonClicked())
	{
		rotary_onButtonClick(3);
	}
}

void IRAM_ATTR readEncoderISR()
{
	rotaryEncoder1.readEncoder_ISR();
  rotaryEncoder2.readEncoder_ISR();
  rotaryEncoder3.readEncoder_ISR();

}






/*****************************************************************************/
float p1[8] = {0.0}, p2[8] = {0.0}, p3[8] = {0.0};  // 3-Point history for 8 sensors
float raw[8] = {0.0}; // Current readings for 8 sensors
float baseline[8] = {0.0};
float smoothed[8] = {0.0};
unsigned long count = 0; 

// Smoothing factors. The closer to one (1.0) the smoother the data. Smoothing 
// introduces a delay. 
//const float dataSmoothingFactor = 0.95;  //ORIGINAL     
//const float baselineSmoothingFactor = 0.9995; //ORIGINAL
const float dataSmoothingFactor = 0.80;       
const float baselineSmoothingFactor = 0.9999;

//T9 = IO32
//T0 = IO4
//T8 = IO33
//T3 = IO15
//T7 = IO27
//T4 = IO13
//T6 = IO14
//T5 = IO12
int sensorPins[8] = {T9, T0, T8, T3, T7, T4, T6, T5}; // Default sensor pin values 0- 7

int minValues[8] = {15}; // Initialize with high values - as in how hard is touched
int maxValues[8] = {83,73,87,65,81,81,92,86}; // Initialize with low values - resting with no touch

 int rangeMax = 360;


void setup()
{
  Serial.begin(9600);
  //delay(100); 

//rotary encoders
//we must initialize rotary encoder
	rotaryEncoder1.begin();
	rotaryEncoder1.setup(readEncoderISR);
  rotaryEncoder2.begin();
	rotaryEncoder2.setup(readEncoderISR);
  rotaryEncoder3.begin();
	rotaryEncoder3.setup(readEncoderISR);
	//set boundaries and if values should cycle or not
	//in this example we will set possible values between 0 and 1000;
	bool circleValues = false;
	rotaryEncoder1.setBoundaries(0, 360, circleValues); //minValue, maxValue, circleValues true|false (when max go to min and vice versa)
  rotaryEncoder2.setBoundaries(0, 360, circleValues); //minValue, maxValue, circleValues true|false (when max go to min and vice versa)
  rotaryEncoder3.setBoundaries(0, 360, circleValues); //minValue, maxValue, circleValues true|false (when max go to min and vice versa)

	/*Rotary acceleration introduced 25.2.2021.
   * in case range to select is huge, for example - select a value between 0 and 1000 and we want 785
   * without accelerateion you need long time to get to that number
   * Using acceleration, faster you turn, faster will the value raise.
   * For fine tuning slow down.
   */
	//rotaryEncoder.disableAcceleration(); //acceleration is now enabled by default - disable if you dont need it
  int acceleration = 250;
	rotaryEncoder1.setAcceleration(acceleration); //or set the value - larger number = more accelearation(250); 0 or 1 means disabled acceleration
  	rotaryEncoder2.setAcceleration(acceleration); //or set the value - larger number = more accelearation(250); 0 or 1 means disabled acceleration
  	rotaryEncoder3.setAcceleration(acceleration); //or set the value - larger number = more accelearation(250); 0 or 1 means disabled acceleration



//touch pins
  // Initialize history and smoothed values to an average of a few readings for each sensor
  for (int i = 0; i < 8; i++) {
    for (int j = 0; j < 100; j++) {
      raw[i] += touchRead(sensorPins[i]); 
    delay(10);
    }
    raw[i] = raw[i] / 100;
    p3[i] = raw[i];
    p2[i] = raw[i];
    p1[i] = raw[i];
    smoothed[i] = raw[i];
    baseline[i] = raw[i];
  }
}

/*****************************************************************************/
void loop()
{
  // Current values for each sensor
  for (int i = 0; i < 8; i++) {
    raw[i] = touchRead(sensorPins[i]); 
    p1[i] = raw[i]; // Latest point in the history
    
    //
    //p1[i] = map(raw[i],-20,50,rangeMax,0); // min/max mapped to 0-360 (reversed)
    
    // Glitch detector
    if (abs(p3[i] - p1[i]) < 5) {
      if (abs(p2[i] - p3[i]) > 3) {
        p2[i] = p3[i];
      }
    }

    //if (raw[i] < 0) {p1[i]=0;}; if (p1[i] > rangeMax) {p1[i]= rangeMax;}


    // Smooth the de-glitched data to take out some noise
    smoothed[i] = p3[i] * (1 - dataSmoothingFactor) + smoothed[i] * dataSmoothingFactor;

    //smoothed[i] = constrain(smoothed[i], 0, rangeMax);

    

    // Dynamic baseline tracking
    if (count > 50) {
      baseline[i] = p3[i] * (1 - baselineSmoothingFactor) + baseline[i] * baselineSmoothingFactor;
    }

    // Shift the history
    p3[i] = p2[i];
    p2[i] = p1[i];
  }

  // Output smoothed values as a comma-separated string
  String output = "";
  String debugRaw = "";

 
    
  for (int i = 0; i < 8; i++) {
    //output += String(int(smoothed[i]) - int(baseline[i]));
    //output += String(raw[i]);

    //dont allow negative numbers to be outputted.
    //DOESNT WORK
    //if (int(smoothed[i]) < 0 ) {smoothed[i] = 0;};
    
    output += String(map(smoothed[i],maxValues[i],minValues[i],0, rangeMax));
    debugRaw += String(int(raw[i]));
    
    if (i < 7) output += ",";debugRaw += ","; // Add comma between values
  }
  //Serial.println(output + " - " + debugRaw );
  Serial.print(output);
  Serial.print(",0,0,");//button placeholders
  Serial.println(String(rotaryEncoder1.readEncoder()) + "," + String(rotaryEncoder2.readEncoder()) + "," + String(rotaryEncoder3.readEncoder()));



  delay(100);
}
