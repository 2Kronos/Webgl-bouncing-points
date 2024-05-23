import { vsSource } from "./shaders.js";
import { fsSource } from "./shaders.js";

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    throw new Error("WebGL not supported");
}

// Vertices
const vertexData = [
    0, 0, 0,
];

//second point
const stationData = [
    -0.5, 0.5, 0,
];



// 1st point buffer
const buffer = gl.createBuffer();
if (!buffer) {
    console.error("Failed to create buffer");
} else {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
}

//Second point buffer
const buffer2 = gl.createBuffer();
if (!buffer2) {
    console.error("Failed to create buffer");
} else {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer2);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(stationData), gl.STATIC_DRAW);
}

// Vertex shader
const vertexShaderSourceCode = vsSource;
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vsSource);
gl.compileShader(vertexShader);

// Error checking for vertex shader
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error(`Vertex shader compilation error:
     ${gl.getShaderInfoLog(vertexShader)}
     `);
}

// Fragment shader
const fragmentShaderSourceCode = fsSource;
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fsSource);
gl.compileShader(fragmentShader);

// Error checking for fragment shader
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error(`Fragment shader compilation error:
     ${gl.getShaderInfoLog(fragmentShader)}
     `);
}

// Program
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

// Linking error
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(`Shader program linking error:
     ${gl.getProgramInfoLog(program)}
     `);
}

const positionLocation = gl.getAttribLocation(program, "pos");
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bindBuffer(gl.ARRAY_BUFFER, buffer2);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

let dotVelocity = [0.015, 0.025, 0.0]; //1st point speed
let stationVelocity = [0.01, 0.06, 0.0]; //2nd point speed

function updateDot() {

    //if the first point hits the canvas in the x plane
    if (vertexData[0] + dotVelocity[0] > 1 || vertexData[0] + dotVelocity[0] < -1) {
        dotVelocity[0] = -dotVelocity[0];
    }
    //if the first point hits the canvas in the y plane
    if (vertexData[1] + dotVelocity[1] > 1 || vertexData[1] + dotVelocity[1] < -1) {
        dotVelocity[1] = -dotVelocity[1];
    }

    //if the second point hits the canvas in the x plane
    if (stationData[0] + stationVelocity[0] > 1 || stationData[0] + stationVelocity[0] < -1) {
        stationVelocity[0] = -stationVelocity[0];
    }

    //if the second point hits the canvas in the y plane
    if (stationData[1] + stationVelocity[1] > 1 || stationData[1] + stationVelocity[1] < -1) {
        stationVelocity[1] = -stationVelocity[1];
    }

    //if first point touches the canvas it will bounce of it
    vertexData[0] += dotVelocity[0];
    vertexData[1] += dotVelocity[1];


    //if second point touches the canvas it will bounce of it
    stationData[0] += stationVelocity[0];
    stationData[1] += stationVelocity[1];
}



function collision() {
    const dx = vertexData[0] - stationData[0];
    const dy = vertexData[1] - stationData[1];
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate the threshold based on the size of the points and the size of the canvas
    const threshold = 90 / Math.min(canvas.width, canvas.height);

    if (distance < threshold) {
        
        // if the points touch each other they will bounce off each other
        dotVelocity[1] = -dotVelocity[1];
        dotVelocity[0] = -dotVelocity[0];

        stationVelocity[1] = -stationVelocity[1];
        stationVelocity[0] = -stationVelocity[0];

        console.log("Collision has occurred");
    } else {
        console.log("No collision");
    }
}



function drawDot() {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    gl.drawArrays(gl.POINTS, 0, 1);
}

function drawStation() {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(stationData), gl.STATIC_DRAW);
    gl.drawArrays(gl.POINTS, 0, 1);
}

function animate() {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    updateDot();
    drawDot();
    drawStation();
    collision();
    window.requestAnimationFrame(animate);
}

animate();
