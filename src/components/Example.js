import React, { useRef, useEffect } from 'react';
// import vision from "@mediapipe/tasks-vision"; 
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

const { FaceLandmarker, FilesetResolver} = vision;

const Example = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  let faceLandmarker;

  // Initializing device webcam
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


  // Loading mediapipe's tasks-vision module and face landmarker model file
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
    } catch (error) {
        console.error('Error loading the model:', error);
    }
  };

  
  const handleFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    if (!faceLandmarker) {
      await createFaceLandmarker();
    }  
    const faceLandmarkerResult = faceLandmarker.detect(video);
    exampleFunction(faceLandmarkerResult.faceLandmarks, canvas);
  };
  


  // -------------------------- YOUR INFERENCE CODE -------------------------------------
 
  const exampleFunction= (landmarks, canvas) => { 
    try {
      // Draw landmarks on the canvas for 2 keypoints
      const landmarkPoint10 = landmarks[0][10];     
      const landmarkPoint152 = landmarks[0][152];         
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(landmarkPoint10.x * canvas.width, landmarkPoint10.y * canvas.height, 5, 0, Math.PI * 2);
      ctx.arc(landmarkPoint152.x * canvas.width, landmarkPoint152.y * canvas.height, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
    catch (error) {
      console.error('Error drawing on Canvas:', error);
    }
  };
  


  useEffect(() => {
    const interval = setInterval(handleFrame, 30);
    return () => clearInterval(interval);
  });


  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ position: 'absolute'}} />          
      <canvas ref={canvasRef} style={{ position: 'absolute' }} />
    </div>
  );

};

export default Example;