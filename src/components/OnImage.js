import React, { useRef, useEffect } from 'react';
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

const { FaceLandmarker, FilesetResolver} = vision;

const OnImage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  let faceLandmarker;

  useEffect(() => {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
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
        delegate: "GPU",
        minDetectionConfidence: 0.9,
        minTrackingConfidence:1.0
      },
      runningMode: "IMAGE",
      numFaces: 1
    }); 
    } catch (error) {
        console.error('Error loading the model:', error);
    }
  };




  const handleFrame = async () => {
    if (!faceLandmarker) {
      await createFaceLandmarker();
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (image && image.complete && video.videoWidth === image.width && video.videoHeight === image.height) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const faceLandmarkerResult = faceLandmarker.detect(video);
    //   applyLipColor(faceLandmarkerResult.faceLandmarks, canvas);
      applyLipColorToImage(faceLandmarkerResult.faceLandmarks, image);
    }
  };


  const applyLipColorToImage = (landmarks, image) => {
    try {
      // Create a copy of the image data to draw on
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);

      // Your lip color drawing code here...
      // Modify the copied image (canvas) to apply lip color

      
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
  
      ctx.imageSmoothingEnabled = true;
      const baseColor = { r: 90, g: 30, b: 31, a: 0.6 };
      ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${baseColor.a})`;
      ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${baseColor.a})`;
  
      ctx.beginPath();
      ctx.lineWidth= 0.9;
      landmarkLips1.forEach(point => { ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2) }); //upper lip
      landmarkLips2.forEach(point => { ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2) }); //lower lip
      ctx.fill();
      ctx.stroke();  // Lip liner
      ctx.closePath();


      // Replace the image source with the modified canvas
      image.src = canvas.toDataURL();
    // Convert the modified canvas to a data URL
    const dataURL = canvas.toDataURL('image/jpeg', 0.9); // Change the format and quality as needed

    // Create a download link
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'result.jpg';
    a.style.display = 'none';

    // Append the link to the document and trigger a click event to initiate the download
    document.body.appendChild(a);
    a.click();


    } catch (error) {
      console.error('Error applying lip color to image:', error);
    }
  };

  // The rest of your LipColor component remains the same...

  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ position: 'absolute', display: 'none'  }} />
      <canvas ref={canvasRef} style={{ position: 'absolute' }} />
      <a className='a' id='a' href='#'>Click</a>
      <img
        ref={imageRef}
        src="./testImage.jpg" // Provide the image path here
        alt="Test Image"
        style={{ position: 'absolute' }} // Hide the image
      />
    </div>
  );
};

export default OnImage;
