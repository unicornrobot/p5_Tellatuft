function drawWaveformGarden() {
    colorMode(HSB, 360, 100, 100, 100);
    background(200, 30, 95); // Light blue sky
    
    const waveHeight = height / 20; // 5 sensors + 1 for spacing
    const treeBaseSize = 10;
    const yOffset = 100; // Add this line to define a vertical offset
    
    
    // Draw sun
    fill(45, 100, 100);
    noStroke();
    circle(width - 50, 50, 80);
    
    for (let i = 0; i < 5; i++) {
      const yBase = yOffset + (i + 1) * waveHeight * 2 + 50; // Add 50 pixels between each wave
      //const yBase = (i + 1) * waveHeight;
      const avgSum = summaryFlower[i];
      
      // Calculate a unique green hue for each wave
      const waveHue = 90 + i * 10; // Vary from 90 (yellowish green) to 130 (blueish green)
      
      // Draw ground
      fill(waveHue, 60, 60);
      //noStroke();
      stroke(waveHue,30,30);
      strokeWeight(2);
      beginShape();
      curveVertex(0, height);
      curveVertex(0, yBase);
      
      // Draw waveform
      let prevX = 0;
      let prevY = yBase;
      for (let x = 0; x <= width; x += 10) {
        const index = floor(map(x, 0, width, 0, capturedData.length - 1));
        const value = capturedData[index][i];
        const noiseValue = noise(x * 0.01, i * 10) * 20; // Perlin noise for organic variation
        const y = yBase - map(value, 0, 100, 0, waveHeight * 0.3) - noiseValue; //changing the *0.x value smooths the lines
        
        curveVertex(x, y);
        
        // Draw tree (but not on every iteration to reduce density)
        if (x % 60 == 0 && x > 0) {
          drawTree(prevX + (x - prevX) / 2, (prevY + y) / 2, map(value, 0, 100, treeBaseSize, treeBaseSize * 3), waveHue);
        }
        
        prevX = x;
        prevY = y;
      }
      
      curveVertex(width, yBase);
      curveVertex(width, height);
      endShape(CLOSE);
      
      // Draw average line
      stroke(0, 100, 100);
      strokeWeight(2);
      const avgY = yBase - map(avgSum, 0, 100, 0, waveHeight * 0.7);
      //line(0, avgY, width, avgY);
      
      // Label sensor
      fill(0, 0, 0);
      noStroke();
      textAlign(LEFT, CENTER);
      textSize(16);
      //text(`Sensor ${i}`, 10, yBase - waveHeight / 2);
    }
    
    // Draw legend
    //drawWaveformLegend();
  }

  ///AI ideas
  /*
  Data Bloom:
Imagine a circular visualization where each sensor is represented by a "petal" extending from the center. The length of each petal represents the average sum, while the width of the petal varies along its length to show the distribution of data points. You could use color gradients to represent the frequency of values.
Sensor Constellation:
Create a star-like visualization where each sensor is a point on a star. The distance from the center represents the average sum. Around each point, draw smaller points representing individual data captures, with their distance from the main point showing how much they deviate from the average.
Data Tree:
Draw a tree where the trunk height represents the overall average of all sensors. Each branch represents a sensor, with its length showing the sensor's average. Along each branch, draw leaves or fruits, with their size and color representing individual data points.
Circular Histogram:
Create a circular histogram for each sensor. The circle's radius represents the average sum, while the histogram bars around the circle show the distribution of captured data. You could arrange these circular histograms in a flower-like pattern.
Waveform Garden:
Draw a landscape where each sensor is represented by a waveform. The average height of each wave is the sensor's average sum, while the wave's shape shows the variation in captured data. You could add elements like flowers or trees along the waves, with their sizes corresponding to data points.
6. Data Mandala:
Create a mandala-like visualization where each concentric ring represents a sensor. The average sum determines the ring's thickness, while patterns within the ring represent the distribution of captured data. This could create a beautiful, symmetrical design that's also data-rich.
7. Sensor Aquarium:
Visualize an aquarium where each sensor is a different species of fish. The average size of each fish species represents the sensor's average sum, while individual fish of varying sizes represent captured data points. The movement and clustering of fish could show data trends.
8. Data Galaxy:
Create a galaxy visualization where each sensor is a spiral arm. The length and brightness of each arm represent the average sum, while stars along the arm represent individual data points. Their size and color could indicate how far they deviate from the average.
*/