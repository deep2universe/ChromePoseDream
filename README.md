![Logo](assets/logo128.png)

YouTube pose dream is a Chrome AI extension to visualize videos.

When you're old enough, you may remember [Winamp](http://www.winamp.com/). There was the possibility to visualize music.   
However, this extension makes similar with videos. The human pose in the video is used as input for the visualization.  
In the process, the existing video is transformed into a psychedelic work of art.  

Pose estimation is done with [TensorFlow.js](https://www.tensorflow.org/js)  
Particle animation is done with [Proton](https://github.com/drawcall/Proton)  

This project is a [Google Chrome](https://www.google.com/intl/en/chrome/) browser extension. That's why you need this browser to try it out.

# Table of Contents
1. [How it works](#HowItWorks)
2. [Features](#Features)
   1. [Show Pose detection](#showPoseDetection)
   2. [Replace head with image](#img)
      1. [Cat](#cat)
      2. [Smiley](#smiley)
      3. [Sun](#sun)
      4. [Monkey](#monkey)
   3. [Show particle animation](#particle)
      1. [Hand power balls](#handPowerBalls)
      2. [Two head balls](#twoHeadBalls)
      3. [Right hand line](#rightHadnLine)
      4. [Nose gravity](#NoseGravity)
      5. [Nose supernova](#noseSupernova)
      6. [Hands track from border](#handsTrackFromBorder)
      7. [Upper body glow](#upperBodyGlow)
      8. [Glow painting](#glowPainting)
      9. [Particle painting](#particlePainting)
      10. [Particle painting with random drift](#particlePaintingDrift)
3. [Installation](#Installation)
   1. [Download this repository](#clone)
   2. [Open Chrome extensions](#chromeExtension)
   3. [Enable developer mode](#enableDevMode)
   4. [Load extension](#loadExtension)
   5. [Check extension installation](#checkExtension)
   6. [Check Chrome settings](#checkChromeSettings)
   7. [Pin the extension](#pin)
4. [Usage](#Usage) 
5. [Build](#Build)
6. [Further development](#Further-development)
7. [License](#License)

<a name="Features"></a>
# How it works.
The Chrome extension becomes active, when you watch a YouTube video.  
![howItWorks](assets/howItWorks.png)


The extension use MoveNet as model.  
Visual representation of the keypoints:  
![keypoints](assets/keypoints.png)  
[Image from tensorflow.js pose-detection model](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection#coco-keypoints-used-in-movenet-and-posenet)  
We use these keypoints to place animations or static content in the video.


<a name="Features"></a>
# Features 

After the installation you can select the following visualizations via the extension menu.  
You can change the visualization while the video is playing.  
![popup menu](assets/popup.png)


The video [Fatboy Slim ft. Bootsy Collins - Weapon Of Choice Official 4k Video](https://www.youtube.com/watch?v=wCDIYvFmgW8) was used for all screenshots.

![original image](assets/original.png)

<a name="showPoseDetection"></a>
## Show Pose detection
### Skeleton
This is TensorFlow.js in action.  
[MoveNet](https://blog.tensorflow.org/2021/05/next-generation-pose-detection-with-movenet-and-tensorflowjs.html) is used for the detection.
![pose detection](assets/skeleton.png)

<a name="img"></a>
## Replace head with image
The eyes are used as a reference for displaying the image.  

<a name="cat"></a>
### Cat
![cat face](assets/cat.png)

<a name="smiley"></a>
### Smiley
![smiley face](assets/smiley.png)

<a name="sun"></a>
### Sun
![sun as face](assets/sun.png)

<a name="monkey"></a>
### Monkey
![monkey face](assets/monkey.png)

<a name="particle"></a>
## Show particle animation

<a name="handPowerBalls"></a>
### Hand power balls
Every hand gets one energy ball.  
![hand power balls](assets/twoHandPowerBall.png)

<a name="twoHeadBalls"></a>
### Two head balls
Two energy balls circle around the head.  
![two head balls](assets/twoHeadBalls.png)

<a name="rightHadnLine"></a>
### Right hand line
Only the right hand gets a particle animation.  
![Right hand line](assets/rightHandLine.png)

<a name="NoseGravity"></a>
### Nose gravity
A gravitational field is created around the nose.  
![Nose gravity](assets/noseGravity.png)

<a name="noseSupernova"></a>
### Nose supernova
Supernovas are constantly exploding on the nose.  
![Nose supernova](assets/noseSupernova.png)

<a name="handsTrackFromBorder"></a>
### Hands track from border
The yellow ray is connected to the right hand.  
The red ray is connected to the left hand.  
If the hands are too far away from the edge, the connection is interrupted.  
![Hands track from border](assets/handTrackFromBorder.png)

<a name="upperBodyGlow"></a>
### Upper body glow
![upper body glow](assets/upperBodyGlow.png)

<a name="glowPainting"></a>
### Glow painting
![Glow painting](assets/glowPainting.png)

<a name="particlePainting"></a>
### Particle painting
![Particle painting](assets/particlePainting.png)

<a name="particlePaintingDrift"></a>
### Particle painting with random drift
![Particle painting with random drift](assets/particlePaintingRandomDrift.png)

<a name="Installation"></a>
# Installation
<a name="clone"></a>
## Download this repository
```shell
git clone https://github.com/deep2universe/ChromePoseDream.git
```
<a name="chromeExtension"></a>
## Open Chrome extensions
Open this [URL](chrome://extensions):
```
chrome://extensions
```
<a name="enableDevMode"></a>
## Enable developer mode
In the upper right corner you have to activate the developer mode.  
![developer mode](assets/developerMode.png)
<a name="loadExtension"></a>
## Load extension
Click this button to load the extension.  
Then select the ```dist``` Folder from this repository.  
![load](assets/loadExtension.png)

<a name="checkExtension"></a>
## Check extension installation
You should now see the following entry.  
![extension](assets/extension.png)

<a name="checkChromeSettings"></a>
## Check Chrome settings
Go to this [URL](chrome://settings/accessibility)
```
chrome://settings/accessibility
```
In the System settings make sure to enable this:    
![hardware chrome settings](assets/hardware.png)

<a name="pin"></a>
## Pin the extension
In the upper right corner click this to pin the extension.  
![pin](assets/pin.png)

<a name="Usage"></a>
# Usage
Open [YouTube](https://www.youtube.com/)

Watch a video and have fun.

<a name="Build"></a>
# Build
All the code is in the src directory.  
You need [PARCEL](https://parceljs.org/) for the build.
```shell
# install dependencies
npm install

# install PARCEL
npm install -g parcel-bundler

# build dist folder
npm run build
```


<a name="Further-development"></a>
# Further development

The following is still on the TODO list:
- Support for other video platforms (e.g. Vimeo)
- Support for multi-pose detection.
- Internationalization
- Export of the pose detection keypoints for other applications.
- Use pose detection keypoints to feed GAN or VAE model and display result in webpage.
- After the video finishes, the drawing canvas will not be removed. Therefore, the suggested next videos cannot be clicked in the video window. But you can click the right Video suggestions.
- It should be possible to deactivate the extension. Currently, it has to be uninstalled.
- Fill settings page with content (default animation, disable extension, language settings etc.)
- Publish to Chrome extension store.
- Check size changes during video playback.
- Enlarge the drawing canvas area over the whole video and move the video control bar down.
- Clean up code.
- Add support for [three.proton](https://github.com/drawcall/three.proton/) to enable 3D particles.
- Check content.js video event listener, - sometimes you have to reload the page to start pose dream.
- Add more particle animations.

This is an example of how this project setup could be extended in the future.  
Currently, the focus of the project is on exploring the existing architectural possibilities. 
![workflowExtended](assets/workflowExtended.png)
With the help of artificial intelligence, many other enhancements are feasible. For example, the acoustic content of the video is not viewed and could also be used.

If you want to support, pull requests are always welcome.  
If you find any bugs please report them.

<a name="License"></a>
# License
[Apache License 2.0](https://opensource.org/licenses/Apache-2.0)




