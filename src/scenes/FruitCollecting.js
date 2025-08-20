import BaseScene from "@engine/BaseScene.js";

export default class DrawingScene extends BaseScene {
  constructor(params) {
    super({ ...params, useColorIndicator: true });
    this.container = document.getElementById("gameContainer");
    this.cursorOffset = (img) => ({ x: 0, y: -img.clientHeight });

    this.handData = new Map();

    this.handleMove = this.handleMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.updateFrameCount = this.updateFrameCount.bind(this);
    this.lastPointingUpGesture = performance.now();
    this.currentScreen = "rules";
    this.sceneloaded = false;
  }

  async init() {
    await this.assets.loadImage("backButton", "/pictures/backButton.webp");
    await this.assets.loadImage("cursor", "/pictures/drawingGame/brush.webp");
    await this.assets.loadImage(
      "cursorTip",
      "/pictures/drawingGame/brushTip.webp"
    );

    this.styleEl = this.loadStyle("/css/Drawing.css");

    this.calculateLineWidth();

    this.render();

    this.input.on("move", this.handleMove);
    this.input.on("click", this.handleClick);
    this.input.on("frameCount", this.updateFrameCount);
  }

  update(dt) {}

  render() {
    if (this.lastRenderedScreen === this.currentScreen) return;
    this.lastRenderedScreen = this.currentScreen;

    if (this.sceneEl) this.sceneEl.remove();

    this.sceneEl = document.createElement("div");
    this.sceneEl.classList.add("container");
    this.container.innerHTML = "";

    switch (this.currentScreen) {
      case "rules":
        this.renderRulesScreen();
        break;
      case "game":
        this.resetHands();
        this.renderGameplayScreen();
        break;
    }
  }

  async renderRulesScreen() {
    await this.waitForImage("backButton");

    this.sceneEl.classList.add("drawing-container");
    this.sceneEl.classList.add("drawingInstructions");

    this.sceneEl.innerHTML = `
      <div class="firstLayer layer">
        <button class="btn" id="btnBack"><img src="${
          this.assets.images.get("backButton").src
        }" height="100%"/></button>
      </div>
      <div class="secondLayerInstructions layer">
        <h1 class="textStyle instructionsHeader">Upute</h1>
        <p class="textStyle instructionsTextBlock">
          Crtaj po zaslonu, promijeni boju kista i probudi svoju kreativnost uz jednostavne pokrete ruku. 
        </p>
        <h1 class="textStyle instructionsTextBlock">☝️ - crtaj</h1>
        <h1 class="textStyle instructionsTextBlock">✊ - odaberi</h1>
      </div>
      <div class="thirdLayerInstructions layer">
        <button class="btnSecondLayer textStyle btn" id="btnPlayGame">Igraj</button>
      </div>
    `;

    this.container.appendChild(this.sceneEl);

    this.cursorContainer = this.sceneEl;

    this.btnBack = this.sceneEl.querySelector("#btnBack");
    this.btnPlayGame = this.sceneEl.querySelector("#btnPlayGame");

    this.btnBack.addEventListener("click", () =>
      this.manager.switch("StartMenu")
    );
    this.btnPlayGame.addEventListener("click", () => {
      this.currentScreen = "game";
      this.render();
    });

    this.sceneloaded = true;
  }

  renderGameplayScreen() {
    this.sceneEl.classList.add("drawing-container");

    this.sceneEl.innerHTML += `
        <div class="firstLayer layer">
            <button class="btn" id="btnBack"><img src="/pictures/backButton.png" height="100%" /></button>
            <p class="textStyle lbl" id="lblScoreView">Bodovi: 0</p>
        </div>
        <div class="secondLayer layer">
            <p class="textStyle lbl" id="lblCatchStars">Skupi voće</p>
            <canvas class="output_canvas"></canvas>
            <p class="textStyle lbl" id="lblGameOver"><span style="font-size: 16em;"> Kraj! </span> <br> <span style="font-size: 8em;"> Probaj ponovo! </span></p>
        </div>
        <div class="thirdLayer layer">
            <button class="textStyle btn btnGameButtons" id="btnStartGame">Nova igra</button>
        </div>
    `;

    this.container.appendChild(this.sceneEl);

    this.cursorContainer = this.sceneEl;

    this.canvasElement = this.sceneEl.querySelector(".output_canvas");
    this.canvasCtx = this.canvasElement.getContext("2d");
    this.btnBack = this.sceneEl.querySelector("#btnBack");
    this.btnStartGame = this.sceneEl.querySelector("#btnStartGame");

    this.btnBack.addEventListener("click", () =>
      this.manager.switch("StartMenu")
    );
    this.btnStartGame.addEventListener("click", () =>
      this.canvasCtx.clearRect(
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      )
    );

    this.resize();
    window.addEventListener("resize", this.resize.bind(this));

    this.sceneloaded = true;
  }

  calculateLineWidth() {
    this.baseLineWidth = window.innerWidth * 0.04;
  }

  async destroy() {
    this.input.off("move", this.handleMove);
    this.input.off("click", this.handleClick);
    this.input.off("frameCount", this.updateFrameCount);
    this.removeStyle(this.styleEl);
    window.removeEventListener("resize", this.resize.bind(this));
    this.container.innerHTML = "";
    await super.destroy();
    this.sceneEl.remove();
  }

  resize() {
    this.canvasElement.width = this.container.clientWidth * 0.96;
    this.canvasElement.height = this.container.clientHeight * 0.7;
    this.calculateLineWidth();
  }

  updateFrameCount() {
    super.updateFrameCount();
  }

  findHandFromCursor(x, y) {
    let closest = null;
    let closestDist = Infinity;
    this.handData.forEach((data, id) => {
      const dist = Math.hypot((data.currX || 0) - x, (data.currY || 0) - y);
      if (dist < closestDist) {
        closestDist = dist;
        closest = id;
      }
    });
    return closest;
  }

  setHandColor(id, color) {
    if (id === undefined || id === null) return;
    const data = this.handData.get(id) || {};
    data.color = color;
    this.handData.set(id, data);
    const cursor = this.handCursors.get(id);

    const img = cursor.indicator;

    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.drawImage(img, 0, 0);
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = newColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      img.src = canvas.toDataURL();
    };

    if (cursor) {
      if (cursor.indicator) {
        cursor.indicator.style.backgroundColor = color;
      }
    }
  }

  calculateRGBColor(ratio) {
    let newColor, bgColor;
    if (ratio <= 1 / 6) {
      const g = Math.round(ratio * 6 * 255);
      newColor = `rgb(255, ${g}, 0)`;
      bgColor = `rgba(255, ${g}, 0, 0.3)`;
    } else if (ratio <= 2 / 6) {
      const r = 255 - Math.round((ratio - 1 / 6) * 6 * 255);
      newColor = `rgb(${r}, 255, 0)`;
      bgColor = `rgba(${r}, 255, 0, 0.3)`;
    } else if (ratio <= 3 / 6) {
      const b = Math.round((ratio - 2 / 6) * 6 * 255);
      newColor = `rgb(0, 255, ${b})`;
      bgColor = `rgba(0, 255, ${b}, 0.3)`;
    } else if (ratio <= 4 / 6) {
      const g = 255 - Math.round((ratio - 3 / 6) * 6 * 255);
      newColor = `rgb(0, ${g}, 255)`;
      bgColor = `rgba(0, ${g}, 255, 0.3)`;
    } else if (ratio <= 5 / 6) {
      const r = Math.round((ratio - 4 / 6) * 6 * 255);
      newColor = `rgb(${r}, 0, 255)`;
      bgColor = `rgba(${r}, 0, 255, 0.3)`;
    } else {
      const b = 255 - Math.round((ratio - 5 / 6) * 6 * 255);
      newColor = `rgb(255, 0, ${b})`;
      bgColor = `rgba(255, 0, ${b}, 0.3)`;
    }
    return { newColor, bgColor };
  }

  handleMove({ x, y, i, gesture, thickness }) {
    if (!this.sceneloaded) return;

    this.updateCursor(x, y, i);
    const smooth = this.handSmoothed.get(i) || { x, y };
    const screenX = smooth.x * window.innerWidth;
    const screenY = smooth.y * window.innerHeight;
    if (this.canvasElement === undefined) return;
    const xPx = screenX - this.canvasElement.offsetLeft;
    const yPx = screenY - this.canvasElement.offsetTop;

    let data = this.handData.get(i);
    if (!data) {
      data = {
        drawing: false,
        prevX: xPx,
        prevY: yPx,
        color: "black",
        screenX,
        screenY,
      };
      this.handData.set(i, data);
    }

    if (
      gesture === "Pointing_Up" ||
      (gesture !== "Pointing_Up" &&
        performance.now() - this.lastPointingUpGesture < 50)
    ) {
      if (data.drawing) {
        const dx = xPx - data.prevX;
        const dy = yPx - data.prevY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const steps = Math.ceil(dist / 2);
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const ix = data.prevX + dx * t;
          const iy = data.prevY + dy * t;

          this.canvasCtx.beginPath();
          this.canvasCtx.arc(
            ix,
            iy,
            (this.baseLineWidth * thickness) / 2,
            0,
            2 * Math.PI
          );
          this.canvasCtx.fillStyle = data.color;
          this.canvasCtx.fill();
          this.canvasCtx.closePath();
        }
      }

      data.drawing = true;
      data.prevX = xPx;
      data.prevY = yPx;

      if (gesture === "Pointing_Up")
        this.lastPointingUpGesture = performance.now();
    } else if (gesture === "None") {
    } else {
      data.drawing = false;
    }

    data.currX = xPx;
    data.currY = yPx;
    data.screenX = screenX;
    data.screenY = screenY;
  }

  removeCursor(id) {
    super.removeCursor(id);
    this.handData.delete(id);
  }

  handleClick({ x, y }) {
    const px = x * window.innerWidth;
    const py = y * window.innerHeight;
    var el = document.elementFromPoint(px, py);
    if (!el) return;

    if (!el.id && el.parentElement) el = el.parentElement;

    const handId = this.findHandFromCursor(px, py);

    switch (el.id) {
      case "btnBack":
        this.manager.switch("StartMenu");
        break;
      case "btnClearBackground":
        this.canvasCtx.clearRect(
          0,
          0,
          this.canvasElement.width,
          this.canvasElement.height
        );
        break;
      case "btnRGBPicker":
        if (handId) {
          const rect = el.getBoundingClientRect();
          const ratio = (px - rect.left) / rect.width;
          const { newColor, bgColor } = this.calculateRGBColor(ratio);
          this.setHandColor(handId, newColor, bgColor);
        }
        break;
      case "btnPlayGame":
        this.currentScreen = "game";
        this.render();
        break;
      default:
        if (this.colorButtons === undefined) break;
        const btn = this.colorButtons[el.id];
        if (btn && handId) {
          this.setHandColor(handId, btn.color, btn.bg);
        }
        if (el.tagName === "BUTTON" && !btn) el.click();
    }
  }
}
