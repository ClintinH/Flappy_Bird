"use strict";

let lastTime = null;
let deltaTime = 0;
let timeSinceLastJump = Number.POSITIVE_INFINITY;
let timeSinceLastPipe;

const title = document.querySelector("[data-title]");
const birdEl = document.querySelector("[data-bird]");
const background = document.createElement("div");

document.addEventListener("keypress", startGame, { once: true });

function gameLoop(curTime) {
  // skipping first loop
  if (lastTime == null) {
    lastTime = curTime;
    window.requestAnimationFrame(gameLoop);
    return;
  }
  // time between animation frames
  const deltaTime = curTime - lastTime;

  bird.update(deltaTime);
  pipe.update(deltaTime);
  if (checkLose()) return gameStop();

  lastTime = curTime;
  window.requestAnimationFrame(gameLoop);
}

function startGame() {
  title.classList.add("hide");

  createBackground();
  imgSrc("./img/bird-01.png");
  bird.setup();
  pipe.setup();
  lastTime = null;

  window.requestAnimationFrame(gameLoop);
}

function createBackground() {
  background.style.width = "1920px";
  background.style.height = "1050px";
  background.style.backgroundColor = "black";

  document.body.appendChild(background);
}

function imgSrc(src) {
  if (birdEl.querySelector("img") !== null) return;
  let img = document.createElement("img");
  img.src = src;
  birdEl.appendChild(img);
}

class bird {
  constructor(speed, jumpDuration) {
    this.speed = speed;
    this.jumpDuration = jumpDuration;
  }

  update(delta) {
    if (timeSinceLastJump < jumpDuration) {
      // setting the bird to jump up
      this.setPosition(this.getPosition() - birdSpeed * delta);
      this.updateSrc("./img/bird-03.png");
    } else {
      // setting the bird to constantly move down
      this.setPosition(this.getPosition() + birdSpeed * delta);
      this.updateSrc("./img/bird-05.png");
    }
    timeSinceLastJump += delta;
  }

  updateSrc(src) {
    let img = bird.querySelector("img");
    img.src = src;
  }

  setPosition(topPosition) {
    // setting the bird top position in css style to the current top position
    birdEl.style.setProperty("--bird-top", topPosition);
  }

  getPosition() {
    // get bird position as updating from gameloop - use parsefloat to convert to number
    return parseFloat(getComputedStyle(birdEl).getPropertyValue("--bird-top"));
  }

  setup() {
    this.setPosition(window.innerHeight / 2);
    document.removeEventListener("keydown", handleJump);
    document.addEventListener("keydown", handleJump);
  }

  currentPosition() {
    // gets the bird top, left, bottom and right positions
    return birdEl.getBoundingClientRect();
  }

  handleJump(e) {
    if (e.code !== "Space") return;
    timeSinceLastJump = 0;
  }
}

const flappyBird = new bird(0.3, 115);

let pipeEl;

class pipe {
  constructor() {
    this.holeHeight = 160;
    this.pipeWidth = 120;
    this.pipeInterval = 1500;
    this.pipeSpeed = 0.75;

    this.pipeEl = pipeEl;
    this.pipes = [];

    this.pipeLeftPostion();
  }

  getRects() {
    return pipes.flatMap((pipe) => this.pipeRects());
  }

  createSegment(position) {
    const segment = document.createElement("div");
    segment.classList.add("segment", position);
    return segment;
  }

  update(delta) {
    timeSinceLastPipe += delta;

    if (timeSinceLastPipe > pipeInterval) {
      timeSinceLastPipe -= pipeInterval;
      this.createPipe();
    }
    pipes.forEach((pipe) => {
      if (pipe.left + pipeWidth < 0) pipe.remove();
      pipe.left = pipe.left - delta * pipeSpeed;
    });
  }

  setup() {
    document.documentElement.style.setProperty("--pipe-width", pipeWidth);
    document.documentElement.style.setProperty("--hole-height", holeHeight);
    pipes.forEach((pipe) => this.removePipes());
    timeSinceLastPipe = pipeInterval;
  }

  createPipe() {
    // const pipeEl = document.createElement("div");
    this.pipeEl = document.createElement("div");
    const topEl = this.createSegment("top");
    const botEl = this.createSegment("bottom");

    this.pipeEl.append(topEl);
    this.pipeEl.append(botEl);
    this.pipeEl.classList.add("pipe");
    this.pipeEl.style.setProperty(
      "--hole-top",
      this.randomNumberBetween(
        holeHeight * 1.5,
        window.innerHeight - holeHeight * 0.5
      )
    );
  }

  randomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  getPipeLeft() {
    return parseFloat(
      getComputedStyle(this.pipeEl).getPropertyValue("--pipe-left")
    );
  }

  setPipeLeft(value) {
    this.pipeEl.style.setProperty("--pipe-left", value);
  }

  removePipes() {
    pipes = pipes.filter((p) => p !== pipe);
    this.pipeEl.removePipes();
  }

  pipeRects() {
    return [topEl.getBoundingClientRect(), botEl.getBoundingClientRect()];
  }

  pipeLeftPostion() {
    this.setPipeLeft(window.innerWidth);
    document.body.append(this.pipeEl);
    this.pipes.push(pipe);
  }
}

const collisionPipe = new pipe();

function isCollision(rect1, rect2) {
  return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top
  );
}

function checkLose() {
  const birdRect = bird.currentPosition();
  const insidePipe = pipe
    .getRects()
    .some((rect) => isCollision(birdRect, rect));
  const outsideWorld = birdRect.top < 0 || birdRect.bottom > window.innerHeight;

  return outsideWorld || insidePipe;
}

function gameStop() {
  setTimeout(() => {
    title.classList.remove("hide");
    document.addEventListener("keypress", startGame, { once: true });
  }, 500);
  background.style.backgroundColor = "white";
}
