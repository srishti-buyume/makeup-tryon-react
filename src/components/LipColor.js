import React, { useRef, useEffect } from 'react';
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

const { FaceLandmarker, FilesetResolver} = vision;

const LipColor = () => {
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


  useEffect(() => {
    createFaceLandmarker();
  });

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
    try{
      if (!faceLandmarker) {
        await createFaceLandmarker();
      }  
      const faceLandmarkerResult = faceLandmarker.detect(video);
      applyLipColor(faceLandmarkerResult.faceLandmarks, canvas);
      } catch (error) {
        console.error('Error creating face landmarks:', error);
      }
  };


  
  const applyLipColor= (landmarks, canvas) => { 
  try {

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
        landmarks[0][14], landmarks[0][87], landmarks[0][178], landmarks[0][88],landmarks[0][95], landmarks[0][61]
      ];

    // const shineImage = new Image();
    // shineImage.src = 'shine.png';
    
    // Draw landmarks on the canvas for above 2 landmark keypoints
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.alpha= 0.5;

    const baseColor = { r: 201, g: 15, b: 40, a: 0.4 };

    // Darken the color by reducing the alpha channel
    const enhancedColor = { ...baseColor};

    // enhancedColor.r -= 10;
    enhancedColor.g -= 20;
    enhancedColor.b -= 20;

    ctx.fillStyle = `rgba(${enhancedColor.r}, ${enhancedColor.g}, ${enhancedColor.b}, ${enhancedColor.a})`;

    const glossyGradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 4
    );
    glossyGradient.addColorStop(0, `rgba(${enhancedColor.r}, ${enhancedColor.g}, ${enhancedColor.b}, ${enhancedColor.a})`);
    glossyGradient.addColorStop(1, `rgba(${enhancedColor.r}, ${enhancedColor.g}, ${enhancedColor.b}, 0.5)`);

   
    ctx.beginPath();
      
    landmarkLips1.forEach(point => {
          ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2)
    
        });
    
    ctx.fill();
    ctx.strokeStyle = `rgba(${enhancedColor.r - 20}, ${enhancedColor.g - 20}, ${enhancedColor.b - 20}, ${enhancedColor.a})`;
    ctx.shadowColor = `rgba(${enhancedColor.r}, ${enhancedColor.g}, ${enhancedColor.b}, ${enhancedColor.a})`;
    ctx.shadowBlur = 8.0;
    ctx.lineJoin = 'round';

    
    ctx.fillStyle = glossyGradient;
    // ctx.lineWidth = 25;
    ctx.closePath();

    ctx.beginPath();

    ctx.lineWidth= 0.5;
      
    landmarkLips1.forEach(point => {
          ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2)
    
        });
    ctx.stroke();
    
    ctx.closePath();


    ctx.beginPath();

    landmarkLips2.forEach(point => {
          ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2)
    
        });
    ctx.fill();
    ctx.strokeStyle = `rgba(${enhancedColor.r - 20}, ${enhancedColor.g - 20}, ${enhancedColor.b - 20}, ${enhancedColor.a})`;
    ctx.shadowColor = `rgba(${enhancedColor.r}, ${enhancedColor.g}, ${enhancedColor.b}, ${enhancedColor.a})`;
    ctx.shadowBlur = 8.0;
    ctx.lineJoin = 'round';
    
    ctx.fillStyle = glossyGradient;
    // ctx.lineWidth = 25;
    ctx.closePath();

    ctx.beginPath();

    ctx.lineWidth= 0.5;

    landmarkLips2.forEach(point => {
          ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2)
    
        });
    ctx.stroke();

    ctx.closePath();


    canvas.style.filter = "blur(0px) brightness(40%)  saturate(125%) sepia(10%) contrast(120%)"; 
 
  }  // try block
  
  catch (error) {
    console.error('Error in main algorithm:', error);
  }

  };
  

  useEffect(() => {
    const interval = setInterval(handleFrame, 10);
    return () => clearInterval(interval);
  });



  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ position: 'absolute' }} />          
      <canvas ref={canvasRef} style={{ position: 'absolute' }} />
    </div>
  );

};

export default LipColor;