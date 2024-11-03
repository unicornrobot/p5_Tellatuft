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


//WEBMIDI//
function onMidiEnabled() {
    console.log("MIDI enabled");
    loadStoredControllerValues(); // Load stored values on MIDI enable
      // Display available MIDI input devices
      if (WebMidi.inputs.length < 1)
          console.log("No device detected.");
      else
          WebMidi.inputs.forEach((device, index) => {
              console.log(`${index}: ${device.name}`);
          });
      
    const myMidi = WebMidi.inputs[0];
    // const mySynth = WebMidi.getInputByName("TYPE NAME HERE!")
    // Map of note identifiers to button actions
    //can be variable sets or function calls.
    const buttonOnActions = {
      "G#-1": () => {
        sunColor = "#FF0000"; 
        storeCurrentControllerValues(); // Store values when button is pressed
      }, //1
      "A-1": () => {
        console.log("button a-1 pressed");
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
    "A-1": () => console.log("button a-1 released"),
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
      console.log("Loaded stored controller values:", capturedControllerValues);
      
      // Set the initial state of the graphs or UI elements
      setInitialGraphStates(capturedControllerValues);
    } else {
      capturedControllerValues = []; // Initialize as empty array if not set
      console.log("No stored controller values found, initialized as empty array.");
    }
  }

  // Function to set the initial state of the graphs or UI elements
  function setInitialGraphStates(values) {
    // Assuming you have a function or method to update the graphs
    // This is a placeholder; replace with actual implementation
    for (let i = 0; i < values.length; i++) {
      // Update your graph or UI element with the loaded values
      // Example: updateGraph(i, values[i]);
     // console.log(`Setting graph ${i} to value: ${values[i]}`);
    }
  }

  // Function to store current controller values
  function storeCurrentControllerValues() {
    capturedControllerValues = mappedControllerValues.slice(0, 10).map(value => Math.round(value)); // Capture only the first 10 controller values rounded to no decimal place
    console.log("First 10 controller values stored:", capturedControllerValues);
    
    // Save to localStorage, replacing the previous data
    localStorage.setItem('capturedControllerValues', JSON.stringify(capturedControllerValues));
  }
    
      //myMidi.addListener("noteon", onNote);
  
    // Function to read knob values before using them
  function readKnobValues() {
    // Example of how to use the stored knob values
    for (let i = 0; i < midiKnobValues.length; i++) {
        if (midiKnobValues[i] !== undefined) {
            //console.log(`Knob ${i}: ${midiKnobValues[i]}`);
            savedControllerValues[i] = mappedControllerValues[i];
        }
    }
  }
  
  ///BUTTONS///
    // Listen for note on messages
    myMidi.addListener("noteon", e => {
      console.log(`${e.note.identifier}`);
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
      
  });
  
  //KNOBS
    myMidi.addListener("controlchange", onCC);	
  }
  function onNote(e) {
      console.log(`${e.controller.number} `);
    mappedControllerValues[e.controller.number] = map(e.value, 0, 1, 0, 100);
  }

  function onCC(e) {
    if(midiLogRaw){
      console.log(`${e.controller.number} ${e.value}`)
      console.log(` ${e.controller.number}`);
    };
    // Map the controller value for later use
    mappedControllerValues[e.controller.number] = map(e.value, 0, 1, 0, 100);
    savedControllerValues[e.controller.number] = map(e.value, 0, 1, 0, 100);

    if (e.controller.number == 9) {

      sunAlpha = map(e.value, 0, 1, 0, 100); // Change sunAlpha based on controller 9
      //console.log(sunAlpha);
  }
  }