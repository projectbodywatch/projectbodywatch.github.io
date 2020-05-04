window.onload = () => {
    'use strict';
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js');
    }
}

let video;
let poseNet;
//let poses = [];
let pose;
let options = {
    architecture: 'MobileNetV1',
    imageScaleFactor: 0.3,
    outputStride: 16,
    flipHorizontal: false,
    minConfidence: 0.5,
    maxPoseDetections: 1,
    scoreThreshold: 0.5,
    nmsRadius: 20,
    detectionType: 'single',
    multiplier: 0.5,
    quantBytes: 2,
    inputResolution: 161,
}
let skeleton;
let shoulderL;
let shoulderR;
let eyeL;
let eyeR;
let d;
let startingD;
let badD;
let leanCheck = 0;
let muteCheck = 'unmuted'
let step = "starting_pose";

function setup() {
    //create camera window and webcam usage.
    createCanvas(800, 600);
    video = createCapture(VIDEO);
    // video.size(width, height);
    poseNet = ml5.poseNet(video, options, check);
    
    poseNet.on('pose', showPoses)
    
    video.hide();
}

function check() {
    console.log('check');
}

function showPoses(poses) {
    //show pose x and y variables.
    console.log(poses);
    if (poses.length > 0) {
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
        detectOutOfCanvas();
    }
}

function displayStartPose() {
    startingD = d;
    console.log("starting D = " + startingD);
    document.getElementById("start").innerHTML = startingD;
}

function displayBadPose() {
    badD = d;
    console.log("bad D = " + badD);
    document.getElementById("bad").innerHTML = badD;
}

function modelReady() {
    //check if model is loaded in.
    console.log('Loaded');
}

//function to show notification split into mute/unmuted can remove one if we choose to let users mute via System
function showNotificaton() {
    //leancheck is set to 1 to notify the rest there is a notification showing
    leanCheck = 1;
    if (muteCheck == 'muted'){
        Push.create("Watch your pose", {
            body: "You are leaning forward too much",
            icon: 'icon.png',
            onClick: function () {
                //puts leancheck back to 0 to signal the notification is clicked and is ready for a new one when needed  
                leanCheck = 0;
                this.close();
            }
        });
    } 
    else{
        playSound('bing');
        Push.create("Watch your pose", {
            body: "You are leaning forward too much",
            icon: 'icon.png',
            onClick: function () {
                //puts leancheck back to 0 to signal the notification is clicked and is ready for a new one when needed  
                leanCheck = 0;
                this.close();
            }
        });
    }
}

//function to mute/unmute sound can remove if we want people to just mute via System
function muteSwitch() {
    var x = document.getElementById("myMute");
    if (x.innerHTML === "unmuted") {
      x.innerHTML = "muted";
      muteCheck = "muted";
    } else {
      x.innerHTML = "unmuted";
      muteCheck = "unmuted";
    }
  }

function tutorialSwitch() {
    var image = document.getElementById('myImage');
    var x = document.getElementById("tutorialText");
    if (image.src.match("correct_pose_test")) {
        image.src = "worst_pose_test.png";
        x.innerHTML = "Take a seat and take the pose you find yourself in when you are focused on work and just dive into your laptop. This will be called the worst pose. (kunnen de slechtste pose aannemen en dan met stappen/levels notifications maken naar de slechtste pose toe ipv alleen maar beste en slechtste pose)";
    }
    else {
        image.src = "correct_pose_test.png";
        x.innerHTML ="Take a seat and take a comfortable working pose when you have the correct pose click this is my best pose (hier kan nog een stap bij stap hoe een algemene goede pose eruit ziet en hoe je die aanneemt. Soort van 'algemene' handelingen die je kan doen zodat je met goede pose eindigt over het algemeen)";
    }
}

//shows/hides menu so the screen will not get full with buttons
function showMenu() {
    var x = document.getElementById("myMenu");
    if (x.style.display === "none") {
        x.style.display = "block";
    }
    else {
        x.style.display = "none";
    }
}

function showTutorial() {
    var x = document.getElementById("myTutorial");
    if (x.style.display === "none") {
        x.style.display = "block";
    }
    else {
        x.style.display = "none";
    }
}

//plays a sound when called
function playSound(filename){
    var mp3Source = '<source src="' + filename + '.mp3" type="audio/mpeg">';
    var oggSource = '<source src="' + filename + '.ogg" type="audio/ogg">';
    var embedSource = '<embed hidden="true" autostart="true" loop="false" src="' + filename +'.mp3">';
    document.getElementById("sound").innerHTML='<audio autoplay="autoplay">' + mp3Source + oggSource + embedSource + '</audio>';
}

function draw() {
    //draw both keypoints and the skeleton for testing purposes.
    drawKeyPoints();
    ////drawSkeleton();
}

function drawKeyPoints() {
    image(video, 0, 0);
        
    try {
        //make keypoints for the point between the shoulders
        ////let midX = shoulderL.position.x + (shoulderR.position.x - shoulderL.position.x) * 0.50;
        ////let midY = shoulderL.position.y + (shoulderR.position.y - shoulderL.position.y) * 0.50;
        
        //trying to check distance eyes
        let eyeR = pose.rightEye;
        let eyeL = pose.leftEye;
        d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
        
        //fill with color red and create ellipse to show the keypoints
        fill(255,0,0);
        ////ellipse(midX, midY, 34);

        //use d to check distance instead of fixed variable
        ellipse(pose.nose.x, pose.nose.y, d);
        ////ellipse(pose.leftShoulder.x, pose.leftShoulder.y, 30);
        /////ellipse(pose.rightShoulder.x, pose.rightShoulder.y, 30);

        console.log(d);
        console.log(leanCheck);
        console.log(muteCheck);

        //if leaning forward && no notification is showing then show notification 
        //otherwise the notification will loop and crash the browser/application
            if (d > startingD + (badD - startingD) && leanCheck == 0){
                showNotificaton();
                console.log("bad D");
        } 
    }
    catch (err) {
       //console.log("No pose found!");
    }
}

//function drawSkeleton() {
//    try {
//        //first 2 points in this array are the shoulders. 
//        let a = skeleton[0][0];
//        let b = skeleton[0][1];
//        
//        //put in global variable for drawKeyPoints
//        shoulderL = a;
//        shoulderR = b;
//        
//        //create middle keypoint for check later on
//        let midX = shoulderL.position.x + (shoulderR.position.x - shoulderL.position.x) * 0.50;
//        let midY = shoulderL.position.y + (shoulderR.position.y - shoulderL.position.y) * 0.50;
//        
//        strokeWeight(3);
//        stroke(255);
//        
//        //draw lines
//        line(a.position.x, a.position.y, b.position.x, b.position.y);  
//        line(pose.nose.x, pose.nose.y, midX, midY);
//    }
//    catch(err) {
//      //console.log("No pose found!");
//    }   
//}

function detectOutOfCanvas(){
    const nose = pose.nose;
    const leftShoulder = pose.leftShoulder;
    const rightShoulder = pose.rightShoulder;
    console.log("x"+nose.x);
    console.log("y"+nose.y);
    if (nose && nose.x && nose.y){
        if (nose.x < 0 || nose.x > 800){
            console.log("nose x position is out of the image");
        }
    }
    if (nose && nose.x && nose.y){
        if (nose.y < 0 || nose.y > 600){
            console.log("nose y position is out of the image");
        }
    }
    if (leftShoulder && leftShoulder.x && leftShoulder.y){
        if (leftShoulder.y < 0 || leftShoulder.y > 600){
            console.log("leftShoulder y position is out of the image");
        }
    }
    if (leftShoulder && leftShoulder.x && leftShoulder.y){
        if (leftShoulder.x < 0 || leftShoulder.x > 800){
            console.log("leftShoulder x position is out of the image");
        }
    }
    if (rightShoulder && rightShoulder.x && rightShoulder.y){
        if (rightShoulder.x < 0 || rightShoulder.x > 800){
            console.log("rightShoulder x position is out of the image");
        }
    }
    if (rightShoulder && rightShoulder.x && rightShoulder.y){
        if (rightShoulder.y < 0 || rightShoulder.y > 600){
            console.log("rightShoulder y position is out of the image");
        }
    }
}