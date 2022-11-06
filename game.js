"use strict";
import { updateGround, setupGround } from "./background.js";

// How to start game?
// start game by press of key
// How to get bird on screen?
// change the x axis to start position (middle of screen)
// How to get bird to move?
// use game loop to change the x axis up / down

let lastTime = null;
let speedScale = 1;
let deltaTime = 0;
const birdSpeed = 0.3;
const jumpDuration = 115;

let timeSinceLastJump = Number.POSITIVE_INFINITY;
let timeSinceLastPipe;

const holeHeight = 160;
const pipeWidth = 120;
const pipeInterval = 1500;
const pipeSpeed = 0.75;
let pipes = [];

const title = document.querySelector("[data-title]");
const bird = document.querySelector("[data-bird]");

function gameLoop(curTime) {
  // skipping first loop
  if (lastTime == null) {
    lastTime = curTime;
    window.requestAnimationFrame(gameLoop);
    return;
  }

  // time between animation frames
  const deltaTime = curTime - lastTime;

  updateBird(deltaTime);
  updatePipe(deltaTime);
  updateGround(deltaTime, speedScale);
  if (checkLose()) return gameStop();

  lastTime = curTime;
  window.requestAnimationFrame(gameLoop);
}

function startGame() {
  title.classList.add("hide");

  imgSrc("img/bird-01.png");
  setupBird();
  setupPipes();
  setupGround();
  lastTime = null;
  speedScale = 1;

  window.requestAnimationFrame(gameLoop);
}

function checkLose() {
  const birdRect = birdCurrentPosition();
  const insidePipe = getPipeRects().some((rect) => isCollision(birdRect, rect));
  const outsideWorld = birdRect.top < 0 || birdRect.bottom > window.innerHeight;

  return outsideWorld || insidePipe;
}

function updateBird(delta) {
  if (timeSinceLastJump < jumpDuration) {
    // setting the bird to jump up
    setBirdPosition(getBirdPosition() - birdSpeed * delta);
    updateSrc("img/bird-03.png");
  } else {
    // setting the bird to constantly move down
    setBirdPosition(getBirdPosition() + birdSpeed * delta);
    updateSrc("img/bird-05.png");
  }

  timeSinceLastJump += delta;
}

function updatePipe(delta) {
  timeSinceLastPipe += delta;

  if (timeSinceLastPipe > pipeInterval) {
    timeSinceLastPipe -= pipeInterval;
    createPipe();
  }
  pipes.forEach((pipe) => {
    if (pipe.left + pipeWidth < 0) pipe.remove();
    pipe.left = pipe.left - delta * pipeSpeed;
  });
}

function setBirdPosition(topPosition) {
  // setting the bird top position in css style to the current top position
  bird.style.setProperty("--bird-top", topPosition);
}

function getBirdPosition() {
  // get bird position as updating from gameloop - use parsefloat to convert to number
  return parseFloat(getComputedStyle(bird).getPropertyValue("--bird-top"));
}

function setupBird() {
  setBirdPosition(window.innerHeight / 2);
  document.removeEventListener("keydown", handleJump);
  document.addEventListener("keydown", handleJump);
}

function birdCurrentPosition() {
  // gets the bird top, left, bottom and right positions
  return bird.getBoundingClientRect();
}

function handleJump(e) {
  if (e.code !== "Space") return;

  timeSinceLastJump = 0;
}

function setupPipes() {
  document.documentElement.style.setProperty("--pipe-width", pipeWidth);
  document.documentElement.style.setProperty("--hole-height", holeHeight);
  pipes.forEach((pipe) => pipe.remove());
  timeSinceLastPipe = pipeInterval;
}

function createPipe() {
  const pipeEl = document.createElement("div");
  const topEl = createPipeSegment("top");
  const botEl = createPipeSegment("bottom");

  pipeEl.append(topEl);
  pipeEl.append(botEl);
  pipeEl.classList.add("pipe");
  pipeEl.style.setProperty(
    "--hole-top",
    randomNumberBetween(holeHeight * 1.5, window.innerHeight - holeHeight * 0.5)
  );

  const pipe = {
    get left() {
      return parseFloat(
        getComputedStyle(pipeEl).getPropertyValue("--pipe-left")
      );
    },
    set left(value) {
      pipeEl.style.setProperty("--pipe-left", value);
    },
    remove() {
      pipes = pipes.filter((p) => p !== pipe);
      pipeEl.remove();
    },
    rects() {
      return [topEl.getBoundingClientRect(), botEl.getBoundingClientRect()];
    },
  };
  pipe.left = window.innerWidth;
  document.body.append(pipeEl);
  pipes.push(pipe);
}

function getPipeRects() {
  return pipes.flatMap((pipe) => pipe.rects());
}

function createPipeSegment(position) {
  const segment = document.createElement("div");
  segment.classList.add("segment", position);
  return segment;
}

function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function isCollision(rect1, rect2) {
  return (
    rect1.left + 25 < rect2.right &&
    rect1.top + 25 < rect2.bottom &&
    rect1.right - 5 > rect2.left &&
    rect1.bottom - 5 > rect2.top
  );
}

function imgSrc(src) {
  if (bird.querySelector("img") !== null) return;
  let img = document.createElement("img");
  replaceImg(src);
  bird.appendChild(img);
}

function updateSrc(src) {
  replaceImg(src);
}

function gameStop() {
  setTimeout(() => {
    title.classList.remove("hide");
    document.addEventListener("keypress", startGame, { once: true });
  }, 500);
}

let images = ["bird-01.png", "bird-03.png", "bird-05.png"];

///loader
let bar_percentage = document.getElementById("bar_percentage");
let percentage_number = document.getElementById("percentage_number");
let loaderOverlay = document.getElementById("loaderOverlay");

let img_queue = new createjs.LoadQueue();
let completedProgress = 0;
img_queue.addEventListener("progress", (event) => {
  let progress_percentage = Math.floor(event.progress * 100);
  bar_percentage.style.width = progress_percentage + "%";
  percentage_number.innerHTML = progress_percentage + "%";
  console.log("progress " + Math.floor(event.progress * 100));
  if (progress_percentage === 100) preloaderComplete();
});

images.forEach((element) => {
  img_queue.loadFile(`img/${element}`);
});

function preloaderComplete() {
  //start game loop

  document.addEventListener("keypress", startGame, { once: true });
  // loaderOverlay.remove();
  setTimeout(() => {
    loaderOverlay.remove();
  }, 2000);
}

let loadedImages = new Map();

img_queue.addEventListener("fileload", (e) => {
  addImg(e.item.id, e.loader._rawResult);
});

export function replaceImg(id) {
  const bird = document.querySelector("[data-birdImg]");
  let urlCreator = window.URL || window.webkitURL;
  let imageUrl = urlCreator.createObjectURL(loadedImages.get(id));
  bird.src = imageUrl;
}

function addImg(id, loadedImg) {
  if (!loadedImages.has(id)) {
    loadedImages.set(id, loadedImg);
  }
}
