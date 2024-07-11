const apiURL = "http://172.17.72.222:8000/";
let totalBoxes = 0;


const detected = document.querySelector('.detected');
const calculated = document.querySelector('.calculated');

// Generate the input boxes based on the user input
function generateBoxes(numBoxes) {
    if (totalBoxes > 9) {
        alert("Number of boxes cannot be more than 10.")
        return;
    }
    console.log(numBoxes);

    let container = document.getElementById("canvas-container");

    for (let i = totalBoxes; i < totalBoxes + numBoxes; i++) {
        container.innerHTML += `
                    <div class="input-box">
                        <canvas id="canvas${i}"></canvas>
                        <br>
                        <button onclick="clearCanvas('canvas${i}')" class="clear-btn">Clear</button>
                    </div>
                `;
    }

    for (let i = 0; i < totalBoxes + numBoxes; i++) {
        let canvas = document.getElementById(`canvas${i}`);
        let ctx = canvas.getContext("2d");

        let size = ((window.innerWidth * 9) / 10) / (totalBoxes + numBoxes);
        canvas.width = size;
        canvas.height = size;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);


    }

    // Add event listeners to each canvas element
    console.log('total', totalBoxes + numBoxes);
    for (let i = 0; i < totalBoxes + numBoxes; i++) {
        console.log('hehe', i);
        let canvas = document.getElementById(`canvas${i}`);
        let ctx = canvas.getContext("2d");
        let isDrawing = false;

        if (totalBoxes < 5) {
            ctx.lineWidth = 8;
        } else {
            ctx.lineWidth = 4;
        }

        canvas.addEventListener("mousedown", startDrawing);
        canvas.addEventListener("mousemove", draw);
        canvas.addEventListener("mouseup", stopDrawing);
        canvas.addEventListener("mouseout", stopDrawing);

        function startDrawing(event) {
            isDrawing = true;
            ctx.beginPath();
            ctx.moveTo(event.offsetX, event.offsetY);
        }

        function draw(event) {
            if (isDrawing) {
                ctx.lineTo(event.offsetX, event.offsetY);
                ctx.stroke();
            }
        }

        function stopDrawing() {
            isDrawing = false;
        }

    }
    totalBoxes += numBoxes;

}

generateBoxes(5);
// setTimeout(() => {
//     generateBoxes(1)
// }, 5000);

// Clear the canvas
function clearCanvas(canvasId) {
    let canvas = document.getElementById(canvasId);
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

}

// Recognize the handwritten input using an API endpoint
function recognize() {
    let dataUrls = [];
    for (let i = 0; i < totalBoxes; i++) {
        dataUrls.push(document.getElementById(`canvas${i}`).toDataURL())
    }

    let data = {
        count: totalBoxes,
        images: dataUrls
    }

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/octet-stream",
            'Accept': 'application/json',
            "Access-Control-Allow-Origin": URL
        },
        body: JSON.stringify(data)
    }
    fetch(apiURL + 'solve', options)
        .then(response => response.json())
        .then(response => {
            detected.innerText = response.detected;
            calculated.innerText = response.answer;
        });
}