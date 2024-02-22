import React, { useRef, useEffect } from 'react';
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";


const { FaceLandmarker, FilesetResolver} = vision;

const FaceBlush = () => {
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
      else{
        const faceLandmarkerResult = faceLandmarker.detect(video);
        applyBlush(faceLandmarkerResult.faceLandmarks, canvas);
      }
      } catch (error) {
        console.error('Error loading the model:', error);
      }
  };

 
  const applyBlush= (landmarks, canvas) => { 
    try {
      const landmarkCheeksLeft= [
        landmarks[0][119],landmarks[0][116],landmarks[0][123],
        landmarks[0][147],landmarks[0][187],landmarks[0][205],
        landmarks[0][36],landmarks[0][119]
        ];
      const landmarkCheeksRight= [
        landmarks[0][348],landmarks[0][345],landmarks[0][352],
        landmarks[0][376],landmarks[0][411],landmarks[0][425],
        landmarks[0][266],landmarks[0][348]
        ];


        const landmarkLips1= [
          landmarks[0][61],landmarks[0][40],landmarks[0][39],landmarks[0][37],landmarks[0][0],landmarks[0][267],landmarks[0][269],landmarks[0][270],landmarks[0][409],
          landmarks[0][306],landmarks[0][415], landmarks[0][310],landmarks[0][311],landmarks[0][312],landmarks[0][13],landmarks[0][82],landmarks[0][81],landmarks[0][42],
          landmarks[0][183],landmarks[0][61],landmarks[0][61],landmarks[0][61],landmarks[0][61],landmarks[0][61],landmarks[0][61],landmarks[0][61],
          landmarks[0][61],landmarks[0][61], landmarks[0][61]
        ];
        const landmarkLips2= [
            landmarks[0][61], landmarks[0][146],landmarks[0][91], landmarks[0][181],
            landmarks[0][84], landmarks[0][17], landmarks[0][314],landmarks[0][405], landmarks[0][321], landmarks[0][375], landmarks[0][306], 
            landmarks[0][409], landmarks[0][324], landmarks[0][318], landmarks[0][402],landmarks[0][317], 
            landmarks[0][14], landmarks[0][87], landmarks[0][178], landmarks[0][88],landmarks[0][95], landmarks[0][61]
          ];
    
        

      // Draw landmarks on the canvas for landmark keypoints
      const ctx = canvas.getContext('2d');
      ctx.globalAlpha = 0.55;
      ctx.filter = 'blur(6px)';
      ctx.strokeStyle = 'rgba(201, 15, 40, 0.3)'; // Adjust as needed
      ctx.shadowBlur = 0; // Adjust as needed

      ctx.beginPath();

      // Gradient filter for Left Cheek
      const gradientLeftCheek = ctx.createRadialGradient(
        landmarks[0][50].x * canvas.width,     // inner x
        landmarks[0][50].y * canvas.height,    // ineer y
        0,                                     // inner radius
        landmarks[0][50].x * canvas.width,     // outer x
        landmarks[0][50].y * canvas.height,    // outer y
        50                                     // outer radius
      );

      gradientLeftCheek.addColorStop(0, 'rgba(237, 91, 24, 0.7)');
      gradientLeftCheek.addColorStop(1, 'rgba(201, 15, 40, 0)');
      ctx.fillStyle = gradientLeftCheek;
      // ctx.beginPath();

      landmarkCheeksLeft.forEach(point => {
            ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2)
          });
      ctx.fill();

      const gradientRightCheek = ctx.createRadialGradient(
        landmarks[0][280].x * canvas.width,     // inner x
        landmarks[0][280].y * canvas.height,    // ineer y
        0,                                     // inner radius
        landmarks[0][280].x * canvas.width,     // outer x
        landmarks[0][280].y * canvas.height,    // outer y
        50                                     // outer radius
      );
      
      gradientRightCheek.addColorStop(0, 'rgba(237, 91, 24, 0.7)');
      gradientRightCheek.addColorStop(1, 'rgba(201, 15, 40, 0)');

      ctx.fillStyle = gradientRightCheek;
      landmarkCheeksRight.forEach(point => {
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2)
      });

      ctx.fill();
      ctx.closePath();



  
      const baseColor = { r: 90, g: 30, b: 31, a: 0.6 };
      ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${baseColor.a})`;
      ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${baseColor.a})`;
      ctx.filter = 'blur(0px)';
      ctx.beginPath();
      ctx.lineWidth= 0.9;
      landmarkLips1.forEach(point => { ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2) }); //upper lip
      landmarkLips2.forEach(point => { ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2) }); //lower lip
      ctx.fill();
      ctx.stroke();  // Lip liner
      ctx.closePath();
  
      canvas.style.filter = "blur(0px) brightness(100%)  saturate(125%) sepia(1%) contrast(120%)"; 


    
      } catch (error) {
        console.error('Error drawing on canvas:', error);
      }

  };

  useEffect(() => {
    const interval = setInterval(handleFrame, 30); //adjust refresh time
    return () => clearInterval(interval);
  });


  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ position: 'absolute' }} />          
      <canvas ref={canvasRef} style={{ position: 'absolute' }} />
    </div>
  );

};

export default FaceBlush;