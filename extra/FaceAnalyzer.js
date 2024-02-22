import React, { useRef, useEffect } from 'react';
import vision from "@mediapipe/tasks-vision"; 


const { FaceLandmarker, FilesetResolver} = vision;

const FaceAnalyzer = ({ onFrame }) => {
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

      // Draw a circle or ellipse on the canvas
      context.beginPath();
      // context.arc(canvas.width/2, canvas.height/2, canvas.width/3.5, 0, 2 * Math.PI);
      context.ellipse(canvas.width/2, canvas.height/2, canvas.width/3.5, canvas.height/3, Math.PI/2, 0, Math.PI*2);
      context.strokeStyle = "skyblue";
      context.lineWidth = 3;
      context.stroke();
      context.closePath();

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

    // Get the (x, y) coordinates of keypoints for the face right profile
    const rightProfileKeypoints = [
      landmarks[0][10], landmarks[0][338], landmarks[0][297], landmarks[0][332],
      landmarks[0][284], landmarks[0][251], landmarks[0][389], landmarks[0][356],
      landmarks[0][454], landmarks[0][323], landmarks[0][361], landmarks[0][288],
      landmarks[0][397], landmarks[0][365], landmarks[0][379], landmarks[0][378],
      landmarks[0][400], landmarks[0][377], landmarks[0][152]
    ];
  
    // Get the (x, y) coordinates of keypoints for the face left profile
    const leftProfileKeypoints = [
      landmarks[0][148], landmarks[0][176], landmarks[0][149], landmarks[0][150],
      landmarks[0][136], landmarks[0][172], landmarks[0][58], landmarks[0][132],
      landmarks[0][93], landmarks[0][234], landmarks[0][127], landmarks[0][162],
      landmarks[0][21], landmarks[0][54], landmarks[0][103], landmarks[0][67],
      landmarks[0][109], landmarks[0][109], landmarks[0][109]
    ];
  

    // Get the (x, y) coordinates of upper face keypoints
    const upperFaceKeypoints = [
      landmarks[0][93], landmarks[0][234], landmarks[0][127], landmarks[0][162],
      landmarks[0][21], landmarks[0][54], landmarks[0][103], landmarks[0][67],
      landmarks[0][109], landmarks[0][10], landmarks[0][338], landmarks[0][297],
      landmarks[0][332], landmarks[0][284], landmarks[0][251], landmarks[0][389],
      landmarks[0][356], landmarks[0][454], landmarks[0][323]
    ];

     // Get the (x, y) coordinates of lower face keypoints
    const lowerFaceKeypoints = [
      landmarks[0][93], landmarks[0][132], landmarks[0][58], landmarks[0][172],
      landmarks[0][136], landmarks[0][150], landmarks[0][149], landmarks[0][176],
      landmarks[0][148], landmarks[0][152], landmarks[0][377], landmarks[0][400],
      landmarks[0][378], landmarks[0][379], landmarks[0][365], landmarks[0][397],
      landmarks[0][288], landmarks[0][361], landmarks[0][323]
    ];

    // Get the (x, y) coordinates of all outer boundary keypoints of the face
    const faceOuterKeypoints = [
      landmarks[0][10], landmarks[0][338], landmarks[0][297], landmarks[0][332],
      landmarks[0][284], landmarks[0][251], landmarks[0][389], landmarks[0][356],
      landmarks[0][264], landmarks[0][454], landmarks[0][323], landmarks[0][361],
      landmarks[0][288], landmarks[0][397], landmarks[0][365], landmarks[0][379],
      landmarks[0][378], landmarks[0][400], landmarks[0][377], landmarks[0][152],
      landmarks[0][148], landmarks[0][176], landmarks[0][149], landmarks[0][150],
      landmarks[0][136], landmarks[0][172], landmarks[0][58], landmarks[0][215],
      landmarks[0][132], landmarks[0][93], landmarks[0][234], landmarks[0][127],
      landmarks[0][162], landmarks[0][21], landmarks[0][54], landmarks[0][103],
      landmarks[0][67], landmarks[0][109]
    ];

    // Initialising circle parameters
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const circleRadius = canvas.width / 3.5;

    // Initialising the 6 main facial landmark keypoints
    const landmarkPoint10 = landmarks[0][10];       // forehead-center
    const landmarkPoint152 = landmarks[0][152];     // chin-center
    const landmarkPoint162 = landmarks[0][162];     // top-left
    const landmarkPoint389 = landmarks[0][389];     // top-right
    const landmarkPoint172 = landmarks[0][172];     // bottom-left
    const landmarkPoint397 = landmarks[0][397];     // bottom-right


    
    // Draw landmarks on canvas for the main 6 keypoints 
    // Use it just for reference purpose while development - should not be shown to end user
    const ctx = canvas.getContext('2d');
    ctx.font = "25px Arial";
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(landmarkPoint10.x * canvas.width, landmarkPoint10.y * canvas.height, 5, 0, Math.PI * 2);
    ctx.arc(landmarkPoint152.x * canvas.width, landmarkPoint152.y * canvas.height, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(landmarkPoint162.x * canvas.width, landmarkPoint162.y * canvas.height, 5, 0, Math.PI * 2);
    ctx.arc(landmarkPoint389.x * canvas.width, landmarkPoint389.y * canvas.height, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(landmarkPoint172.x * canvas.width, landmarkPoint172.y * canvas.height, 5, 0, Math.PI * 2);
    ctx.arc(landmarkPoint397.x * canvas.width, landmarkPoint397.y * canvas.height, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();



    // Checking if the face is right distance from the camera

    // Distance is measured in terms of how much area is occupied by the face with respect to the area of the circle, 
    // so if the area of the circle changes wrt to application's window size for different mobile/web views, 
    // it also need changing the thresholding value of the face-area to circle-area ratio 
    const faceArea = calculateContourArea(faceOuterKeypoints, canvas);
    const circleArea =  circleRadius * circleRadius * Math.PI
    const areaRatio = faceArea / circleArea;
    if (areaRatio < 0.30) {
      ctx.fillStyle = 'red';
      ctx.fillText('Too far', canvas.width*0.02, canvas.height/1.13)
    } 
    else if (areaRatio >= 0.65){
      ctx.fillStyle = 'red';
      ctx.fillText('Too close', canvas.width*0.02, canvas.height/1.13)
    }
    else {
      ctx.fillStyle = 'green';
      ctx.fillText('Distance good', canvas.width*0.02, canvas.height/1.13)
    }



    // Checking if the face is inside the circle or not

    // This is done by checking if the above mentioned 6 key landmark points are inside the circle or outside
    // Calculations are for a circle for simplicity but to user an Ellipse is shown for better UI/UX experience
    // Might need changes depending on the app windows' size and the circle/ellipse used
    const distanceToLandmark10 = Math.sqrt(
    (centerX - landmarkPoint10.x * canvas.width) ** 2 +
    (centerY - landmarkPoint10.y * canvas.height) ** 2
    );

    const distanceToLandmark152 = Math.sqrt(
    (centerX - landmarkPoint152.x * canvas.width) ** 2 +
    (centerY - landmarkPoint152.y * canvas.height) ** 2
    );

    const distanceToLandmark162 = Math.sqrt(
    (centerX - landmarkPoint162.x * canvas.width) ** 2 +
    (centerY - landmarkPoint162.y * canvas.height) ** 2
    );

    const distanceToLandmark389 = Math.sqrt(
    (centerX - landmarkPoint389.x * canvas.width) ** 2 +
    (centerY - landmarkPoint389.y * canvas.height) ** 2
    );

    const distanceToLandmark172 = Math.sqrt(
    (centerX - landmarkPoint172.x * canvas.width) ** 2 +
    (centerY - landmarkPoint172.y * canvas.height) ** 2
    );

    const distanceToLandmark397 = Math.sqrt(
    (centerX - landmarkPoint397.x * canvas.width) ** 2 +
    (centerY - landmarkPoint397.y * canvas.height) ** 2
    );

    if ( distanceToLandmark10 >= circleRadius || distanceToLandmark152 >= circleRadius || distanceToLandmark162 >= circleRadius || distanceToLandmark389 >= circleRadius || distanceToLandmark172 >= circleRadius || distanceToLandmark397 >= circleRadius) {
    ctx.fillStyle = 'red';
    ctx.fillText('Keep face inside the circle', canvas.width*0.02, canvas.height/1.01)
    }
    else {
    ctx.fillStyle = 'green';
    ctx.fillText('Face inside the circle', canvas.width*0.02, canvas.height/1.01)
    }



    // Checking if the face is straight or not

    // This is done by comparing the ratio of the left half profile of the face with right half profile and upper half face to lower half face
    // No need to change anything in this code, the calculations does not depend on the app windows' size 
    const rightProfileArea = calculateContourArea(rightProfileKeypoints, canvas);
    const leftProfileArea = calculateContourArea(leftProfileKeypoints, canvas);
    const upperFaceArea = calculateContourArea(upperFaceKeypoints, canvas);
    const lowerFaceArea = calculateContourArea(lowerFaceKeypoints, canvas);
    const vratio = leftProfileArea / rightProfileArea; 
    const hratio = upperFaceArea / lowerFaceArea; 
    if (vratio <= 1.5 && vratio >= 0.5 &&  hratio<=1.8 && hratio>=1) { 
        ctx.fillStyle = 'green';
        ctx.fillText('Looking Straight', canvas.width*0.02, canvas.height/1.07)
    } else {
        ctx.fillStyle = 'red';
        ctx.fillText('Not Looking Straight', canvas.width*0.02, canvas.height/1.07)
    }

  }  // try block
  
  catch (error) {
    console.error('Error in main algorithm:', error);
  }

  };
  


  // Function that calculates area given facial landmark keypoints coordinates
  const calculateContourArea = (contour, canvas) => {
    let area = 0;
    for (let i = 0; i < contour.length; i++) {
      const point1 = contour[i];
      const point2 = contour[(i + 1) % contour.length];
      area += (point2.x * canvas.width - point1.x * canvas.width) * (point2.y * canvas.height + point1.y * canvas.height);
    }
    return Math.abs(area) / 2;
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

export default FaceAnalyzer;