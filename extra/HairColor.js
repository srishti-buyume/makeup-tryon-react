import React, { useRef, useEffect } from 'react';
import vision from "@mediapipe/tasks-vision"; 


const { FaceLandmarker, FilesetResolver} = vision;
// const { ImageSegmenter, SegmentationMask, FilesetResolver } = vision;

const HairColor = ({ onFrame }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  let faceLandmarker;
  let lastVideoTime = -1;

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



  // Loading mediapipe's facial landmark module using @mediapipe/tasks-vision npm package
  const createFaceLandmarker = async () => {
    try{
    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: "GPU"
      },
      // outputFaceBlendshapes: true,
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
        //Face alignment algorithm module
        checkFaceAlignment(faceLandmarkerResult.faceLandmarks, canvas);
      }

      const frame = canvas.toDataURL('image/jpeg');
      onFrame(frame);
    }
    }  // try block 
    catch (error) {
      console.error('Error creating face landmarks:', error);
    }
  };


  // -------------------------- THE ALGORITHM -------------------------------------
  // Function that checks if all the conditions are met for the photo to be clicked
  const checkFaceAlignment = (landmarks, canvas) => {

    try {

  }  // try block
  
  catch (error) {
    console.error('Error in main algorithm:', error);
  }

  };
  




  useEffect(() => {
    const interval = setInterval(handleFrame, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ position: 'absolute' }} />
      <canvas ref={canvasRef} style={{ position: 'absolute' }} />
    </div>
  );

};

export default HairColor;