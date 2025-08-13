import BaseScene from "@engine/BaseScene.js";

export default class TicTacToeScene extends BaseScene {
  constructor(params) {
    super(params);
    this.container = document.getElementById('gameContainer');
    this.state = "menu";
    
    this.timer = 0;
    this.timerInterval = null;
    this.currentPlayer = "X";
    this.board = Array(3).fill(null).map(() => Array(3).fill(null));
    this.gameOver = false;

    this.handleMove = this.handleMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.updateFrameCount = this.updateFrameCount.bind(this);

  }

  async init() {
    await this.assets.loadImage("xPlayer", "/pictures/tictactoeGame/krizic.webp");
    await this.assets.loadImage("oPlayer", "/pictures/tictactoeGame/kruzic.webp");
    await this.assets.loadImage("backButton", "/pictures/backButton.webp");
    await this.assets.loadImage("baltazar", "/pictures/tictactoeGame/baltazar.webp");
    await this.assets.loadImage("cursor", "/pictures/drawingGame/brush.webp");

    this.styleEl = this.loadStyle("/css/tictactoe.css");
    
    this.input.on("move", this.handleMove);
    this.input.on("click", this.handleClick);
    this.input.on("frameCount", this.updateFrameCount);

    this.createMenuScreen();
  }

  createButton(text, onClick) {
    const btn = document.createElement("button");
    btn.className = "btnGameButtons";
    btn.innerText = text;
    btn.addEventListener("click", onClick);
    return btn;
  }

  clearScreen() {
    if (this.container) {
      this.container.innerHTML = "";
    }
  }

  createMenuScreen() {
    this.clearScreen();
    this.resetHands();
    this.state = "menu";

    this.sceneEl = document.createElement("div");
    this.sceneEl.className = "container tictactoe-container";
    this.sceneEl.innerHTML = `
      <div class="firstLayer layer">
        <button class="btn" id="btnBack"><img src="${this.assets.images.get("backButton").src}" height="100%"/></button>
      </div>
      <div class="secondLayer layer">
        <h1 class="textStyle tictactoe-title">Križić-kružić</h1>
      </div>
      <div class="thirdLayer layer">
        <button class="textStyle btn tictactoe-menu-button" id="btnGame">Nova igra</button>
        <button class="textStyle btn tictactoe-menu-button" id="btnInstructions">Upute</button>
      </div>
    `;

    this.container.appendChild(this.sceneEl);

    this.btnBack = this.sceneEl.querySelector("#btnBack");
    this.btnBack.addEventListener("click", () =>
      this.manager.switch("StartMenu")
    );

    this.btnGame = this.sceneEl.querySelector("#btnGame");
    this.btnGame.addEventListener("click", () =>
      this.createGameScreen()
    );

    this.btnInstructions = this.sceneEl.querySelector("#btnInstructions");
    this.btnInstructions.addEventListener("click", () =>
      this.createUputeScreen()
    );
    
    this.cursorContainer = this.sceneEl;
  }

  createUputeScreen() {
    this.clearScreen();
    this.resetHands();
    this.state = "upute";

    this.sceneEl.className = "container tictactoe-instructions-container";
    this.sceneEl.innerHTML = `
      <div class="firstLayer layer">
        <button class="btn" id="btnBack"><img src="${this.assets.images.get("backButton").src}" height="100%"/></button>
      </div>
      <div class="secondLayerInstructions layer">
        <h1 class="textStyle tictactoe-instructions-title">Upute!</h1>
        <p class="textStyle tictactoe-instructions-text">Koristi pokrete ruku kako bi postavio krug ili križić na željeno mjesto na tabli.
        \nPobjednik je onaj koji uspije spojiti svoja 3 znaka uzastopno u nekom redu, stupcu, glavnoj ili sporednoj dijagonali.</p>
        <img class="imgProfBaltazar tictactoe-baltazar-img" src="${this.assets.images.get("baltazar").src}"/>
      </div>
    `;

    this.container.appendChild(this.sceneEl);

    this.btnBack = this.sceneEl.querySelector("#btnBack");
    this.btnBack.addEventListener("click", () =>
      this.createMenuScreen()
    );
    
    this.cursorContainer = this.sceneEl;
  }

  createGameScreen() {
    this.clearScreen();
    this.resetHands();
    this.state = "igra";

    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timer = 0;
    this.currentPlayer = "X";
    this.board = Array(3).fill(null).map(() => Array(3).fill(null));
    this.gameOver = false;

    this.sceneEl.className = "container tictactoe-game-container";
    this.sceneEl.innerHTML = `
      <div class="firstLayer layer">
        <button class="btn" id="btnBack"><img src="${this.assets.images.get("backButton").src}" height="100%"/></button>
      </div>
      <div class="secondLayerGame layer">
        <div id="timerText" class="textStyle tictactoe-timer">Vrijeme igre: 0</div>
        <div id="currentPlayer" class="textStyle tictactoe-current-player">
          Na redu je igrač: 
          <img class="tictactoe-player-img" src="${this.getPlayerImg(this.currentPlayer)}"/>
        </div>
        <div class="tictactoe-board"></div>
      </div>
    `;
    
    this.btnBack = this.sceneEl.querySelector("#btnBack");
    this.btnBack.addEventListener("click", () =>
      this.createMenuScreen()
    );

    this.container.appendChild(this.sceneEl);
    this.cursorContainer = this.sceneEl;

    this.fillContainer();

    this.timerInterval = setInterval(() => {
      this.timer++;
      timerText.innerText = `Vrijeme igre: ${this.timer}`;
    }, 1000);
  }

  fillContainer() {
    const boardContainer = document.getElementsByClassName("tictactoe-board")[0];

    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        const cell = document.createElement("div");
        cell.dataset.x = x;
        cell.dataset.y = y;
        cell.className = "tictactoe-cell";

        cell.addEventListener("click", () => this.handleCellClick(x, y, cell));
        boardContainer.appendChild(cell);
      }
    }
  }

  handleCellClick(x, y, cellElement) {
    if (this.board[y][x] || this.gameOver) return;

    const symbolImg = document.createElement("img");
    symbolImg.src = this.getPlayerImg(this.currentPlayer);
    symbolImg.className = "tictactoe-symbol";

    let translateX = 0;
    let translateY = 0;

    if (x === 0) translateX = 35;
    else if (x === 2) translateX = -35;

    if (y === 0) translateY = 35;
    else if (y === 2) translateY = -35;

    symbolImg.style.transform = `translate(${translateX}%, ${translateY}%)`;

    cellElement.appendChild(symbolImg);

    this.board[y][x] = this.currentPlayer;

    if (this.checkWin(this.currentPlayer)) {
        this.endGame(`${this.currentPlayer}`);
    } else if (this.checkDraw()) {
        this.endGame(null);
    } else {
        this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
        const playerText = document.getElementById("currentPlayer");

        let img = playerText.querySelector("img");
        if (!img) {
        img = document.createElement("img");
        img.className = "tictactoe-player-img-inline";
        playerText.appendChild(img);
        }
        playerText.firstChild.textContent = "Na redu je igrač: ";
        img.src = this.getPlayerImg(this.currentPlayer);
    }
  }

  endGame(winner) {
    clearInterval(this.timerInterval);
    this.gameOver = true;
    this.state = "kraj";

    const overlay = document.createElement("div");
    overlay.className = "tictactoe-overlay";

    const resultText = document.createElement("h1");
    resultText.className = "textStyle tictactoe-result-text";

    if (winner) {
        resultText.innerText = "Pobijedio je igrač:";
    } else {
        resultText.innerText = "Neriješeno!";
    }

    let symbolImg = null;
    if (winner) {
        symbolImg = document.createElement("img");
        symbolImg.src = winner === "X"
        ? "/pictures/tictactoeGame/krizic.webp"
        : "/pictures/tictactoeGame/kruzic.webp";
        symbolImg.className = "tictactoe-winner-symbol";
    }

    const endText = document.createElement("p");
    endText.className = "textStyle tictactoe-end-text";
    endText.innerText = "Kraj! Igrajte ponovo!";

    const btnNew = this.createButton("Nova igra", () => {
        overlay.remove(); 
        this.createGameScreen();
    });
    btnNew.classList.add("tictactoe-end-button");
    btnNew.classList.add("textStyle");

    const btnMenu = this.createButton("Izbornik", () => {
        overlay.remove(); 
        this.createMenuScreen();
    });
    btnMenu.classList.add("tictactoe-end-button");
    btnMenu.classList.add("textStyle");

    overlay.append(resultText);
    if (symbolImg) overlay.appendChild(symbolImg);
    overlay.append(endText, btnNew, btnMenu);
    this.sceneEl.appendChild(overlay); 
  }

  checkWin(player) {
    const b = this.board;
    for (let i = 0; i < 3; i++) {
      if (b[i][0] === player && b[i][1] === player && b[i][2] === player) return true;
      if (b[0][i] === player && b[1][i] === player && b[2][i] === player) return true;
    }
    if (b[0][0] === player && b[1][1] === player && b[2][2] === player) return true;
    if (b[0][2] === player && b[1][1] === player && b[2][0] === player) return true;
    return false;
  }

  checkDraw() {
    return this.board.flat().every(cell => cell);
  }

  getPlayerImg(player) {
    return player === "X"
      ? this.assets.images.get("xPlayer").src
      : this.assets.images.get("oPlayer").src;
  }

  handleMove({ x, y, i }) {
    this.updateCursor(x, y, i);
  }

  handleClick({ x, y }) {
    const px = x * window.innerWidth;
    const py = y * window.innerHeight;
    const el = document.elementFromPoint(px, py);

    if (!el) return;

    if (el.tagName === "BUTTON") {
      el.click();
    } else if (el.tagName === "IMG" && el.src && el.src.includes("backButton.webp")) {
      el.click();
    } else if (el.dataset && el.dataset.x !== undefined && el.dataset.y !== undefined) {
      const xCoord = parseInt(el.dataset.x, 10);
      const yCoord = parseInt(el.dataset.y, 10);
      this.handleCellClick(xCoord, yCoord, el);
    }
  }

  updateFrameCount() {
    super.updateFrameCount();
  }

  async destroy() {
    this.input.off("move", this.handleMove);
    this.input.off("click", this.handleClick);
    this.input.off("frameCount", this.updateFrameCount);

    super.destroy();
    clearInterval(this.timerInterval);
    if (this.sceneEl && this.sceneEl.parentNode) {
      this.sceneEl.remove();
    }
  }
}