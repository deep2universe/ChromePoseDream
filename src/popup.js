/**
 * Add EventListener to links from popup.html and send message to content.js
 */

// ---  skeleton animation ---
document.getElementById("skeleton").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "skeleton"});
    });
});
document.getElementById("puppetsPlayer").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "puppetsPlayer"});
    });
});
document.getElementById("spiderWeb").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "spiderWeb"});
    });
});

// -- img animations ---
document.getElementById("imgCat").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "imgCat"});
    });
});
document.getElementById("imgSmiley").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "imgSmiley"});
    });
});
document.getElementById("imgSun").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "imgSun"});
    });
});
document.getElementById("imgMonkey").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "imgMonkey"});
    });
});
document.getElementById("imgAnonymous").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "imgAnonymous"});
    });
});

// --- particles animation ---
document.getElementById("particleHandsBall").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "particleHandsBall"});
    });
});
document.getElementById("particle2BalHead").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "particle2BalHead"});
    });
});
document.getElementById("particleRightHandLine").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "particleRightHandLine"});
    });
});
document.getElementById("particleNoseGravity").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "particleNoseGravity"});
    });
});
document.getElementById("particleNoseSupernova").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "particleNoseSupernova"});
    });
});
document.getElementById("particleHandsTrackFromBorder").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "particleHandsTrackFromBorder"});
    });
});
document.getElementById("particleUpperBodyGlow").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "particleUpperBodyGlow"});
    });
});
document.getElementById("particleGlowPainting").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "particleGlowPainting"});
    });
});
document.getElementById("particlePainting").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "particlePainting"});
    });
});
document.getElementById("particlePaintRandomDrift").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "particlePaintRandomDrift"});
    });
});
document.getElementById("particleCometThrower").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "particleCometThrower"});
    });
});
document.getElementById("particleBodyGlow").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "particleBodyGlow"});
    });
});
document.getElementById("particleBurningMan").addEventListener("click", async ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {animation: "particleBurningMan"});
    });
});