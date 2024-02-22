import React, { useRef, useEffect } from 'react';
import vision from "@mediapipe/tasks-vision"; 


const { FaceLandmarker, FilesetResolver} = vision;

const Example = ({ onFrame }) => {
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
    
    // Draw landmarks on the canvas for above 2 landmark keypoints
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(landmarkPoint10.x * canvas.width, landmarkPoint10.y * canvas.height, 5, 0, Math.PI * 2);
    ctx.arc(landmarkPoint152.x * canvas.width, landmarkPoint152.y * canvas.height, 5, 0, Math.PI * 2);
    ctx.fill();
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
      <canvas ref={canvasRef} style={{ position: 'absolute' }} />
    </div>
  );

};

export default Example;