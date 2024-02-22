import React, { useRef, useEffect } from 'react';
import * as vision from "@mediapipe/tasks-vision";
const { FaceLandmarker, FilesetResolver } = vision;

// import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";


// const { FaceLandmarker, FilesetResolver} = vision;

const ReactTemplate = ({ onFrame }) => {
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


    const landmarkEyeshadow1= [ landmarks[0][113], landmarks[0][225], landmarks[0][224], landmarks[0][223], landmarks[0][222], 
    landmarks[0][221], landmarks[0][189], landmarks[0][190], landmarks[0][173], landmarks[0][157], landmarks[0][158], landmarks[0][159], landmarks[0][160], 
    landmarks[0][161], landmarks[0][246], landmarks[0][33], landmarks[0][130], landmarks[0][113] ];

    const landmarkEyeshadow2= [ landmarks[0][413], landmarks[0][441], landmarks[0][442], landmarks[0][443], landmarks[0][444], 
    landmarks[0][445], landmarks[0][342], landmarks[0][263], landmarks[0][466], landmarks[0][388], landmarks[0][387], landmarks[0][386], 
    landmarks[0][385], landmarks[0][384], landmarks[0][398], landmarks[0][362], landmarks[0][413] ];

    
    const ctx = canvas.getContext('2d');
    ctx.font = "25px Arial";
    ctx.imageSmoothingEnabled = true;
    ctx.globalAlpha= 0.5

    const baseColor = { r: 228, g: 93, b: 125, a: 0.5 };

    // Darken the color by reducing the alpha channel
    const enhancedColor = { ...baseColor, a: 0.2};

    // enhancedColor.r -= 10;
    enhancedColor.g -= 20;
    enhancedColor.b -= 20;


    // ctx.fillStyle = gradient;
    ctx.fillStyle = `rgba(${enhancedColor.r}, ${enhancedColor.g}, ${enhancedColor.b}, ${enhancedColor.a})`;

    const glossyGradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 4
    );
    glossyGradient.addColorStop(0, `rgba(${enhancedColor.r}, ${enhancedColor.g}, ${enhancedColor.b}, ${enhancedColor.a})`);
    glossyGradient.addColorStop(1, `rgba(${enhancedColor.r}, ${enhancedColor.g}, ${enhancedColor.b}, 0.5)`);

   
    ctx.beginPath();

    landmarkEyeshadow1.forEach(point => {
          ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2)
    
        });
    landmarkEyeshadow2.forEach(point => {
      ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2)

    });
    
    ctx.fill();
    ctx.strokeStyle = `rgba(${enhancedColor.r - 20}, ${enhancedColor.g - 20}, ${enhancedColor.b - 20}, ${enhancedColor.a})`;
    ctx.shadowColor = `rgba(${enhancedColor.r}, ${enhancedColor.g}, ${enhancedColor.b}, ${enhancedColor.a})`;
    ctx.shadowBlur = 8.0;
    ctx.lineJoin = 'round';
    ctx.fillStyle = glossyGradient;
    
    ctx.closePath();

    canvas.style.filter = "blur(0.6px) brightness(100%)  saturate(125%) sepia(10%) "; 
 
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
      <canvas ref={canvasRef} style={{ position: 'absolute' }} />
    </div>
  );

};

export default ReactTemplate;