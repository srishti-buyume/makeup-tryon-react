import React, { useRef, useEffect } from 'react';
// import vision from "@mediapipe/tasks-vision"; 
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
import './style2.css'

const { FaceLandmarker, FilesetResolver} = vision;

const LipColor = ({ onFrame }) => {
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

        // This will be your main custom function where you will write code to display results of whatever mediapipe module and model file you are using
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


  // -------------------------- YOUR CUSTOM INFERENCE CODE -------------------------------------
 
  const myCustomFunction= (landmarks, canvas) => { 
  try {

    // Get 2 example facial landmark keypoints
    const landmarkPoint10 = landmarks[0][10];       // forehead-center
    const landmarkPoint152 = landmarks[0][152];     // chin-center

    const landmarkLips1= [
      landmarks[0][61],landmarks[0][40],landmarks[0][39],landmarks[0][37],landmarks[0][0],landmarks[0][267],landmarks[0][269],landmarks[0][270],landmarks[0][409],
      landmarks[0][306],landmarks[0][415], landmarks[0][310],landmarks[0][311],landmarks[0][312],landmarks[0][13],landmarks[0][82],landmarks[0][81],landmarks[0][42],
      landmarks[0][183],landmarks[0][61],landmarks[0][61],landmarks[0][61],landmarks[0][61],landmarks[0][61],landmarks[0][61],landmarks[0][61],
      landmarks[0][61],landmarks[0][61], landmarks[0][61]
    ];
    // landmarks[0][78], landmarks[0][62], landmarks[0][76],
    // landmarks[0][292]
    const landmarkLips2= [
        landmarks[0][61], landmarks[0][146],landmarks[0][91], landmarks[0][181],
        landmarks[0][84], landmarks[0][17], landmarks[0][314],landmarks[0][405], landmarks[0][321], landmarks[0][375], landmarks[0][306], 
        landmarks[0][409], landmarks[0][324], landmarks[0][318], landmarks[0][402],landmarks[0][317], 
        landmarks[0][14], landmarks[0][87], landmarks[0][178], landmarks[0][88],landmarks[0][95], landmarks[0][61], landmarks[0][61], landmarks[0][61], 
        landmarks[0][61]
      ];
    
    // Draw landmarks on the canvas for above 2 landmark keypoints
    const ctx = canvas.getContext('2d');
    ctx.font = "25px Arial";
    ctx.imageSmoothingEnabled = true;
    // ctx.alpha='true';

    const baseColor = { r: 199, g: 44, b: 107, a: 0.3 };

    // Darken the color by reducing the alpha channel
    const enhancedColor = { ...baseColor};

    // enhancedColor.r -= 10;
    enhancedColor.g -= 20;
    enhancedColor.b -= 20;
    // const enhancedColor= baseColor;
    // const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 4);
    // gradient.addColorStop(0, `rgba(${enhancedColor.r}, ${enhancedColor.g}, ${enhancedColor.b}, ${enhancedColor.a})`);
    // gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)'); // Lighter color at the center


    // ctx.fillStyle = gradient;
    ctx.fillStyle = `rgba(${enhancedColor.r}, ${enhancedColor.g}, ${enhancedColor.b}, ${enhancedColor.a})`;

   
    ctx.beginPath();
    // ctx.arc(landmarkPoint10.x * canvas.width, landmarkPoint10.y * canvas.height, 5, 0, Math.PI * 2);
    // ctx.arc(landmarkPoint152.x * canvas.width, landmarkPoint152.y * canvas.height, 5, 0, Math.PI * 2);

    landmarkLips2.forEach(point => {
          // console.log(`X: ${point.x}, Y: ${point.y}`);
          ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2)
    
        });
      
    landmarkLips1.forEach(point => {
          // console.log(`X: ${point.x}, Y: ${point.y}`);
          ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2)
    
        });
    
    ctx.fill();
    // ctx.strokeStyle = `rgba(${enhancedColor.r}, ${enhancedColor.g}, ${enhancedColor.b}, ${enhancedColor.a})`;
    ctx.strokeStyle = `rgba(${enhancedColor.r - 20}, ${enhancedColor.g - 20}, ${enhancedColor.b - 20}, ${enhancedColor.a})`;
    ctx.shadowColor = `rgba(${enhancedColor.r}, ${enhancedColor.g}, ${enhancedColor.b}, ${enhancedColor.a})`;
    ctx.shadowBlur = 8.0;
    ctx.lineWidth = 15.0;
    ctx.lineJoin = 'round';
    const glossyGradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 4
    );
    glossyGradient.addColorStop(0, `rgba(${enhancedColor.r}, ${enhancedColor.g}, ${enhancedColor.b}, ${enhancedColor.a})`);
    glossyGradient.addColorStop(1, `rgba(${enhancedColor.r}, ${enhancedColor.g}, ${enhancedColor.b}, 0.5)`);
    
    ctx.fillStyle = glossyGradient;
    ctx.closePath();
 
  }  // try block
  
  catch (error) {
    console.error('Error in main algorithm:', error);
  }

  };
  

  useEffect(() => {
    const interval = setInterval(handleFrame, 100);
    return () => clearInterval(interval);
  }, []);


// Below is what will be displayed on the browser for user to see - 
// 1. A video element displaying live webcam feed and 
// 2. A canvas element that draws stuff on the video element
  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ position: 'absolute' }} />          
      {/* <canvas ref={canvasRef} style={{ position: 'absolute' }} /> */}
      <canvas ref={canvasRef} className="canvas-filter" style={{ position: 'absolute' }} />
   
    </div>
  );

};

export default LipColor;