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
    minConfidence: 1,
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
let showPopup = 'true'
let step = "starting_pose";
let reward_good_pose = 'true';
let frequentTime = 0.25; //voor nu staat hij op 0.25 om te testen maar in productie zou hij bijvoorbeeld 15 staan voor elke kwartier een notification
let goodPoseTime = 1; //voor nu staat hij op 1 om te testen maar in productie zou hij bijvoorbeeld elke uur kunnen aangeven of je fout heb gezeten
let used = false;

function setup() {
    //create camera window and webcam usage.
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    // video.size(width, height);
    poseNet = ml5.poseNet(video, options, check);
    
    poseNet.on('pose', showPoses)
    
    video.hide();

    //functies hier uitvoeren zorgt misschien voor beetje lag? weet niet zeker even testen 
    //misschien probleem omdat hij hier ook de webcam opzet en functies hier uitvoeren kan voor vertraging zorgen of ligt aan me eigen laptop (lol)
    randomNotifications();
    checkGoodPose();
}

function check() {
    console.log('check');
}

function showPoses(poses) {
    //show pose x and y variables.
    // console.log(poses);
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
    //leancheck is set to 1 to notify the rest there is a notification showing so it will not spam notifications and crash the application
    leanCheck = 1;
    if (muteCheck == 'muted' && showPopup == 'true'){
        Push.create("Watch your pose", {
            body: "You are leaning forward too much",
            icon: 'img/icon.png',
            onClick: function () {
                //puts leancheck back to 0 to signal the notification is clicked and is ready for a new one when needed  
                leanCheck = 0;
                this.close();
            }
        });
        resetLeanCheck(); //gemaakt zodat gebruiker niet perse hoef te klikken om te 'resetten' maar dat het na x seconden gebeurt, zodat we advies blijven geven en geen applicatie worden die forced.
    } 
    else if (muteCheck == 'unmuted' && showPopup == 'true'){
        playSound('bing');
        Push.create("Watch your pose", {
            body: "You are leaning forward too much",
            icon: 'img/icon.png',
            onClick: function () {
                //puts leancheck back to 0 to signal the notification is clicked and is ready for a new one when needed  
                leanCheck = 0;
                this.close();
            }
        });
        resetLeanCheck();
    }
    else if (muteCheck == 'muted' && showPopup == 'false') //kijken wat we hiermee gaan doen maybe wel voor data registreren want geen geluid en popup is eigenlijk niks
    {
        console.log("sound is muted and showPopup is false so nothing shows but it went of in the background!");
        resetLeanCheck();
    }
    else if (muteCheck == 'unmuted' && showPopup == 'false')
    {
        playSound('bing');
        resetLeanCheck();
    }
}

//random berichten die we pushen dit zijn test teksten en test timers we moeten nog kijken naar de frequentie van de notificaties
function randomNotifications() {
    setTimeout(
        function() {
            Push.create("Good job!", {
                body: "Have a sticker, keep it up 1",
                icon: 'img/sticker.png',
                onClick: function () {
                    this.close();
                }
            });
        }, frequentTime * 60 * 1000); 

        setTimeout(
            function() {
                Push.create("Good job!", {
                    body: "Do not forget to do some stretches click here for a small routine",
                    icon: 'img/stretch.png',
                    onClick: function () {
                        testHyperlink();
                        this.close();
                    }
                });
            }, (frequentTime * 2) * 60 * 1000);

        setTimeout(
            function() {
                Push.create('Time for a break!', {
                    body: "Click on this notification to take a break. x minutes have passed.",
                    onClick: function () {
                        window.location.href = "./timer/timer_index.html"
                        this.close();
                    }
                });
            }, ((frequentTime * 3) * 60 * 1000)
        );
}

function testHyperlink() {
    window.open("https://www.youtube.com/watch?v=6lJBZCRlFnI");
  }

function resetLeanCheck() {
    setTimeout(
    function() {
        leanCheck = 0;
    }, 10000);
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

//function to mute/unmute sound can remove if we want people to just mute via System
function popupSwitch() {
    var x = document.getElementById("myPopup");
    if (x.innerHTML === "true") {
      x.innerHTML = "false";
      showPopup = "false";
    } else {
      x.innerHTML = "true";
      showPopup = "true";
    }
  }

function tutorialSwitch() {
    var image = document.getElementById('myImage');
    var x = document.getElementById("tutorialText");
    if (image.src.match("correct_pose_test")) {
        image.src = "img/worst_pose_test.png";
        x.innerHTML = "Take a seat and take the pose you find yourself in when you are focused on work and just dive into your laptop. This will be called the worst pose. (kunnen de slechtste pose aannemen en dan met stappen/levels notifications maken naar de slechtste pose toe ipv alleen maar beste en slechtste pose)";
    }
    else {
        image.src = "img/correct_pose_test.png";
        x.innerHTML ="Take a seat and take a comfortable working pose when you have the correct pose click this is my best pose (hier kan nog een stap bij stap hoe een algemene goede pose eruit ziet en hoe je die aanneemt. Soort van 'algemene' handelingen die je kan doen zodat je met goede pose eindigt over het algemeen)";
    }
}

//shows or hides menu so the screen will not get full with buttons
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

//test code geschreven hoef NIET gebruikt te worden misschien in toekomst
//dit checkt elke x seconden of er verandering is (in dit geval op variable d) 
//dit kan in toekomst gebruikt worden als het nodig is eventueel voor nu geen behoefte 
function checkChange(){
    var someValue = d;
    var prevVal = null;             
    var _myInterval = setInterval(function() {
        if(prevVal == someValue) {
            console.log("No change for 2 second", someValue)
            someValue = d;
            //hier kan je iets uitvoeren als er 2 seconden niks veranderd is misschien reminder of timer 
            //kunnen misschien in plaats van == het van elkaar aftrekken en met marges spelen want camera kan shaken door licht inval
        } else {
            console.log("Value was changed between past 2 second prev: ", prevVal, " New: ", someValue)
            prevVal = someValue;
            someValue = d;
            //als values niet gelijk meer zijn dan veranderd de opgeslagen value in de nieuwe value maar 
            //hij kijkt of values PRECIES hetzelfde zijn dus beter spelen met marges
        }
    }, 2000)
}

function checkGoodPose(){
    setTimeout(
        function() {
            rewardGoodPose();
        }, goodPoseTime * 60 * 1000); 
}

function rewardGoodPose(){
    if (reward_good_pose == 'true')
    {
        console.log("we detected no bad poses for x minutes check")
        Push.create("Keep it up", {
            body: "You had no bad poses for x minutes!",
            icon: 'img/sticker.png',
            onClick: function () {
                this.close();
            }
        });
        checkGoodPose();
    }
    else {
        //moet nog iets komen als er bad pose is
        console.log("we detected a bad pose in the x minutes check")
        reward_good_pose = 'true';
        clearInterval(checkGoodPose);
        checkGoodPose();
    }
}

function myFrequentTime() {
    var x = document.getElementById("myFrequentTime");
    frequentTime = x.value;
    clearInterval(randomNotifications); //reset timer voor randomNotifications zodat de functie nog een keer word uitgevoerd maar dan met de nieuwe 'timer'
    randomNotifications();
}

function myGoodPoseTime() {
    var x = document.getElementById("myGoodPoseTime");
    goodPoseTime = x.value;
    clearInterval(checkGoodPose); //reset timer voor randomNotifications zodat de functie nog een keer word uitgevoerd maar dan met de nieuwe 'timer'
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

        // // console.log(d);
        // // console.log(leanCheck);
        // // console.log(muteCheck);
        // // console.log("reward good pose " + reward_good_pose);
        // // console.log(frequentTime);
        // // console.log(goodPoseTime);

        //if leaning forward && no notification is showing then show notification 
        //otherwise the notification will loop and crash the browser/application
            if (d > startingD + (badD - startingD) && leanCheck == 0){
                showNotificaton();
                console.log("bad D");
                reward_good_pose = 'false';
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

function personNotFound() {
    if (used == false) {
        console.log("Nobody is behind the camera.");
        let timeout = setTimeout(function() { window.location.href ="./timer/timer_index.html" }, 10000);

        Push.create('Are you still here?', {
            body: "Click on this notification if you are here.",
            onClick: function () {
                clearTimeout(timeout);
                console.log("Person back.");
                used = false;
                this.close();
            }
        });
        used = true;
    }    
}

function detectOutOfCanvas(){
    const nose = pose.nose;
    const leftShoulder = pose.leftShoulder;
    const rightShoulder = pose.rightShoulder;
    // console.log("x"+nose.x);
    // console.log("y"+nose.y);
    if (nose && nose.x && nose.y){
        if (nose.x < 0 || nose.x >= 640){
            personNotFound();
            
            // console.log("nose x position is out of the image");
        }
    }
    // if (nose && nose.x && nose.y){
    //     if (nose.y < 0 || nose.y >= 480){
    //         console.log("nose y position is out of the image");
    //     }
    // }
    // if (leftShoulder && leftShoulder.x && leftShoulder.y){
    //     if (leftShoulder.y < 0 || leftShoulder.y >= 480){
    //         console.log("leftShoulder y position is out of the image");
    //     }
    // }
    // if (leftShoulder && leftShoulder.x && leftShoulder.y){
    //     if (leftShoulder.x < 0 || leftShoulder.x >= 640){
    //         console.log("leftShoulder x position is out of the image");
    //     }
    // }
    // if (rightShoulder && rightShoulder.x && rightShoulder.y){
    //     if (rightShoulder.x < 0 || rightShoulder.x >= 640){
    //         console.log("rightShoulder x position is out of the image");
    //     }
    // }
    // if (rightShoulder && rightShoulder.x && rightShoulder.y){
    //     if (rightShoulder.y < 0 || rightShoulder.y >= 480){
    //         console.log("rightShoulder y position is out of the image");
    //     }
    // }
}