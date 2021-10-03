import 'regenerator-runtime/runtime'
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import Proton from 'proton-engine';

var mainVideo = document.getElementsByClassName("html5-main-video")[0];
var intervalVideoPlayId;
var detector = poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER}).then(console.log("detector created"));
var img = new Image();

/**
 * Current animation type. Can be 'skeleton', 'img', 'particle'
 * @type {string}
 */
var currentAnimation = "skeleton5Times";
// used for random switch
var allAnimationIDs=["skeleton",
    "skeleton3Times",
    "skeleton5Times",
    "puppetsPlayer",
    "spiderWeb",
    "imgCat",
    "imgSmiley",
    // "imgSun",
    // "imgMonkey",
    // "imgAnonymous",
    "particleHandsBall",
    "particle2BalHead",
    // "particleRightHandLine",
    "particleNoseGravity",
    "particleNoseSupernova",
    "particleHandsTrackFromBorder",
    "particleUpperBodyGlow",
    "particleGlowPainting",
    "particlePainting",
    "particlePaintRandomDrift",
    "particleCometThrower",
    "particleBodyGlow",
    "particleBurningMan"];
var randomSwitchSec=10;    // sec between animation switch
var randomSwitchIntervalID=null;


// skeleton settings
var skeletonLineSize=1;


var ctx;
var webGLtx;
var canvas;
var canvasGL;

// for resize. initial size of video.
var wVideo;
var hVideo;

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
var isParticleInit=false; // only once init the particle system
var rendererGL;
var startParticleInit=true; //

var startTick=false;

// Player popup initial don't show
var showPlayerPopup=false;


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
    },
    {
        "imgWidth": 100,
        "imgHeight": 45,
        "url": "/images/anonymous.png",
        "rightEyeToLeft": 33,
        "rightEyeToTop": 20,
        "pixelsBetweenEyes": 25
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
        clearRandomSwitchInterval();
    }
}

/**
 * Get message from popup.js and update content
 * We have 3 kinds of messages for the animation request. And some that don't fit the scheme
 * - skeleton: show skeleton
 * - img<value>: replace head with image
 * - particle<value>: show particle
 * - puppetsPlayer, spiderWeb
 */
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(randomSwitchIntervalID){
            clearInterval(randomSwitchIntervalID);
        }
        setNewAnimation(request.animation);
    }
);

/**
 * Switch and prepare current animation.
 * @param animationId new animation ID
 */
function setNewAnimation(animationId){

    clearWebGL();
    if (animationId === "skeleton"){
        currentAnimation="skeleton";

    }else if (animationId === "skeleton3Times"){
        currentAnimation="skeleton3Times";

    }else if (animationId === "skeleton5Times"){
        currentAnimation="skeleton5Times";

    }else if (animationId === "puppetsPlayer"){
        currentAnimation="puppetsPlayer";

    }else if (animationId === "spiderWeb"){
        currentAnimation="spiderWeb";

    }else if(animationId === "imgCat"){
        usedImageArrayIndex=0;
        loadImage();
        currentAnimation="img";

    }else if(animationId === "imgSmiley"){
        usedImageArrayIndex=1;
        loadImage();
        currentAnimation="img";

    }else if(animationId === "imgSun"){
        usedImageArrayIndex=2;
        loadImage();
        currentAnimation="img";

    }else if(animationId === "imgMonkey") {
        usedImageArrayIndex = 3;
        loadImage();
        currentAnimation = "img";
    }else if(animationId === "imgAnonymous"){
        usedImageArrayIndex=4;
        loadImage();
        currentAnimation="img";

    }else if(animationId === "particleHandsBall"){
        currentAnimation="particle";
        particlesEffectType=0;
        initParticles();

    }else if(animationId === "particle2BalHead"){
        currentAnimation="particle";
        particlesEffectType=1;
        initParticles();

    }else if(animationId === "particleRightHandLine"){
        currentAnimation="particle";
        particlesEffectType=2;
        initParticles();

    }else if(animationId === "particleNoseGravity"){
        currentAnimation="particle";
        particlesEffectType=3;
        initParticles();

    }else if(animationId === "particleNoseSupernova"){
        currentAnimation="particle";
        particlesEffectType=4;
        initParticles();

    }else if(animationId === "particleHandsTrackFromBorder"){
        currentAnimation="particle";
        particlesEffectType=5;
        initParticles();

    }else if(animationId === "particleUpperBodyGlow"){
        currentAnimation="particle";
        particlesEffectType=6;
        initParticles();

    }else if(animationId === "particleGlowPainting"){
        currentAnimation="particle";
        particlesEffectType=7;
        initParticles();

    }else if(animationId === "particlePainting"){
        currentAnimation="particle";
        particlesEffectType=8;
        initParticles();

    }else if(animationId === "particlePaintRandomDrift"){
        currentAnimation="particle";
        particlesEffectType=9;
        initParticles();

    }else if(animationId === "particleCometThrower"){
        currentAnimation="particle";
        particlesEffectType=10;
        initParticles();

    }else if(animationId === "particleBodyGlow"){
        currentAnimation="particle";
        particlesEffectType=11;
        initParticles();

    }else if(animationId === "particleBurningMan"){
        currentAnimation="particle";
        particlesEffectType=12;
        initParticles();

    }
}

/**
 * Prepare particle system
 */
function initParticles(){
    if(!currentAnimation.startsWith("particle")){
        return;
    }
    startParticleInit=true;

    protonEmitterArray = [];

    // clear canvas2D content
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(particlesEffectType===0){
        // hand left + hand right
        // ### Hand power balls
        proton = new Proton();
        var emitter = new Proton.Emitter();
        // right hand
        emitter.addInitialize(new Proton.Mass(10));
        let particleImage = new Image();
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
        emitter.p.x = canvasGL.width / 2;
        emitter.p.y = canvasGL.height / 2;
        emitter.emit();
        proton.addEmitter(emitter);
        protonEmitterArray[0]=emitter;
        // left hand
        emitter = new Proton.Emitter();
        emitter.addInitialize(new Proton.Mass(10));
        let particleImage2 = new Image();
        particleImage2.src = chrome.runtime.getURL("/images/particle.png");
        particleImage2.onload = () => {
            emitter.addInitialize(new Proton.Body(particleImage2));
        }
        emitter.addInitialize(new Proton.Life(.1, .4));
        emitter.rate = new Proton.Rate(new Proton.Span(20, 20), .1);
        emitter.addInitialize(new Proton.V(new Proton.Span(3, 5), new Proton.Span(0, 360), 'polar'));
        emitter.addBehaviour(new Proton.Alpha(1, 0));
        emitter.addBehaviour(new Proton.Color("#fdf753", "#f63a3f"));
        emitter.addBehaviour(new Proton.Scale(Proton.getSpan(1, 1.6), Proton.getSpan(0, .1)));
        emitter.p.x = canvasGL.width / 2;
        emitter.p.y = canvasGL.height / 2;
        emitter.emit();
        proton.addEmitter(emitter);
        protonEmitterArray[1]=emitter;

        tryWebGLRendererInit();

    } else if(particlesEffectType===1){
        // ### Two head balls
        proton = new Proton();
        protonEmitterArray[0] = createImageEmitter(canvas.width / 2 + conf.radius, canvas.height / 2, '#4F1500', '#0029FF');
        protonEmitterArray[1] = createImageEmitter(canvas.width / 2 - conf.radius, canvas.height / 2, '#004CFE', '#6600FF');

        tryWebGLRendererInit();


    }else if (particlesEffectType===2){
        // ### Right hand line
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

        let renderer = new Proton.CanvasRenderer(canvas);
        proton.addRenderer(renderer);
    }else if(particlesEffectType===3){
        // ### Nose gravity
        proton = new Proton;

        protonEmitterArray[0] = new Proton.Emitter();
        protonEmitterArray[0].damping = 0.0075;
        protonEmitterArray[0].rate = new Proton.Rate(300);

        let particleImage = new Image();
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
        attractionBehaviour = new Proton.Attraction(nosePosition, 10, 1000);
        protonEmitterArray[0].addBehaviour(attractionBehaviour,  new Proton.Color('random'));
        protonEmitterArray[0].addBehaviour(new Proton.Scale(Proton.getSpan(.1, .7)));

        protonEmitterArray[0].p.x = canvas.width / 2;
        protonEmitterArray[0].p.y = canvas.height / 2;
        protonEmitterArray[0].emit('once');
        proton.addEmitter(protonEmitterArray[0]);

        let renderer = new Proton.CanvasRenderer(canvas);
        proton.addRenderer(renderer);
    }else if(particlesEffectType===4){
        // ### Nose supernova
        proton = new Proton();
        protonEmitterArray[0] = new Proton.Emitter();
        protonEmitterArray[0].rate = new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(.05, .2));

        let particleImage = new Image();
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

        let renderer = new Proton.CanvasRenderer(canvas);
        proton.addRenderer(renderer);
    }else if(particlesEffectType===5){
        // ### Hands track from border
        proton = new Proton(4000);

        createEmitter(canvas.width+50, canvas.height / 2, 0, '#fdf753', rightHandPosition, 0);
        createEmitter(canvas.width-50, canvas.height / 2, 180, '#f80610', leftHandPosition, 1);
        let renderer = new Proton.CanvasRenderer(canvas);
        proton.addRenderer(renderer);
    }else if(particlesEffectType===6){
        // ### upper body glow
        proton = new Proton;
        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            createEmitterPointGlow(0, "#4F1500","#e7af22",90, particleImage);
            createEmitterPointGlow(1, "#4F1500","#0029FF",65, particleImage);
            createEmitterPointGlow(2, "#4F1500","#6974f8",0, particleImage);
            createEmitterPointGlow(3, "#4F1500","#59b9e3",0, particleImage);
            createEmitterPointGlow(4, "#4F1500","#aa40e0",-65, particleImage);
            createEmitterPointGlow(5, "#4F1500","#32fd16",-90, particleImage);
        }

        tryWebGLRendererInit();
    }else if(particlesEffectType===7){
        // ### glow painting
        proton = new Proton;
        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            createEmitterDrawGlow(0, "#4F1500","#e7af22",90, particleImage);
            createEmitterDrawGlow(1, "#4F1500","#0029FF",-90, particleImage);

        }

        tryWebGLRendererInit();
    }else if(particlesEffectType===8){
        // ### particle painting
        proton = new Proton;
        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            createEmitterPointDraw(0, "#4F1500","#e7af22",90, particleImage);
            createEmitterPointDraw(1, "#4F1500","#0029FF",-90, particleImage);

        }

        tryWebGLRendererInit();
    }else if(particlesEffectType===9){
        // ### particle painting with random drift
        proton = new Proton;
        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            createEmitterPointDrawRandomDrift(0, "#4F1500","#e7af22",90, particleImage);
            createEmitterPointDrawRandomDrift(1, "#4F1500","#0029FF",-90, particleImage);

        }

        tryWebGLRendererInit();
    }else if(particlesEffectType===10){
        // ### particleCometThrower
        proton = new Proton;

        let imageComet1 = new Image();
        imageComet1.src = chrome.runtime.getURL("/images/Comet_1.png");
        imageComet1.onload = () => {
            createEmitterCometThrower(0, imageComet1);
        }

        let imageComet2 = new Image();
        imageComet2.src = chrome.runtime.getURL("/images/Comet_2.png");
        imageComet2.onload = () => {
            createEmitterCometThrower(1, imageComet2);
        }

        let renderer = new Proton.CanvasRenderer(canvas);
        renderer.onProtonUpdate = function() {
            ctx.clearRect(0,0,canvas.width,canvas.height);
        };
        proton.addRenderer(renderer);
    }else if(particlesEffectType===11){
        // ### body glow
        proton = new Proton;
        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            createEmitterPointGlow(0, "#4F1500","#e7af22",90, particleImage);
            createEmitterPointGlow(1, "#4F1500","#0029FF",65, particleImage);
            createEmitterPointGlow(2, "#4F1500","#6974f8",0, particleImage);
            createEmitterPointGlow(3, "#4F1500","#59b9e3",0, particleImage);
            createEmitterPointGlow(4, "#4F1500","#aa40e0",-65, particleImage);
            createEmitterPointGlow(5, "#4F1500","#32fd16",-90, particleImage);

            createEmitterPointGlow(6, "#031a17","#e7af22",90, particleImage);
            createEmitterPointGlow(7, "#44011b","#0029FF",65, particleImage);
            createEmitterPointGlow(8, "#493b01","#6974f8",0, particleImage);

            createEmitterPointGlow(9, "#0e0601","#5cff24",-90, particleImage);
            createEmitterPointGlow(10, "#054b01","#aa40e0",-65, particleImage);
            createEmitterPointGlow(11, "#1e012c","#32fd16",0, particleImage);
        }

        tryWebGLRendererInit();
    }else if(particlesEffectType===12){
        // ### burning man
        proton = new Proton;
        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            createEmitterPointGlow(0, "#C97024","#290000",90, particleImage);
            createEmitterPointGlow(1, "#C97024","#290000",65, particleImage);
            createEmitterPointGlow(2, "#C97024","#290000",0, particleImage);
            createEmitterPointGlow(3, "#C97024","#290000",0, particleImage);
            createEmitterPointGlow(4, "#C97024","#290000",-65, particleImage);
            createEmitterPointGlow(5, "#C97024","#290000",-90, particleImage);

            createEmitterPointGlow(6, "#C97024","#290000",90, particleImage);
            createEmitterPointGlow(7, "#C97024","#290000",65, particleImage);
            createEmitterPointGlow(8, "#C97024","#290000",0, particleImage);

            createEmitterPointGlow(9, "#C97024","#290000",-90, particleImage);
            createEmitterPointGlow(10, "#C97024","#290000",-65, particleImage);
            createEmitterPointGlow(11, "#C97024","#290000",0, particleImage);

            createEmitterPointGlow(12, "#C97024","#290000",225, particleImage);
            createEmitterPointGlow(13, "#C97024","#290000",-225, particleImage);

            createEmitterPointGlow(14, "#C97024","#290000",-65, particleImage);
            createEmitterPointGlow(15, "#C97024","#290000",65, particleImage);

            createEmitterPointGlow(16, "#C97024","#290000",0, particleImage);
            createEmitterPointGlow(17, "#C97024","#290000",65, particleImage);
            createEmitterPointGlow(18, "#C97024","#290000",-65, particleImage);

        }

        tryWebGLRendererInit();
    }
    startParticleInit=false;

}

/**
 * Help function to create particle system with image for 'cometThrower'
 *
 * @param emitterIndex index of the emitter
 * @param image image to use for this emiter
 */
function createEmitterCometThrower(emitterIndex, image){
    protonEmitterArray[emitterIndex] = new Proton.Emitter();
    protonEmitterArray[emitterIndex].rate = new Proton.Rate(new Proton.Span(2, 5), .05);
    protonEmitterArray[emitterIndex].addInitialize(new Proton.Body(image, 20, 40));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.Mass(1));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.Life(1.5, 2.2));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.Velocity(2, Proton.getSpan(0, 360), 'polar'));

    protonEmitterArray[emitterIndex].addBehaviour(new Proton.Rotate());
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.Gravity(3));
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.Alpha(0.6, 1));
    // protonEmitterArray[emitterIndex].addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, canvas.width, canvas.height), 'bound'));

    protonEmitterArray[emitterIndex].p.x = canvas.width / 2;
    protonEmitterArray[emitterIndex].p.y = canvas.height / 2;
    proton.addEmitter(protonEmitterArray[emitterIndex]);
    protonEmitterArray[emitterIndex].emit();
}

/**
 * Help function to create particle system with different angel and colors for 'pointDrawRandomDrift'
 *
 * @param emitterIndex index of the emitter
 * @param colorT
 * @param colorE
 * @param angle angle for the emission of the particle
 * @param image particle image to use
 */
function createEmitterPointDrawRandomDrift(emitterIndex, colorT, colorE, angle, image){
    protonEmitterArray[emitterIndex]= new Proton.Emitter();
    protonEmitterArray[emitterIndex].rate = new Proton.Rate(new Proton.Span(.1, .2), new Proton.Span(.01, .015));

    protonEmitterArray[emitterIndex].addInitialize(new Proton.Mass(10));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.Life(1, 2));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.Body(image, 4));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.Radius(2));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.V(new Proton.Span(1, 2), angle, 'polar'));

    protonEmitterArray[emitterIndex].addBehaviour(new Proton.Alpha(0.8, 0));
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.RandomDrift(30, 30, 0));
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.Color(colorT, colorE));
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.Scale(1, 0));
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, canvasGL.width, canvasGL.height), 'dead'));

    protonEmitterArray[emitterIndex].p.x = canvasGL.width / 2;
    protonEmitterArray[emitterIndex].p.y = canvasGL.height / 2;
    protonEmitterArray[emitterIndex].emit();
    proton.addEmitter(protonEmitterArray[emitterIndex]);
}

/**
 * Help function to create particle system with different angel and colors for 'pointDraw'
 *
 * @param emitterIndex
 * @param colorT
 * @param colorE
 * @param angle
 * @param image
 */
function createEmitterPointDraw(emitterIndex, colorT, colorE, angle, image){
    protonEmitterArray[emitterIndex]= new Proton.Emitter();
    protonEmitterArray[emitterIndex].rate = new Proton.Rate(new Proton.Span(.1, .2), new Proton.Span(.01, .015));

    protonEmitterArray[emitterIndex].addInitialize(new Proton.Mass(1));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.Life(1, 50));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.Body(image, 4));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.Radius(2));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.V(new Proton.Span(1, 2), angle, 'polar'));

    protonEmitterArray[emitterIndex].addBehaviour(new Proton.Alpha(0.8, 0));
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.Color(colorT, colorE));
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.Scale(1, 0.1));
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, canvasGL.width, canvasGL.height), 'dead'));

    protonEmitterArray[emitterIndex].p.x = canvasGL.width / 2;
    protonEmitterArray[emitterIndex].p.y = canvasGL.height / 2;
    protonEmitterArray[emitterIndex].emit();
    proton.addEmitter(protonEmitterArray[emitterIndex]);
}

/**
 * Help function to create particle system with different angel and colors for 'pointGlow'
 *
 * @param emitterIndex
 * @param colorT
 * @param colorE
 * @param angle
 * @param image
 */
function createEmitterPointGlow(emitterIndex, colorT, colorE, angle, image){
    protonEmitterArray[emitterIndex]= new Proton.Emitter();
    protonEmitterArray[emitterIndex].rate = new Proton.Rate(new Proton.Span(.1, .2), new Proton.Span(.01, .015));

    protonEmitterArray[emitterIndex].addInitialize(new Proton.Mass(1));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.Life(1, 2));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.Body(image, 32));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.Radius(2));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.V(new Proton.Span(1, 2), angle, 'polar'));

    protonEmitterArray[emitterIndex].addBehaviour(new Proton.Alpha(0.2, 0));
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.Color(colorT, colorE));
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.Scale(3, 0.1));
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, canvasGL.width, canvasGL.height), 'dead'));

    protonEmitterArray[emitterIndex].p.x = canvasGL.width / 2;
    protonEmitterArray[emitterIndex].p.y = canvasGL.height / 2;
    protonEmitterArray[emitterIndex].emit();
    proton.addEmitter(protonEmitterArray[emitterIndex]);
}

/**
 * Help function to create particle system with different angel and colors for 'drawGlow'
 * @param emitterIndex
 * @param colorT
 * @param colorE
 * @param angle
 * @param image
 */
function createEmitterDrawGlow(emitterIndex, colorT, colorE, angle, image){
    protonEmitterArray[emitterIndex]= new Proton.Emitter();
    protonEmitterArray[emitterIndex].rate = new Proton.Rate(new Proton.Span(.1, .2), new Proton.Span(.01, .015));

    protonEmitterArray[emitterIndex].addInitialize(new Proton.Mass(1));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.Life(1, 50));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.Body(image, 32));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.Radius(2));
    protonEmitterArray[emitterIndex].addInitialize(new Proton.V(new Proton.Span(1, 2), angle, 'polar'));

    protonEmitterArray[emitterIndex].addBehaviour(new Proton.Alpha(0.2, 0));
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.Color(colorT, colorE));
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.Scale(3, 0.1));
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, canvasGL.width, canvasGL.height), 'dead'));

    protonEmitterArray[emitterIndex].p.x = canvasGL.width / 2;
    protonEmitterArray[emitterIndex].p.y = canvasGL.height / 2;
    protonEmitterArray[emitterIndex].emit();
    proton.addEmitter(protonEmitterArray[emitterIndex]);
}

function tryWebGLRendererInit(removeOtherRenderer=false){
    // Try WebGLRender. If not posssible fallback to Canvas renderer
    try {
        rendererGL = new Proton.WebGLRenderer(canvasGL);
        rendererGL.blendFunc("SRC_ALPHA", "ONE");
        proton.addRenderer(rendererGL);
    }catch (e){
        const renderer = new Proton.CanvasRenderer(canvas);
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
    protonEmitterArray[emitterIndex].addBehaviour(new Proton.Attraction(handPos, 10, 1500));
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

    if(startParticleInit===true){
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
        case 6:
            /**
             * Mapping emitter to pos in array (->)
             0: nose
             1: left_eye
             2: right_eye
             3: left_ear
             4: right_ear
             5: left_shoulder   -> 2
             6: right_shoulder  -> 3
             7: left_elbow      -> 1
             8: right_elbow     -> 4
             9: left_wrist      -> 0
             10: right_wrist    -> 5
             11: left_hip
             12: right_hip
             13: left_knee
             14: right_knee
             15: left_ankle
             16: right_ankle
             */
            protonEmitterArray[0].p.x=keypoints[9].x;
            protonEmitterArray[0].p.y=keypoints[9].y;
            protonEmitterArray[1].p.x=keypoints[7].x;
            protonEmitterArray[1].p.y=keypoints[7].y;
            protonEmitterArray[2].p.x=keypoints[5].x;
            protonEmitterArray[2].p.y=keypoints[5].y;
            protonEmitterArray[3].p.x=keypoints[6].x;
            protonEmitterArray[3].p.y=keypoints[6].y;
            protonEmitterArray[4].p.x=keypoints[8].x;
            protonEmitterArray[4].p.y=keypoints[8].y;
            protonEmitterArray[5].p.x=keypoints[10].x;
            protonEmitterArray[5].p.y=keypoints[10].y;
            break;
        case 7:
            leftRightWristUpdate(keypoints);
            break;
        case 8:
            leftRightWristUpdate(keypoints);
            break;
        case 9:
            leftRightWristUpdate(keypoints);
            break;
        case 10:
            leftRightWristUpdate(keypoints);
            break;
        case 11:
            protonEmitterArray[0].p.x=keypoints[9].x;
            protonEmitterArray[0].p.y=keypoints[9].y;
            protonEmitterArray[1].p.x=keypoints[7].x;
            protonEmitterArray[1].p.y=keypoints[7].y;
            protonEmitterArray[2].p.x=keypoints[5].x;
            protonEmitterArray[2].p.y=keypoints[5].y;
            protonEmitterArray[3].p.x=keypoints[6].x;
            protonEmitterArray[3].p.y=keypoints[6].y;
            protonEmitterArray[4].p.x=keypoints[8].x;
            protonEmitterArray[4].p.y=keypoints[8].y;
            protonEmitterArray[5].p.x=keypoints[10].x;
            protonEmitterArray[5].p.y=keypoints[10].y;

            protonEmitterArray[6].p.x=keypoints[11].x;
            protonEmitterArray[6].p.y=keypoints[11].y;
            protonEmitterArray[7].p.x=keypoints[13].x;
            protonEmitterArray[7].p.y=keypoints[13].y;
            protonEmitterArray[8].p.x=keypoints[15].x;
            protonEmitterArray[8].p.y=keypoints[15].y;
            protonEmitterArray[9].p.x=keypoints[12].x;
            protonEmitterArray[9].p.y=keypoints[12].y;
            protonEmitterArray[10].p.x=keypoints[14].x;
            protonEmitterArray[10].p.y=keypoints[14].y;
            protonEmitterArray[11].p.x=keypoints[16].x;
            protonEmitterArray[11].p.y=keypoints[16].y;
            break;
        case 12:
            protonEmitterArray[0].p.x=keypoints[9].x;
            protonEmitterArray[0].p.y=keypoints[9].y;
            protonEmitterArray[1].p.x=keypoints[7].x;
            protonEmitterArray[1].p.y=keypoints[7].y;
            protonEmitterArray[2].p.x=keypoints[5].x;
            protonEmitterArray[2].p.y=keypoints[5].y;
            protonEmitterArray[3].p.x=keypoints[6].x;
            protonEmitterArray[3].p.y=keypoints[6].y;
            protonEmitterArray[4].p.x=keypoints[8].x;
            protonEmitterArray[4].p.y=keypoints[8].y;
            protonEmitterArray[5].p.x=keypoints[10].x;
            protonEmitterArray[5].p.y=keypoints[10].y;

            protonEmitterArray[6].p.x=keypoints[11].x;
            protonEmitterArray[6].p.y=keypoints[11].y;
            protonEmitterArray[7].p.x=keypoints[13].x;
            protonEmitterArray[7].p.y=keypoints[13].y;
            protonEmitterArray[8].p.x=keypoints[15].x;
            protonEmitterArray[8].p.y=keypoints[15].y;
            protonEmitterArray[9].p.x=keypoints[12].x;
            protonEmitterArray[9].p.y=keypoints[12].y;
            protonEmitterArray[10].p.x=keypoints[14].x;
            protonEmitterArray[10].p.y=keypoints[14].y;
            protonEmitterArray[11].p.x=keypoints[16].x;
            protonEmitterArray[11].p.y=keypoints[16].y;

            protonEmitterArray[12].p.x=keypoints[5].x;
            protonEmitterArray[12].p.y=keypoints[5].y;
            protonEmitterArray[13].p.x=keypoints[6].x;
            protonEmitterArray[13].p.y=keypoints[6].y;

            protonEmitterArray[14].p.x=keypoints[15].x;
            protonEmitterArray[14].p.y=keypoints[15].y;
            protonEmitterArray[15].p.x=keypoints[16].x;
            protonEmitterArray[15].p.y=keypoints[16].y;

            protonEmitterArray[16].p.x=keypoints[0].x;
            protonEmitterArray[16].p.y=keypoints[0].y;
            protonEmitterArray[17].p.x=keypoints[3].x;
            protonEmitterArray[17].p.y=keypoints[3].y;
            protonEmitterArray[18].p.x=keypoints[4].x;
            protonEmitterArray[18].p.y=keypoints[4].y;


            break;
        default:
            break;

    }
}

/**
 * Update proton emitter position for left/right wrist from keypoint detection
 */
function leftRightWristUpdate(keypoints){
    protonEmitterArray[0].p.x=keypoints[9].x;
    protonEmitterArray[0].p.y=keypoints[9].y;
    protonEmitterArray[1].p.x=keypoints[10].x;
    protonEmitterArray[1].p.y=keypoints[10].y;
}

/**
 * Particle animation frame
 */
function tick() {
    requestAnimationFrame(tick);
    if(!currentAnimation.startsWith("particle")){
        return;
    }
    if(proton !== null){
       proton.update();
    }
}

function clearWebGL(){
    // clear WebGLCanvas and particles
    protonEmitterArray.forEach(emitter=>{
        emitter.removeAllParticles();
        emitter.destroy();
    });
    webGLtx.clear(webGLtx.DEPTH_BUFFER_BIT | webGLtx.COLOR_BUFFER_BIT | webGLtx.STENCIL_BUFFER_BIT);
}
/**
 * Loads image for head replacement
 */
function loadImage() {
    img.src = chrome.runtime.getURL(imgArray[usedImageArrayIndex].url);
    img.onload = () => {
        // This is intentional
    }
}

/**
 * Video event listener.
 * If video is playing, start detection interval
 */
mainVideo.addEventListener('loadeddata', (event) => {

    wVideo=mainVideo.clientWidth;
    hVideo=mainVideo.clientHeight;

    var animControlsButton = document.getElementsByClassName("ytp-right-controls");
    if(document.getElementById("posedream-popup-btn") === null){
        var button = document.createElement('button');
        button.id="posedream-popup-btn";
        button.className = 'ytp-button it-player-button';
        button.dataset.title = "PoseDream";
        button.onclick = function(){document.dispatchEvent(new CustomEvent('displayPoseDreamPopup', { detail: {animationID:'skeleton'} }));}
        animControlsButton[0].insertBefore(button, animControlsButton[0].childNodes[0]);

        let playerImage = new Image();
        playerImage.src = chrome.runtime.getURL("/images/logo48.png");
        playerImage.onload = () => {
            var imgTag = document.createElement('img');
            imgTag.src=playerImage.src;
            button.appendChild(imgTag);
        }
    }


    initVideoPlayerPopup();



})

/**
 * Add popup to video player
 */
function initVideoPlayerPopup(){
    const div = document.createElement('div');

    div.className = 'posedream-video-popup';
    div.innerHTML = `
<div>
<button id="randomButton" class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('runRandomAnimation'));">Random 10s</button>
<input type="range" min="2" max="60" value="10" id="randomRange" onclick="document.dispatchEvent(new CustomEvent('changeRandomInterval', { detail: {interval:this.value} }));">
</div>
<div>
<p id="changeSizeSkeletonText" ">Skeleton size 1px</p>
<input type="range" min="1" max="10" value="1" id="sizeSkeleton" onclick="document.dispatchEvent(new CustomEvent('changeSizeSkeleton', { detail: {interval:this.value} }));">
</div>
    Fun with lines
<ol>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'skeleton'} }));">Skeleton</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'skeleton3Times'} }));">Skeletons 3 times</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'skeleton5Times'} }));">Skeletons 5 times</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'puppetsPlayer'} }));">Puppets player</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'spiderWeb'} }));">Spider web</button></li>
</ol>
<br>
Replace head with image
<ol>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'imgCat'} }));">Cat</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'imgSmiley'} }));">Smiley</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'imgSun'} }));">Sun</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'imgMonkey'} }));">Monkey</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'imgAnonymous'} }));">Anonymous</button></li>
</ol>
<br>
Show particle animation
<ol>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'particleHandsBall'} }));">Hand power balls</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'particle2BalHead'} }));">Two head balls</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'particleRightHandLine'} }));">Right hand line</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'particleNoseGravity'} }));">Nose gravity</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'particleNoseSupernova'} }));">Nose supernova</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'particleHandsTrackFromBorder'} }));">Hands track from border</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'particleUpperBodyGlow'} }));">Upper body glow</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'particleGlowPainting'} }));">Glow painting</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'particlePainting'} }));">Particle painting</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'particlePaintRandomDrift'} }));">Particle painting with random drift</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'particleCometThrower'} }));">Comet thrower</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'particleBodyGlow'} }));">Body glow</button></li>
  <li><button class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'particleBurningMan'} }));">Burning Man</button></li>
</ol>
    `;

    var html5VideoPlayer = document.getElementsByClassName("html5-video-player");
    html5VideoPlayer[0].appendChild(div);
}


mainVideo.oncanplay = (event) => {
    console.log('Video can start, but not sure it will play through.');
};

mainVideo.onplaying = (event) => {
    if(document.getElementById("canvasdummy") === null){
        canvas = document.createElement('canvas'); // creates new canvas element
        canvas.id = 'canvasdummy'; // gives canvas id
        if(mainVideo.length !== 0){
            canvas.height = mainVideo.clientHeight; //get original canvas height
            canvas.width = mainVideo.clientWidth; // get original canvas width
        }else {
            canvas.height = 600;
            canvas.width = 600;
        }

        let videoContainerDIV = document.getElementsByClassName("html5-video-container")[0];
        videoContainerDIV.appendChild(canvas); // adds the canvas to the body element
        setCanvasStyle(canvas);
        ctx = canvas.getContext('2d');
    }

    if(document.getElementById("canvasdummyGL") === null){
        canvasGL = document.createElement('canvas'); // creates new canvas element
        canvasGL.id = 'canvasdummyGL'; // gives canvas id
        if(mainVideo.length !== 0){
            canvasGL.height = mainVideo.clientHeight; //get original canvas height
            canvasGL.width = mainVideo.clientWidth; // get original canvas width
        }else {
            canvasGL.height = 600;
            canvasGL.width = 600;
        }

        let videoContainerDIV = document.getElementsByClassName("html5-video-container")[0];
        videoContainerDIV.appendChild(canvasGL); // adds the canvas to the body element
        setCanvasStyle(canvasGL);
        webGLtx = canvasGL.getContext("experimental-webgl");
    }

    if(isParticleInit===false){
        isParticleInit=true;
        initParticles();
    }

    resizeObserver.observe(mainVideo);

    createDetectorInterval();

    // only call tick once.
    if(startTick===false){
        startTick=true;
        tick();
    }
}

/**
 * Create interval to detect poses
 * CHECKME: use requestAnimationFrame
 */
function createDetectorInterval(){
    intervalVideoPlayId= setInterval(function (){

        if(detector !== undefined){

            detector.then(function (poseDetector){

                if(mainVideo === undefined || !location.href.includes("watch")){
                    return;
                }
                poseDetector.estimatePoses(mainVideo).then((pose)=>{
                    if(mainVideo.paused){
                        return;
                    }
                    if(pose !== undefined && pose[0] !== undefined && pose[0].keypoints !== undefined){
                        let canvasPoseCoordinates = transformKeypointsForRender(pose[0].keypoints);
                        if(currentAnimation==="skeleton"){
                            ctx.clearRect(0,0,canvas.width,canvas.height);
                            drawKeyPoints(canvasPoseCoordinates);
                            drawSkeleton(canvasPoseCoordinates);
                        }

                        if(currentAnimation==="skeleton3Times"){
                            ctx.clearRect(0,0,canvas.width,canvas.height);
                            drawKeyPoints(canvasPoseCoordinates);
                            drawSkeleton(canvasPoseCoordinates);

                            canvasPoseCoordinates = transformKeypointsForRender(pose[0].keypoints, 0.5, 0.5);
                            drawKeyPoints(canvasPoseCoordinates);
                            drawSkeleton(canvasPoseCoordinates);

                            canvasPoseCoordinates = transformKeypointsForRender(pose[0].keypoints, 1.5, 1.5);
                            drawKeyPoints(canvasPoseCoordinates);
                            drawSkeleton(canvasPoseCoordinates);
                        }

                        if(currentAnimation==="skeleton5Times"){
                            ctx.clearRect(0,0,canvas.width,canvas.height);
                            drawKeyPoints(canvasPoseCoordinates);
                            drawSkeleton(canvasPoseCoordinates);

                            canvasPoseCoordinates = transformKeypointsForRender(pose[0].keypoints, 0.5, 0.5);
                            drawKeyPoints(canvasPoseCoordinates);
                            drawSkeleton(canvasPoseCoordinates);

                            canvasPoseCoordinates = transformKeypointsForRender(pose[0].keypoints, 0.5, 0.5, canvas.width/2, canvas.height/2);
                            drawKeyPoints(canvasPoseCoordinates);
                            drawSkeleton(canvasPoseCoordinates);

                            canvasPoseCoordinates = transformKeypointsForRender(pose[0].keypoints, 0.5, 0.5, canvas.width/2);
                            drawKeyPoints(canvasPoseCoordinates);
                            drawSkeleton(canvasPoseCoordinates);

                            canvasPoseCoordinates = transformKeypointsForRender(pose[0].keypoints, 0.5, 0.5, 0, canvas.height/2);
                            drawKeyPoints(canvasPoseCoordinates);
                            drawSkeleton(canvasPoseCoordinates);
                        }

                        if(currentAnimation==="puppetsPlayer"){
                            ctx.clearRect(0,0,canvas.width,canvas.height);
                            drawPuppets(canvasPoseCoordinates);
                        }

                        if(currentAnimation==="spiderWeb"){
                            ctx.clearRect(0,0,canvas.width,canvas.height);
                            drawSpiderWeb(canvasPoseCoordinates);
                        }

                        if(currentAnimation === "img"){
                            ctx.clearRect(0,0,canvas.width,canvas.height);
                            drawImage(canvasPoseCoordinates);
                        }

                        if(currentAnimation === "particle"){
                            updateParticles(canvasPoseCoordinates);
                        }


                    }

                })
            })
        }

    }, 100);
}

/**
 * Transformer for the detector keypoints
 * This allows you to move and scale the keypoints before drawing them.
 *
 * @param keypoints original keypoints from detector
 * @param scaleX scale in x direction
 * @param scaleY scale in y direction
 * @param shiftX shift in x direction
 * @param shiftY shift in y direction
 * @returns {*[]} new array with transformed keypoints
 */
function transformKeypointsForRender(keypoints, scaleX=1, scaleY=1, shiftX=0, shiftY=0){
    let canvasCoordinates=[];
    for(let kp of keypoints){
        let { x, y, score } = kp;
        canvasCoordinates.push({x: scaleX * canvas.width * x/wVideo +shiftX, y: scaleY * canvas.height * y/hVideo + shiftY, score: score});
    }
    return canvasCoordinates;
}

/**
 * Event to disable the detection interval
 */
mainVideo.onpause = function (){
    clearInterval(intervalVideoPlayId);
}

/**
 * Helper function to style the canvas.
 * We have one canvas for 'normal' paintings and another for WebGL
 * @param tmpCanvas
 */
function setCanvasStyle(tmpCanvas) {
    tmpCanvas.style.position = "absolute";
    tmpCanvas.style.top = "0px";
    tmpCanvas.style.right = "0px";
    tmpCanvas.style.left = mainVideo.style.cssText.split("; ")[2].split(": ")[1]
    tmpCanvas.style.bottom = "0px";
}

/**
 * Check resize event for video.
 *
 * @type {ResizeObserver}
 */
const resizeObserver = new ResizeObserver(entries => {
    if(intervalVideoPlayId!==undefined){
        clearInterval(intervalVideoPlayId);
    }

    mainVideo = document.getElementsByClassName("html5-main-video")[0];
    setCanvasStyle(canvas);
    canvas.width=entries[0].target.clientWidth;
    canvas.height=entries[0].target.clientHeight;
    ctx.width=entries[0].target.clientWidth;
    ctx.height=entries[0].target.clientHeight;

    setCanvasStyle(canvasGL);
    canvasGL.width=entries[0].target.clientWidth;
    canvasGL.height=entries[0].target.clientHeight;
    webGLtx.width=entries[0].target.clientWidth;
    webGLtx.height=entries[0].target.clientHeight;

    initParticles();
    createDetectorInterval();
});


/**
 * Draw image at nose keypoint
 *
 * @param keypoints
 */
function drawImage(keypoints){
    if(keypoints!== undefined){
        let spaceBetweenRightLeftEye = keypoints[1].x - keypoints[2].x;
        let ratio = spaceBetweenRightLeftEye/imgArray[usedImageArrayIndex].pixelsBetweenEyes;
        ratio = ratio === 0 ? 1 : ratio;
        ctx.drawImage(img, keypoints[2].x-imgArray[usedImageArrayIndex].rightEyeToLeft*ratio, keypoints[2].y-imgArray[usedImageArrayIndex].rightEyeToTop*ratio, imgArray[usedImageArrayIndex].imgWidth*ratio, imgArray[usedImageArrayIndex].imgHeight*ratio);
    }

}

/**
 * Draw cicle at every keypoint from detector
 * @param keypoints
 */
function drawKeyPoints(keypoints){
    for(let keypoint of keypoints){
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 2*skeletonLineSize, 0, 2 * Math.PI);
        ctx.fillStyle = 'blue';
        ctx.fill();
    }
}

/**
 * Draw lines between all keypoints in the order
 * @param keypoints
 */
function drawSkeleton(keypoints){
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'red';
    ctx.lineWidth = skeletonLineSize;

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

/**
 * Draw lines from top to some keypoints
 * @param keypoints
 */
function drawPuppets(keypoints){
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;

    drawLine(keypoints[10].x, keypoints[10].y, keypoints[10].x, 0);
    drawLine(keypoints[9].x, keypoints[9].y, keypoints[9].x, 0);
    drawLine(keypoints[0].x, keypoints[0].y, keypoints[0].x, 0);
    drawLine(keypoints[6].x, keypoints[6].y, keypoints[6].x, 0);
    drawLine(keypoints[5].x, keypoints[5].y, keypoints[5].x, 0);
    drawLine(keypoints[15].x, keypoints[15].y, keypoints[15].x, 0);
    drawLine(keypoints[16].x, keypoints[16].y, keypoints[16].x, 0);

}

/**
 * Helper function to draw line
 * @param startX
 * @param startY
 * @param endX
 * @param endY
 */
function drawLine(startX, startY, endX, endY){
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

/**
 * Draw lines from the border to all keypoints from the detector
 * @param keypoints
 */
function drawSpiderWeb(keypoints){
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;

    drawLine(keypoints[0].x, keypoints[0].y, canvas.width/2, 0);
    drawLine(keypoints[1].x, keypoints[1].y, canvas.width/2 *(1+0.25), 0);
    drawLine(keypoints[3].x, keypoints[3].y, canvas.width/2 *(1+0.5), 0);

    drawLine(keypoints[2].x, keypoints[2].y, canvas.width/2 *(1-0.25), 0);
    drawLine(keypoints[4].x, keypoints[4].y, canvas.width/2 *(1-0.5), 0);

    drawLine(keypoints[6].x, keypoints[6].y, 0, canvas.height/2 *(1-0.5));
    drawLine(keypoints[8].x, keypoints[8].y, 0, canvas.height/2 *(1-0.25));

    drawLine(keypoints[9].x, keypoints[9].y, canvas.width, canvas.height/2);
    drawLine(keypoints[10].x, keypoints[10].y, 0, canvas.height/2);

    drawLine(keypoints[12].x, keypoints[12].y, 0, canvas.height/2 *(1+0.3));
    drawLine(keypoints[14].x, keypoints[14].y, 0, canvas.height/2 *(1+0.6));
    drawLine(keypoints[16].x, keypoints[16].y, 0, canvas.height/2 *(1+0.9));

    drawLine(keypoints[5].x, keypoints[5].y, canvas.width, canvas.height/2 *(1-0.5));
    drawLine(keypoints[7].x, keypoints[7].y, canvas.width, canvas.height/2 *(1-0.25));

    drawLine(keypoints[11].x, keypoints[11].y, canvas.width, canvas.height/2 *(1+0.3));
    drawLine(keypoints[13].x, keypoints[13].y, canvas.width, canvas.height/2 *(1+0.6));
    drawLine(keypoints[15].x, keypoints[15].y, canvas.width, canvas.height/2 *(1+0.9));

}

/**
 * Called from player popup to change visualization.
 */
document.addEventListener('changeVisualizationFromPlayer', function (e) {
    clearRandomSwitchInterval();
    setNewAnimation(e.detail.animationID)
});

/**
 * Called from player control icon to switch display of player popup
 */
document.addEventListener('displayPoseDreamPopup', function (e) {
    var playerPopup = document.getElementsByClassName('posedream-video-popup');
    if(showPlayerPopup){
        playerPopup[0].style.display = "none"
    }else{
        playerPopup[0].style.display = "block"
    }
    showPlayerPopup = !showPlayerPopup;
});

/**
 * Event to change the random interval from popup
 */
document.addEventListener('changeRandomInterval', function (e) {
    document.getElementById("randomButton").innerText="Random " + e.detail.interval +"s";
    randomSwitchSec= e.detail.interval;
});

function clearRandomSwitchInterval(){
    if(randomSwitchIntervalID){
        clearInterval(randomSwitchIntervalID);
    }
}
/**
 * Event to start the random animation
 */
document.addEventListener('runRandomAnimation', function (e) {

    clearRandomSwitchInterval();

    randomSwitchIntervalID = setInterval(function (){
        let rndNum = Math.floor(Math.random() * allAnimationIDs.length) + 1;
        setNewAnimation(allAnimationIDs[rndNum]);
    }, 1000*randomSwitchSec);
});

/**
 * Event to change the line size for all skeleton animations
 */
document.addEventListener('changeSizeSkeleton', function (e) {
    document.getElementById("changeSizeSkeletonText").innerText="Skeleton size " + e.detail.interval +"px";
    skeletonLineSize= e.detail.interval;
});

