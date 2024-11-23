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