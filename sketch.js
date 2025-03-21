//CLICK FOR FULLSCREEN TOGGLE
// serial communication between a microcontroller with 8 sensor values
//visualizations based on the reading
//different modes

//KEY PRESSES///
//  s = startscreen
//  c = capture
//  r = results
//-------------
//  d = debug
//  v = cycle through modes
//  a = save screenshot
//  b = reset weave

// 


let serial; // variable for the serial object
let latestData = "waiting for data"; // variable to hold the data
let portButton;

let inputs = []; // all your inputs in an array
let totalInputs = 8; //how many incoming touch inputs?

//BUTTONS
let button1State = 0;
let button2State = 0;

let lastButton1State = 0;
let lastButton2State = 0;

let debounceDelay = 50; // Adjust the debounce delay as needed
let lastDebounceTime1 = 0;
let lastDebounceTime2 = 0;

//rotary encoders
let rotary1, rotary2, rotary3 = 0; //defaults

//weave controls
let initialBoxHeight = 0; // Set the initial value for boxHeight
let initialWeaveOffset = 0; // Set the initial value for weaveOffset


//webmidi//defaults.
//GLOBAL VALUES TO SAVE CONSTOLLER VALUES
let mappedControllerValues = [0,150,100,100,100,360,100,0,0,300,0,0,0,0,0,0,0,0]; //first item (0) not used
let savedControllerValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0];

let midiKnobValues = []; // Array to store MIDI knob values


let sensors = [];
let splitVal;

let debugMode = false; // Start in debug mode
let offlineMode = false; // Global variable to track offline mode
let midiLogRaw = false;
let sampleData = []; // Array to hold generated sample data

let maxDataValue = 360; // the max value the sensor is sending

let displayInfo = false;

let backgroundColor =[0,0,10] //0,0,32 = grey / 10 dark grey

let brushMode = false ; // enable p5 Brush mode - stops loop - needs fixing

let graphData = []; // Array to store historical data for each sensor
//const maxDataPoints = 360; // Maximum number of data points to store for each sensor
let hillHeight = 30; //value of disatnce between 

let  w=500;let h=200;let noFunc = 1;

// Add these near the top of your sketch, with other global variables
let frameCounter = 0;
let updateInterval = 5; // Initial update interval
const minInterval = 1;
const maxInterval = 60;

let time = 0
let vel = NaN // TWO_PI / 300 assigned in setup()
let hori_count= 14
let vert_count = 7

let sunColor;
let sunAlpha = 100;

let toggleOutline = false;


let startScreen = 7; // 4 is weave drawing // 7 is palette choice.
let captureScreen = 4;
let resultsScreen = 5;// (used if captureMode = fixed/continous) 5 = beckymode - 6 = circulrgraph

let viewMode = startScreen;

//if (offlineMode){viewMode = 5;} else {viewMode = startScreen;}

 // 0: Debug, 1: Live Graphs, 2: Geometric Animations, 3: Flower Garden, 4: Summary Flower 5: wavegarden 

let flowerX = 0;
const flowerColors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", 
  "#98D8C8", "#F67280", "#C06C84", "#6C5B7B"
];

let previousViewMode = 0;

// Add these new variables
let capturedData = [];
let isCapturing = true;
let summaryData = 0;
let waveHeight; // Declare waveHeight as a global variable
let averages =[];

let isReadingData = true; // Flag to control data reading
let runOnce = false;


let myFont; // Variable to hold the font

function preload() {
    // Load the font file (make sure the path is correct)
    myFont = loadFont('assets/Roboto-Regular.ttf'); // Replace with your font file path
    
}

//let bgColor = (0,0,32);//grey

//PALETTES
let palettes = [];
let selectedPaletteIndex = 1; //(1-8)
const totalPalettes = 8;
const colorsPerPalette = 8;
//let globalPalette;
let currentPalette = []; // Global variable for the current palette


////SETUP//////

function setup() {
  createCanvas(windowWidth, windowHeight,WEBGL);
  //fullscreen();
  frameRate(30);

  colorMode(HSB,360,100,100,100)
  background(0,0,32);//grey

  //generateRandomPalettes();
  generateRandomColorRamps();
  
  textFont(myFont); // Set the loaded font
  textSize(32);
  noFill()

  //strokeWeight(3)
  //noStroke();
    vel = TWO_PI / 300

    WebMidi
    .enable()
    .then(onMidiEnabled)
    .catch(err => alert(err));
  
  sunColor = color(60, 100, 100, 10);
   
  // serial constructor
   serial = new p5.WebSerial();
  // check to see if serial is available:
   if (!navigator.serial) {
    alert("WebSerial is not supported in this browser. Try Chrome or MS Edge.");
  } 
  // get a list of all connected serial devices
  //serial.getPorts();
  // serial port to use - you'll need to change this
  //serial.open('/dev/tty.SLAB_USBtoUART');//USB
  //serial.open('/dev/tty.ESP32_demo-ESP32SPP');//Bluetooth
  //
  // if serial is available, add connect/disconnect listeners:
  navigator.serial.addEventListener("connect", portConnect);
  navigator.serial.addEventListener("disconnect", portDisconnect);
  // check for any ports that are available:
  serial.getPorts();
  // if there's no port chosen, choose one:
  serial.on("noport", makePortButton);
  // open whatever port is available:
  serial.on("portavailable", openPort);
  // handle serial errors:
  serial.on("requesterror", portError);
  // handle any incoming serial data:
  serial.on("data", gotData);
  serial.on("close", makePortButton);


  // Generate initial sample data
  generateSampleData();

  waveHeight = height / 20; // Initialize waveHeight based on the canvas height
}


function draw() {

  if (viewMode !== previousViewMode) {
    resetView();
    previousViewMode = viewMode;
  }

  //NEEDED WHEN IN WEBGL MODE
  translate(-width / 2, -height / 2); // Move the origin to the top-left corner
  /////////////////////////////

  switch (viewMode) {
    case 0:
      drawDebugView();
      break;
    case 1:
      drawLiveGraphs();
      break;
    case 2:
      drawGeometricAnimations();
      break;
    case 3:
      drawFlowerGarden();
      break;
    case 4:
      drawWeave();
      captureData();
      //drawSummary();
      break;
    case 5:

      drawDashboard(); //dataviz dashboard

      //drawResultsScreen(); //Becky mode
     
      break;
    case 6: 
      //drawWaveformGarden();
      drawResultsScreen(); //Becky mode
      break;
    case 7:
      displayPalettes();
      dashDrawOnce = false;
      break;
  }

}




// when data is received in the serial buffer
function gotData() {

  if (!isReadingData) return; // If not reading data, exit the function


  let currentString = serial.readLine(); // store the data in a variable
  //trim(currentString); // get rid of whitespace
  if (!currentString) return; // if there's nothing in there, ignore it
  //console.log(currentString); // print it out
  latestData = currentString; // save it to the global variable

  //DEBUG
  //if(debugMode){console.log(currentString)}
  //seperate values in the array
  let splitVal = splitTokens(currentString, ',');

  //parse strings into ints. 
  splitVal = splitVal.map(value => isNaN(value) ? 0 : int(value)); // Convert to int and replace NaN with 0

  //only push  totalInputs at one a time. 
  sensors = [];
  for (let i = 0; i < totalInputs; i++) {
    sensors.push(splitVal[i])
    
  }
//button 1 = index 8
//button 2 = index 9
button1State = splitVal[9];
button2State = splitVal[8];

//rotarys
rotary1 = splitVal[12];
rotary2 = splitVal[11];
rotary3 = splitVal[10];
if(debugMode){console.log(rotary1 + "-" + rotary2 + "-" + rotary3)};

//if(debugMode){console.log("btn1,2: "+ splitVal[8] + "," + splitVal[9])};

  // Update button states
  updateButtonStates(splitVal);

  // Process sensor values as needed
  // ...
}

///FULLSCREEN CODE
function mousePressed() {
  //background(0,0,32);
  if (mouseX > 0 && mouseX < windowWidth && mouseY > 0 && mouseY < windowHeight) {
    
    //fullscreen mouse toggle - disabled while developing 
    //let fs = fullscreen();
    //fullscreen(!fs);
    
    generateRandomColorRamps();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  resetView();
}

//KEY PRESSES///
//  s = startscreen
//  c = capture
//  r = results
//-------------
//  d = debug
//  v = cycle through modes
//  a = save screenshot
//  b = reset weave


function keyPressed() {

   if (key === 'f' || key === 'F') { // Press 'f' for full screen
    let fs = fullscreen();
    fullscreen(!fs);
    }


   if (key === 'a' || key === 'A') { // Press 'A' to save data
    //saveDataToLocalStorage();
    saveCanvas('weave_' + Date.now(), 'png');
    }

    if (key === 'i' || key === 'I') { // Press 'i' to show info
    displayInfo = !displayInfo;
    }

  

    if (key >= '1' && key <= '8') {
      selectedPaletteIndex = int(key); // Update selected palette index // -1 is needed to map index to palette number (0=1)
      console.log(`Palette Selected: ${selectedPaletteIndex}`); // Log the selected palette
      //viewMode(key)
    } 


    if (key === 's' || key === 'S') { // Press 'A' to save data
      viewMode = startScreen;
     }
    if (key === 'c' || key === 'C') {
    setGlobalPalette();
    capturedData = []; //clear out the dataset for next time.
    viewMode = captureScreen;
    //console.log(palette)
    }
    if (key === 'r' || key === 'R') {
      viewMode = resultsScreen; }

   


    
  

  if (key === 'b' || key === 'B') { //back to data capture
    capturedData = [];//reset data

    if(viewMode=6){viewMode=4;verticalOffset = 0;dashDrawOnce=false};
  }
  if (key == "p") {
    //console.log("Ports!");
    serial.requestPort();
  }
  if (key === 'D' || key === 'd') {
    debugMode = !debugMode;
  }
  if (key === 'v' || key === 'V') {
    viewMode = (viewMode + 1) % 7; // Now cycles through 7 views

    if (viewMode === 4) {
      // Reset capture for weave view
      capturedData = [];
      isCapturing = true;

    }
  }
  if (key === '+' || key === '=') {
    updateInterval = constrain(updateInterval - 1, minInterval, maxInterval);
  }
  if (key === '-' || key === '_') {
    updateInterval = constrain(updateInterval + 1, minInterval, maxInterval);
  }
  if (key === 'o' || key === 'O') { // Press 'O' to toggle offline mode
    offlineMode = !offlineMode;
    if (offlineMode) {
      viewMode = 5;
      console.log("Offline mode activated. Sample data will be used.");
    } else {
      viewMode = 4;
      console.log("Offline mode deactivated. Live data will be used.");
    }
  }
}


/////////////
// PALETTES ///
/////////////

function getColorFromPalette(index) { //UNUSED??
  const selectedColor = currentPalette[index];
  return {
      h: hue(selectedColor),
      s: saturation(selectedColor),
      l: lightness(selectedColor),
  };
}


///RAPENSAU RELATED FUNCTIONS.
//https://meodai.github.io/rampensau/
//RAMPENSAU COLOR RAMPS
function generateRandomColorRamps() {
  palettes = []; // Clear existing palettes

  for (let i = 0; i < 8; i++) {
    
    //KNOBS
    
      //const hCenter = mappedControllerValues[1]; // Map hue center to MIDI knob 1 (0-360)
      //const hCenter = rotary1; // Map hue center to esp knobs
      //const hCycles = map(mappedControllerValues[2], 0, 360, 0.1, 0.9); // Map hue cycles to MIDI knob 2
      //const hCycles = rotary2; //esp knob
     //const sRange = [map(mappedControllerValues[3], 0, 360, 20, 80), map(mappedControllerValues[4], 0, 360, 30, 80)]; // Map saturation range to MIDI knobs 3 and 4
      const sRange = [mappedControllerValues[3], mappedControllerValues[4]]; // Map saturation range to MIDI knobs 3 and 4
      //const sRange = rotary3; //esp knob


      const lRange = [map(mappedControllerValues[5], 0, 360, 10, 100), map(mappedControllerValues[6], 0, 360, 17, 10)]; // Map lightness range to MIDI knobs 5 nd 6
      //const lRange = [mappedControllerValues[5], mappedControllerValues[6]]; // Map lightness range to MIDI knobs 5 nd 6

      const hCenter = Math.random() * 360
      const hCycles = Math.random() * 0.5
      //const sRange = [round(random(50,80),1), round(random(30,80),1) ]; // 
      //const lRange = [round(random(50,80),1), round(random(30,80),1)]; // 


      const palette = generateColorRamp({
        total: 8,
        //*
        hCenter: hCenter, 
        hCycles: hCycles,
        sRange: sRange,  // SATURATION RANGE - try 30, 70 
        //*/
        /*
        hCenter: hCenter, 
        hCycles: hCycles, //1.5
        sRange: [sRange,sRange],  // SATURATION RANGE - try 30, 70 
        /*/
        sEasing: x => Math.pow(x, 2),
        lRange: lRange,
        //lRange: [lRange, lRange],
        lEasing: easings.easeInQuad,//x => Math.pow(x, 15),
      });
      palettes.push(palette);
      if(debugMode){console.log(`Palette ${i+1}: hCenter=${round(hCenter,1)}, hCycles=${round(hCycles,1)}, sRange=${sRange}, lRange=${lRange}`)}; // Output values to console for debugging
      if(debugMode){console.log(`knob ${i+1}: ${round(mappedControllerValues[i+1],1)}`)};

  }
}

const easeIn = p => t => Math.pow(t, p)
const easeOut = p => t => 1 - easeIn(p)(1 - t)
const easeInOut = p => t => t < .5 ? easeIn(p)(t * 2) / 2 : easeOut(p)(t * 2 - 1) / 2 + .5
const easings = {
	linear: easeIn(1),
	easeInQuad: easeIn(2),
	easeOutQuad: easeOut(2),
	easeInOutQuad: easeInOut(2),
	easeInCubic: easeIn(3),
	easeOutCubic: easeOut(3),
	easeInOutCubic: easeInOut(3),
	easeInQuart: easeIn(4),
	easeOutQuart: easeOut(4),
	easeInOutQuart: easeInOut(4),
	easeInQuint: easeIn(5),
	easeOutQuint: easeOut(5),
	easeInOutQuint: easeInOut(5)
}

//EXAMPLE generateRandomColorRamp /// 
/*function generateRandomColorRamps() {
  palettes = []; // Clear existing palettes

  for (let i = 0; i < 8; i++) {
      const palette = generateColorRamp({
        total: 8,
        hCenter: Math.random() * 360, 
        hCycles: Math.random() * 1.5, //1.5
        sRange: [30, 70],  // 30, 70 
        sEasing: x => Math.pow(x, 2),
        lRange: [Math.random() * 30, 75 + Math.random() * 10],
        lEasing: easings.linear,//x => Math.pow(x, 15),
      });
      palettes.push(palette);
  }
}
*/



//system random - not so pretty :( ////
function generateRandomPalettes() {
  for (let i = 0; i < totalPalettes; i++) {
      let palette = [];
      for (let j = 0; j < colorsPerPalette; j++) {
          let hue = random(360);
          let saturation = random(50, 100);
          let lightness = random(30, 70);
          palette.push(color(hue, saturation, lightness));
          
      }
      palettes.push(palette);
      if(debugMode){console.log(`Palette ${i + 1}:`, palette)}; // Log the generated palette
  }

  if(debugMode){accessHSLValues()};
}

////DISPLAY PALETTES

// Global flag to indicate if the sensor value for hue is the default option
let useSensorHue = true; // Enabled by default

function displayPalettes() {
  if (debugMode) { console.log(sensors.toString()); }

  // Check for button presses
  if (button1State === 1) { // If btn1 is pressed go to the capture screen
    setGlobalPalette();
    capturedData = []; // Clear out the dataset for next time.
    imageSaved = false;
    viewMode = captureScreen; 
  }
  if (button2State === 1) { // If btn2 is pressed shuffle the palettes
    generateRandomColorRamps(); // TO DO - CYCLE ONLY ONCE.
  }

  background(backgroundColor);
  noStroke();
  const paletteWidth = width * 0.1 / colorsPerPalette; // Adjusted width for each color in a palette
  const paletteHeight = height * 0.07; // Adjusted height for each palette block
  const margin = width * 0.06; // Adjusted margin between palettes
  const startY = height - (paletteHeight + margin) * 3.7; // Starting Y position for 4 rows

  // Calculate the total width for the palette area
  const totalPaletteWidth = 2 * (paletteWidth * colorsPerPalette) + margin; // Total width of both columns plus margin
  const startX = (width - totalPaletteWidth) / 2; // Center the palettes horizontally

  // Draw the full hue range color bar
  const hueBarWidth = (width) - 2 * margin - width * 0.7; // Width of the hue bar
  const hueBarHeight = paletteHeight * 0.7; // Height of the hue bar
  const hueBarY = startY - hueBarHeight - margin; // Y position for the hue bar, just above the palette bars

  // Draw the hue bar centered on the x-axis
  for (let h = 0; h < 360; h++) {
    fill(h, 100, 100); // Set fill color based on hue
    rect(width / 2 + h * (hueBarWidth / 360) - hueBarWidth / 2, hueBarY, hueBarWidth / 360, hueBarHeight); // Draw a rectangle for the hue centered on the x-axis
  }

  // Draw a white box around the hue bar to indicate it's the default option
  if (sensors.every(sensor => sensor <= 40)) { // Check if no sensors are being touched (with a threshold allowance)
    stroke(0, 0, 70); // White color for the box
    strokeWeight(5);
    noFill();
    rect(width / 2 - hueBarWidth / 2, hueBarY - 2, hueBarWidth, hueBarHeight + 4); // Draw the box in the center of the x-axis
    useSensorHue = true;
  } else {
    useSensorHue = false;
  }

  // DRAW PALETTE BARS
  for (let i = 0; i < 8; i++) { // Limit to display 4 rows of 2 palettes
    noStroke();
    const col = i % 2; // Column index (0 or 1)
    const row = floor(i / 2); // Row index (0 to 3)

    // Calculate position for each palette block
    const x = startX + col * (paletteWidth * colorsPerPalette + margin); // Adjusted for center alignment with equal distance and margins on the x-axis
    const y = startY + (paletteHeight + margin *0.5) * row;

    // Draw each color in the palette
    for (let j = 0; j < colorsPerPalette; j++) {
      fill(palettes[i][j]);
      rect(x + j * paletteWidth, y, paletteWidth, paletteHeight); // Draw color block aligned with the palette boxes
    }

    // Find the sensor with the highest reading and set selectedPaletteIndex accordingly
    let highestReading = 0;
    let highestReadingIndex = 0;
    for (let k = 0; k < sensors.length; k++) {
      if (sensors[k] > highestReading) {
        highestReading = sensors[k];
        highestReadingIndex = k;
      }
    }
    selectedPaletteIndex = highestReadingIndex + 1; // Adjust index to match palette numbering

    // Draw a white border around the selected palette if a sensor is detected
    if (selectedPaletteIndex === i + 1 && highestReading > 40) { // Check if this palette is selected and a sensor is detected
      strokeWeight(5); // Set stroke weight for the border
      stroke(0, 0, 70); // Set stroke color to white
      noFill(); // Ensure no fill for the border
      rect(x, y, paletteWidth * colorsPerPalette, paletteHeight); // Draw border around the selected palette aligned with the palette boxes
    } else {
      noStroke(); // Ensure no stroke for non-selected palettes or if no sensor is detected
    }
  }

  // Draw 2 grey circles above the palettes at the top of the screen
  if (button2State === 1) { fill(0, 0, 60); } else { noFill(); }
  stroke(0, 0, 60); // Set fill color to grey in HSB

  ellipse(margin * 0.5, margin * 0.5, paletteHeight*0.5, paletteHeight*0.5); // Draw first circle at the top left
  ellipse(width - margin * 0.8, margin * 0.5, paletteHeight*0.5, paletteHeight*0.5); // Draw second circle at the top right

  // Label the circles
  fill(0, 0, 100); // Set fill color to white in HSB
  textAlign(CENTER, CENTER); // Set text alignment to center
  textSize(paletteHeight / 4); // Set text size proportionally to paletteHeight
  text("new colours", margin * 1.2, margin * 0.2 + paletteHeight / 2); // Label first circle at the top left
  text("go", width - margin * 1.2, margin * 0.2 + paletteHeight / 2); // Label second circle at the top right
}

function accessHSLValues() {
  // Example: Access the HSL values of the first color in the first palette
  const paletteIndex = 7; // First palette
  const colorIndex = 7; // First color in the palette

  const selectedColor = palettes[paletteIndex][colorIndex]; // Get the color object
  const h = round(hue(selectedColor)); // Get the hue
  const s = round(saturation(selectedColor)); // Get the saturation
  const l = round(lightness(selectedColor)); // Get the lightness

  console.log(`HSL Values of Palette ${paletteIndex + 1}, Color ${colorIndex + 1}: H=${h}, S=${s}, L=${l}`);
}

function setGlobalPalette() {
  // Set the global palette color for use in the sketch
  currentPalette = palettes[selectedPaletteIndex-1]; //-1 needed for correct array position
  //console.log(palettes[selectedPaletteIndex]);
  // Example usage: fill(globalPalette[0]); // Use the first color of the selected palette
}




//////////////////////
//////DRAW WEAVE/////
////////////////////


let weaveOffset = 0; // Initialize a variable to track the horizontal offset
let verticalOffset = 0; // Initialize a variable to track the vertical offset
let resetToBottom = true; // Setting to enable drawing to start at the bottom when it reaches the top
let imageSaved = false;

function drawWeave() {
  //draw background
  //background(backgroundColor)
  noStroke();
  fill(0,0,30)
  rect(0,0,width,height*0.1)


  //draw buttons on screen
  const buttonSize = height * 0.07; // Adjusted height for each palette block
  const buttonLoc = width * 0.06; // Adjusted margin between palettes
  stroke(0,0,100)
  ellipse(buttonLoc * 0.5, buttonLoc * 0.5, buttonSize*0.5, buttonSize*0.5); // Draw first circle at the top left
  ellipse(width - buttonLoc * 0.8, buttonLoc * 0.5, buttonSize*0.5, buttonSize*0.5); // Draw second circle at the top right
  fill(0,0,100)
  text("data" ,width*0.07, buttonLoc * 0.4)

  

///Button logic
  if(button1State === 3){console.log("btn1")};
  if(button1State === 6 && imageSaved == false){saveCanvas('weave_' + Date.now(), 'png');imageSaved=true;} //long hold and release
  //if(button1State === 3 ){verticalOffset = 0;viewMode = resultsScreen}//data screen
  if(button2State === 1 || keyPressed === 'r'){verticalOffset = 0;text("processing",width*0.5,height*0.5,);viewMode = resultsScreen;}//back button

//BOX HEIGHT
  //MIDI MODE
  const boxHeight = map(mappedControllerValues[1], 0, 360, 1, 20); // Fixed height for each box - defines the thread size (1=small)
  //ROTARY MODE
  //const boxHeight = initialBoxHeight + map(int(rotary1), 360, 0, 10, 1); // Fixed height for each box - defines the thread size (1=small)

//DRAWING SPEED
  // Increment the offset for the next set of sensor data
  //MIDI MODE
  weaveOffset += height / map(mappedControllerValues[2], 0, 360, 10, 1); // speed of drawing - 0=fast  10=good
  
  //Rotary MODE
  //weaveOffset += height / map(rotary2, 0, 360, 0, 10); // speed of drawing - 0=fast  10=good, true for default value

  const centerX = width / 2; // Center of the screen
  const startY = height; // Start from the bottom of the screen

  let currentX = 0; // Initialize the starting x position


  let h = 0;
  let s = 0;
  let l = 0;


  for (let i = 0; i < sensors.length; i++) {
    const sensorValue = sensors[i];
    const boxWidth = map(sensorValue, 0, maxDataValue, 0, width / 2); // Map sensor value to box width

    // Draw the box
    noStroke();



    //HSB RAINBOW -- HUE MAPPED FROM SENSOR VALUE TO HSB WHEEL
    if(useSensorHue) {

      //make the palette boxes disappear when not pressed for each individual sensor
      if (sensorValue > 10) {
        fill(sensorValue, 90, 80, map(mappedControllerValues[3], 0, 360, 10, 100)); // Color based on sensor value / alpha knob 3

        //fill(sensorValue, 90, 80, map(rotary3, 360, 0, 100, 30)); // Color based on sensor value / alpha knob 3
      } else {
        fill(backgroundColor);
      }

   } else { //then use selected palette
     
    //HUE MAPPED TO KNOB 4 + SENSOR VALUES SET SAT AND BRI 
    //fill(mappedControllerValues[4], map(sensorValue, 0, 360, 50, 100), map(sensorValue, 0, 360, 50, 100), map(mappedControllerValues[3], 0, 360, 5, 100)); // Fixed hue, sensor values change saturation and brightness, alpha knob 3
    
    //HUE PICKED FROM A SELECTED PALETTE
    //fill(colors[i][0], colors[i][1], colors[i][2], map(mappedControllerValues[3], 0, 360, 10, 100)); // Color based on predefined palette / alpha knob 3
   
    //HUE PICKED BY CHOSEN GLOBAL PALETTE
    //const selectedColor = palettes[selectedPaletteIndex-1][i]; // Get the color object // (map the index to the palette number)
    const selectedColor = currentPalette[i]; // Get the color object // (map the index to the palette number)
    
    h = hue(selectedColor); // Get the hue
    s = saturation(selectedColor); // Get the saturation
    l = lightness(selectedColor); // Get the lightness
   
    fill(h,s,l*1.5);  //hack to match lightness value
    }
    //draw the boxes
    rect(currentX, startY - verticalOffset, boxWidth, boxHeight);
    
    // Draw the mirrored box on the x-axis
    rect(width - currentX - boxWidth, startY - verticalOffset, boxWidth, boxHeight);
 
    // Increment the x position for the next box
    currentX += boxWidth;

    //palette boxes

    let paletteBoxWidth = width/sensors.length *0.20;
    let palleteBoxHeight = height*0.01;
    let offset = 1.4;
    const column = i % 2;
    const row = floor(i / 2);
    rect(width / 2 - paletteBoxWidth / 2 - (paletteBoxWidth * offset) / 2 + column * (paletteBoxWidth * offset), row * (palleteBoxHeight * offset) + height*0.02, paletteBoxWidth, palleteBoxHeight);
//console.log(verticalOffset)
  }

   // Draw a circle the size of the paletteboxheight
   let paletteBoxWidth = width/sensors.length;
   let palleteBoxHeight = height*0.02;
   let offset = 1.4;
   noFill();
   stroke(0, 0, 100);
   strokeWeight(2);
   let xStart = width * 0.040;
   let yStart = height * 0.040;
   //ellipse(xStart, yStart, palleteBoxHeight*1.5, palleteBoxHeight*1.5);
   // Add text underneath that says "data"
   noStroke();
   //fill(255);
   textAlign(CENTER, TOP);
   textSize(width*0.009)
   //text("press=", xStart, yStart*0.2);
   text("data", xStart+palleteBoxHeight*2.5, palleteBoxHeight*1.5);


   // Draw knobs at the top of the screen
  const knobSize = 50; // Size of the knobs
  const knobY = 30; // Y position for the knobs
  const knobSpacing = 100; // Spacing between knobs
  const knobXStart = width / 4 - knobSpacing; // Starting X position for the first knob
  let knobs = [rotary1,rotary2,rotary3];

  for (let i = 0; i < 3; i++) {
    const knobX = knobXStart + i * knobSpacing; // Calculate X position for each knob
    fill(200); // Set knob color
    ellipse(knobX, knobY, knobSize, knobSize); // Draw the knob

     // Display the mapped rotary value inside the knob
     fill(0); // Set text color
     textAlign(CENTER, CENTER);
     let rotaryValue;
     if (i === 0) {
       rotaryValue = int(map(rotary1,0,360,0,10)); // Get value for the first knob
     } else if (i === 1) {
       rotaryValue = int(map(rotary2,0,360,0,10)); // Get value for the second knob
     } else {
       rotaryValue = int(rotary3); // Get value for the third knob
     }
     text(rotaryValue, knobX, knobY+10); // Display the mapped rotary value
   

    // Display the current rotary value
    fill(0); // Set text color
    textAlign(CENTER, CENTER);
    text(`Rotary ${i + 1}: ${int(knobs[i])}`, knobX, knobY); // Display the rotary value
  }





    if (debugMode) {


      //console.log(currentPalette);
      //console.log(palettes[selectedPaletteIndex-1]);
      //noLoop();

      console.log(sensors.toString());

     // console.log(`thread width: ${round(boxHeight)}`, width-120, height - 60);
      //console.log(`weave speed: ${round(mappedControllerValues[2])}`, width-120, height - 40);
      //console.log(`brightness: ${round(mappedControllerValues[3])}`, width-120, height - 20);

      /*
      console.log(`thread width: ${round(boxHeight)}`);
      console.log(`weave speed: ${round(mappedControllerValues[2])}`);
      console.log(`brightness: ${round(mappedControllerValues[3])}`);
      */
    }
    print("1:height: " + round(mappedControllerValues[1]) + " 2:offset: " + round(mappedControllerValues[2]) + " 3:alpha" + round(mappedControllerValues[3]));




  // If the weaveOffset exceeds the height, reset it and move up vertically
  if (weaveOffset > height) {
    weaveOffset = 0;

        // Only draw when at least one sensor value is more than zero
  if (sensors.some(sensor => sensor > 50)) {
    verticalOffset += boxHeight; // Move up for the next iteration without gap
  }

    // If verticalOffset exceeds the screen height, reset it based on the setting
    if (verticalOffset > height*0.9) { //distance to loop from the top of the screen
        if(!resetToBottom){verticalOffset=0;viewMode = resultsScreen};
      verticalOffset = resetToBottom ? 0 : height - boxHeight; //resettoBottom is either true or false
    }
  }
  


}


function drawFlowerGarden() {
  // Clear background only when starting a new row
  if (flowerX === 0) {
    background(backgroundColor);
  }

  // Only draw when at least one sensor value is more than zero
  if (sensors.some(sensor => sensor > 0)) {
    for (let i = 0; i < sensors.length; i++) {
      // Introduce a probability check to reduce flower creation
      if (random() < 0.2) { // 30% chance to draw a flower
        drawFlower(i);
      }
    }
    flowerX += 2; // Increase horizontal spacing between potential flower positions
    if (flowerX > width) {
      flowerX = 0; // Reset to the left side when reaching the right edge
    }
  }
}

function drawFlower(sensorIndex) {
  const sensorValue = sensors[sensorIndex];
  const minStemHeight = 50;
  const maxStemHeight = height-300;
  const stemHeight = map(sensorValue, 0, 360, minStemHeight, maxStemHeight);
  const flowerSize = 30; // Fixed flower size
  const y = height - stemHeight;
  const baseAlpha = 20; // Base transparency value for stems
  const maxAlpha = 60; // Maximum transparency for stems
  const alpha = map(sensorValue, 0, 100, baseAlpha, maxAlpha);

  // Calculate stem bend
  const maxBend = 20; // Maximum bend in pixels
  const bendDirection = random() > 0.5 ? 1 : -1; // Randomly choose left or right
  const bendAmount = map(sensorValue, 0, 100, 0, maxBend) * bendDirection;

  // Calculate the actual top point of the stem
  const topX = flowerX + bendAmount;

  // Draw stem with organic bend
  push(); // Save current drawing state
  strokeWeight(0.5); // Thin stem
  stroke(120, 70, 60, alpha); // Green color in HSB with variable transparency
  noFill();
  beginShape();
  vertex(flowerX, height);
  bezierVertex(
    flowerX + bendAmount * 0.2, height - stemHeight * 0.3,
    flowerX + bendAmount * 0.8, height - stemHeight * 0.7,
    topX, y
  );
  endShape();

  // Add a slight curve in the opposite direction for more organic look
  beginShape();
  vertex(flowerX, height);
  bezierVertex(
    flowerX - bendAmount * 0.1, height - stemHeight * 0.4,
    flowerX - bendAmount * 0.2, height - stemHeight * 0.6,
    topX - bendAmount * 0.2, y + stemHeight * 0.1
  );
  endShape();
  pop(); // Restore previous drawing state

  // Generate random rotation for flower head
  const randomRotation = random(TWO_PI);

  // Draw flower head
  push(); // Save current drawing state
  noStroke();
  fill(color(flowerColors[sensorIndex] + hexAlpha(alpha * 2))); // Adjust flower head alpha
  drawFlowerHead(topX, y, flowerSize, randomRotation);
  pop(); // Restore previous drawing state
}

function drawFlowerHead(x, y, size, rotation) {
  push();
  translate(x, y);
  rotate(rotation);
  for (let i = 0; i < 5; i++) {
    ellipse(0, -size / 2, size / 2, size);
    rotate(TWO_PI / 5);
  }
  fill(60, 50, 70, 2); // Yellow center in HSB
  ellipse(0, 0, size / 2, size / 2);
  pop();
}

function hexAlpha(alpha) {
  return ("0" + Math.round(alpha).toString(16)).slice(-2);
}

function resetView() {
  background(backgroundColor)

  flowerX = 0; // Reset flower position for the garden view
  // Add any other reset operations here if needed for other views

 
}

let lastCapturedData = []; // Array to store the last captured sensor values

// This function captures sensor data if any sensor value is greater than 0.
// It checks each sensor value and if any value is positive, 
// it adds a copy of the current sensor values to the capturedData array.
function captureData() {
  // Check if any sensor value is greater than 0
  if (sensors.some(sensor => sensor > 0)) {
    // Create a copy of the current sensor values
    const currentData = [...sensors];

    //  NOISE REDUCTION
    // Check if the current data is different from the last captured data
    if (!arraysEqual(currentData, lastCapturedData)) {
      capturedData.push(currentData); // Add to captured data
      lastCapturedData = currentData; // Update last captured data
    }
      //
  }
}
// Helper function to compare two arrays for equality
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false; // Check length
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false; // Check each element
  }
  return true; // Arrays are equal
}





///// MAIN RESULTS SCREEN + FUNCTIONS ////

function drawResultsScreen() {

  //reset things
  verticalOffset = 0; //used to reset the weave
  

  background(backgroundColor)

  const totalSensors = sensors.length; // Total number of sensors

    // Calculate the average value for each sensor
    // `sensors.map` iterates over each sensor, and for each sensor:
    // 1. `capturedData.map(data => data[i])` extracts the data for the current sensor across all captured data points.
    // 2. `sensorData.reduce((sum, value) => sum + value, 0)` sums up all the values for the current sensor.
    // 3. The sum is then divided by the number of data points (`sensorData.length`) to get the average value for the current sensor.
 
    averages = sensors.map((_, i) => {
        const sensorData = capturedData.map(data => data[i]);
        return sensorData.reduce((sum, value) => sum + value, 0) / sensorData.length;      
    });
    // Find the sensor with the highest average
    const highestAverage = Math.max(...averages);
    const highestSensorIndex = averages.indexOf(highestAverage);


    for (let i = 0; i < totalSensors; i++) {
       //Offsets
    const offsetX = averages[i] * sin(TWO_PI * i / totalSensors);
    const offsetY = averages[i] * cos(TWO_PI * i / totalSensors);
        //draw becky blobs randomnly onscreen 
        drawBeckyMode(i, width * 0.5 + offsetX, height *0.5 + offsetY, averages[i]*2, averages[i]*2, averages[i], highestSensorIndex,averages[i],brushMode);
      }

     
}

function drawBeckyMode(sensorIndex, x, y, width, height, average, highlightIndex, rotation,brushMode) {

  const numSensors = totalInputs; // Number of sensors
  const boxWidth = window.width/totalInputs; // Width of each box
  const boxHeight = window.height*0.02;//50; // Height of each palette box


    //HUE PICKED BY CHOSEN GLOBAL PALETTE
    const selectedColor = palettes[selectedPaletteIndex-1][sensorIndex];// Retrieve the color object from the current palette for the current sensor index
    const h = round(hue(selectedColor)); // Get the hue
    const s = round(saturation(selectedColor)); // Get the saturation
    const l = round(lightness(selectedColor)); // Get the lightness
    
    if(debugMode){ console.log(`HSL Values - H: ${h}, S: ${s}, L: ${l}`)};
      // Debugging: Log the selectedPaletteIndex
   if(debugMode){console.log(`Selected Palette Index: ${selectedPaletteIndex}`)};

/////FILL OPTIONS/////
    //use averages from captured data as hue/sat/bri values
    //fill(average, average, average, 50);

    //use hslcolorvalues from rampensau
    //fill(colorHue, colorSat, colorBri, 50);

    //use fill from global palette choice 
    fill(h,s,l);
    noStroke();

     //palette boxes
  rect(sensorIndex * boxWidth, 0, boxWidth, boxHeight);


  // Draw a circular line graph for the specific sensor
  push();
  translate(x + width / 2, y + height / 4); // Center the graph
  rotate(rotation); // Apply rotation
  const radius = min(width, height) / 2; // Radius for the graph

  // Set color based on whether this is tbhe highest average
  //const colorHue = sensorIndex === highlightIndex ? 60 : 200; // Highlight color for the highest average
  //const colorHue = average; // Set hue based on the average value of each sensor (0-360)
  
  if(brushMode)
    {
      brush.noField();
      brush.noStroke();
      //brush.fillAnimatedMode(true); // THIS DOESNT SEEM TO PREVENT A REDRAW OF THE FILL

      //brush.fill(average,100,100,100);
      brush.fill(h,s,l,100)

      //brush.fillTexture(map(average,0,360,0,1),0) //texture strength (0-1) and border intensity (0-1)
      brush.fillTexture(1,0) //texture strength (0-1) and border intensity (0-1)
      brush.bleed(map(average,0,360,0,0.3), "out");


    }else{

    //global chosen palette values
    fill(h,s,l)

     //fill(colorHue, 100, 100, map(mappedControllerValues[9],0,360,10,90));
     //fill(colorHue,colorSat,colorBri,50);
     //fill(average,average,average,50);
     //fill(hslColorValues[7][0],hslColorValues[0][1]*100,hslColorValues[0][1]*100)
     //console.log(hslColorValues)

     //fill(colorHue, colorSat, colorBri, 50);
  };

  if(brushMode){brush.beginShape(0);}else{beginShape();};

  for (let j = 0; j < capturedData.length; j++) {
      const angle = map(j, 0, capturedData.length, 0, TWO_PI);
      //const r = radius + map(capturedData[j][sensorIndex], 0, 100, -radius / 2, radius / 2); // Adjust radius based on data
      const r = radius + map(capturedData[j][sensorIndex], 0, 100, -radius / 2, mappedControllerValues[3]); // Adjust radius based on data
      const xPos = r * cos(angle);
      const yPos = r * sin(angle);
      if (j === 0) {
       if(brushMode){brush.vertex(xPos, yPos)}else{curveVertex(xPos, yPos);}; // Use curveVertex for smooth lines
      }
      //brush.vertex(xPos, yPos); // Use curveVertex for smooth lines
      if(brushMode){brush.vertex(xPos, yPos)}else{curveVertex(xPos, yPos);}; 

      if (j === capturedData.length - 1) {
        if(brushMode){brush.vertex(xPos, yPos)}else{curveVertex(xPos, yPos);};       // Ensure the curve closes smoothly
      }
  }
  //brush.endShape(CLOSE);
  if(brushMode){brush.endShape(CLOSE);}else{endShape(CLOSE)};
  pop();
  
//KILLS THE SCRIPT DEAD - NOT IDEAL - NO MORE INTERACTION
/// NEED A BETTER SOLUTION
if(brushMode){noLoop()}; 
}

/////////////////////////
///////DASHBOARD DATA VIZ MODE ////
////////////////////////////

function getColorValues(index) {
  // Ensure the index is within the bounds of the currentPalette array
  if (index < 0 || index >= currentPalette.length) {
    console.error("Index out of bounds for currentPalette.");
    return null; // Return null or handle the error as needed
  }

  // Get the selected color from the current palette
  const selectedColor = currentPalette[index]; // Get the color object
  const h = hue(selectedColor); // Get the hue
  const s = saturation(selectedColor); // Get the saturation
  const l = lightness(selectedColor); // Get the lightness

  // Return the values as an object
  return { h, s, l };
}

let dashDrawOnce = false;

function drawDashboard(){
  if (button1State === 3){viewMode = startScreen};

if(!dashDrawOnce){

isCapturing = false;
if(debugMode){console.log(capturedData)};

    averages = sensors.map((_, i) => {
    const sensorData = capturedData.map(data => data[i]);
    return sensorData.reduce((sum, value) => sum + value, 0) / sensorData.length;});
    // Find the sensor with the highest average
    const highestAverage = Math.max(...averages);
    const highestSensorIndex = averages.indexOf(highestAverage);

    if(debugMode){
    console.log(averages);
    console.log('highest average ' + highestAverage);
    console.log('highest index ' + highestSensorIndex);}

    //draw once
    dashDrawOnce = true;   
    drawCircularLineGraph(width*0.5, height*0.45 ,0.1); //x,y,max ~~ 0.1,0.1,0.1 = top left , small
                          //width*0.2, height*0.27 ,0.08
    drawSensorLineRipples(width*0.5,height*0.45,0.1);//x,y,max
                        //width*0.5,height*0.27,0.10

    drawConcentricArcs(width*0.5, height*0.45, 0.8);//x,y,max
                      //width*0.8, height*0.27, 0.3

    drawSensorBoxesAndBars();

    drawLineGraph(); //max

  }
  
  //draw here for looping
    //drawDataPie(width*0.1, height*0.45 ,0.1); //x,y,max ~~ 0.1,0.1,0.1 = top left , small
  
  //


}

//COMBINED LINE GRAPHS
function drawLineGraph(max) {
  const maxGraphHeight = height*0.10; // Set a maximum height for the graph
  const graphHeight = min(height * 0.8, maxGraphHeight); // Constrain the graph height
  const graphWidth = width; // Full width of the canvas
  const leftMargin = width * 0.01; // Left margin for the graph
  const rightMargin = width * 0.01; // Right margin for the graph
  const bottomMargin = height * 0.02; // Bottom margin for the graph

  // Adjust the graph position to the bottom of the screen
  const graphY = height - bottomMargin - graphHeight; // Position the graph at the bottom

  

  // Draw bounding box
  stroke(0, 0, 80, 50);
  strokeWeight(1);
  noFill();
  //rect(leftMargin, graphY, graphWidth - leftMargin - rightMargin, graphHeight);

  // Draw the line graph for each sensor
  for (let i = 0; i < totalInputs; i++) {

  //get current palette
  const selectedColor = getColorValues(i);

    beginShape();
    for (let j = 0; j < capturedData.length; j++) {
      //stroke(i * 30 % 360, 100, 100, map(capturedData[j][i], 0, 360, 30, 80)); // Set color based on sensor index
      if(useSensorHue){
        stroke(averages[i], 100, 100, 70)
      }else { 
      stroke(selectedColor.h,selectedColor.s,selectedColor.l*1.5)
      }

      strokeWeight(map(capturedData[j][i], 0, 360, 1, 4));
      const x = map(j, 0, capturedData.length - 1, leftMargin, graphWidth - rightMargin);
      // Flip the y value to position the lowest value nearest the bottom
      const y = map(capturedData[j][i], -10, 350, graphY + graphHeight, graphY);
      curveVertex(x, y);
    }
    endShape();
  }
}

function drawCircularLineGraph(x,y,max) {

  background(backgroundColor)

  const totalSensors = totalInputs;//sensors.length; // Total number of sensors
  const centerX = x;//width *0.4;//width *0.15;  //  width / 2; // X center of the concentric rings
  const centerY = y;//height/2;//height * 0.2; //height / 2; // Y center of the concentric rings
  const maxRadius = min(width, height) * max;//0.15; // Maximum radius for the outermost ring 0.4 for full
  const ringSpacing = maxRadius / totalSensors; // Equal spacing for each sensor ring
  //BLEND MODES

blendMode(BLEND)

  //DRAW THE SHAPE
  for (let i = 0; i < totalSensors; i++) {
    const sensorData = capturedData.map(data => data[i]); // Get the captured data for the current sensor
    const sensorDataString = sensorData.join(', '); // Convert array to string
    const averageValue = round(sensorData.reduce((sum, value) => sum + value, 0) / sensorData.length); // Calculate average
   
    const colorHue = averageValue;//map(mappedControllerValues[2], 0, maxDataValue, 0, 360); // Set hue based on average value
    
    //get current palette
    let selectedColor = getColorValues(i);
    
    //const alpha = map(mappedControllerValues[9], 0, 360, 5, 40); // Alpha value
    //fill(averageValue, 100, 100, alpha); // Fill color based on average hue
    //let alpha = 50;
    
      strokeWeight(0.5)
      //stroke(colorHue, 100, 100); // stroke color based on mapped controller value
      //fill(colorHue, 100, 100, 10); // stroke color based on mapped controller value

      if(useSensorHue){
        stroke(averages[i], 100, 100, 70)
        fill(averages[i], 100, 100, 10);
      }else { 
      stroke(selectedColor.h,selectedColor.s,selectedColor.l*2)
      fill(selectedColor.h,selectedColor.s,selectedColor.l*2, 10);
      }

      //noFill();
    

    beginShape(); // Start drawing the line graph
    for (let j = 0; j < capturedData.length; j++) {
      const angle = map(j, 0, capturedData.length, 0, TWO_PI); // Angle for each data point
      // Increase the effect of sensor value on the radius to make differences more prominent
      const radius = ringSpacing * (i + 1) + map(sensorData[j], 0, maxDataValue, 0, ringSpacing * mappedControllerValues[1]*0.1); // Radius based on sensor value
      const x = centerX + cos(angle) * radius; // X position based on angle and radius
      const y = centerY + sin(angle) * radius; // Y position based on angle and radius
      curveVertex(x, y); // Add vertex to the shape
    }
    endShape(CLOSE); // End drawing the line graph with a closed shape


//debug the captured data
if(debugMode){
  if(!runOnce){
  console.log(`Sensor ${i} Data: [${sensorDataString}]`); // Log the array contents
  console.log(`Sensor ${i} Length: ${sensorData.length}`); // Log the array length  
  console.log(`Sensor ${i} Average: ${averageValue}`); // Log the average value
  }}}
  //prevent repeat console logs
  runOnce = true;
}

function drawSensorLineRipples(x,y,max) {
  const centerX = x;
  const centerY = y;
  const maxLength = min(width, height) * max; // Maximum length for the lines
  const ringAlpha = 20;

  for (let i = 0; i < averages.length; i++) {
      const angle = map(i, 0, averages.length, 0, TWO_PI); // Calculate angle for each sensor
      const length = map(averages[i], 0, 100, 0, maxLength); // Map average to line length

      const xEnd = centerX + cos(angle) * length; // Calculate end x position
      const yEnd = centerY + sin(angle) * length; // Calculate end y position

      //get current palette
      const selectedColor = getColorValues(i);

      strokeWeight(0.5);
      //stroke(i * 30 % 360, 100, 100,30); // Set stroke color based on sensor index
      if(useSensorHue){
        stroke(averages[i], 100, 100, ringAlpha)
      }else { 
      stroke(selectedColor.h,selectedColor.s,selectedColor.l*1.5,ringAlpha)
      }

      line(centerX, centerY, xEnd, yEnd); // Draw the line

      // Draw circles along the line based on captured data
      for (let j = 0; j < capturedData.length; j++) {
          const dataValue = capturedData[j][i]; // Get the data value for the current sensor
          const circleSize = map(dataValue, 0, 360, 5, 100); // Map data value to circle size

          // Calculate position along the line
          const t = j / capturedData.length; // Normalized position along the line
          const xCircle = lerp(centerX, xEnd, t); // Interpolate x position
          const yCircle = lerp(centerY, yEnd, t); // Interpolate y position

          noFill(); // No fill for circles
          strokeWeight(1);
          //stroke(i * 30 % 360, 100, 100,20); // Set stroke color for circles
          if(useSensorHue){
            stroke(averages[i], 100, 100, ringAlpha)
          }else { 
          stroke(selectedColor.h,selectedColor.s,selectedColor.l*2, ringAlpha)
          }
          ellipse(xCircle, yCircle, circleSize); // Draw the circle
      }
  }
}

function drawConcentricArcs(x,y,max) {
  const centerX = x;
  const centerY = y;
  const maxRadius = min(width, height) * max; // Maximum radius for the outermost arc
  const arcSpacing = 20; // Spacing between arcs

  

  for (let i = 0; i < capturedData.length; i++) {
      for (let j = 0; j < capturedData[i].length; j++) {
        //get current palette
        const selectedColor = getColorValues(j);

          const sensorValue = capturedData[i][j]; // Get the data value for the current sensor
          const hueValue = sensorValue;
          const radius = maxRadius - (j * arcSpacing); // Calculate radius for the arc
          const arcLength = map(sensorValue, 0, 360, 0, TWO_PI); // Map sensor value to arc length
          const arcSize = radians(map(sensorValue,0,360,0,30));
          const ringAlpha =20;

          noFill(); // No fill for arcs
          //stroke(hueValue, 100, 100, 50); // Set stroke color based on mapped hue
          if(useSensorHue){
            stroke(averages[j], 100, 100, ringAlpha)
          }else { 
          stroke(selectedColor.h,selectedColor.s,selectedColor.l*1.5,ringAlpha)
          }
          strokeWeight(2); // Set stroke weight

          // Draw the arc with length based on sensor value
          arc(centerX, centerY, radius, radius, sensorValue,sensorValue+arcSize,OPEN); // Arc with variable length
      }
  }
}

/*function drawSensorBoxesAndBars() {
  const padding = width * 0.03;
  const boxWidth = (width - (totalInputs + 1) * padding) / totalInputs; // Calculate box width based on padding and total inputs
  const boxHeight = height * 0.03; // Set a fixed height for the boxes
  const offset = padding * 0.7;
  textSize(width * 0.009);

  for (let i = 0; i < totalInputs; i++) {

    const x = padding + i * (boxWidth + padding); // Calculate x position for each box
    const y = height *0.98 - padding; //0.75 = centre //  Position the boxes at the bottom with padding

    // Draw the sensor value inside the box
   // const sensorData = capturedData.map(data => data[i]);
   // const averageValue = round(sensorData.reduce((sum, value) => sum + value, 0) / sensorData.length); // Calculate average value
   
    averages = sensors.map((_, i) => {
      const sensorData = capturedData.map(data => data[i]);
      return sensorData.reduce((sum, value) => sum + value, 0) / sensorData.length;      
    });
  // Find the sensor with the highest average
  const highestAverage = Math.max(...averages);
  const highestSensorIndex = averages.indexOf(highestAverage);

    
    // Draw the box
    fill(averages[i], 100, 100, 70); // Set fill color based on sensor index

    if(i==highestSensorIndex){stroke(0,0,100)} //draw outline around higest sensor.
      else{ 
         noStroke();}

    //boxWidth =   boxWidth*0.5;
    
    rect(x, y-(offset), boxWidth, boxHeight);
    
    //text color
    fill(0,90,0); //0,0,100 -white
    textAlign(LEFT,CENTER);
    //text(round(averages[i]), x + boxWidth / 2, y + boxHeight / 2); // Display the average value in the center of the box
    text(round(averages[i]), x + (boxWidth*0.03), y -(offset) + boxHeight / 2); // Display the average value in the center of the box
    

    //LINE GRAPH
    // Draw a small line graph for each sensor data within a thin outline
    const graphWidth = boxWidth- (padding *0.7) //-(boxWidth*0.3)//* 0.4; // Set the width for the small line graph
    const graphHeight = boxHeight-(boxHeight*0.01); // Set the height for the small line graph
    const graphX = x + (padding*0.7)//+ (boxWidth  * 0.2); // Center the graph horizontally within the box
    const graphY = y - (offset)  // Position the graph above the box with padding

    // Draw the outline for the graph
    noFill();
    stroke(0, 50, 0); // Set stroke color to white
    strokeWeight(1); // Set stroke weight
    //rect(graphX, graphY, graphWidth, graphHeight); // Draw the outline

    // Draw the line graph
    beginShape();
    for (let j = 0; j < capturedData.length; j++) {
        const sensorValue = capturedData[j][i]; // Get the data value for the current sensor
        const xPos = map(j, 0, capturedData.length - 1, graphX, graphX + graphWidth); // Map the x position
        const yPos = map(sensorValue, 0, 360, graphY + graphHeight-(boxHeight*0.1), graphY+(boxHeight*0.1)); // Map the y position
        vertex(xPos, yPos); // Add vertex to the shape
    }
    endShape();

    //PIE CHART
    // Draw a pie chart for each sensor average next to the boxes
    const pieChartRadius = boxWidth * 0.25; // Set the radius for the pie chart
    //const pieX = x + boxWidth*0.5; // Position the pie chart to the right of the box
    //const pieY = y - (offset) + boxHeight * 2; // Center the pie chart vertically with the box

    const pieX = x + boxWidth*1.5; // Position the pie chart to the right of the box
    const pieY = y - (offset) + boxHeight; // Center the pie chart vertically with the box

    // Draw the pie chart
    noStroke();
    fill(averages[i], 100, 100, 70); // Set fill color based on sensor average
    arc(pieX, pieY, pieChartRadius, pieChartRadius, -HALF_PI, TWO_PI * (averages[i] / 360) - HALF_PI, PIE); // Draw the pie chart based on the average value, starting at the top
    
    // Draw the circle outline on the pie chart
    noFill();
    stroke(0, 0, 50); // Set stroke color to white
    strokeWeight(1); // Set stroke weight
    ellipse(pieX, pieY, pieChartRadius, pieChartRadius); // Draw the circle outline
    


    //BARS
    // Draw a bar graph for each data item, placed higher than the boxes
    const barGraphHeight = height * 0.2; // Set a fixed height for the bar graph
    const barX = x; // Use the same x position as the box
    const barY = y - barGraphHeight - padding; // Position the bar graph above the box with padding

    // Calculate the width of each bar to fit within the box width
    const numBars = capturedData.length;
    const barWidth = boxWidth / numBars;

    // Draw the bar graph
    for (let j = 0; j < numBars; j++) {
        const sensorValue = capturedData[j][i]; // Get the data value for the current sensor
        const barHeight = barGraphHeight * (sensorValue / 360); // Scale the bar height based on the sensor value
        fill(sensorValue, map(sensorValue,0,360,20,80), map(sensorValue,0,360,20,80), 70); // Set fill color based on sensor value
        noStroke();
        rect(barX + j * barWidth, barY + barGraphHeight - barHeight, barWidth, barHeight); // Draw each bar
    }

    // Draw multiple vertical lines inside the box, incrementally spaced
    const lineColor = map(averages[i], 0, 360, 0, 360); // Map the average value to a color hue
    stroke(lineColor, 100, 100); // Set stroke color based on mapped hue
    strokeWeight(2);
    const numLines = capturedData.length; // Number of lines to draw based on the data length
    const lineSpacing = boxWidth / (numLines + 1); // Calculate spacing between lines

    
  }
}/*

/*function drawDataPie(x,y,max) {
  const totalInputs = sensors.length; // Total number of inputs
  const centerX = x;//width *0.9;  //  width / 2; // X center of the concentric rings
  const centerY = y;//height * 0.2; //height / 2; // Y center of the concentric rings
  const radius = min(width, height) * max;//0.10; // Maximum radius for the outermost ring 0.4 for full
  
  // Calculate the average value for each sensor
  const averages = sensors.map((_, i) => {
    const sensorData = capturedData.map(data => data[i]);
    return sensorData.reduce((sum, value) => sum + value, 0) / sensorData.length;
  });

  // Calculate the total of all averages to determine segment sizes
  const totalAverage = averages.reduce((sum, avg) => sum + avg, 0);

  let startAngle = 0; // Starting angle for the first segment

  const spacing = 0.1; // Define the spacing between segments
  for (let i = 0; i < totalInputs; i++) {
    const segmentSize = (averages[i] / totalAverage) * TWO_PI; // Proportional segment size
    const colorHue = map(i, 0, totalInputs, 0, 360); // Generate a color hue based on the sensor index
    fill(colorHue, 100, 100, 20); // Set fill color based on the hue

    // Draw the pie chart segment with spacing, including spacing at the center
    arc(centerX, centerY, radius * 2 - spacing, radius * 2 - spacing, startAngle + spacing / 2, startAngle + segmentSize - spacing / 2, PIE);

    // Update the start angle for the next segment
    startAngle += segmentSize;
  }
}*/

//layout 2 - matches the locations of the weave sensors (2 columns  - 4 rows) 
function drawSensorBoxesAndBars() {
  const padding = height * 0.12; // Adjusted padding for less space between boxes
  const boxWidth = (width - (2 + 2) * padding) / 5; // Adjusted for 4 columns to make boxes half the size
  const boxHeight = height * 0.03; // Set a fixed height for the boxes
  const offset = padding * 0.5; // Adjusted offset for boxes to be placed higher up the screen
  const startY = height * 0.3;
  textSize(width * 0.009);

  for (let i = 0; i < totalInputs; i++) {
    // Calculate x and y positions based on the new layout
    const col = i % 2; // Column index (0 or 1)
    const row = floor(i / 2); // Row index (0 to 3)
    let x, y;
    if (col === 0) {
      x = padding + col * (boxWidth + padding); // Calculate x position for each box
    } else {
      x = width - padding - boxWidth; // Right justify the box in column 2
    }
    y = startY + (row * (boxHeight + padding)); // Adjusted y position for boxes to be placed higher up the screen

    // Draw the sensor value inside the box
    averages = sensors.map((_, i) => {
      const sensorData = capturedData.map(data => data[i]);
      return sensorData.reduce((sum, value) => sum + value, 0) / sensorData.length;      
    });
    // Find the sensor with the highest average
    const highestAverage = Math.max(...averages);
    const highestSensorIndex = averages.indexOf(highestAverage);

    //get current palette
    const selectedColor = currentPalette[i]; // Get the color object // (map the index to the palette number)

    const h = hue(selectedColor); // Get the hue
    const s = saturation(selectedColor); // Get the saturation
    const l = lightness(selectedColor); // Get the lightness

    // Draw the box
    if(useSensorHue){
      fill(averages[i], 100, 100, 70)}
    else{ // Set fill color based on sensor index
    fill(h,s,l*1.5)};  //hack to match lightness value

    //

    //if (i == highestSensorIndex) { stroke(0, 0, 100); strokeWeight(4); } // Draw outline around highest sensor.
    //else { noStroke(); strokeWeight(1); }
    noStroke();

    rect(x, y - (offset), boxWidth, boxHeight); // Draw the box

    // Text color
    fill(0, 90, 0); // 0,0,100 - white
    textAlign(LEFT, CENTER);
    //text(round(averages[i]), x + (boxWidth * 0.03), y - (offset) + boxHeight / 2); // Display the average value in the center of the box

    // LINE GRAPH
    const graphWidth = boxWidth - (padding * 0.02); // Set the width for the small line graph
    const graphHeight = boxHeight - (boxHeight * 0.01); // Set the height for the small line graph
    const graphX = x + (padding * 0.02); // Center the graph horizontally within the box
    const graphY = y - (offset); // Position the graph above the box with padding

    // Draw the line graph
    noFill();
    stroke(0,0,80);//off-white
    strokeWeight(1); // Set stroke weight
    beginShape();
    for (let j = 0; j < capturedData.length; j++) {
      const sensorValue = capturedData[j][i]; // Get the data value for the current sensor
      const xPos = map(j, 0, capturedData.length - 1, graphX, graphX + graphWidth); // Map the x position
      const yPos = map(sensorValue, 0, 360, graphY + graphHeight - (boxHeight * 0.1), graphY + (boxHeight * 0.1)); // Map the y position
      vertex(xPos, yPos); // Add vertex to the shape
    }
    endShape();

    // PIE CHART
    const pieChartRadius = boxWidth * 0.25; // Set the radius for the pie chart
    let pieX, pieY; // Declare variables for pie chart position
    if (col === 1) { // If in column 1
      pieX = x - pieChartRadius; // Position the pie chart to the left of the box
    } else { // If in column 2
      pieX = x + boxWidth + pieChartRadius; // Position the pie chart to the right of the box
    }
    pieY = y - (offset) + boxHeight / 2; // Center the pie chart vertically with the box

    // Draw the pie chart
    noStroke();
    if(useSensorHue){
      fill(averages[i], 100, 100, 70)}
    else{
      fill(h,s,l*2)
    }; // Set fill color based on sensor average
    arc(pieX, pieY, pieChartRadius, pieChartRadius, -HALF_PI, TWO_PI * (averages[i] / 360) - HALF_PI, PIE); // Draw the pie chart based on the average value, starting at the top

    // Draw the circle outline on the pie chart
    noFill();

    if (i == highestSensorIndex) { stroke(0, 0, 70); strokeWeight(4); } // Draw outline around highest sensor.
      else { stroke(0, 0, 50); strokeWeight(1); }   
    //stroke(0, 0, 50); // Set stroke color to white
    
    ellipse(pieX, pieY, pieChartRadius, pieChartRadius); // Draw the circle outline

    // Text for the sensor value
    fill(0,70,0,60); // Set text background color to black
    noStroke();
    
    rectMode(CENTER); // Set rect mode to center
    let rectCornerRadius = 10;
    //rect(pieX, pieY, pieChartRadius*0.4, pieChartRadius*0.3,rectCornerRadius,); // Draw a small dark background box for the text
    ellipse(pieX, pieY, pieChartRadius*0.4, pieChartRadius*0.4);
    fill(0,0,100); // Set text color to white
    textAlign(CENTER, CENTER); // Center the text

    if (i == highestSensorIndex) { textSize(width * 0.012);; text(round(averages[i]), pieX, pieY);} // Draw outline around highest sensor.
    else { textSize(width * 0.009);;text(round(averages[i]), pieX, pieY); }  
     // Display the average value in the center of the pie chart
    rectMode(CORNER); // Return to default rect mode


    // BARS
    const barGraphHeight = height * 0.1; // Set a fixed height for the bar graph
    const barX = x; // Use the same x position as the box
    const barY = y - (offset) - barGraphHeight-(barGraphHeight*0.02); // Position the bar graph at the top of the box

    // Calculate the width of each bar to fit within the box width
    const numBars = capturedData.length;
    const barWidth = boxWidth / numBars;

    // Draw the bar graph
    for (let j = 0; j < numBars; j++) {
      const sensorValue = capturedData[j][i]; // Get the data value for the current sensor
      const barHeight = barGraphHeight * (sensorValue / 360); // Scale the bar height based on the sensor value
      if(useSensorHue){
        //fill(sensorValue, map(sensorValue, 0, 360, 20, 80), map(sensorValue, 0, 360, 20, 80), 70); // Set fill color based on sensor value
        fill(averages[i],map(sensorValue,0,360,20,80),map(sensorValue,0,360,20,80)) //
    }else{
        fill(h,map(sensorValue,0,360,20,80),map(sensorValue,0,360,20,70))
    }
      noStroke();
      rect(barX + j * barWidth, barY + barGraphHeight - barHeight, barWidth, barHeight); // Draw each bar
    }

    // Draw multiple vertical lines inside the box, incrementally spaced
    const lineColor = map(averages[i], 0, 360, 0, 360); // Map the average value to a color hue
    stroke(lineColor, 100, 100); // Set stroke color based on mapped hue
    strokeWeight(2);
    const numLines = capturedData.length; // Number of lines to draw based on the data length
    const lineSpacing = boxWidth / (numLines + 1); // Calculate spacing between lines
  }
}


//////////////////////////////////
////FUNCTIONS FOR OTHER TEST MODES
//////////////////////////////////

//mode 0
function drawDebugView() {
  let graphHeight = height * 0.6;
  let graphY = height * 0.2;
  
  // Draw the graph background
  fill(0, 0, 40);
  noStroke();
  rect(0, graphY, width, graphHeight);
  
  // Draw horizontal lines
  stroke(255, 30);
  for (let i = 0; i <= 10; i++) {
    let y = graphY + graphHeight * (1 - i / 10);
    line(0, y, width, y);
    
    // Add labels
    fill(255);
    noStroke();
    textAlign(RIGHT, CENTER);
    text(i * maxDataValue/10, width * 0.05, y);
  }
  
  // Plot the sensor data
  for (let i = 0; i < totalInputs; i++) {
    let x = map(i, 0, totalInputs - 1, width * 0.1, width * 0.9);
    let y = map(sensors[i], 0, maxDataValue, graphY + graphHeight, graphY);
    
    // Draw vertical lines for each sensor
    stroke(255, 50);
    line(x, graphY + graphHeight, x, graphY);
    
    // Draw data points
    noStroke();
    fill(i * 30 % 360, 100, 100);
    circle(x, y, 15);
    
    // Add labels for sensor numbers
    fill(255);
    textAlign(CENTER, TOP);
    text("S" + i, x, graphY + graphHeight + 10);
    
    // Add value labels
    textAlign(CENTER, BOTTOM);
    text(int(sensors[i]), x, y - 10);
    
    // Draw lines connecting the points
    if (i > 0) {
      let prevX = map(i - 1, 0, totalInputs - 1, width * 0.1, width * 0.9);
      let prevY = map(sensors[i - 1], 0, maxDataValue, graphY + graphHeight, graphY);
      stroke(255, 100);
      line(prevX, prevY, x, y);
    }
  }
  
  // Add title
  fill(255);
  textAlign(CENTER, TOP);
  textSize(24);
  text("Sensor Readings", width / 2, height * 0.05);
}
//mode 1
function drawLiveGraphs() {
  const graphHeight = height / 8;
  const graphWidth = width * 0.9;
  const leftMargin = width * 0.05;

  frameCounter++;

  for (let i = 0; i < totalInputs; i++) {
    const yPos = i * graphHeight;
    
    // Draw graph background
    fill(0, 0, 40);
    noStroke();
    rect(leftMargin, yPos, graphWidth, graphHeight);

    // Draw graph title
    fill(255);
    textAlign(LEFT, TOP);
    textSize(12);
    text(`Sensor ${i}`, leftMargin, yPos + 5);

    // Draw current value
    textAlign(RIGHT, TOP);
    // Check if capturedControllerValues has enough elements
    const currentValue = (capturedControllerValues.length > i) ? capturedControllerValues[i] : sensors[i]; // Use stored value if available
    text(currentValue, width - leftMargin, yPos + 5);

    // Add new data point based on updateInterval
    if (frameCounter >= updateInterval) {
      if (!graphData[i]) {
        graphData[i] = [];
      }
      graphData[i].push(sensors[i]);
      if (graphData[i].length > maxDataValue) {
        graphData[i].shift();
      }
    }

    // Draw graph
    stroke(i * 30 % 360, 100, 100);
    noFill();
    beginShape();
    
    
    if (graphData[i] && graphData[i].length) {
      for (let j = 0; j < graphData[i].length; j++) {
        const x = map(j, 0, maxDataValue - 1, leftMargin, leftMargin + graphWidth);
        const y = map(graphData[i][j], 0, 100, yPos + graphHeight - 10, yPos + 10);
        vertex(x, y);
      }
    }

    endShape();
  }
}
//mode 2
function drawGeometricAnimations() {
  // Don't redraw the background
  // background(0, 0, 32);

  // Set up the layout
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = min(width, height) * 0.4;

  // Draw rotating pentagons
  for (let i = 0; i < 5; i++) {
    const angle = frameCount * 0.02 + i * TWO_PI / 5;
    const x = centerX + cos(angle) * maxRadius * 0.6;
    const y = centerY + sin(angle) * maxRadius * 0.6;
    const size = map(sensors[i], 0, 360, 20, 200);
    const hue = sensors[i];//map(sensors[i], 0, 100, 0, 360);
    
    push();
    translate(x, y);
    rotate(frameCount * 0.05 + i * TWO_PI / 5);
    noFill();
    stroke(hue, 100, 100, 50); // Added transparency
    strokeWeight(2);
    polygon(0, 0, size, 5);
    pop();
  }

  // Draw staggered lines
  for (let i = 0; i < 5; i++) {
    const angle = map(i, 0, 5, 0, TWO_PI);
    const length = map(sensors[i], 0, 100, 0, maxRadius);
    const hue = map(sensors[i], 0, 100, 180, 540);
    
    push();
    translate(centerX, centerY);
    rotate(angle + frameCount * 0.02);
    stroke(hue % 360, 100, 100, 50); // Added transparency
    strokeWeight(5);
    line(0, 0, length, 0);
    pop();
  }

  // Draw central circle
  const avgSensor = sensors.slice(0, totalInputs).reduce((a, b) => a + b, 0) / totalInputs;
  const centralSize = map(avgSensor, 0, 100, 20, 100);
  const centralHue = map(avgSensor, 0, 100, 0, 360);
  
  noStroke();
  noFill();
  //fill(centralHue, 100, 100, 10); // Increased transparency
  
  //fill(centralHue, 100, 100, 10); // Increased transparency
  circle(centerX, centerY, centralSize);

  // Display sensor values
  if(debugMode){
  textAlign(LEFT, TOP);
  textSize(12);
  fill(1);
  rect(10,10,50,totalInputs*20);
  for (let i = 0; i < totalInputs; i++) {
    fill(i * 72 % 360, 100, 100);
    text(`S${i}: ${sensors[i]}`, 10, 10 + i * 20);
  }
  }
}
//
function polygon(x, y, radius, npoints) {
  let angle = TWO_PI / npoints;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function drawDataStar() {
  background(backgroundColor)
  translate(width / 2, height / 2);
  
  const maxRadius = min(width, height) * 0.4;
  const angleStep = TWO_PI / sensors.length;

  // Draw connecting lines
  stroke(100, 50, 50, 50); // Light, semi-transparent lines
  strokeWeight(1);
  beginShape();
  for (let i = 0; i < sensors.length; i++) {
    const avgSum = summaryFlower[i];
    const r = map(avgSum, 0, 100, 0, maxRadius);
    const angle = i * angleStep - PI/2; // Start from top
    const x = r * cos(angle);
    const y = r * sin(angle);
    vertex(x, y);
  }
  endShape(CLOSE);

  // Draw points and data captures
  for (let i = 0; i < sensors.length; i++) {
    const avgSum = summaryFlower[i];
    const r = map(avgSum, 0, 100, 0, maxRadius);
    const angle = i * angleStep - PI/2; // Start from top
    const x = r * cos(angle);
    const y = r * sin(angle);

    // Draw main point
    noStroke();
    fill(flowerColors[i]);
    ellipse(x, y, 15, 15);

    // Draw data capture points
    for (let j = 0; j < capturedData.length; j++) {
      const value = capturedData[j][i];
      const deviation = value - avgSum;
      const dr = map(abs(deviation), 0, 50, 0, maxRadius * 0.2);
      const dataX = x + dr * cos(angle + PI); // Opposite direction of main point
      const dataY = y + dr * sin(angle + PI);
      
      // Color based on whether it's above or below average
      const hue = deviation > 0 ? 120 : 0; // Green if above, red if below
      fill(hue, 100, 100, 70);
      ellipse(dataX, dataY, 5, 5);
    }

    // Draw sensor label
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(12);
    const labelX = (maxRadius + 20) * cos(angle);
    const labelY = (maxRadius + 20) * sin(angle);
    text(`S${i}`, labelX, labelY);
  }

  // Draw center point
  fill(255);
  ellipse(0, 0, 10, 10);

  // Draw legend
  drawLegend();
}

function drawLegend() {
  const legendX = -width/2 + 20;
  const legendY = height/2 - 60;
  
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(12);
  text("Legend:", legendX, legendY);
  text("Main point: Average", legendX, legendY + 20);
  text("Small points: Data captures", legendX, legendY + 40);
  
  fill(120, 100, 100);
  ellipse(legendX - 10, legendY + 40, 5, 5);
  text("Above average", legendX + 110, legendY + 40);
  
  fill(0, 100, 100);
  ellipse(legendX - 10, legendY + 60, 5, 5);
  text("Below average", legendX + 110, legendY + 60);
}

function drawWaveformGarden() {
  // Ensure waveHeight is defined before using it
  if (waveHeight === undefined) {
    waveHeight = height / 20; // Fallback definition if not set
  }
  //colorMode(HSB, 360, 100, 100, 100);
  background(200, 30, 95); // Light blue sky
  
  // Draw sun
  fill(60,100,100,100);
  noStroke();
  circle(width - 50, 50, 80);
  
  // Use either capturedData or sampleData based on offline mode
  const dataToUse = offlineMode ? sampleData : capturedData;

//ADJUSTING WITH MIDI CONTROLER
 let  landHeight = map(mappedControllerValues[3], 0, 100, height, 0);
 let  seaHeight = map(mappedControllerValues[4], 0, 100, height, 0);


 landHeight =200;
 seaHeight =400;

 //console.log(mappedControllerValues[3]);
  drawDataWaves(dataToUse, landHeight ,  mappedControllerValues[1] , 90); // Adjust parameters as needed
  drawDataWaves(dataToUse, seaHeight,   mappedControllerValues[2], 200);

}

function drawDataWaves(dataToUse, startY, distance, startHue) {
  for (let i = 0; i < sensors.length; i++) {
    const yBase = startY + (i + 1) * distance; // Use the distance parameter for spacing
    const avgSum = dataToUse[i];
    
    // Calculate a unique green hue for each wave
    const hillsHue = startHue + i * 10; // Vary hue based on starting color
    
    // Draw ground
    fill(hillsHue, 60, 60);
    stroke(hillsHue, 30, 30);
    strokeWeight(2);
    beginShape();
    curveVertex(0, height);
    curveVertex(0, yBase);
    
    // Draw waveform
    let prevX = 0;
    let prevY = yBase;
    for (let x = 0; x <= width; x += 10) {
      const index = floor(map(x, 0, width, 0, dataToUse.length - 1));
      const value = dataToUse[index][i]; // Use dataToUse instead of capturedData
      const noiseValue = noise(x * 0.01, i * 10) * 20; // Generates a Perlin noise value for organic variation
      const y = yBase - map(value, 0, 100, 0, distance * 0.3) - noiseValue;
      
      curveVertex(x, y);
      
      // Draw tree (but not on every iteration to reduce density)
      /*
      if (x % 60 == 0 && x > 0) {
        drawTree(prevX + (x - prevX) / 2, (prevY + y) / 2, map(value, 0, 100, treeBaseSize, treeBaseSize * 3), hillsHue);
      }
        */
      
      prevX = x;
      prevY = y;
    }
    
    curveVertex(width, yBase);
    curveVertex(width, height);
    endShape(CLOSE);
  }
}

function drawTree(x, y, size, hue) {
  push();
  translate(x, y);
  
  // Draw trunk
  stroke(30, 60, 40);
  strokeWeight(size / 5);
  line(0, 0, 0, -size);
  
  // Draw leaves
  fill(hue, 70, 70);
  noStroke();
  triangle(-size/2, -size*0.8, 0, -size*1.5, size/2, -size*0.8);
  triangle(-size*0.7, -size*0.5, 0, -size*1.2, size*0.7, -size*0.5);
  triangle(-size*0.9, -size*0.2, 0, -size*0.9, size*0.9, -size*0.2);
  
  pop();
}

function drawWaveformLegend() {
  const legendX = width - 150;
  const legendY = height - 80;
  
  fill(0, 0, 0);
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(12);
  text("Legend:", legendX, legendY);
  //text("Red line: Average", legendX, legendY + 20);
  text("Wave: Sensor readings", legendX, legendY + 40);
  text("Trees: Data points", legendX, legendY + 60);
}

// Function to generate sample data
function generateSampleData() {
  sampleData = [];
  for (let i = 0; i < 50; i++) { // Generate 200 data points
    const noisyData = Array.from({ length: totalInputs }, () => {
      // Introduce sporadic peaks and spikes in the data
      let baseValue = random(0, 100); // Base value between 0 and 100
      let noiseOffset = random(-20, 20); // Random noise offset between -20 and 20
      // Introduce sporadic peaks and spikes
      if (random(1) < 0.1) { // 10% chance of a peak or spike
        noiseOffset = random(-50, 50); // Larger noise offset for peaks and spikes
      }
      // Create portions with minimum data
      if (random(1) < 0.3) { // 30% chance of minimum data
        baseValue = 0; // Set base value to 0 for minimum data
      }
      return Math.max(0, Math.min(baseValue + noiseOffset, 100)); // Ensure the value is between 0 and 100
    });
    sampleData.push(noisyData);
  }
}

// Function to save captured data and mapped controller values to local storage
function saveDataToLocalStorage() {
  localStorage.setItem('capturedData', JSON.stringify(capturedData));
  localStorage.setItem('mappedControllerValues', JSON.stringify(mappedControllerValues));
  console.log("Data saved to local storage.");
}

function updateButtonStates(splitVal) {
  // Get the current button states from the split values
  const currentButton1State = Number(splitVal[9]);
  const currentButton2State = Number(splitVal[8]);
  //if(debugMode){console.log(currentButton1State);console.log(currentButton2State)};

  
      button1State = currentButton1State; // Update the button state
      if (button1State === 3) { //3 only gets sent once in the serial string (whereas 1 gets sent multiple times)
        if(debugMode){console.log("Button 1 pressed")}; // Action for button 1 pressed
      }


      button2State = currentButton2State; // Update the button state
      // Perform action based on button 2 state
      if (button2State === 3) {
        // Action for button 2 pressed
        if(debugMode){console.log("Button 2 pressed")};
      }

}