import * as faceapi from 'face-api.js';
import $ from 'jquery';
var nets = {
    ssdMobilenetv1: new faceapi.SsdMobilenetv1(), // ssdMobilenetv1 目标检测
    tinyFaceDetector: new faceapi.TinyFaceDetector(),  // 人脸识别（精简版）
    tinyYolov2: new faceapi.TinyYolov2(),   // Yolov2 目标检测（精简版）
    mtcnn: new faceapi.Mtcnn(),   // MTCNN
    faceLandmark68Net: new faceapi.FaceLandmark68Net(),  // 面部 68 点特征识别
    faceLandmark68TinyNet: new faceapi.FaceLandmark68TinyNet(), // 面部 68 点特征识别（精简版）
    faceRecognitionNet: new faceapi.FaceRecognitionNet(),  // 面部识别
    faceExpressionNet: new faceapi.FaceExpressionNet(),  //  表情识别
    ageGenderNet: new faceapi.AgeGenderNet()  // 年龄识别
};

async function updateResults() {
    if (!isFaceDetectionModelLoaded()) {
      return
    }
    const inputImgEl = $('#inputImg').get(0)
    const options = getFaceDetectorOptions()
    const results = await faceapi.detectAllFaces(inputImgEl, options)
      // compute face landmarks to align faces for better accuracy
      .withFaceLandmarks()
      .withAgeAndGender()
    const canvas = $('#overlay').get(0)
    faceapi.matchDimensions(canvas, inputImgEl)
    const resizedResults = faceapi.resizeResults(results, inputImgEl)
    faceapi.draw.drawDetections(canvas, resizedResults)
    resizedResults.forEach(result => {
      const { age, gender, genderProbability } = result
      new faceapi.draw.DrawTextField(
        [
          `${faceapi.utils.round(age, 0)} years`,
          `${gender} (${faceapi.utils.round(genderProbability)})`
        ],
        result.detection.box.bottomLeft
      ).draw(canvas)
    })
  }
async function run() {
    // load face detection and age and gender recognition models
    // and load face landmark model for face alignment
    await changeFaceDetector(SSD_MOBILENETV1);
    await faceapi.loadFaceLandmarkModel('https://assets.dxycdn.com/gitrepo/face-api/models');
    await faceapi.nets.ageGenderNet.load('https://assets.dxycdn.com/gitrepo/face-api/models');
    // start processing image
    updateResults()
}
$(document).ready(function() {
    renderNavBar('#navbar', 'age_and_gender_recognition')
    initImageSelectionControls('happy.jpg', true)
    initFaceDetectionControls()
    run()
  })
