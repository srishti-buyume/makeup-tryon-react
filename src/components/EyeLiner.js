import React, { useRef, useEffect } from 'react';
// import vision from "@mediapipe/tasks-vision"; 
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
import "./styles.css"

const { FaceLandmarker, FilesetResolver} = vision;

const EyeLiner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  let faceLandmarker;

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
      

      const faceLandmarkerResult = faceLandmarker.detect(video);
      
      myCustomFunction(faceLandmarkerResult.faceLandmarks, canvas);

    }
    }  // try block 
    catch (error) {
      console.error('Error creating face landmarks:', error);
    }
  };
  


  // -------------------------- YOUR CUSTOM INFERENCE CODE -------------------------------------
 
  const myCustomFunction= (landmarks, canvas) => { 
  try {

    const landmarkEyeliner1= [
      landmarks[0][362],landmarks[0][398],landmarks[0][384],landmarks[0][385],landmarks[0][386],landmarks[0][387],landmarks[0][388], landmarks[0][466], 
      landmarks[0][263], landmarks[0][359]
    ];

    const landmarkEyeliner2= [
      landmarks[0][133], landmarks[0][173],landmarks[0][157],landmarks[0][158], landmarks[0][159], landmarks[0][160], landmarks[0][161], landmarks[0][246], 
      landmarks[0][33], landmarks[0][130],
      ];
    
    // Draw landmarks on the canvas for above 2 landmark keypoints
    const ctx = canvas.getContext('2d');
    ctx.font = "25px Arial";
    ctx.imageSmoothingEnabled = true;
    // ctx.alpha='true';

    const baseColor = { r: 0, g: 0, b: 0, a: 0.4 };

    // Darken the color by reducing the alpha channel
    const enhancedColor = { ...baseColor};

    // enhancedColor.r -= 10;
    enhancedColor.g -= 20;
    enhancedColor.b -= 20;

    ctx.strokeStyle = `rgba(${enhancedColor.r}, ${enhancedColor.g}, ${enhancedColor.b}, ${enhancedColor.a})`;
    ctx.fillStyle = `rgba(${enhancedColor.r}, ${enhancedColor.g}, ${enhancedColor.b}, ${enhancedColor.a})`;



   
    ctx.beginPath();
    ctx.lineWidth = 3;
      
    landmarkEyeliner1.forEach(point => {
          ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2)
    
        });
        
    ctx.stroke();
    
    ctx.closePath();

    ctx.beginPath();
    ctx.lineWidth = 3;

    landmarkEyeliner2.forEach(point => {
          ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2)
    
        });
    ctx.stroke();
    
    ctx.closePath();
    // canvas.style.filter = "blur(0.6px) brightness(100%)  saturate(125%) sepia(10%) "; 
 
  }  // try block
  
  catch (error) {
    console.error('Error in main algorithm:', error);
  }

  };
  

  useEffect(() => {
    const interval = setInterval(handleFrame, 30);
    return () => clearInterval(interval);
  }, []);


// Below is what will be displayed on the browser for user to see - 
// 1. A video element displaying live webcam feed and 
// 2. A canvas element that draws stuff on the video element
  return (
    <div class="canvas-filter">
      <video ref={videoRef} autoPlay muted style={{ position: 'absolute' }} />          
      <canvas ref={canvasRef} style={{ position: 'absolute' }} />
    </div>
  );

};

export default EyeLiner;