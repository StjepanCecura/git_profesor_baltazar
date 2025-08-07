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
    this.input.on("move", this.handleMove);
    this.input.on("click", this.handleClick);
    this.input.on("frameCount", this.updateFrameCount);

    this.cursorContainer = this.container;

    this.createMenuScreen();
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
    sceneEl.className = "container";
    sceneEl.style.backgroundImage = "url('/pictures/tictactoeGame/background1.webp')";
    sceneEl.style.display = "flex";
    sceneEl.style.flexDirection = "column";
    sceneEl.style.alignItems = "center";
    sceneEl.style.justifyContent = "center";
    sceneEl.style.position = "relative";
    sceneEl.style.padding = "2em";
    sceneEl.style.width = "100vw";
    sceneEl.style.height = "100vh";

    // NASLOV
    const title = document.createElement("h1");
    title.innerText = "Križić-kružić";
    title.className = "textStyle";
    title.style.fontSize = "12vw";
    title.style.marginBottom = "1em";
    title.style.textAlign = "center";

    // BALTHAZAR
    const img = document.createElement("img");
    img.src = "/pictures/tictactoeGame/baltazar.webp";
    img.className = "imgProfBaltazar";
    img.style.maxHeight = "40vh";
    img.style.width = "auto";
    img.style.marginBottom = "2em";

    // GUMBI
    const btnNewGame = this.createButton("Nova igra", () => this.createGameScreen());
    const btnUpute = this.createButton("Upute", () => this.createUputeScreen());

    [btnNewGame, btnUpute].forEach((btn) => {
        btn.style.backgroundColor = "#008782";
        btn.style.color = "white";
        btn.style.fontFamily = "Marhey";
        btn.style.fontSize = "6vw";
        btn.style.width = "40%";
        btn.style.margin = "-1em 0";
        btn.style.marginBottom= "10%";
    });

    const back = this.createBackButton(() => {
      this.manager.switch('StartMenu');
    });
    back.style.top = "4em";
    back.style.left = "4em";

    sceneEl.append(title, img, btnNewGame, btnUpute);
    sceneEl.appendChild(back);

    this.container.appendChild(sceneEl);
    this.sceneEl = sceneEl;
  }

  createUputeScreen() {
    this.clearScreen();
    this.state = "upute";

    const sceneEl = document.createElement("div");
    sceneEl.className = "container";
    sceneEl.style.backgroundImage = "url('/pictures/tictactoeGame/background1.webp')";
    sceneEl.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    sceneEl.style.backgroundBlendMode = "darken";
    sceneEl.style.width = "100vw";
    sceneEl.style.height = "100vh";
    sceneEl.style.display = "flex";
    sceneEl.style.flexDirection = "column";
    sceneEl.style.alignItems = "center";
    sceneEl.style.justifyContent = "center";
    sceneEl.style.boxSizing = "border-box";
    sceneEl.style.padding = "5vh 5vw";
    sceneEl.style.position = "relative";
    sceneEl.style.margin = "0";

    const title = document.createElement("h1");
    title.innerText = "Upute!";
    title.className = "textStyle";
    title.style.textAlign = "center";
    title.style.fontSize = "12vw";
    title.style.marginBottom = "3vh";
    title.style.color = "white";

    const text = document.createElement("p");
    text.className = "textStyle";
    text.style.fontSize = "6vw";
    text.style.textAlign = "center";
    text.style.color = "white";
    text.style.whiteSpace = "pre-line";
    text.style.marginBottom = "4vh";
    text.innerText =
        "Koristi pokrete ruku kako bi postavio krug ili križić na željeno mjesto na tabli.\nPobjednik je onaj koji uspije spojiti svoja 3 znaka uzastopno u nekom redu, stupcu, glavnoj ili sporednoj dijagonali.";

    const icons = document.createElement("div");
    icons.style.display = "flex";
    icons.style.justifyContent = "center";
    icons.style.gap = "10vw";
    icons.style.marginBottom = "5vh";

    // Križić blok
    const krizicContainer = document.createElement("div");
    krizicContainer.style.display = "flex";
    krizicContainer.style.flexDirection = "column";
    krizicContainer.style.alignItems = "center";

    const krizic = document.createElement("img");
    krizic.src = "/pictures/tictactoeGame/krizic.webp";
    krizic.style.width = "40vw";
    krizic.style.maxWidth = "220px";

    const krizicLabel = document.createElement("p");
    krizicLabel.className = "textStyle";
    krizicLabel.innerText = "Križić";
    krizicLabel.style.fontSize = "6vw";
    krizicLabel.style.marginTop = "1vh";

    // Kružić blok
    const kruzicContainer = document.createElement("div");
    kruzicContainer.style.display = "flex";
    kruzicContainer.style.flexDirection = "column";
    kruzicContainer.style.alignItems = "center";

    const kruzic = document.createElement("img");
    kruzic.src = "/pictures/tictactoeGame/kruzic.webp";
    kruzic.style.width = "40vw";
    kruzic.style.maxWidth = "220px";

    const kruzicLabel = document.createElement("p");
    kruzicLabel.className = "textStyle";
    kruzicLabel.innerText = "Kružić";
    kruzicLabel.style.fontSize = "6vw";
    kruzicLabel.style.marginTop = "1vh";

    // Spajanje
    krizicContainer.append(krizic, krizicLabel);
    kruzicContainer.append(kruzic, kruzicLabel);
    icons.append(krizicContainer, kruzicContainer);

    const back = this.createBackButton(() => this.createMenuScreen());
    back.style.position = "absolute";
    back.style.top = "4em";
    back.style.left = "4em";
    back.style.height = "220px";
    back.style.cursor = "pointer";

    sceneEl.append(back, title, text, icons);
    this.container.appendChild(sceneEl);
    this.sceneEl = sceneEl; // Store reference for cleanup
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
    sceneEl.className = "container";
    sceneEl.style.backgroundImage = "url('/pictures/tictactoeGame/background2.webp')";
    sceneEl.style.display = "flex";
    sceneEl.style.flexDirection = "column";
    sceneEl.style.alignItems = "center";
    sceneEl.style.justifyContent = "center";
    sceneEl.style.minHeight = "100vh";
    sceneEl.style.width = "100vw";

    const timerText = document.createElement("div");
    timerText.id = "timerText";
    timerText.className = "textStyle";
    timerText.style.fontSize = "8vw";
    timerText.style.textAlign = "center";
    timerText.style.marginTop = "1.5em";
    timerText.innerText = `Vrijeme igre: 0`;

    const currentPlayerText = document.createElement("div");
    currentPlayerText.id = "currentPlayer";
    currentPlayerText.className = "textStyle";
    currentPlayerText.style.fontSize = "6vw";
    currentPlayerText.style.textAlign = "center";
    currentPlayerText.style.marginTop = "-0.5em";

    const playerImg = document.createElement("img");
    playerImg.src = this.getPlayerImg(this.currentPlayer);
    playerImg.style.height = "10vw";
    playerImg.style.verticalAlign = "middle";
    playerImg.style.marginLeft = "1vw";

    currentPlayerText.innerText = "Na redu je igrač: ";
    currentPlayerText.appendChild(playerImg);

    const boardContainer = document.createElement("div");
    boardContainer.style.position = "relative";
    boardContainer.style.width = "100vw";  
    boardContainer.style.height = "100vw";
    boardContainer.style.margin = "2em auto";
    boardContainer.style.backgroundImage = "url('/pictures/tictactoeGame/gameboard.webp')";
    boardContainer.style.backgroundSize = "contain";  
    boardContainer.style.backgroundRepeat = "no-repeat";
    boardContainer.style.display = "grid";
    boardContainer.style.gridTemplateColumns = "repeat(3, 1fr)";
    boardContainer.style.gridTemplateRows = "repeat(3, 1fr)";

    // 3x3 GRID
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        const cell = document.createElement("div");
        cell.dataset.x = x;
        cell.dataset.y = y;
        
        cell.style.display = "flex";
        cell.style.justifyContent = "center";
        cell.style.alignItems = "center";
        cell.style.cursor = "pointer";
        cell.style.border = "1px solid transparent";

        cell.addEventListener("click", () => this.handleCellClick(x, y, cell));
        boardContainer.appendChild(cell);
      }
    }

    const back = this.createBackButton(() => this.createMenuScreen());
    back.style.marginTop = "4em";
    back.style.marginLeft = "4em";

    sceneEl.append(back, timerText, currentPlayerText, boardContainer);
    this.container.appendChild(sceneEl);
    this.sceneEl = sceneEl; // Store reference for cleanup

    this.timerInterval = setInterval(() => {
      this.timer++;
      timerText.innerText = `Vrijeme igre: ${this.timer}`;
    }, 1000);
  }

  handleCellClick(x, y, cellElement) {
    if (this.board[y][x] || this.gameOver) return;

    const symbolImg = document.createElement("img");
    symbolImg.src = this.getPlayerImg(this.currentPlayer);
    symbolImg.style.width = "50%";
    symbolImg.style.height = "50%";
    symbolImg.style.objectFit = "contain";

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
        img.style.height = "10vw";
        img.style.verticalAlign = "middle";
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
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)"; 
    overlay.style.zIndex = "10";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "2em";

    const resultText = document.createElement("h1");
    resultText.className = "textStyle";
    resultText.style.fontSize = "8vw";
    resultText.style.color = "#FFFFFF";
    resultText.style.marginBottom = "0.5em";

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
        symbolImg.style.width = "15vw";
        symbolImg.style.marginTop = "0.3em";
    }

    const endText = document.createElement("p");
    endText.className = "textStyle";
    endText.style.fontSize = "5vw";
    endText.style.color = "#FFFFFF";
    endText.style.marginBottom = "2em";
    endText.innerText = "Kraj! Igrajte ponovo!";

    const styleButton = (btn) => {
        btn.style.backgroundColor = "#008782";  
        btn.style.color = "#FFFFFF";
        btn.style.fontSize = "5vw";
        btn.style.fontFamily = "'Marhey', sans-serif";
        btn.style.padding = "1em 2.5em";  
        btn.style.border = "none";
        btn.style.borderRadius = "8px";
        btn.style.margin = "0.5em";
        btn.style.cursor = "pointer";
        btn.style.width = "50%";  
    };

    const btnNew = this.createButton("Nova igra", () => {
        overlay.remove(); 
        this.createGameScreen();
    });
    styleButton(btnNew);

    const btnMenu = this.createButton("Izbornik", () => {
        overlay.remove(); 
        this.createMenuScreen();
    });
    styleButton(btnMenu);

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
    btn.style.position = "absolute";
    btn.style.top = "1em";
    btn.style.left = "1em";
    btn.style.height = "220px";
    btn.style.cursor = "pointer";
    btn.style.zIndex = "1000";
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