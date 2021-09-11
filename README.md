![Logo](assets/logo128.png)

YouTube pose dream is a Chrome AI extension to visualize videos.

When you're old enough, you may remember Winamp. There was the possibility to visualize music. However, this extension makes similar with videos. The human pose in the video is used as input for the visualization.

Pose estimation is done with [TensorFlow.js](https://www.tensorflow.org/js)  
Particle animation is done with [Proton](https://github.com/drawcall/Proton)  

This project is a [Google Chrome](https://www.google.com/intl/en/chrome/) browser extension. That's why you need this browser to try it out.

# Table of Contents
1. [Features](#Features)
2. [Installation](#Installation)
3. [Build](#Build)
4. [Further development](#Further-development)
5. [License](#License)

<a name="Features"></a>
# Features 

After the installation you can select the following visualizations via the extension menu.  
You can change the visualization while the video is playing.  
![popup menu](assets/popup.png)


The video [Fatboy Slim ft. Bootsy Collins - Weapon Of Choice Official 4k Video](https://www.youtube.com/watch?v=wCDIYvFmgW8) was used for all screenshots.

![original image](assets/original.png)

## Show Pose detection
### Skeleton
This is TensorFlow.js in action.  
[MoveNet](https://blog.tensorflow.org/2021/05/next-generation-pose-detection-with-movenet-and-tensorflowjs.html) is used for the detection.
![pose detection](assets/skeleton.png)

## Replace head with image
The eyes are used as a reference for displaying the image.  

### Cat
![cat face](assets/cat.png)

### Smiley
![smily face](assets/smiley.png)

### Sun
![sun as face](assets/sun.png)

### Monkey
![monkey face](assets/monkey.png)


## Show particle animation

### Hand power balls
Every hand gets one energy ball.  
![hand power balls](assets/twoHandPowerBall.png)

### Two head balls
Two energy balls circle around the head.  
![show ](assets/twoHeadBalls.png)

### Right hand line
Only the right hand gets a particle animation.  
![show ](assets/rightHandLine.png)

### Nose gravity
A gravitational field is created around the nose.  
![show ](assets/noseGravity.png)

### Nose supernova
Supernovas are constantly exploding on the nose.  
![show ](assets/noseSupernova.png)

### Hands track from border
The yellow ray is connected to the right hand.  
The red ray is connected to the left hand.  
If the hands are too far away from the edge, the connection is interrupted.  
![show ](assets/handTrackFromBorder.png)

<a name="Installation"></a>
# Installation
## Download this repository
```shell
git clone https://github.com/deep2universe/ChromePoseDream.git
```
## Open Chrome extensions
Open this [URL](chrome://extensions):
```
chrome://extensions
```
## Enable developer mode
In the upper right corner you have to activate the developer mode.  
![developer mode](assets/developerMode.png)
## Load extension
Click this button to load the extension.  
Then select the ```dist``` Folder from this repository.  
![load](assets/loadExtension.png)

## Check extension installation
You should now see the following entry.  
![extension](assets/extension.png)

## Check Chrome settings
Got to this [URL](chrome://settings/accessibility)
```
chrome://settings/accessibility
```
In the System settings make sure to enable this:    
![hardware chrome settings](assets/hardware.png)

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
```shell
# install dependencies
npm install

# build dist folder
npm run build
```


<a name="Further-development"></a>
# Further development

The following should still be implemented.
- Support for other video platforms (e.g. Vimeo)
- Support for multi-pose detection
- Internationalization
- Export of the pose detection keypoints for other applications
- Use pose detection keypoints to feed GAN or VAE model and display result in webpage
- After the video finishes, the drawing canvas will not be removed. Therefore, the suggested next videos cannot be clicked in the video window. But you can click the right Video suggestions.
- It should be possible to deactivate the extension. Currently it has to be uninstalled.
- Fill settings page with content (default animation, disable extension, language settings etc.)
- Publish to chrome extension store
- Check size changes during video playback.
- Enlarge the drawing canvas area over the whole video and move the video control bar down.
- Clean up code


If you want to support, pull requests are always welcome.  
If you find any bugs please report them.

<a name="License"></a>
# License
[Apache License 2.0](https://opensource.org/licenses/Apache-2.0)




