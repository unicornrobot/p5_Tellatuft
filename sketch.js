
//CLICK FOR FULLSCREEN TOGGLE


// serial communication between a microcontroller with 8 sensor values

let serial; // variable for the serial object
let latestData = "waiting for data"; // variable to hold the data
let portButton;

let inputs = []; // all your inputs in an array
let totalInputs = 8; //how many incoming inputs?

//webmidi//defaults.
//GLOBAL VALUES TO SAVE CONSTOLLER VALUES
let mappedControllerValues = [0,13,7,21,36,0,0,0,0,0,0,0,0,0,0,0,0,0]; //first item (0) not used
let savedControllerValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0];

let midiKnobValues = []; // Array to store MIDI knob values



let sensor0 = 0;
let sensor1 = 0;
let sensor2 = 0;
let sensor3 = 0;
let sensor4 = 0;
let sensor5 = 0;
let sensor6 = 0;
let sensor7 = 0;

let sensors = [];
let splitVal;

let debugMode = false; // Start in debug mode
let offlineMode = false; // Global variable to track offline mode
let midiLogRaw = false;
let sampleData = []; // Array to hold generated sample data

let maxDataValue = 360; // the max value the sensor is sending



let graphData = []; // Array to store historical data for each sensor
//const maxDataPoints = 360; // Maximum number of data points to store for each sensor
let hillHeight = 30; //value of disatnce between 

let  w=500

let h=200

let noFunc = 1;

// Add these near the top of your sketch, with other global variables
let frameCounter = 0;
let updateInterval = 5; // Initial update interval
const minInterval = 1;
const maxInterval = 60;

let time = 0
let vel = NaN // TWO_PI / 300 assigned in setup()
let hori_count= 14
let vert_count = 7
let colors = ["#F94144", "#F65A38", "#F3722C",
              "#F68425", "#F8961E", "#F9AF37",
              "#F9C74F", "#C5C35E", "#90BE6D",
              "#6AB47C", "#43AA8B", "#4D908E",
              "#52838F", "#577590"]

let sunColor;
let sunAlpha = 50;

let toggleOutline = true;
//

// Add this near the top with other global variables
let viewMode
let resultsScreen = 6;//5 = wavegarden - 6 = circulrgraph

if (offlineMode){viewMode = 6;} else {viewMode = 4;}

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
let summaryFlower = null;
let waveHeight; // Declare waveHeight as a global variable

function setup() {
  fullscreen();
  //textFont(myFont);
  colorMode(HSB,360,100,100,100)
  blendMode(SCREEN)
  noFill()
  strokeWeight(3)
    vel = TWO_PI / 300

    WebMidi
    .enable()
    .then(onMidiEnabled)
    .catch(err => alert(err));
  
  
  createCanvas(windowWidth, windowHeight);

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



// when data is received in the serial buffer

function gotData() {
  let currentString = serial.readLine(); // store the data in a variable
  //trim(currentString); // get rid of whitespace
  if (!currentString) return; // if there's nothing in there, ignore it
  //console.log(currentString); // print it out
  latestData = currentString; // save it to the global variable

  //DEBUG
  if(debugMode){console.log(currentString)}
  //seperate values in the array
  let splitVal = splitTokens(currentString, ',');

  //parse strings into ints. 
  splitVal = int(splitVal);
  //console.log(splitVal);
  //get the individual values for visualisation
  sensor0 = splitVal[0];
  sensor1 = splitVal[1];
  sensor2 = splitVal[2];
  sensor3 = splitVal[3];
  sensor4 = splitVal[4];
  sensor5 = splitVal[5];
  sensor6 = splitVal[6];
  sensor7 = splitVal[7];

  //only push  totalInputs at one a time. 
  sensors = [];
  for (let i = 0; i < totalInputs; i++) {
    sensors.push(splitVal[i])
    
  }
}

function draw() {
  if (viewMode !== previousViewMode) {
    resetView();
    previousViewMode = viewMode;
  }

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
      drawSummary();
      break;
    case 5:
      drawWaveformGarden();
      break;
    case 6: 
      drawCircularLineGraph();
      //drawCapturedDataGraphs();
      break;
  }

  // Instructions
  fill(255);
  textAlign(LEFT, BOTTOM);
  textSize(14);
  //text("Press 'V' to cycle views. '+'/'-' to adjust graph speed.", 10, height - 10);
}

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

// Ensure capturedControllerValues is initialized
//let capturedControllerValues = []; // Initialize as an empty array

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
{w-=0.009}//speed
  

function drawWave(waveHeight,colR,colG,colB, sensorData){
    //background(255)
  let x = frameCount*0.5;
  let y = 10 * sin(x * 0.5);
  //point(x, y);
  fill(colR,colG,colB)
  ellipse(x,y+sensorData,10,10)
  
}


// if there's no port selected, 
// make a port select button appear:
function makePortButton() {
  // create and position a port chooser button:
  portButton = createButton("choose port");
  portButton.position(10, 10);
  // give the port button a mousepressed handler:
  portButton.mousePressed(choosePort);
}
 
// make the port selector window appear:
function choosePort() {
  if (portButton) portButton.show();
  serial.requestPort();
}
 
// open the selected port, and make the port 
// button invisible:
function openPort() {
  // wait for the serial.open promise to return,
  // then call the initiateSerial function
  serial.open().then(initiateSerial);
 
  // once the port opens, let the user know:
  function initiateSerial() {
    console.log("port open");
  }
  // hide the port button once a port is chosen:
  if (portButton) portButton.hide();
}
 
// pop up an alert if there's a port error:
function portError(err) {
  alert("Serial port error: " + err);
}
// read any incoming data as a string
// (assumes a newline at the end of it):
function serialEvent() {
  inData = Number(serial.read());
  console.log(inData);
}
 
// try to connect if a new serial port 
// gets added (i.e. plugged in via USB):
function portConnect() {
  console.log("port connected");
  serial.getPorts();
}
 
// if a port is disconnected:
function portDisconnect() {
  serial.close();
  console.log("port disconnected");
}
 
function closePort() {
  serial.close();
}


///FULLSCREEN CODE
function mousePressed() {
  if (mouseX > 0 && mouseX < windowWidth && mouseY > 0 && mouseY < windowHeight) {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {

  if (key === 's' || key === 'S') { // Press 'S' to save data
    saveDataToLocalStorage();
  }

  if (key === 'b' || key === 'B') {
    currentBlendModeIndex = (currentBlendModeIndex + 1) % blendModes.length;
    blendMode(blendModes[currentBlendModeIndex]);
    console.log("Current Blend Mode: " + blendModes[currentBlendModeIndex]);
  }
  if (key == "p") {
    //console.log("Ports!");
    serial.requestPort();
  }
  if (key === 'D' || key === 'd') {
    debugMode = !debugMode;
  }
  if (key === 'v' || key === 'V') {
    viewMode = (viewMode + 1) % 7; // Now cycles through 6 views
    if (viewMode === 4) {
      // Reset capture for summary flower view
      capturedData = [];
      isCapturing = true;
      summaryFlower = null;
      flowerX = 0;
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
    const size = map(sensors[i], 0, 100, 20, 80);
    const hue = map(sensors[i], 0, 100, 0, 360);
    
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
  const avgSensor = sensors.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
  const centralSize = map(avgSensor, 0, 100, 20, 100);
  const centralHue = map(avgSensor, 0, 100, 0, 360);
  
  noStroke();
  fill(centralHue, 100, 100, 10); // Increased transparency
  circle(centerX, centerY, centralSize);

  // Display sensor values
  textAlign(LEFT, TOP);
  textSize(12);
  fill(1);
  rect(10,10,50,100);
  for (let i = 0; i < 5; i++) {
    fill(i * 72 % 360, 100, 100);
    text(`S${i}: ${sensors[i]}`, 10, 10 + i * 20);
  }
}

function drawFlowerGarden() {
  // Clear background only when starting a new row
  if (flowerX === 0) {
    background(0, 0, 32);
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
  background(0, 0, 32); // Clear the background
  flowerX = 0; // Reset flower position for the garden view
  // Add any other reset operations here if needed for other views
}

function drawSummary() {

  if (isCapturing) {
    // Continue drawing the flower garden and capturing data
    drawFlowerGarden();
    captureData();
    
    // Check if we've reached the end of the screen
    if (flowerX >= width) {
      isCapturing = false;
      calculateSummary();
    }
  } else {
    // Draw the summary viz when the edge is reached
    if (summaryFlower) {
      viewMode = resultsScreen; 
      console.log('finished');
      
    }
  }
}
/*
// This function captures sensor data if any sensor value is greater than 0.
// It checks each sensor value and if any value is positive, 
// it adds a copy of the current sensor values to the capturedData array.
function captureData() {
  if (sensors.some(sensor => sensor > 0)) {
    capturedData.push([...sensors]);
  }
}*/let lastCapturedData = []; // Array to store the last captured sensor values

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



function calculateSummary() {
  let sums = new Array(sensors.length).fill(0);

  for (let data of capturedData) {
      //console.log(data.join(", ")); // Output the entire captured data for 1 sensor as a single string
      for (let i = 0; i < data.length; i++) {
        sums[i] += data[i]; // Accumulate sums for valid data
      }
  }

  // Calculate averages only if there are valid data entries
  summaryFlower = sums.map(sum => sum / capturedData.length);


  if(debugMode){outputCapturedDataLengths()};
  // Output the final array for each sensor to the console
  /*
  console.log("Final Captured Data for Each Sensor:");
  for (let i = 0; i < sensors.length; i++) {
    const sensorData = capturedData.map(data => data[i]);
    console.log(`Sensor ${i}:`, sensorData.length);
  }
  */
  
}

function drawLargeSummaryFlower() {
  push();
  translate(width / 2, height / 2);
  
  // Draw stem
  stroke(120, 70, 60);
  strokeWeight(10);
  line(0, 0, 0, 200);
  
  // Draw petals
  noStroke();
  for (let i = 0; i < 5; i++) {
    let petalSize = map(summaryFlower[i], 0, 100, 50, 200);
    fill(flowerColors[i]);
    rotate(TWO_PI / 5);
    ellipse(0, -petalSize / 2, petalSize / 2, petalSize);
  }
  
  // Draw center
  fill(60, 100, 100);
  ellipse(0, 0, 50, 50);
  
  pop();
}

function drawDataStar() {
  background(0, 0, 32);
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



///MAIN SCENE

function drawWaveformGarden() {
  // Ensure waveHeight is defined before using it
  if (waveHeight === undefined) {
    waveHeight = height / 20; // Fallback definition if not set
  }
  //colorMode(HSB, 360, 100, 100, 100);
  background(200, 30, 95); // Light blue sky
  
  // Draw sun
  fill(60,100,100,sunAlpha);
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
///FUNCTIONS//

function drawCloud(x, y, size) {
  push();
  translate(x, y);
  noStroke();
  
  // Base color for the cloud (white with some transparency)
  let baseColor = color(0, 100, 100, 80); // White with 80% opacity
  
  for (let i = 0; i < 3; i++) { // Draw multiple parts for a fluffy look
    let cloudPart = random(0.3, 1); // Randomize size of cloud parts
    let xOffset = random(-size / 2, size / 2);
    let yOffset = random(-size / 4, size / 4);
    
    // Add some color variation (keeping it white)
    let cloudColor = color(0, 0, 100, random(50, 0.8)); // White with some transparency
    
    fill(cloudColor);
    ellipse(xOffset, yOffset, size * cloudPart, size * cloudPart * 0.6);
  }
  
  pop();
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

let runOnce = false;

// New function to draw circular line graphs
function drawCircularLineGraph() {

  background(0)
  const totalSensors = sensors.length; // Total number of sensors
  const centerX = width / 2; // X center of the concentric rings
  const centerY = height / 2; // Y center of the concentric rings
  const maxRadius = min(width, height) * 0.4; // Maximum radius for the outermost ring
  const ringSpacing = maxRadius / totalSensors; // Equal spacing for each sensor ring
  //BLEND MODES

blendMode(BLEND)

  //DRAW THE SHAPE
  for (let i = 0; i < totalSensors; i++) {
    const sensorData = capturedData.map(data => data[i]); // Get the captured data for the current sensor
    const sensorDataString = sensorData.join(', '); // Convert array to string
    const averageValue = round(sensorData.reduce((sum, value) => sum + value, 0) / sensorData.length); // Calculate average
   
    //debug the data
  if(debugMode){
    if(!runOnce){
    console.log(`Sensor ${i} Data: [${sensorDataString}]`); // Log the array contents
    console.log(`Sensor ${i} Length: ${sensorData.length}`); // Log the array length  
    console.log(`Sensor ${i} Average: ${averageValue}`); // Log the average value
  }}
    
    
    const colorHue = map(mappedControllerValues[2], 0, maxDataValue, 0, 360); // Set hue based on average value
    const alpha = map(mappedControllerValues[9], 0, 360, 0, 100); // Alpha value
    //fill(averageValue, 100, 100, alpha); // Fill color based on average hue
    if(!toggleOutline){
     fill(colorHue, 100, 100, alpha); // Fill color based on mapped controller value
      noStroke();
    }else{
      strokeWeight(map(mappedControllerValues[3],0,360,1,20))
      stroke(colorHue, 100, 100, alpha); // Fill color based on mapped controller value
      noFill();
    }

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
  }
  runOnce = true;
}

function drawCapturedDataGraphs() {
  const totalSensors = sensors.length; // Total number of sensors
  const totalRings = capturedData.length; // Total number of rings based on captured data
  const ringSpacing = width / (totalRings + 1); // Equal spacing for each ring

  for (let i = 0; i < totalSensors; i++) {
    const sensorData = capturedData.map(data => data[i]); // Get the captured data for the current sensor
    const colorHue = map(i, 0, totalSensors, 0, 360); // Generate a color hue based on the sensor index
    stroke(colorHue, 100, 100); // Set stroke color based on the hue
    noFill(); // No fill for the line graph

    beginShape(); // Start drawing the line graph
    for (let j = 0; j < capturedData.length; j++) {
      const x = ringSpacing * (j + 1); // X position based on ring index
      const y = height - map(sensorData[j], 0, 100, height, 0); // Y position based on sensor value, ensuring the graph is vertically spaced
      if (j === 0) {
        vertex(x, y); // First vertex
      } else {
        curveVertex(x, y); // Smooth curve for the rest of the vertices
      }
    }
    // Connect the last vertex to the first vertex to close the curve
    curveVertex(ringSpacing, height - map(sensorData[0], 0, 100, height, 0));
    endShape(CLOSE); // End drawing the line graph with a closed curve
  }
}




