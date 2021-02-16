// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/YIklb0Tff/";

let model, webcam, labelContainer, maxPredictions;
let bars = [];
let barColors = [
    "#333736", "#3d5a56", "#90719a", "#846a51",
];

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(250, 250, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.querySelector(".loading").remove();
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");

    let inner = "";
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        inner += `<div class="item-container">
            <span id="item-label${i}" class="item-label"></span>
            <div id="item${i}" class="item ldBar label-right"
            style="width:100%;height:30px"></div>
            <span id="item-value${i}" class="item-value ldBar label-right"></span>
        </div>`;
    }
    labelContainer.innerHTML = inner;
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        var bar = new ProgressBar.Line(`#item${i}`, {
            strokeWidth: 8,
            easing: 'easeInOut',
            duration: 1400,
            color: barColors[i],
            trailColor: '#eee',
            trailWidth: 10,
            svgStyle: { width: '100%', height: '100%' },
        });
        bars.push(bar);
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

let beforeClassName = "";
// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    let max = 0;
    let maxIdx = 0;
    for (let i = 0; i < maxPredictions; i++) {
        document.querySelector(`#item-label${i}`).innerHTML = prediction[i].className;
        let percent = prediction[i].probability.toFixed(2);
        bars[i].set(percent);
        percent = Math.round(percent * 100, 0);
        document.querySelector(`#item-value${i}`).innerHTML = `${percent} %`;
        if (max < percent) {
            max = Math.max(percent, max);
            maxIdx = i;
        }
    }
    let className = prediction[maxIdx].className;
    if (beforeClassName !== className) {
        beforeClassName = className;
        document.querySelector("#best").innerHTML = `
        <a href="./page3.html?class=${className}" class="btn" style="background-color:${barColors[maxIdx]}">
            ${className}
        </a>`;
    }
}

window.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        init();
    }, 100);
})