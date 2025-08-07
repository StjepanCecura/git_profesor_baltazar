import BaseScene from "@engine/BaseScene.js";

export default class TicTacToeScene extends BaseScene {
  constructor(params) {
    super(params);
    this.container = document.getElementById('gameContainer');
    this.state = "menu"; // menu | upute | igra | kraj
    
    this.timer = 0;
    this.timerInterval = null;
    this.currentPlayer = "X"; // X ili O
    this.board = Array(3).fill(null).map(() => Array(3).fill(null));
    this.gameOver = false;

    this.handleMove = this.handleMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.updateFrameCount = this.updateFrameCount.bind(this);

  }

  async init() {
    // Load CSS file
    await this.loadCSS();
    
    // Load cursor images for hand tracking
    await this.assets.loadImage("cursor", "/pictures/startMenu/hand.webp");
    await this.assets.loadImage("cursorTip", "/pictures/startMenu/hand.webp");
    
    // Set up hand tracking input listeners
    this.input.on("move", this.handleMove);
    this.input.on("click", this.handleClick);
    this.input.on("frameCount", this.updateFrameCount);

    this.createMenuScreen();
  }

  async loadCSS() {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = '/css/tictactoe.css';
      link.onload = () => resolve();
      link.onerror = () => reject(new Error('Failed to load CSS'));
      document.head.appendChild(link);
    });
  }

  clearScreen() {
    if (this.container) {
      this.container.innerHTML = "";
    }
  }

  createMenuScreen() {
    this.clearScreen();
    this.state = "menu";

    const sceneEl = document.createElement("div");
    sceneEl.className = "container tictactoe-container";

    // NASLOV
    const title = document.createElement("h1");
    title.innerText = "Križić-kružić";
    title.className = "textStyle tictactoe-title";

    // BALTHAZAR
    const img = document.createElement("img");
    img.src = "/pictures/tictactoeGame/baltazar.webp";
    img.className = "imgProfBaltazar tictactoe-baltazar-img";

    // GUMBI
    const btnNewGame = this.createButton("Nova igra", () => this.createGameScreen());
    const btnUpute = this.createButton("Upute", () => this.createUputeScreen());

    [btnNewGame, btnUpute].forEach((btn) => {
        btn.classList.add("tictactoe-menu-button");
    });

    const back = this.createBackButton(() => {
      this.manager.switch('StartMenu');
    });
    back.classList.add("tictactoe-back-button-menu");

    sceneEl.append(title, img, btnNewGame, btnUpute);
    sceneEl.appendChild(back);

    this.container.appendChild(sceneEl);
    this.sceneEl = sceneEl;
    
    // KLJUČNO: Postavi cursorContainer za hand tracking
    this.cursorContainer = this.sceneEl;
  }

  createUputeScreen() {
    this.clearScreen();
    this.state = "upute";

    const sceneEl = document.createElement("div");
    sceneEl.className = "container tictactoe-instructions-container";

    const title = document.createElement("h1");
    title.innerText = "Upute!";
    title.className = "textStyle tictactoe-instructions-title";

    const text = document.createElement("p");
    text.className = "textStyle tictactoe-instructions-text";
    text.innerText =
        "Koristi pokrete ruku kako bi postavio krug ili križić na željeno mjesto na tabli.\nPobjednik je onaj koji uspije spojiti svoja 3 znaka uzastopno u nekom redu, stupcu, glavnoj ili sporednoj dijagonali.";

    const icons = document.createElement("div");
    icons.className = "tictactoe-icons-container";

    // Križić blok
    const krizicContainer = document.createElement("div");
    krizicContainer.className = "tictactoe-icon-container";

    const krizic = document.createElement("img");
    krizic.src = "/pictures/tictactoeGame/krizic.webp";
    krizic.className = "tictactoe-icon-img";

    const krizicLabel = document.createElement("p");
    krizicLabel.className = "textStyle tictactoe-icon-label";
    krizicLabel.innerText = "Križić";

    // Kružić blok
    const kruzicContainer = document.createElement("div");
    kruzicContainer.className = "tictactoe-icon-container";

    const kruzic = document.createElement("img");
    kruzic.src = "/pictures/tictactoeGame/kruzic.webp";
    kruzic.className = "tictactoe-icon-img";

    const kruzicLabel = document.createElement("p");
    kruzicLabel.className = "textStyle tictactoe-icon-label";
    kruzicLabel.innerText = "Kružić";

    // Spajanje
    krizicContainer.append(krizic, krizicLabel);
    kruzicContainer.append(kruzic, kruzicLabel);
    icons.append(krizicContainer, kruzicContainer);

    const back = this.createBackButton(() => this.createMenuScreen());
    back.className = "tictactoe-back-button-instructions";

    sceneEl.append(back, title, text, icons);
    this.container.appendChild(sceneEl);
    this.sceneEl = sceneEl; // Store reference for cleanup
    
    // KLJUČNO: Postavi cursorContainer za hand tracking
    this.cursorContainer = this.sceneEl;
  }

  createGameScreen() {
    this.clearScreen();
    this.state = "igra";
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timer = 0;
    this.currentPlayer = "X";
    this.board = Array(3).fill(null).map(() => Array(3).fill(null));
    this.gameOver = false;

    const sceneEl = document.createElement("div");
    sceneEl.className = "container tictactoe-game-container";

    const timerText = document.createElement("div");
    timerText.id = "timerText";
    timerText.className = "textStyle tictactoe-timer";
    timerText.innerText = `Vrijeme igre: 0`;

    const currentPlayerText = document.createElement("div");
    currentPlayerText.id = "currentPlayer";
    currentPlayerText.className = "textStyle tictactoe-current-player";

    const playerImg = document.createElement("img");
    playerImg.src = this.getPlayerImg(this.currentPlayer);
    playerImg.className = "tictactoe-player-img";

    currentPlayerText.innerText = "Na redu je igrač: ";
    currentPlayerText.appendChild(playerImg);

    const boardContainer = document.createElement("div");
    boardContainer.className = "tictactoe-board";

    // 3x3 GRID
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

    const back = this.createBackButton(() => this.createMenuScreen());
    back.classList.add("tictactoe-back-button-game");

    sceneEl.append(back, timerText, currentPlayerText, boardContainer);
    this.container.appendChild(sceneEl);
    this.sceneEl = sceneEl; // Store reference for cleanup
    
    // KLJUČNO: Postavi cursorContainer za hand tracking
    this.cursorContainer = this.sceneEl;

    this.timerInterval = setInterval(() => {
      this.timer++;
      timerText.innerText = `Vrijeme igre: ${this.timer}`;
    }, 1000);
  }

  handleCellClick(x, y, cellElement) {
    if (this.board[y][x] || this.gameOver) return;

    const symbolImg = document.createElement("img");
    symbolImg.src = this.getPlayerImg(this.currentPlayer);
    symbolImg.className = "tictactoe-symbol";

    // Pomaci za centriranje
    let translateX = 0;
    let translateY = 0;

    // Horizontalno pomicanje:
    if (x === 0) translateX = 35;
    else if (x === 2) translateX = -35;

    // Vertikalno pomicanje:
    if (y === 0) translateY = 35;
    else if (y === 2) translateY = -35;

    symbolImg.style.transform = `translate(${translateX}%, ${translateY}%)`;

    cellElement.appendChild(symbolImg);

    this.board[y][x] = this.currentPlayer;

    // Provjera pobjednika ili neriješenog stanja
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

    const btnMenu = this.createButton("Izbornik", () => {
        overlay.remove(); 
        this.createMenuScreen();
    });
    btnMenu.classList.add("tictactoe-end-button");

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

  createButton(text, onClick) {
    const btn = document.createElement("button");
    btn.className = "btnGameButtons";
    btn.innerText = text;
    btn.addEventListener("click", onClick);
    return btn;
  }

  createBackButton(onClick) {
    const btn = document.createElement("img");
    btn.src = "/pictures/backButton.webp";
    btn.className = "tictactoe-back-button";
    btn.addEventListener("click", onClick);
    return btn;
  }

  getPlayerImg(player) {
    return player === "X"
      ? "/pictures/tictactoeGame/krizic.webp"
      : "/pictures/tictactoeGame/kruzic.webp";
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
      // Handle back button clicks
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