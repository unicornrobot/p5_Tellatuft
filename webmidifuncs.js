//
//WEBMIDI funcs for behringer x-touch mini
//ADD TO SETUP IN MAIN JS FILE
/*
WebMidi
.enable()
.then(onMidiEnabled)
.catch(err => alert(err));
*/




  // New array to store the captured controller values
  let capturedControllerValues = [];

  let currentControllerValues = {};



//WEBMIDI//
function onMidiEnabled() {
    console.log("MIDI enabled");
          
    const myMidi = WebMidi.inputs[0];
    const myMidiOut = WebMidi.outputs[0];

      // Display available MIDI input devices
      if (WebMidi.inputs.length < 1)
          console.log("No device detected.");
      else
          WebMidi.inputs.forEach((device, index) => {
            if(debugMode){console.log(`${index}: ${device.name}`)};
          });

    // Display available MIDI output devices
    if (WebMidi.outputs.length < 1) {
      console.log("No MIDI output device detected.");
  } else {
      WebMidi.outputs.forEach((device, index) => {
        if(debugMode){console.log(`${index}: ${device.name}`)};
      });
  }


    if (!myMidiOut) {
      console.error("MIDI output not found.");
      return; // Exit if no output is found
  }

    //console.log("webmidioutput: " + myMidiOut);

    myMidiOut.sendControlChange(1,127,11);
 
   
// Example usage
const controllerNumber = 1; // Change this to the correct controller number
//const valueToSend = Math.round(0.7 * 127); // Convert to MIDI value range (0-127)
const valueToSend = 127; // Convert to MIDI value range (0-127)

sendControlChange(controllerNumber, valueToSend);


    
    // const mySynth = WebMidi.getInputByName("TYPE NAME HERE!")
    // Map of note identifiers to button actions
    //can be variable sets or function calls.webmidi updating

    loadStoredControllerValues(); // Load stored values on MIDI enable
    //updateMidiControllerValues(); // Call this function to send updated values




    const buttonOnActions = {
      "G#-1": () => {
        sunColor = "#FF0000"; 
        storeCurrentControllerValues(); // Store values when button is pressedo
      }, //1
      "A-1": () => {
        if(debugMode){console.log("button a-1 pressed")};

        //BUTTON 1 ACTIONS
        storeCurrentControllerValues(); // Store values when button is pressed
        

      }, //2
      "A#-1": () => noFunc = 1,  //3
      "B-1": () => noFunc = 1,  //4
      "C0": () => noFunc = 1,  //5
      "C#0": () => noFunc = 1,  //6
      "D0": () => noFunc = 1,  //7
      "D#0": () => noFunc = 1,  //8
      "E0": () => noFunc = 1,  //9
      "F0": () => noFunc = 1,  //10
      "F#0": () => noFunc = 1,  //11
      "G0": () => noFunc = 1,  //12
      "G#0": () => noFunc = 1,  //13
      "A0": () => noFunc = 1,  //14
      "A#0": () => noFunc = 1,  //15
      "B0": () => noFunc = 1,  //16 
  
      //KNOB BUTTONS LAYER A
      "C-1": () => savedControllerValues[1] = round(mappedControllerValues[1],0),  //knob1 value
      "C#-1": () => savedControllerValues[2] = round(mappedControllerValues[2],0),  //knob2 value
      "D-1": () => savedControllerValues[3] = round(mappedControllerValues[3],0),  //knob3 value
      "D#-1": () => savedControllerValues[4] = round(mappedControllerValues[4],0),  //knob4 value
      "E-1": () => savedControllerValues[5] = round(mappedControllerValues[5],0),  //knob5 value
      "F-1": () => savedControllerValues[6] = round(mappedControllerValues[6],0),  //knob6  value
      "F#-1": () => savedControllerValues[7] = round(mappedControllerValues[7],0),  //knob7 value
      "G-1": () => savedControllerValues[8] = round(mappedControllerValues[8],0),  //knob8 value
  
      // SLIDER IS  10th position in the array
  
      //LAYER B
      "C1": () => savedControllerValues[9] = round(mappedControllerValues[11],0),  //knob9 value
      "C#1": () => savedControllerValues[10] = round(mappedControllerValues[12],0),  //knob10 value
      "D1": () => savedControllerValues[11] = round(mappedControllerValues[13],0),  //knob11 value
      "D#1": () => savedControllerValues[12] = round(mappedControllerValues[14],0),  //knob12 value
      "E1": () => savedControllerValues[13] = round(mappedControllerValues[15],0),  //knob13 value
      "F1": () => savedControllerValues[14] = round(mappedControllerValues[16],0),  //knob14  value
      "F#1": () => savedControllerValues[15] = round(mappedControllerValues[17],0),  //knob15 value
      "G1": () => savedControllerValues[16] = round(mappedControllerValues[18],0),  //knob16 value
      
      
  };
  
  const buttonOffActions = {
    "G#-1": () => sunColor="#FFFF00",
    "A-1": () => noFunc = 1,
    "A#-1": () => noFunc = 1,
    "B-1": () => noFunc = 1,  //4
    "C0": () => noFunc = 1,  //5
    "C#0": () => noFunc = 1,  //6
    "D0": () => noFunc = 1,  //7
    "D#0": () => noFunc = 1,  //8
      "E0": () => noFunc = 1,  //9
      "F0": () => noFunc = 1,  //10
      "F#0": () => noFunc = 1,  //11
      "G0": () => noFunc = 1,  //12
      "G#0": () => noFunc = 1,  //13
      "A0": () => noFunc = 1,  //14
      "A#0": () => noFunc = 1,  //15
      "B0": () => noFunc = 1,  //16 
  };



  // Function to load stored controller values from localStorage
  function loadStoredControllerValues() {
    const storedValues = localStorage.getItem('capturedControllerValues');
    if (storedValues) {
      capturedControllerValues = JSON.parse(storedValues);
      if(debugMode){console.log("Loaded stored controller values:", capturedControllerValues)};
      
      // Set the initial state of the graphs or UI elements
      setInitialGraphStates(capturedControllerValues);
    } else {
      capturedControllerValues = []; // Initialize as empty array if not set
      if(debugMode){console.log("No stored controller values found, initialized as empty array.")};
    }
  }

  // Function to set the initial state of the graphs or UI elements
  function setInitialGraphStates(values) {
    // Assuming you have a function or method to update the graphs
    // This is a placeholder; replace with actual implementation
    for (let i = 0; i < values.length; i++) {
      // Update your graph or UI element with the loaded values
      // Example: updateGraph(i, values[i]);
      if(debugMode){console.log(`Setting graph ${i} to value: ${values[i]}`)};
    }
  }

  // Function to store current controller values
  function storeCurrentControllerValues() {
    capturedControllerValues = mappedControllerValues.slice(0, 10).map(value => Math.round(value)); // Capture only the first 10 controller values rounded to no decimal place
    if(debugMode){console.log("First 10 controller values stored:", capturedControllerValues)};
    
    // Save to localStorage, replacing the previous data
    localStorage.setItem('capturedControllerValues', JSON.stringify(capturedControllerValues));
  }
    
   


/*
// Function to send MIDI control change messages to the MIDI controller
function sendMidiControlChange(controllerNumber, value) {
  //const myMidi = WebMidi.inputs[0]; // Assuming you are using the first MIDI input
  if (myMidi) {
    // Send a control change message
    myMidi.output.sendControlChange(controllerNumber, value);
    console.log(`Sent control change: Controller ${controllerNumber}, Value ${value}`);
  } else {
    console.error("MIDI device not found.");
  }
}

// Example usage: Update a specific controller value
function updateMidiControllerValues() {
  for (let i = 0; i < mappedControllerValues.length; i++) {
    const value = Math.round(mappedControllerValues[i]); // Round the value if necessary
    sendMidiControlChange(i, value); // Send the value to the corresponding controller
  }
}
*/


  
  ///BUTTONS///
    // Listen for note on messages
    myMidi.addListener("noteon", e => {
      if(debugMode){console.log(`${e.note.identifier}`)};
      //console.log(`${mappedControllerValues[e.controller.number]}`);
      // Check if the note identifier is mapped to an action
      if (buttonOnActions[e.note.identifier]) {
          buttonOnActions[e.note.identifier](); // Call the mapped action
      }
  });
  
  // Listen for note off messages
  myMidi.addListener("noteoff", e => {
      //console.log(`${e.note.identifier}`);
      // Trigger an action when button is released
      if (buttonOffActions[e.note.identifier]) {
          buttonOffActions[e.note.identifier](); // Call the mapped action
      }
  
      //console.log("saved: " + savedControllerValues.map(value => Math.round(value)).join(','));
      // Example: Send a control change to controller 1 with a value of 100
   
    
  });
  
  //KNOBS
    myMidi.addListener("controlchange", onCC);	
  }
  function onNote(e) {
    if(debugMode){console.log(`${e.controller.number} `)};
    mappedControllerValues[e.controller.number] = map(e.value, 0, 1, 0, 100);
  }

  function onCC(e) {
    if(midiLogRaw){
      console.log(`${e.controller.number} ${e.value}`)
      //console.log(` ${e.controller.number}`);
    };
    // Map the controller value for later use
    mappedControllerValues[e.controller.number] = map(e.value, 0, 1, 0, 100);
    savedControllerValues[e.controller.number] = map(e.value, 0, 1, 0, 100);

    currentControllerValues[e.controller.number] = e.value;
    logCurrentControllerValues();


    if (e.controller.number == 9) {

      sunAlpha = map(e.value, 0, 1, 0, 100); // Change sunAlpha based on controller 9
      //console.log(sunAlpha);
  }
  }

  // Function to log all current controller values
function logCurrentControllerValues() {
  if(debugMode){console.log("Current Controller Values:")};
  for (const [controllerNumber, value] of Object.entries(currentControllerValues)) {
    if(debugMode){console.log(`Controller ${controllerNumber}: Value ${value}`)};
  }
}



function sendControlChange(controllerNumber, value, channel = 11) {
  const myMidiOut = WebMidi.outputs[0]; // Get the first MIDI output


  // Construct the status byte for control change on the specified channel
  //const channel = 11; // Set to channel 11
  const statusByte = 0xB0 + (channel - 1); // MIDI channels are 0-indexed in the status byte

  // Send the control change message to set the knob value
  myMidiOut.send([statusByte, controllerNumber, value]);
  if(debugMode){console.log(`Sent Control Change: Status Byte: ${statusByte.toString(16)}, Controller: ${controllerNumber}, Value: ${value}`)};

  // Send LED control change message to light the corresponding LED
  const ledStatusByte = 0xB0 ;//+ (channel - 1); // Same status byte for LED
  const ledValue = value > 0 ? 127 : 0; // Set LED to full brightness if value > 0, otherwise off
  myMidiOut.send([ledStatusByte, controllerNumber + 32, ledValue]); // Add 32 to the controller number for LED
  if(debugMode){console.log(`Sent LED Control Change: Status Byte: ${ledStatusByte.toString(16)}, LED Controller: ${controllerNumber + 32}, Value: ${ledValue}`)};
}

