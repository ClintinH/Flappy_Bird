import {
  getCustomProperty,
  incrementCustomProperty,
  setCustomProperty,
} from "./updateCustomProperty.js";

const speed = 0.05;
const backgroundEl = document.querySelectorAll("[data-background]");

console.log(backgroundEl);

export function setupGround() {
  setCustomProperty(backgroundEl[0], "--left", 0);
  setCustomProperty(backgroundEl[1], "--left", 100);
}

export function updateGround(delta, speedscale) {
  backgroundEl.forEach((background) => {
    incrementCustomProperty(
      background,
      "--left",
      delta * speedscale * speed * -1
    );

    if (getCustomProperty(background, "--left") <= -100) {
      incrementCustomProperty(background, "--left", 200);
    }
  });
}

// const background = document.createElement("div");

// function createBackground() {
//   background.style.width = "1920px";
//   background.style.height = "1050px";
//   // background.style.backgroundColor = "black";
//   background.style.backgroundImage = "img\background.svg";

//   document.body.appendChild(background);
// }
