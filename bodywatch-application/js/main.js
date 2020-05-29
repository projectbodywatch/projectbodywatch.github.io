let video;
let poseNet;
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
let frequentTime = 15; 
let goodPoseTime = 30;
let tipsTime = 10;
let badpose_per_session = [];
let badposeCounter_per_session = 0;
let pausesTaken = 0;
let goodPoseCounter_per_session = 0;
let startTimeVar;
let endTimeVar;
let spendTimeVar;
let used = false;
let diffHrs; 
let diffMins;
var lS_badPosesCounter; 
var lS_goodPosesCounter; 
var lS_pauseTakenCounter;
var lS_diffHrs;
var lS_diffMins;
let startimeChecker = 0;

function setup() {
    //create camera window and webcam usage.
    var canvas = createCanvas(640, 480);
    //connects to the div canvasPosition. 
    canvas.parent('canvasPosition'); 
    //relocate canvas
    canvas.position(0,0);

    video = createCapture(VIDEO);
    poseNet = ml5.poseNet(video, options, check);
    
    poseNet.on('pose', showPoses)
    video.hide();

    randomNotifications();
    checkGoodPose();
    randomTips(); 
    loadStatistics();
}

//simple check to ensure the program will run. Needed a simple function to use proper options for PoseNet. 
function check() {
    console.log('check');
    startTime(); 
}

//if a pose gets detected, create an array with the keypoints and make it visible. this way we can check if a person is out of the screen or still visible.
function showPoses(poses) {
    if (poses.length > 0) {
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
        detectOutOfCanvas();
    }
}

//creates a good starting pose which the program uses to check pose. 
function displayStartPose() {
    startingD = d;
    document.getElementById("start").innerHTML = startingD;
}

//creates a bad pose which the programs uses to check pose. 
function displayBadPose() {
    badD = d;
    document.getElementById("bad").innerHTML = badD;
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
                changeColorToGood();
                this.close();
            }
        });
        resetLeanCheck();
    } 
    else if (muteCheck == 'unmuted' && showPopup == 'true'){
        playSound('bing');
        Push.create("Watch your pose", {
            body: "You are leaning forward too much",
            icon: 'img/icon.png',
            onClick: function () {
                //puts leancheck back to 0 to signal the notification is clicked and is ready for a new one when needed  
                leanCheck = 0;
                changeColorToGood();
                this.close();
            }
        });
        resetLeanCheck();
    }
    else if (muteCheck == 'muted' && showPopup == 'false')
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

//random push messages like breaks and motivation.
function randomNotifications() {
    setTimeout(
        function() {
            Push.create("Good job!", {
                body: "Do not forget to do some stretches click here for a small routine",
                icon: 'img/stretch.png',
                onClick: function () {
                    openHyperlink();
                    this.close();
                }
            });
        }, frequentTime * 60 * 1000); 

    setTimeout(
        function() {
            Push.create('Time for a break!', {
                body: "Click on this notification to take a break. " + (frequentTime * 2) + " minutes have passed.",
                icon: 'img/breaktime.png',
                onClick: function () {
                    window.location.href = "./timer/timer_index.html"
                    takePause();
                    this.close();
                }
            });
        }, ((frequentTime * 2) * 60 * 1000)
    );

    setTimeout(
        function() {
            Push.create("Good job!", {
                body: "Do not forget to do some stretches click here for a small routine",
                icon: 'img/stretch.png',
                onClick: function () {
                    window.open("https://www.youtube.com/watch?v=BdfTuxdfIE8");
                    this.close();
                }
            });
        }, (frequentTime * 3) * 60 * 1000); 

    setTimeout(
        function() {
            Push.create('Time for a break!', {
                body: "Click on this notification to take a break. " + (frequentTime * 4) + " minutes have passed.",
                icon: 'img/breaktime.png',
                onClick: function () {
                    window.location.href = "./timer/timer_index.html"
                    takePause();
                    this.close();
                }
            });
        }, ((frequentTime * 4) * 60 * 1000)
    );

    setTimeout(
        function() {
            Push.create("Good job!", {
                body: "Do not forget to do some stretches click here for a small routine",
                icon: 'img/stretch.png',
                onClick: function () {
                    window.open("https://www.youtube.com/watch?v=R86jwm1HIvk");
                    this.close();
                }
            });
        }, (frequentTime * 5) * 60 * 1000); 

    setTimeout(
        function() {
            Push.create('Time for a break!', {
                body: "Click on this notification to take a break. " + (frequentTime * 6) + " minutes have passed.",
                icon: 'img/breaktime.png',
                onClick: function () {
                    window.location.href = "./timer/timer_index.html"
                    takePause();
                    this.close();
                }                   
            });
        }, ((frequentTime * 6) * 60 * 1000),
    );

    setTimeout(
        function() {
            Push.create("Good job!", {
                body: "Do not forget to do some stretches click here for a small routine",
                icon: 'img/stretch.png',
                onClick: function () {
                    window.open("https://www.youtube.com/watch?v=6fnLKyRJsrs");
                    this.close();
                }
            });
        }, (frequentTime * 7) * 60 * 1000); 

        setTimeout(
            function() {
                Push.create('Time for a break!', {
                    body: "Click on this notification to take a break. " + (frequentTime * 8) + " minutes have passed.",
                    icon: 'img/breaktime.png',
                    onClick: function () {
                        window.location.href = "./timer/timer_index.html"
                        takePause();
                        this.close();
                    }                   
                });
            }, ((frequentTime * 8) * 60 * 1000),
        );
}

//opens new tab with a youtube video to show stretch practices.
function openHyperlink() {
    window.open("https://www.youtube.com/watch?v=6lJBZCRlFnI");
}

//function to reset leancheck, which you could click on to reset. this way it's automated.
function resetLeanCheck() {
    setTimeout(
    function() {
        leanCheck = 0;
        changeColorToGood();
    }, 15000);
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

//functie om alle 'field' bij settings op te slaan zodat ze voor volgende gebruik kunnen worden gebruikt.
function testing_save() { 
    ////sound 
    var sound = document.getElementById("myMute").innerHTML;
    ////notification
    var notification = document.getElementById("myPopup").innerHTML;
    ///frequentietimer
    var frequenttimer = document.getElementById("myFrequentTime").value;
    ///goodposecheck
    var goodposetimer = document.getElementById("myGoodPoseTime").value;
    /// startPose
    var startpositie = document.getElementById("start").innerHTML;
    /// badPose
    var badpositie = document.getElementById("bad").innerHTML;

    //Set
    localStorage.setItem("sound", sound);
    localStorage.setItem("notification", notification);
    localStorage.setItem("frequenttimer", frequenttimer);
    localStorage.setItem("goodposetimer", goodposetimer);
    localStorage.setItem("startpositie", startpositie);
    localStorage.setItem("badpositie", badpositie);
} 

//functie om alle bewaarde values te loaden
function testing_load(){
     //Retrieve
    document.getElementById("myMute").innerHTML = localStorage.getItem("sound");
    document.getElementById("myPopup").innerHTML = localStorage.getItem("notification");
    document.getElementById("myFrequentTime").value = localStorage.getItem("frequenttimer");
    document.getElementById("myGoodPoseTime").value = localStorage.getItem("goodposetimer");
    document.getElementById("start").innerHTML = localStorage.getItem("startpositie");
    document.getElementById("bad").innerHTML = localStorage.getItem("badpositie");

    muteCheck = localStorage.getItem("sound");
    showPopup = localStorage.getItem("notification");
    badD = Number(localStorage.getItem("badpositie"));
    startingD = Number(localStorage.getItem("startpositie"))
    frequentTime = localStorage.getItem("frequenttimer");        
    goodPoseTime = localStorage.getItem("goodposetimer");
}

//function to save time and put in an array. shows on the top right div. only used when a bad pose is detected.
function recordBadPose() {
    var time = new Date();
    var timeconverted = time.toUTCString();
    badpose_per_session.unshift(timeconverted);
}

//prints the array from previously made function in the top right div.
function printBadSession(){
    for (let index = 0; index < badpose_per_session.length; index++) {
        //console.log(badpose_per_session[index]);
    }

    text = "<ul>";
    for (i = 0; i < badpose_per_session.length; i++) {
        text += "<li>" + badpose_per_session[i] + "</li>";
            }
        text += "</ul>";
    document.getElementById("demo2").innerHTML = text;
}

//changes color when pose is bad. goes from green to red. changes text as well.
function changeColorToBad() {
    document.getElementById("gwd-div-uhf8").style.backgroundColor = "red";
    document.getElementById("gwd-span-1rvu").innerHTML = "Your posture is wrong!";
}

//changes color when pose is good. goes from red to green. changes text as well.
function changeColorToGood() {
    document.getElementById("gwd-div-uhf8").style.backgroundColor= 'rgb(' + 63 + ',' + 255 + ',' + 0 + ')';
    document.getElementById("gwd-span-1rvu").innerHTML = "Your posture is correct! Good job :)";
}

function showStatistics() {
    document.getElementById("badPoses").innerHTML = lS_badPosesCounter;
    document.getElementById("goodPoses").innerHTML = lS_goodPosesCounter;
    document.getElementById("amountBreaks").innerHTML = lS_pauseTakenCounter;
    document.getElementById("timeWorked").innerHTML = lS_diffHrs + "h : " + lS_diffMins + "m";    
}

function displayStatistics(){
    loadLocalStats();
    setTimeout(
        function() {
            showStatistics();
        }, 2200); 
}

function takePause(){
    pausesTaken += 1;
    sessionStorage.setItem("pauseTaken", pausesTaken);
    collectStatistics();
}

function collectStatistics()
{
    sessionStorage.setItem("badPoses", badposeCounter_per_session);
    sessionStorage.setItem("goodPoses", goodPoseCounter_per_session);
    sessionStorage.setItem("startTime", startTimeVar);
    sessionStorage.setItem("startimeChecker", startimeChecker);
    console.log("collected statistics")
}

function loadStatistics()
{
    badposeCounter_per_session = Number(sessionStorage.getItem("badPoses"));
    goodPoseCounter_per_session = Number(sessionStorage.getItem("goodPoses"));
    pausesTaken = Number(sessionStorage.getItem("pauseTaken"));
    startTimeVar = Number(sessionStorage.getItem("startTime"));
    startimeChecker = Number(sessionStorage.getItem("startimeChecker"));
    console.log("loaded statistics")
}

function loadEndPage()
{
    endTime();
    calculateSpendTime();
    saveLocalStats();
    location.href = "./endpage/index.html";
}

function saveLocalStats()
{
    localStorage.setItem("lS_badPose", badposeCounter_per_session);
    localStorage.setItem("lS_goodPose", goodPoseCounter_per_session);
    localStorage.setItem("lS_pauseTaken", pausesTaken);
    localStorage.setItem("lS_diffHrs", diffHrs);
    localStorage.setItem("lS_diffMins", diffMins);
}

function loadLocalStats()
{
    lS_badPosesCounter = Number(localStorage.getItem("lS_badPose"));
    lS_goodPosesCounter = Number(localStorage.getItem("lS_goodPose"));
    lS_pauseTakenCounter = Number(localStorage.getItem("lS_pauseTaken"));
    lS_diffHrs = Number(localStorage.getItem("lS_diffHrs"));
    lS_diffMins = Number(localStorage.getItem("lS_diffMins"));
}

function startTime()
{
    if (startimeChecker == 0){
        startTimeVar = Date.now();
        startimeChecker = 1;
    }
    else if (startimeChecker > 0)
    {
        console.log("boe");
    }
    //sessionStorage.setItem("startTime", startTimeVar); 
}

function endTime() //deze moet uitgevoerd worden als gebruiker 'stopt' met de applicatie en statistics wilt zien 
{
    startTimeVar = Number(sessionStorage.getItem("startTime"));
    endTimeVar = Date.now();
}

function calculateSpendTime()
{
    var diffMs = (endTimeVar - startTimeVar);
    var diffDays = Math.floor(diffMs / 86400000); // days
    diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
    diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    sessionStorage.setItem("diffHrs", diffHrs);
    sessionStorage.setItem("diffMins", diffMins);
    console.log(diffDays + " days, " + diffHrs + " hours, " + diffMins + " minutes spend using this application");
}

//met deze functie vullen we de tips veld op het scherm met tips / motivatie
//denk aan tips, motivatie die mensen zien als ze op de page zelf zijn niet perse belangrijke dingen
function randomTips(){
    var textField = document.getElementById("tipsText");
    setTimeout(
        function() {
            textField.innerHTML = "Please take short brakes, dont work for more than two hours at the time"
        }, tipsTime * 60 * 1000); 

    setTimeout(
        function() {
            textField.innerHTML = "Remember to stretch!"
        }, (tipsTime * 2) * 60 * 1000); 
    
    setTimeout(
        function() {
            textField.innerHTML = "This software is not a medical expert, please see one if needed"
        }, (tipsTime * 3) * 60 * 1000); 

    setTimeout(
        function() {
            textField.innerHTML = "Stress can cause backpains! Remember to take a break once in a while!"
        }, (tipsTime * 4) * 60 * 1000);

    setTimeout(
        function() {
            textField.innerHTML = "Stuck on something, try to take a little break to clear your mind."
        }, (tipsTime * 5) * 60 * 1000); 

    setTimeout(
        function() {
            textField.innerHTML = "Did you know that a good pose, also improves your productivity."
        }, (tipsTime * 6) * 60 * 1000); 

    setTimeout(
        function() {
            textField.innerHTML = "A break helps your focus"
            randomTips(); //loop anders gaat maar 1x, deze moet in de laatste dus als je meer toevoegt deze hier weg halen en bij laatste zetten
        }, (tipsTime * 7) * 60 * 1000); 
}

//functie zodat om de x minuten word gecheckt of de gebruiker in die tijd een foute pose heeft gehad
//function to check if the person has been sitting correctly for the past minute(s).
function checkGoodPose(){
    setTimeout(
        function() {
            rewardGoodPose();
        }, goodPoseTime * 60 * 1000); 
}

//functie om te kijken of de gebruiker een 'reward' krijgt of niet. 
//function to reward the user for it's good pose.
function rewardGoodPose(){
    if (reward_good_pose == 'true')
    {
        Push.create("Keep it up", {
            body: "You had no bad poses for " + goodPoseTime + " minutes!",
            icon: 'img/sticker.png',
            onClick: function () {
                this.close();
            }
        });
        goodPoseCounter_per_session += 1;
        clearTimeout(checkGoodPose);
        checkGoodPose();
    }
    else {
        Push.create("Dont give up", {
            body: "You had a bad poses in the last " + goodPoseTime + " minutes!",
            icon: 'img/hanginthere.png',
            onClick: function () {
                this.close();
            }
        });
        reward_good_pose = 'true';
        clearTimeout(checkGoodPose);
        checkGoodPose();
    }
}

//function to change the time between the random notifications. 
function myFrequentTime() {
    var x = document.getElementById("myFrequentTime");
    frequentTime = Number(x.value);
    clearTimeout(randomNotifications); //reset timer voor randomNotifications zodat de functie nog een keer word uitgevoerd maar dan met de nieuwe 'timer'
    randomNotifications();
}

//function to change the time between the good pose notification.
function myGoodPoseTime() {
    var x = document.getElementById("myGoodPoseTime");
    goodPoseTime = Number(x.value);
    clearTimeout(checkGoodPose); //reset timer voor checkGoodPose zodat de functie nog een keer word uitgevoerd maar dan met de nieuwe 'timer'
    clearTimeout(rewardGoodPose);
    checkGoodPose();
}

//function to change the time between tips notification
function myTipsTime() {
    var x = document.getElementById("myTipsTime");
    tipsTime = Number(x.value);
    clearTimeout(randomTips);
    randomTips();
}


//plays a sound when called
function playSound(filename){
    var mp3Source = '<source src="' + filename + '.mp3" type="audio/mpeg">';
    var oggSource = '<source src="' + filename + '.ogg" type="audio/ogg">';
    var embedSource = '<embed hidden="true" autostart="true" loop="false" src="' + filename +'.mp3">';
    document.getElementById("sound").innerHTML='<audio autoplay="autoplay">' + mp3Source + oggSource + embedSource + '</audio>';
}

//draws the keypoints so the camera can manage the good poses and bad poses
function draw() {
    drawKeyPoints();
}

//function to make the nose bigger, how closer the person is to the camera. 
function drawKeyPoints() {
    image(video, 0, 0);
        
    try {
        let eyeR = pose.rightEye;
        let eyeL = pose.leftEye;
        d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
        if (d > startingD + (badD - startingD) && leanCheck == 0){
            showNotificaton();
            reward_good_pose = 'false';

                recordBadPose();
                printBadSession();
                badposeCounter_per_session += 1;
                changeColorToBad();
            } 
    }
    catch (err) {
       console.log("No pose found.");
    }
}

//function gives a notification where you can click on if the person is still there. 
//will trigger after 10 seconds by going to the break page if notification is not clicked.
function personNotFound() {
    if (used == false) {
        console.log("Nobody is behind the camera.");
        let timeout = setTimeout(
                        function() { 
                            takePause();
                            window.location.href ="./timer/timer_index.html" },
                             10000);

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

//checks if the nose is still visible on the camera. if not found, calls personNotFound to create a notification.
function detectOutOfCanvas(){
    const nose = pose.nose;
    const leftShoulder = pose.leftShoulder;
    const rightShoulder = pose.rightShoulder;

    if (nose && nose.x && nose.y){
        if (nose.x < 0 || nose.x >= 640){
            personNotFound();
        }
    }
}