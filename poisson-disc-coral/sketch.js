/*
references: 
The Coding Train - https://www.youtube.com/watch?v=flQgnCUxHlw
Robert Brisdon - https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf
Jason Davie - https://www.jasondavies.com/poisson-disc/
*/

let record = true;
let capture;

/***** COLORS PALETTE *****/
let yellow = "#ffd800";
let orange = "#ff4f00";
let red = "#ff1100";
let pink = "#ffc4ed";
let purple = "#6050dc";
let blue = "#0081f7";
let lightblue = "#9ed8ff";

// put as many colors as you want in here
let colors = [purple, yellow, red, blue, lightblue];

let r = 5;
let k = 30;
let grid = [];
let w = r / Math.sqrt(2);
let active = [];
let nCols, nRows;

let ordered = [];

function setup() {
  let canvas = createCanvas(500, 500);
  canvas.id("canvas");
  background(255);
  strokeWeight(2);

  capture = new CCapture({
    format: "png",
    framerate: 30,
    name: "frames",
    // verbose: true,
    autoSaveTime: 300,
  });

  nCols = floor(width / w);
  nRows = floor(height / w);
  // make the grid array a 2D array
  for (let i = 0; i < nRows; i++) {
    let newRow = [];
    for (let j = 0; j < nCols; j++) {
      newRow.push(undefined);
    }
    grid.push(newRow);
  }

  // for each color in the colors array :
  for (let n = 0; n < colors.length; n++) {
    // p is a new vector point created at random position on canvas
    let p = createVector(random(width), random(height));

    let i = floor(p.x / w);
    let j = floor(p.y / w);
    let pos = createVector(p.x, p.y);
    grid[i][j] = pos;
    // the color is stored in the active array with the position vector
    active.push({
      pos: pos,
      color: colors[n],
    });
  }

  //frameRate(1);
}

function draw() {
  if (frameCount === 1 && record) {
    console.log("starting recording...");
    capture.start();
  }

  for (let total = 0; total < 25; total++) {
    if (active.length > 0) {
      let randIndex = floor(random(active.length));

      // grab the values we stored in the active array
      let pos = active[randIndex].pos;
      let color = active[randIndex].color;

      let found = false;
      for (let n = 0; n < k; n++) {
        let sample = p5.Vector.random2D();
        let m = random(r, 2 * r);
        sample.setMag(m);
        sample.add(pos);

        let col = floor(sample.x / w);
        let row = floor(sample.y / w);

        if (col > -1 && row > -1 && col < nCols && row < nRows && !grid[col][row]) {
          let ok = true;

          // max() ensures that the largest value in the sequence will be taken
          // min() ensures that the smallest value will be taken
          for (let i = max(row - 1, 0); i <= min(row + 1, nRows - 1); i++) {
            for (let j = max(col - 1, 0); j <= min(col + 1, nRows - 1); j++) {
              let neighbor = grid[i][j];
              if (neighbor) {
                let d = p5.Vector.dist(sample, neighbor);
                if (d < r) {
                  ok = false;
                }
              }
            }
          }

          if (ok) {
            found = true;
            grid[row][col] = sample;
            active.push({
              pos: sample,
              color: color,
            });
            ordered.push({
              pos: sample,
              color: color,
            });

            stroke(color);
            line(sample.x, sample.y, pos.x, pos.y);

            capture.capture(document.getElementById("canvas"));
            break;
          }
        }
      }

      if (!found) {
        active.splice(randIndex, 1);
      }
    }
  }

  //   for (let i = 0; i < ordered.length; i++) {
  //     if (ordered[i].pos) {
  //       stroke(white);
  //       strokeWeight(r * 0.5);

  //       point(ordered[i].pos.x, ordered[i].pos.y);
  //     }
  //   }

  // for (let i = 0; i < active.length; i++) {
  //   stroke(orange);
  //   strokeWeight(r * 0.5);

  //   point(active[i].pos.x, active[i].pos.y);

  // }
}

function mousePressed() {
  console.log("done!");
  capture.stop();
  capture.save();
  record = false;
}
