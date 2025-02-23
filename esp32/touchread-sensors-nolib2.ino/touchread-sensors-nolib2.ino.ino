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
const float dataSmoothingFactor = 0.90;       
const float baselineSmoothingFactor = 0.9990;

int sensorPins[8] = {T9, T0, T8, T3, T7, T4, T6, T5}; // Default sensor pin values 0- 7

int minValues[8] = {3}; // Initialize with high values
int maxValues[8] = {38,52,38,37,32,35,33,31}; // Initialize with low values

 int rangeMax = 360;


void setup()
{
  Serial.begin(9600);
  //delay(100); 

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
    if (int(smoothed[i]) < 0 ) {smoothed[i] = 0;};
    
    output += String(map(smoothed[i],maxValues[i],minValues[i],0, rangeMax));
    debugRaw += String(int(raw[i]));
    
    if (i < 7) output += ",";debugRaw += ","; // Add comma between values
  }
  Serial.println(output);// + " - " + debugRaw );

  delay(100);
}
