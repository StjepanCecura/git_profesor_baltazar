import BaseScene from "@engine/BaseScene.js";

export default class SpojiCudoScene extends BaseScene {
  constructor(params) {
    super(params);
    this.container = document.getElementById("gameContainer");

    this.COLS = 7;
    this.ROWS = 6;
    this.CELL = 100;

    this.board = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
    this.selectedCol = 3;
    this.gameOver = false;

    this.lastMoveTime = 0;
    this.lastFistTime = 0;
    this.MOVE_DELAY = 800;
    this.FIST_DELAY = 1100;

    this.canvas = null;
    this.ctx = null;
    this.messageHeader = null;

    this.video = null;
    this.hands = null;
    this.camera = null;

    this.cursorEl = null;
  }

  async init() {
    document.body.style.backgroundImage = "url('pictures/spojiCudoGame/Background.png')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.margin = "0";
    document.body.style.height = "100vh";
    document.body.style.width = "100vw";
    document.body.style.overflow = "hidden";

    this.sceneEl = document.createElement("div");
    this.sceneEl.classList.add("container");

    const scale = 1.6;
    const width = this.CELL * this.COLS * scale;
    const height = (this.CELL * this.ROWS + 100) * scale;

    this.sceneEl.style.position = "absolute";
    this.sceneEl.style.width = width + "px";
    this.sceneEl.style.height = height + "px";
    this.sceneEl.style.top = "50%";
    this.sceneEl.style.left = "50%";
    this.sceneEl.style.transform = "translate(-50%, -50%)";
    this.sceneEl.style.border = "5px solid white";
    this.sceneEl.style.backgroundColor = "transparent";
    this.sceneEl.style.boxSizing = "border-box";

    this.container.appendChild(this.sceneEl);

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.CELL * this.COLS;
    this.canvas.height = this.CELL * this.ROWS;

    this.canvas.style.width = (this.canvas.width * scale) + "px";
    this.canvas.style.height = (this.canvas.height * scale) + "px";

    this.sceneEl.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    this.messageHeader = document.createElement("h2");
    this.messageHeader.style.color = "blue";
    this.messageHeader.style.fontSize = (40 * scale) + "px";
    this.messageHeader.style.marginTop = (10 * scale) + "px";
    this.messageHeader.style.textAlign = "center";
    this.sceneEl.appendChild(this.messageHeader);

    this.drawBoard();

    this.video = document.createElement("video");
    this.video.setAttribute("playsinline", "");
    this.video.style.display = "none";
    this.sceneEl.appendChild(this.video);

    this.hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    this.hands.onResults((results) => {
      if (results.multiHandLandmarks?.length > 0) {
        const lm = results.multiHandLandmarks[0];
        const fingers = [
          [8, 5],
          [12, 9], 
          [16, 13],
          [20, 17],
        ];
        const isFist = fingers.every(([tip, base]) => lm[tip].y > lm[base].y);
        const handX = lm[9].x;

        if (isFist) {
          this.handleFistGesture();
        } else {
          if (!this.gameOver) {
            if (handX < 0.4) this.moveSelection("left");
            else if (handX > 0.6) this.moveSelection("right");
          }
        }
        this.moveCursorWithFinger(lm);
      }
    });

    this.camera = new window.Camera(this.video, {
      onFrame: async () => {
        await this.hands.send({ image: this.video });
      },
      width: 640,
      height: 480,
    });
    await this.camera.start();

    this.setFavicon("pictures/spojiCudoGame/icon.png");

    this.createCustomCursor();
    this.createBackButton();

    this.loop();
  }

  setFavicon(iconURL) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.getElementsByTagName("head")[0].appendChild(link);
    }
    link.href = iconURL;
  }

  drawBoard() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        this.ctx.beginPath();
        this.ctx.arc(
          c * this.CELL + this.CELL / 2,
          r * this.CELL + this.CELL / 2,
          this.CELL / 2 - 10,
          0,
          Math.PI * 2
        );
        if (this.board[r][c] === 1) this.ctx.fillStyle = "green";
        else if (this.board[r][c] === 2) this.ctx.fillStyle = "yellow";
        else this.ctx.fillStyle = "white";
        this.ctx.fill();
      }
    }
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 5;
    this.ctx.strokeRect(this.selectedCol * this.CELL, 0, this.CELL, this.canvas.height);
  }

  dropDisk(col, player) {
    for (let r = this.ROWS - 1; r >= 0; r--) {
      if (this.board[r][col] === 0) {
        this.board[r][col] = player;
        return r;
      }
    }
    return -1;
  }

  checkWin(player) {
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        if (
          (c + 3 < this.COLS &&
            this.board[r][c] === player &&
            this.board[r][c + 1] === player &&
            this.board[r][c + 2] === player &&
            this.board[r][c + 3] === player) ||
          (r + 3 < this.ROWS &&
            this.board[r][c] === player &&
            this.board[r + 1][c] === player &&
            this.board[r + 2][c] === player &&
            this.board[r + 3][c] === player) ||
          (r + 3 < this.ROWS &&
            c + 3 < this.COLS &&
            this.board[r][c] === player &&
            this.board[r + 1][c + 1] === player &&
            this.board[r + 2][c + 2] === player &&
            this.board[r + 3][c + 3] === player) ||
          (r - 3 >= 0 &&
            c + 3 < this.COLS &&
            this.board[r][c] === player &&
            this.board[r - 1][c + 1] === player &&
            this.board[r - 2][c + 2] === player &&
            this.board[r - 3][c + 3] === player)
        ) {
          return true;
        }
      }
    }
    return false;
  }

    resetGame() {
    this.board = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
    this.selectedCol = 3;
    this.gameOver = false;
    this.messageHeader.textContent = "";
    this.drawBoard();

    if (this.cursorEl) this.cursorEl.style.display = "block";
    }

    handleFistGesture() {
    const now = Date.now();
    if (now - this.lastFistTime < this.FIST_DELAY) return;
    this.lastFistTime = now;

    if (this.gameOver) {
        this.resetGame();
        if (this.cursorEl) this.cursorEl.style.display = "block";
        return;
    }

    if (this.dropDisk(this.selectedCol, 1) !== -1) {
        this.drawBoard();


        if (this.cursorEl) this.cursorEl.style.display = "none";

        if (this.checkWin(1)) {
        this.messageHeader.textContent = "Pobjeda! Pokaži šaku za novu igru";
        this.gameOver = true;
        return;
        }
        setTimeout(() => this.aiMove(), 300);
    }
    }


  moveSelection(direction) {
    const now = Date.now();
    if (now - this.lastMoveTime < this.MOVE_DELAY) return;
    this.lastMoveTime = now;

    this.selectedCol += direction === "left" ? -1 : 1;
    this.selectedCol = Math.max(0, Math.min(this.COLS - 1, this.selectedCol));
    this.drawBoard();
  }

  aiMove() {
    let bestScore = -Infinity;
    let move = null;
    for (let c = 0; c < this.COLS; c++) {
      if (this.board[0][c] !== 0) continue;
      let r = this.getAvailableRow(c);
      if (r === -1) continue;
      this.board[r][c] = 2;
      let score = this.minimax(this.board, 4, false, -Infinity, Infinity);
      this.board[r][c] = 0;
      if (score > bestScore) {
        bestScore = score;
        move = c;
      }
    }
    if (move !== null) {
      this.dropDisk(move, 2);
      this.drawBoard();
      if (this.checkWin(2)) {
        this.messageHeader.textContent = "AI wins! Pokaži šaku za novu igru";
        this.gameOver = true;
      }
    }
  }

  getAvailableRow(col) {
    for (let r = this.ROWS - 1; r >= 0; r--) {
      if (this.board[r][col] === 0) return r;
    }
    return -1;
  }

  minimax(boardState, depth, isMaximizing, alpha, beta) {
    if (this.checkWin(2)) return 1000;
    if (this.checkWin(1)) return -1000;
    if (depth === 0) return 0;

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (let c = 0; c < this.COLS; c++) {
        let r = this.getAvailableRow(c);
        if (r === -1) continue;
        boardState[r][c] = 2;
        let score = this.minimax(boardState, depth - 1, false, alpha, beta);
        boardState[r][c] = 0;
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (let c = 0; c < this.COLS; c++) {
        let r = this.getAvailableRow(c);
        if (r === -1) continue;
        boardState[r][c] = 1;
        let score = this.minimax(boardState, depth - 1, true, alpha, beta);
        boardState[r][c] = 0;
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
      return minScore;
    }
  }

  createCustomCursor() {
    this.cursorEl = document.createElement("img");
    this.cursorEl.src = "/pictures/starCatching/starCatchingCursor.webp";
    this.cursorEl.style.position = "absolute";
    this.cursorEl.style.width = "250px";
    this.cursorEl.style.height = "250px";
    this.cursorEl.style.pointerEvents = "none";
    this.cursorEl.style.zIndex = "1000";
    document.body.appendChild(this.cursorEl);

    window.addEventListener("mousemove", (e) => {
      this.cursorEl.style.left = e.pageX + "px";
      this.cursorEl.style.top = e.pageY + "px";
    });
  }

  createBackButton() {
    const backButton = document.createElement("button");
    backButton.id = "btnBack";
    backButton.innerHTML = `<img src="/pictures/backButton.webp" height="80"/>`;
    backButton.style.position = "absolute";
    backButton.style.top = "10px";
    backButton.style.left = "10px";
    backButton.style.zIndex = "1000";
    backButton.style.border = "none";
    backButton.style.background = "transparent";
    backButton.style.cursor = "pointer";
    backButton.style.transition = "filter 0.3s ease";

    backButton.addEventListener("click", () => this.manager.switch('StartMenu'));

    backButton.addEventListener("mouseenter", () => {
        backButton.style.filter = "brightness(1.2)";
        this.manager.switch('StartMenu');
    });

    backButton.addEventListener("mouseleave", () => {
        backButton.style.filter = "brightness(1)";
    });

    document.body.appendChild(backButton);
}

checkCursorHoverOnBackButton() {
  const backButton = document.getElementById("btnBack");
  if (!backButton || !this.cursorEl) return;

  const cursorRect = this.cursorEl.getBoundingClientRect();
  const backRect = backButton.getBoundingClientRect();

  const isOverlapping = !(
    cursorRect.right < backRect.left ||
    cursorRect.left > backRect.right ||
    cursorRect.bottom < backRect.top ||
    cursorRect.top > backRect.bottom
  );

  if (isOverlapping) {
    backButton.style.filter = "brightness(1.2)";

    this.manager.switch('StartMenu');

  } else {
    backButton.style.filter = "brightness(1)";
  }
}


  moveCursorWithFinger(landmarks) {
        const indexFinger = landmarks[8];

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let x = (1 - indexFinger.x) * viewportWidth;
        let y = indexFinger.y * viewportHeight;

        const sensitivity = 1.6;

        const cursorWidth = this.cursorEl ? this.cursorEl.offsetWidth || 40 : 40;
        const cursorHeight = this.cursorEl ? this.cursorEl.offsetHeight || 40 : 40;

        x = x - cursorWidth / 2;
        y = y - cursorHeight / 2;

        let centerX = viewportWidth / 2;
        let centerY = viewportHeight / 2;

        x = centerX + (x - centerX) * sensitivity;
        y = centerY + (y - centerY) * sensitivity;

        x = Math.min(Math.max(0, x), viewportWidth - cursorWidth);
        y = Math.min(Math.max(0, y), viewportHeight - cursorHeight);

        if (this.cursorEl) {
            this.cursorEl.style.left = `${x}px`;
            this.cursorEl.style.top = `${y}px`;
        }
    }

  loop() {
    this.checkCursorHoverOnBackButton();
    requestAnimationFrame(() => this.loop());
  }

  async destroy() {
    this.camera?.stop();
    this.video?.remove();
    this.canvas?.remove();
    this.messageHeader?.remove();
    this.sceneEl?.remove();
    if (this.cursorEl) this.cursorEl.remove();
    const backButton = document.getElementById("btnBack");
    if (backButton) backButton.remove();
    await super.destroy();
  }
}
