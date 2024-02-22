import React, { useRef, useEffect } from 'react';
import vision from "@mediapipe/tasks-vision"; 
// import styles from './style.css';
import './style2.css'


const { FaceLandmarker, FilesetResolver} = vision;

const FaceBlush = ({ onFrame }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  let faceLandmarker;
  let lastVideoTime = -1;

  // Code to Initializing device webcam
  useEffect(() => {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia( { video: true } )
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((error) => {
          console.error('Error accessing webcam:', error);
        });
    }
  }, []);



  // Loading mediapipe's tasks-vision module and face landmarker model file or whatever module you want to work on
  const createFaceLandmarker = async () => {
    try{
    const ultron = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
    faceLandmarker = await FaceLandmarker.createFromOptions(ultron, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: "GPU"
      },
      runningMode: "IMAGE",
      numFaces: 1
    });
    }  // try block 
    catch (error) {
        console.error('Error loading the model:', error);
    }
  };

  
  const handleFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    // Apply the cheek glow effect to the canvas element
    // const canvas = canvasRef.current.classList.add('cheek-glow');
    const context = canvas.getContext('2d');

    try{
    if (canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame on the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);  

      // Use the FaceLandmarker for face landmark detection
      if (!faceLandmarker) {
        await createFaceLandmarker();
      }
      
      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const faceLandmarkerResult = faceLandmarker.detect(video);
        myCustomFunction(faceLandmarkerResult.faceLandmarks, canvas);
      }

      const frame = canvas.toDataURL('image/jpeg');
      onFrame(frame);
    }
    }  // try block 
    catch (error) {
      console.error('Error creating face landmarks:', error);
    }
  };



 // main function
  const myCustomFunction= (landmarks, canvas) => { 
  try {
 
       const keypoints =landmarks
       // Define the landmark indices for the left and right cheeks
       const leftCheekLandmarks = [142, 100, 119, 118, 50, 205, 36, 142];
       const rightCheekLandmarks = [371, 329, 348, 347, 280, 425, 266, 371];
       const ctx = canvas.getContext('2d');
    //    ctx.fillStyle = (197, 44, 107);
    //    const drawFilledShape = (landmarkIndices) => {
    //      ctx.beginPath();
    //      for (const index of landmarkIndices) {
    //        const landmark = landmarks[0][index];
    //        ctx.lineTo(landmark.x * canvas.width, landmark.y * canvas.height);
    //      }
    //      ctx.closePath();
    //      ctx.fill();
    //    }; 
    //    drawFilledShape(leftCheekLandmarks);
    //    drawFilledShape(rightCheekLandmarks);




    // Create a radial gradient to simulate the blush
    const gradient = ctx.createRadialGradient(
      (landmarks[0][50].x + landmarks[0][205].x) / 2 * canvas.width,
      (landmarks[0][50].y + landmarks[0][205].y) / 2 * canvas.height,
      0,
      (landmarks[0][50].x + landmarks[0][205].x) / 2 * canvas.width,
      (landmarks[0][50].y + landmarks[0][205].y) / 2 * canvas.height,
      50
    );

    const gradient2 = ctx.createRadialGradient(
        (landmarks[0][280].x + landmarks[0][425].x) / 2 * canvas.width,
        (landmarks[0][280].y + landmarks[0][425].y) / 2 * canvas.height,
        0,
        (landmarks[0][280].x + landmarks[0][425].x) / 2 * canvas.width,
        (landmarks[0][280].y + landmarks[0][425].y) / 2 * canvas.height,
        50
      );

    // // Set gradient stops to create a smooth transition
    const blushColor = 'rgba(213, 101, 125,0.4)'
    // gradient.addColorStop(0, blushColor);
    // gradient.addColorStop(1, 'white'); // You can adjust this color for the edge of the blush
    // ctx.fillStyle = gradient;
    // ctx.beginPath();
    // ctx.arc( (landmarks[0][50].x + landmarks[0][205].x) / 2 * canvas.width, (landmarks[0][50].y + landmarks[0][205].y) / 2 * canvas.height, 20, 0, 2 * Math.PI);
    // ctx.fill();


    // Sample the color from the canvas within the left cheek landmarks
    const leftCheekColor = sampleColorWithinLandmarks(canvas, leftCheekLandmarks, landmarks);
    const rightCheekColor = sampleColorWithinLandmarks(canvas, rightCheekLandmarks, landmarks);
    // console.log("skin color", rightCheekColor)
    // gradient2.addColorStop(0, blushColor);
    // gradient2.addColorStop(1, `rgba(${rightCheekColor.r}, ${rightCheekColor.g}, ${rightCheekColor.b}, 0.4)`);
    // ctx.fillStyle = gradient2;
    // ctx.beginPath();
    // ctx.arc( (landmarks[0][280].x + landmarks[0][425].x) / 2 * canvas.width, (landmarks[0][280].y + landmarks[0][425].y) / 2 * canvas.height, 20, 0, 2 * Math.PI);
    // ctx.fill();



    // 3 method
    // Apply color enhancements
    const baseColor = 'rgba(197, 44, 107, 0.9)'
    const enhancedLeftCheekColor = enhanceColor(baseColor);
    console.log("color effect", enhancedLeftCheekColor)
    const enhancedRightCheekColor = enhanceColor(rightCheekColor);
    // Set gradient stops with the enhanced colors
    gradient.addColorStop(0, `rgba(${enhancedLeftCheekColor.r}, ${enhancedLeftCheekColor.g}, ${enhancedLeftCheekColor.b}, ${enhancedLeftCheekColor.a})`);
    gradient.addColorStop(0.9, `rgba(${enhancedRightCheekColor.r}, ${enhancedRightCheekColor.g}, ${enhancedRightCheekColor.b}, ${enhancedRightCheekColor.a})`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc( (landmarks[0][50].x + landmarks[0][205].x) / 2 * canvas.width, (landmarks[0][50].y + landmarks[0][205].y) / 2 * canvas.height, 20, 0, 2 * Math.PI);
    ctx.fill();




  }
  
  catch (error) {
    console.error('Error in main algorithm:', error);
  }

  };
  

// Function to sample the color from within landmarks
const sampleColorWithinLandmarks = (canvas, landmarkIndices, landmarks) => {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
    // Collect color samples within the specified landmarks
    const colors = {r: 0,g: 0,b: 0,count: 0,};
  
    for (const index of landmarkIndices) {
      const landmark = landmarks[0][index];
      const pixelIndex = (Math.floor(landmark.x * canvas.width) + Math.floor(landmark.y * canvas.height) * canvas.width) * 4;
      colors.r += imageData.data[pixelIndex];
      colors.g += imageData.data[pixelIndex + 1];
      colors.b += imageData.data[pixelIndex + 2];
      colors.count++;
    }
  
    // Calculate the average color
    colors.r = Math.floor(colors.r / colors.count);
    colors.g = Math.floor(colors.g / colors.count);
    colors.b = Math.floor(colors.b / colors.count);
  
    return colors;
  };
  

// ------------------------------------------------------------------------------------
// Function to enhance color based on properties
const enhanceColor = (color) => {
    color = { r: 199, g: 44, b: 107, a: 0.3 };
    const params = {
      saturation: 1, //1.2,      // Adjust saturation
      shineIntensity: 1,//1.5,  // Increase shine intensity
      shineBleeding: 1, //0.3,   // Control shine bleeding
      brightness: 1.2,     // Adjust brightness
      shineScale: 1, //0.5,     // Scale shine effect
      glitterGrain: 1, //0.3,   // Add glitter grain
      glitterIntensity: 1, //2, // Increase glitter intensity
      glitterBleeding: 1, //0.1  // Control glitter bleeding
    };
  
    // Apply enhancements
    color.r *= params.saturation;
    color.g *= params.saturation;
    color.b *= params.saturation;
  
    // Apply brightness
    color.r *= params.brightness;
    color.g *= params.brightness;
    color.b *= params.brightness;
  
    // // Apply shine effect
    // color.r += (255 - color.r) * params.shineIntensity;
    // color.g += (255 - color.g) * params.shineIntensity;
    // color.b += (255 - color.b) * params.shineIntensity;
  
    // Apply glitter effect
    color.r += (Math.random() * params.glitterGrain - params.glitterGrain / 2) * params.glitterIntensity;
    color.g += (Math.random() * params.glitterGrain - params.glitterGrain / 2) * params.glitterIntensity;
    color.b += (Math.random() * params.glitterGrain - params.glitterGrain / 2) * params.glitterIntensity;
  
    // Ensure color values are within the valid range (0-255)
    color.r = Math.min(255, Math.max(0, color.r));
    color.g = Math.min(255, Math.max(0, color.g));
    color.b = Math.min(255, Math.max(0, color.b));
  
    // Apply alpha
    color.a = 0.3;
  
    return color;
  };














  useEffect(() => {
    const interval = setInterval(handleFrame, 100);
    return () => clearInterval(interval);
  }, []);


  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ position: 'absolute' }} />          
      <canvas ref={canvasRef} style={{ position: 'absolute'}} />
    </div>
  );

};

export default FaceBlush;