import 'regenerator-runtime/runtime'
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import Proton from 'proton-engine';

var mainVideo = document.getElementsByClassName("html5-main-video")[0];
var intervalVideoPlayId;
const detector = poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER}).then(console.log("detector created"));
var img = new Image();

/**
 * Current animation type. Can be 'skeleton', 'img', 'particle'
 * @type {string}
 */
var currentAnimation = "skeleton";


var ctx;
var canvas;

// Proton stuff (particles)
var proton;
var protonEmitterArray = [];
var particlesEffectType = 0;
var attractionBehaviour;
var attractionBehaviours = [];
var nosePosition = {
    x: 400,
    y: 200
};
var leftHandPosition = {
    x: 400,
    y: 200
};
var rightHandPosition = {
    x: 400,
    y: 200
};
var conf = { radius: 170, tha: 0 };



// Config images to replace face
var usedImageArrayIndex = 0;
const imgArray = [
    {
        "imgWidth": 100,
        "imgHeight": 100,
        "url": "/images/cat.png",
        "rightEyeToLeft": 33,
        "rightEyeToTop": 50,
        "pixelsBetweenEyes": 25
    },
    {
        "imgWidth": 100,
        "imgHeight": 100,
        "url": "/images/smily.png",
        "rightEyeToLeft": 36,
        "rightEyeToTop": 34,
        "pixelsBetweenEyes": 25
    },
    {
        "imgWidth": 100,
        "imgHeight": 100,
        "url": "/images/sun.png",
        "rightEyeToLeft": 35,
        "rightEyeToTop": 35,
        "pixelsBetweenEyes": 35
    },
    {
        "imgWidth": 100,
        "imgHeight": 100,
        "url": "/images/monkey.png",
        "rightEyeToLeft": 37,
        "rightEyeToTop": 33,
        "pixelsBetweenEyes": 35
    }
];


/**
 * Check if URL Change and clear detector interval if we do not watch a video
 * https://www.youtube.com -> no video watching
 * https://www.youtube.com/watch* -> video watching
 *
 * @type {string}
 */
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        onUrlChange();
    }
}).observe(document, {subtree: true, childList: true});

/**
 * Clear detector interval when we are not watching a video.
 */
function onUrlChange() {
    if(!location.href.includes("watch")){
        clearInterval(intervalVideoPlayId);
    }
}

/**
 * Get message from popup.js and update content
 * We have 3 kinds of messages for the animation request
 * - skeleton: show skeleton
 * - img<value>: replace head with image
 * - particle<value>: show particle
 */
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.animation === "skeleton"){
            currentAnimation="skeleton";

        }else if(request.animation === "imgCat"){
            usedImageArrayIndex=0;
            loadImage();
            currentAnimation="img";

        }else if(request.animation === "imgSmiley"){
            usedImageArrayIndex=1;
            loadImage();
            currentAnimation="img";

        }else if(request.animation === "imgSun"){
            usedImageArrayIndex=2;
            loadImage();
            currentAnimation="img";

        }else if(request.animation === "imgMonkey"){
            usedImageArrayIndex=3;
            loadImage();
            currentAnimation="img";

        }else if(request.animation === "particleHandsBall"){
            currentAnimation="particle";
            particlesEffectType=0;
            initParticles();

        }else if(request.animation === "particle2BalHead"){
            currentAnimation="particle";
            particlesEffectType=1;
            initParticles();

        }else if(request.animation === "particleRightHandLine"){
            currentAnimation="particle";
            particlesEffectType=2;
            initParticles();

        }else if(request.animation === "particleNoseGravity"){
            currentAnimation="particle";
            particlesEffectType=3;
            initParticles();

        }else if(request.animation === "particleNoseSupernova"){
            currentAnimation="particle";
            particlesEffectType=4;
            initParticles();

        }else if(request.animation === "particleHandsTrackFromBorder"){
            currentAnimation="particle";
            particlesEffectType=5;
            initParticles();

        }

    }
);


function initParticles(){
    if(!currentAnimation.startsWith("particle")){
        return;
    }
    protonEmitterArray = [];

    if(particlesEffectType===0){
        // hand left + hand right
        proton = new Proton();
        var emitter = new Proton.Emitter();
        // right hand
        emitter.addInitialize(new Proton.Mass(10));
        var particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            emitter.addInitialize(new Proton.Body(particleImage));
        }
        emitter.addInitialize(new Proton.Life(.1, .4));
        emitter.rate = new Proton.Rate(new Proton.Span(20, 20), .1);
        emitter.addInitialize(new Proton.V(new Proton.Span(3, 5), new Proton.Span(0, 360), 'polar'));
        emitter.addBehaviour(new Proton.Alpha(1, 0));
        emitter.addBehaviour(new Proton.Color("#3366b2", "#1155b2"));
        emitter.addBehaviour(new Proton.Scale(Proton.getSpan(1, 1.6), Proton.getSpan(0, .1)));
        emitter.p.x = canvas.width / 2;
        emitter.p.y = canvas.height / 2;
        emitter.emit();
        proton.addEmitter(emitter);
        protonEmitterArray[0]=emitter;
        // left hand
        emitter = new Proton.Emitter();
        emitter.addInitialize(new Proton.Mass(10));
        var particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            emitter.addInitialize(new Proton.Body(particleImage));
        }
        emitter.addInitialize(new Proton.Life(.1, .4));
        emitter.rate = new Proton.Rate(new Proton.Span(20, 20), .1);
        emitter.addInitialize(new Proton.V(new Proton.Span(3, 5), new Proton.Span(0, 360), 'polar'));
        emitter.addBehaviour(new Proton.Alpha(1, 0));
        emitter.addBehaviour(new Proton.Color("#fdf753", "#f63a3f"));
        emitter.addBehaviour(new Proton.Scale(Proton.getSpan(1, 1.6), Proton.getSpan(0, .1)));
        emitter.p.x = canvas.width / 2;
        emitter.p.y = canvas.height / 2;
        emitter.emit();
        proton.addEmitter(emitter);
        protonEmitterArray[1]=emitter;

        // var renderer = new Proton.CanvasRenderer(canvas);
        // proton.addRenderer(renderer);

        // renderer = new Proton.WebGlRenderer(canvas);
        // renderer.blendFunc("SRC_ALPHA", "ONE")
        // proton.addRenderer(renderer);
        renderer = new Proton.CanvasRenderer(canvas);
        proton.addRenderer(renderer);

    } else if(particlesEffectType===1){

        proton = new Proton();
        protonEmitterArray[0] = createImageEmitter(canvas.width / 2 + conf.radius, canvas.height / 2, '#4F1500', '#0029FF');
        protonEmitterArray[1] = createImageEmitter(canvas.width / 2 - conf.radius, canvas.height / 2, '#004CFE', '#6600FF');

        // renderer = new Proton.WebGlRenderer(canvas);
        // renderer.blendFunc("SRC_ALPHA", "ONE");
        // proton.addRenderer(renderer);
        renderer = new Proton.CanvasRenderer(canvas);
        proton.addRenderer(renderer);

    }else if (particlesEffectType===2){
        proton = new Proton();
        protonEmitterArray[0] = new Proton.Emitter();
        protonEmitterArray[0].rate = new Proton.Rate(new Proton.Span(1, 50));
        protonEmitterArray[0].addInitialize(new Proton.Radius(2, 10));
        protonEmitterArray[0].addInitialize(new Proton.Life(1, 3));
        protonEmitterArray[0].addBehaviour(new Proton.Color('random'));
        protonEmitterArray[0].addBehaviour(new Proton.RandomDrift(10, 0, .035));
        protonEmitterArray[0].p.x = canvas.width / 2;
        protonEmitterArray[0].p.y = canvas.height / 2;
        protonEmitterArray[0].emit();
        proton.addEmitter(protonEmitterArray[0]);

        renderer = new Proton.CanvasRenderer(canvas);
        proton.addRenderer(renderer);
    }else if(particlesEffectType===3){
        proton = new Proton;

        protonEmitterArray[0] = new Proton.Emitter();
        protonEmitterArray[0].damping = 0.0075;
        protonEmitterArray[0].rate = new Proton.Rate(300);

        var particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            emitter.addInitialize(new Proton.Body(particleImage, 128, 128));
        }

        protonEmitterArray[0].addInitialize(new Proton.Mass(1), new Proton.Radius(Proton.getSpan(5, 10)));
        protonEmitterArray[0].addInitialize(new Proton.Velocity(new Proton.Span(1, 3), new Proton.Span(0, 360), 'polar'));

        nosePosition = {
            x: canvas.width / 2,
            y: canvas.height / 2
        };
        attractionBehaviour = new Proton.Attraction(nosePosition, 10, 100);
        // repulsionBehaviour = new Proton.Repulsion(nosePosition, 30, 350);
        // crossZoneBehaviour = new Proton.CrossZone(new Proton.RectZone(0, 0, canvas.width, canvas.height), 'cross');
        // emitter.addBehaviour(attractionBehaviour, repulsionBehaviour, new Proton.Color('random'));
        protonEmitterArray[0].addBehaviour(attractionBehaviour,  new Proton.Color('random'));
        protonEmitterArray[0].addBehaviour(new Proton.Scale(Proton.getSpan(.1, .7)));
        // emitter.addBehaviour(new Proton.Rotate(Proton.getSpan(0, 180), Proton.getSpan(-5, 5), 'add'));

        protonEmitterArray[0].p.x = canvas.width / 2;
        protonEmitterArray[0].p.y = canvas.height / 2;
        protonEmitterArray[0].emit('once');
        proton.addEmitter(protonEmitterArray[0]);

        // var renderer = new Proton.WebGLRenderer(canvas);
        // renderer.blendFunc("SRC_ALPHA", "ONE")
        // proton.addRenderer(renderer);
        renderer = new Proton.CanvasRenderer(canvas);
        proton.addRenderer(renderer);
    }else if(particlesEffectType===4){
        proton = new Proton();
        protonEmitterArray[0] = new Proton.Emitter();
        protonEmitterArray[0].rate = new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(.05, .2));

        var particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle2.png");
        particleImage.onload = () => {
            protonEmitterArray[0].addInitialize(new Proton.Body(particleImage));
        }

        protonEmitterArray[0].addInitialize(new Proton.Body(image));
        protonEmitterArray[0].addInitialize(new Proton.Mass(1));
        protonEmitterArray[0].addInitialize(new Proton.Life(2, 4));
        protonEmitterArray[0].addInitialize(new Proton.V(new Proton.Span(0.5, 1.5), new Proton.Span(0, 360), 'polar'));

        protonEmitterArray[0].addBehaviour(new Proton.Alpha(1, [.7, 1]));
        var scale = new Proton.Scale(1, 0);
        protonEmitterArray[0].addBehaviour(scale);
        protonEmitterArray[0].addBehaviour(new Proton.Color('random', 'random', Infinity, Proton.easeInSine));

        protonEmitterArray[0].p.x = canvas.width / 2;
        protonEmitterArray[0].p.y = canvas.height / 2;
        protonEmitterArray[0].emit();
        proton.addEmitter(protonEmitterArray[0]);

        var renderer = new Proton.CanvasRenderer(canvas);
        proton.addRenderer(renderer);
    }else if(particlesEffectType===5){
        proton = new Proton(4000);

        createEmitter(canvas.width+50, canvas.height / 2, 0, '#fdf753', rightHandPosition, 0);
        createEmitter(canvas.width-50, canvas.height / 2, 180, '#f80610', leftHandPosition, 1);
        renderer = new Proton.CanvasRenderer(canvas);
        proton.addRenderer(renderer);
    }
}

function createEmitter(x, y, angle, color, handPos, emitterIndex) {
    protonEmitterArray[emitterIndex] = new Proton.Emitter();
    protonEmitterArray[emitterIndex].rate = new Proton.Rate(new Proton.Span(10, 30), new Proton.Span(.1));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.Mass(1));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.Life(3, 6));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.Radius(4,0.1));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.V(new Proton.Span(0.5, 1), new Proton.Span(90, 10, true), 'polar'));
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.Alpha(1, 0));
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.Color(color));
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.Attraction(handPos, 10, 500));
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, canvas.width, canvas.height), 'cross'));
    protonEmitterArray[emitterIndex].p.x = x;
    protonEmitterArray[emitterIndex].p.y = y;
    protonEmitterArray[emitterIndex].emit();
    protonEmitterArray[emitterIndex].rotation = angle;
    proton.addEmitter(protonEmitterArray[emitterIndex]);
}

function createImageEmitter(x, y, color1, color2) {
    var emitter = new Proton.Emitter();
    emitter.rate = new Proton.Rate(new Proton.Span(5, 7), new Proton.Span(.01, .02));

    emitter.addInitialize(new Proton.Mass(1));
    emitter.addInitialize(new Proton.Life(1));
    var particleImage = new Image();
    particleImage.src = chrome.runtime.getURL("/images/particle.png");
    particleImage.onload = () => {
        emitter.addInitialize(new Proton.Body(particleImage, 32));
    }
    // emitter.addInitialize(new Proton.Body(['image/particle.png'], 32));
    emitter.addInitialize(new Proton.Radius(40));

    emitter.addBehaviour(new Proton.Alpha(1, 0));
    emitter.addBehaviour(new Proton.Color(color1, color2));
    emitter.addBehaviour(new Proton.Scale(3.5, 0.1));
    emitter.addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, canvas.width, canvas.height), 'dead'));
    var attractionBehaviour = new Proton.Attraction(nosePosition, 0, 0);
    attractionBehaviours.push(attractionBehaviour);
    emitter.addBehaviour(attractionBehaviour);

    emitter.p.x = x;
    emitter.p.y = y;
    emitter.emit();
    proton.addEmitter(emitter);

    return emitter;
}


/**
 * Update particles emitter position on specific keypoints.
 *
 * @param keypoints from detector
 */
function updateParticles(keypoints){
    if(keypoints === undefined){
        return;
    }

    switch (particlesEffectType){
        case 0: // blue and yellow hand
            protonEmitterArray[0].p.x = keypoints[10].x;
            protonEmitterArray[0].p.y = keypoints[10].y;

            protonEmitterArray[1].p.x = keypoints[9].x;
            protonEmitterArray[1].p.y = keypoints[9].y;
            break;
        case 1: // circle head effect. center is nose
            protonEmitterArray[0].p.x = keypoints[0].x + conf.radius * Math.sin(Math.PI / 2 + conf.tha);
            protonEmitterArray[0].p.y = keypoints[0].y + conf.radius * Math.cos(Math.PI / 2 + conf.tha);
            protonEmitterArray[1].p.x = keypoints[0].x + conf.radius * Math.sin(-Math.PI / 2 + conf.tha);
            protonEmitterArray[1].p.y = keypoints[0].y + conf.radius * Math.cos(-Math.PI / 2 + conf.tha);
            conf.tha += .1;
            break;
        case 2:
            protonEmitterArray[0].p.x = keypoints[10].x;
            protonEmitterArray[0].p.y = keypoints[10].y;
            break;
        case 3:
            nosePosition.x = keypoints[0].x;
            nosePosition.y = keypoints[0].y;
            protonEmitterArray[0].p.x = keypoints[0].x;
            protonEmitterArray[0].p.y = keypoints[0].y;
            break;
        case 4:
            protonEmitterArray[0].p.x = keypoints[0].x;
            protonEmitterArray[0].p.y = keypoints[0].y;
            break;
        case 5:
            leftHandPosition.x = keypoints[9].x;
            leftHandPosition.y = keypoints[9].y;
            rightHandPosition.x = keypoints[10].x;
            rightHandPosition.y = keypoints[10].y
            break;
        default:
            break;

    }
}

function tick() {
    requestAnimationFrame(tick);
    if(!currentAnimation.startsWith("particle")){
        return;
    }
    if(proton !== null || proton !== undefined){
        proton.update();
    }
}

/**
 * Loads image for head replacement
 */
function loadImage() {
    img.src = chrome.runtime.getURL(imgArray[usedImageArrayIndex].url);
    img.onload = () => {
    }
}

mainVideo.addEventListener('loadeddata', (event) => {

    mainVideo.onplaying = function (){

    resizeObserver.observe(mainVideo);

    if(document.getElementById("canvasdummy") === null){
        canvas = document.createElement('canvas'); // creates new canvas element
        canvas.id = 'canvasdummy'; // gives canvas id
        if(mainVideo.length !== 0){
            canvas.height = mainVideo.clientHeight-50; //get original canvas height
            canvas.width = mainVideo.clientWidth; // get original canvas width
        }else {
            canvas.height = 600;
            canvas.width = 600;
        }

        let playlerContainerDIV = document.getElementById("player-container");
        playlerContainerDIV.appendChild(canvas); // adds the canvas to the body element
    }

    initParticles();

    canvas.style.position = "absolute";
    canvas.style.top   = "0px";
    canvas.style.right   = "0px";
    canvas.style.left   = mainVideo.style.cssText.split("; ")[2].split(": ")[1]
    canvas.style.bottom  = "0px";

    ctx = canvas.getContext('2d');
    // ctx.fillStyle = 'green';
    // ctx.fillRect(0, 0, canv.width, canv.height);

    // const img = new Image()
    // img.src = chrome.runtime.getURL("/images/cat.png");

    loadImage();


        intervalVideoPlayId= setInterval(function (){

        if(detector !== undefined){

            detector.then(function (poseDetector){

                if(mainVideo === undefined){
                    return;
                }
                poseDetector.estimatePoses(mainVideo).then((pose)=>{
                    if(pose !== undefined && pose[0] !== undefined && pose[0].keypoints !== undefined){
                        if(currentAnimation==="skeleton"){
                            ctx.clearRect(0,0,canvas.width,canvas.height);
                            drawKeyPoints(pose[0].keypoints, ctx);
                            drawSkeleton(pose[0].keypoints, ctx);
                        }

                        if(currentAnimation === "img"){
                            ctx.clearRect(0,0,canvas.width,canvas.height);
                            drawImage(pose[0].keypoints,ctx);
                        }

                        if(currentAnimation === "particle"){
                            updateParticles(pose[0].keypoints);
                        }


                    }

                })
            })
        }

    }, 100);
    tick();
}
})


mainVideo.onpause = function (){
    clearInterval(intervalVideoPlayId);
}


const resizeObserver = new ResizeObserver(entries => {
    canvas.style.left   = mainVideo.style.cssText.split("; ")[2].split(": ")[1]
    canvas.width=entries[0].target.clientWidth;
    canvas.height=entries[0].target.clientHeight-50;
    ctx.width=entries[0].target.clientWidth;
    ctx.height=entries[0].target.clientHeight-50;
});




function drawImage(keypoints, ctx){
    if(keypoints!== undefined){
        let spaceBetweenRightLeftEye = keypoints[1].x - keypoints[2].x;
        let ratio = spaceBetweenRightLeftEye/imgArray[usedImageArrayIndex].pixelsBetweenEyes;
        ctx.drawImage(img, keypoints[2].x-imgArray[usedImageArrayIndex].rightEyeToLeft*ratio, keypoints[2].y-imgArray[usedImageArrayIndex].rightEyeToTop*ratio, imgArray[usedImageArrayIndex].imgWidth*ratio, imgArray[usedImageArrayIndex].imgHeight*ratio);
    }

}


function drawKeyPoints(keypoints, ctx){
    for(let i=0; i<keypoints.length; i++){
        const keypoint = keypoints[i];
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = 'blue';
        ctx.fill();
    }
}


function drawSkeleton(keypoints, ctx, poseId){
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;

    poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet).forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];

        // If score is null, just show the keypoint.
        const score1 = kp1.score != null ? kp1.score : 1;
        const score2 = kp2.score != null ? kp2.score : 1;
        const scoreThreshold = 0.3;

        if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
            ctx.beginPath();
            ctx.moveTo(kp1.x, kp1.y);
            ctx.lineTo(kp2.x, kp2.y);
            ctx.stroke();
        }
    });
}
