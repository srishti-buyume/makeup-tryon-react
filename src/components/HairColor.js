
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
const { ImageSegmenter, SegmentationMask, FilesetResolver } = vision;
// Get DOM elements
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("canvas");
const canvasCtx = canvasElement.getContext("2d");
const webcamPredictions = document.getElementById("webcamPredictions");
const demosSection = document.getElementById("demos");
let enableWebcamButton;
let webcamRunning = false;

let runningMode = "IMAGE";
let imageSegmenter;
let labels;


const createImageSegmenter = async () => {
  const audio = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  imageSegmenter = await ImageSegmenter.createFromOptions(audio, {
    baseOptions: {
      //   modelAssetPath:"https://storage.googleapis.com/mediapipe-models/image_segmenter/deeplab_v3/float32/1/deeplab_v3.tflite",
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite",
      delegate: "GPU",
    },
    runningMode: runningMode,
    outputCategoryMask: true,
    outputConfidenceMasks: false,
  });
  labels = imageSegmenter.getLabels();
  demosSection.classList.remove("invisible");
};
createImageSegmenter();

const imageContainers = document.getElementsByClassName("segmentOnClick");
// Add click event listeners for the img elements.
for (let i = 0; i < imageContainers.length; i++) {
  imageContainers[i]
    .getElementsByTagName("img")[0]
    .addEventListener("click", handleClick);
}
/**
 * Demo 1: Segmented images on click and display results.
 */
let canvasClick;
async function handleClick(event) {
  // Do not segmented if imageSegmenter hasn't loaded
  if (imageSegmenter === undefined) {
    return;
  }
  canvasClick = event.target.parentElement.getElementsByTagName("canvas")[0];
  canvasClick.classList.remove("removed");
  canvasClick.width = event.target.naturalWidth;
  canvasClick.height = event.target.naturalHeight;
  const cxt = canvasClick.getContext("2d");
  cxt.clearRect(0, 0, canvasClick.width, canvasClick.height);
  cxt.drawImage(event.target, 0, 0, canvasClick.width, canvasClick.height);
  event.target.style.opacity = 0;
  // if VIDEO mode is initialized, set runningMode to IMAGE
  if (runningMode === "VIDEO") {
    runningMode = "IMAGE";
    await imageSegmenter.setOptions({
      runningMode: runningMode,
    });
  }
  // imageSegmenter.segment() when resolved will call the callback function.
  imageSegmenter.segment(event.target, callback);
}


function callback(result) {
  const cxt = canvasClick.getContext("2d");
  const { width, height } = result.categoryMask;
  let imageData = cxt.getImageData(0, 0, width, height).data;
  canvasClick.width = width;
  canvasClick.height = height;
  let category = "";
  const mask = result.categoryMask.getAsUint8Array();

  for (let i in mask) {
    if (mask[i] > 0) {
      category = labels[mask[i]];
    }
    const legendColor = legendColors[mask[i] % legendColors.length];
    imageData[i * 4] = (legendColor[0] + imageData[i * 4]) / 2;
    imageData[i * 4 + 1] = (legendColor[1] + imageData[i * 4 + 1]) / 2;
    imageData[i * 4 + 2] = (legendColor[2] + imageData[i * 4 + 2]) / 2;
    imageData[i * 4 + 3] = (legendColor[3] + imageData[i * 4 + 3]) / 2;
  }

  const uint8Array = new Uint8ClampedArray(imageData.buffer);
  const dataNew = new ImageData(uint8Array, width, height);
  cxt.putImageData(dataNew, 0, 0);
  const p = event.target.parentNode.getElementsByClassName("classification")[0];
  p.classList.remove("removed");
  p.innerText = "Category: " + category;
}
function callbackForVideo(result) {
  let imageData = canvasCtx.getImageData(
    0,
    0,
    video.videoWidth,
    video.videoHeight
  ).data;
  const mask = result.categoryMask.getAsFloat32Array();

  let j = 0;

  for (let i = 0; i < mask.length; ++i) {
    const maskVal = Math.round(mask[i] * 255.0);
    // const legendColor = legendColors[maskVal % legendColors.length];
    // const legendColor = legendColors[0];

    // change this color to change the color of the mask. the first value is red, the second is green, the third is blue, and the fourth is opacity
    const legendColor =  [141, 53, 74, 200] //[240, 78, 138, 255]; //[255, 197, 0, 255];  //#8D354A

    // if (maskVal > 0) {
    //   imageData[j] = (legendColor[0] + imageData[j]) / 2;
    //   imageData[j + 1] = (legendColor[1] + imageData[j + 1]) / 2;
    //   imageData[j + 2] = (legendColor[2] + imageData[j + 2]) / 2;
    //   imageData[j + 3] = (legendColor[3] + imageData[j + 3]) / 2;
    // }

    if (maskVal > 0) {
      const opacity = maskVal; // Adjust opacity based on mask value
      const blendAmount = 0.7; // Adjust the blend amount based on the desired effect

      // Blend colors using a chosen blending mode (e.g., multiply)
      imageData[j] =
        (1 - blendAmount) * imageData[j] + blendAmount * legendColor[0];
      imageData[j + 1] =
        (1 - blendAmount) * imageData[j + 1] + blendAmount * legendColor[1];
      imageData[j + 2] =
        (1 - blendAmount) * imageData[j + 2] + blendAmount * legendColor[2];

      // Adjust opacity based on the mask value
      imageData[j + 3] = Math.round(opacity * imageData[j + 3]);

      // Refine edges for a smoother transition
      const threshold = 0.7; // Adjust the threshold value for edge refinement
      const diff = Math.abs(imageData[j] - imageData[j + 1]); // Calculate color difference
      if (diff < threshold) {
        const edgeBlendAmount = diff / threshold; // Adjust the edge blend amount based on the color difference
        imageData[j] =
          (1 - edgeBlendAmount) * imageData[j] +
          edgeBlendAmount * legendColor[0];
        imageData[j + 1] =
          (1 - edgeBlendAmount) * imageData[j + 1] +
          edgeBlendAmount * legendColor[1];
        imageData[j + 2] =
          (1 - edgeBlendAmount) * imageData[j + 2] +
          edgeBlendAmount * legendColor[2];
      }
    }

    j += 4;
  }

  const uint8Array = new Uint8ClampedArray(imageData.buffer);
  const dataNew = new ImageData(
    uint8Array,
    video.videoWidth,
    video.videoHeight
  );
  canvasCtx.putImageData(dataNew, 0, 0);
  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}
/********************************************************************
// Demo 2: Continuously grab image from webcam stream and segmented it.
********************************************************************/
// Check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
// Get segmentation from the webcam
let lastWebcamTime = -1;
async function predictWebcam() {
  if (video.currentTime === lastWebcamTime) {
    if (webcamRunning === true) {
      window.requestAnimationFrame(predictWebcam);
    }
    return;
  }
  lastWebcamTime = video.currentTime;
  canvasCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  // Do not segmented if imageSegmenter hasn't loaded
  if (imageSegmenter === undefined) {
    return;
  }
  // if image mode is initialized, create a new segmented with video runningMode
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await imageSegmenter.setOptions({
      runningMode: runningMode,
    });
  }
  let startTimeMs = performance.now();
  // Start segmenting the stream.
  imageSegmenter.segmentForVideo(video, startTimeMs, callbackForVideo);
}
// Enable the live webcam view and start imageSegmentation.
async function enableCam(event) {
  if (imageSegmenter === undefined) {
    return;
  }
  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton.innerText = "ENABLE SEGMENTATION";
  } else {
    webcamRunning = true;
    enableWebcamButton.innerText = "DISABLE SEGMENTATION";
  }
  // getUsermedia parameters.
  const constraints = {
    video: true,
  };
  // Activate the webcam stream.
  video.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
  video.addEventListener("loadeddata", predictWebcam);
}
// If webcam supported, add event listener to button.
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}
