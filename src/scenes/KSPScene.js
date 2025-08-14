import BaseScene from "@engine/BaseScene.js";

export default class KSPScene extends BaseScene {
  constructor(params) {
    super(params);
    this.container = document.getElementById("gameContainer");
    this.currentScreen = "start";

    this.handleMove = this.handleMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.updateFrameCount = this.updateFrameCount.bind(this);

    this.round = 1;
    this.playerWins = 0;
    this.botWins = 0;
    this.botChoice = null;
    this.currentPlayerGesture = null;
    this.sceneEl = null;
    this.gameResult = 0;
    this.roundResult = null;
    this.roundState = "countdown";
    this.countdownTime = 3;
    this.countdownInterval = null;
    this.gameOver = 0;
  }

  async init() {
    await this.assets.loadImage("backButton", "/pictures/backButton.webp");
    await this.assets.loadImage(
      "cursor",
      "/pictures/starCatching/starCatchingCursor.webp"
    );

    const assetImages = [
      "background_baltazar",
      "background_stroj",
      "ksp-kamen",
      "ksp-papir",
      "ksp-skare",
    ];
    for (const name of assetImages) {
      await this.assets.loadImage(name, `/pictures/kspGame/${name}.webp`);
    }

    this.styleEl = this.loadStyle("/css/KSP.css");

    this.sceneEl = document.createElement("div");
    this.sceneEl.classList.add("container");
    this.render();

    this.input.on("move", this.handleMove);
    this.input.on("click", this.handleClick);
    this.input.on("frameCount", this.updateFrameCount);
  }

  startNewGame() {
    this.round = 1;
    this.playerWins = 0;
    this.botWins = 0;
    this.currentPlayerGesture = null;
    this.roundResult = null;
    this.roundState = "countdown";
    this.gameOver = 0;

    this.currentScreen = "game";
    this.startNextRound();
  }

  startNextRound() {
    this.roundState = "countdown";
    this.currentPlayerGesture = null;
    this.roundResult = null;
    this.countdownTime = 3;

    this.renderGameplayScreen();

    this.countdownInterval = setInterval(() => {
      this.countdownTime--;
      this.renderGameplayScreen();

      if (this.countdownTime <= 0) {
        clearInterval(this.countdownInterval);
        this.roundState = "waiting";
        this.renderGameplayScreen();
      }
    }, 1000);
  }

  handleGesture({ gesture }) {
    if (this.roundState !== "waiting") return;
    const validGestures = {
      Closed_Fist: "kamen",
      Open_Palm: "papir",
      Victory: "skare",
    };

    if (!validGestures[gesture]) return;

    if (this.currentPlayerGesture) return;

    this.currentPlayerGesture = validGestures[gesture];
    this.playComputerMove();
  }

  playComputerMove() {
    const options = ["kamen", "papir", "skare"];
    const botChoice = options[Math.floor(Math.random() * options.length)];

    const winner = this.getWinner(this.currentPlayerGesture, botChoice);

    this.roundResult = {
      player: this.currentPlayerGesture,
      computer: botChoice,
      winner,
    };
    if (this.playerWins === 3 || this.botWins === 3) {
      this.gameResult = this.playerWins > this.botWins ? 1 : 0;
      this.gameOver = 1;
    }
    this.roundState = "show_result";
    this.renderGameplayScreen();
  }
  getWinner(player, computer) {
    if (player === computer) return "draw";
    if (
      (player === "kamen" && computer === "skare") ||
      (player === "skare" && computer === "papir") ||
      (player === "papir" && computer === "kamen")
    ) {
      this.playerWins++;
      return "player";
    } else {
      this.botWins++;
      return "bot";
    }
  }

  update(dt) {}

  render() {
    if (this.lastRenderedScreen === this.currentScreen) return;
    this.lastRenderedScreen = this.currentScreen;

    if (this.sceneEl) this.sceneEl.remove();

    this.sceneEl = document.createElement("div");
    this.sceneEl.classList.add("container");
    this.container.innerHTML = '';


    switch (this.currentScreen) {
      case "start":
        this.renderStartScreen();
        break;
      case "rules":
        this.renderRulesScreen();
        break;
      case "game":
        this.renderGameplayScreen();
        break;
      case "gameover":
        this.renderGameOverScreen();
        break;
    }
  }

  async renderStartScreen() {
    await this.waitForImage('backButton');

    this.sceneEl.innerHTML = `<div id="startScreen">
      <button class="btn backBtn" id="btnBack">
        <img src="${this.assets.images.get('backButton').src}" height="100%"/>
      </button>
      <div class="titleRow">
        <h1>Kamen<br>Škare papir</h1>
      </div>
      <div class="bottomRow">
          <button id="btnNewGame" class="pamtilicaBtn">Nova Igra</button>
      </div>
    </div>
    `;

    this.container.appendChild(this.sceneEl);

    this.sceneEl.querySelector("#btnNewGame").addEventListener("click", () => {
      this.currentScreen = "rules";
      this.render();
    });

    this.btnBack = this.sceneEl.querySelector("#btnBack");
    this.sceneEl.querySelector("#btnBack").addEventListener("click", () => {
      this.manager.switch("StartMenu");
    });
  }

  async renderRulesScreen() {
    await this.waitForImage('backButton');
    
    this.sceneEl.innerHTML = `
    <div id="uputeScreen">
      <button class="btn backBtn" id="btnBack">
        <img src="${this.assets.images.get("backButton").src}" height="100%"/>
      </button>
      <div class="titleRow">
        <h1>Upute</h1>
      </div>
      <div class="content">
        <p>
          Igraj protiv Baltazarova stroja!
          Izaberi kamen, papir ili škare rukom ispred kamere – stroj odgovara odmah. <br><br>
          Tko će pobijediti ? Saznaj odmah !
        </p>
      </div>
      <div class="bottomRow">
        <button class="pamtilicaBtn" id="btnStart">Igraj</button>
      </div>
    </div>`;

    this.container.appendChild(this.sceneEl);

    this.sceneEl.querySelector("#btnStart").addEventListener("click", () => {
      this.startNewGame();
    });

    this.sceneEl.querySelector("#btnBack").addEventListener("click", () => {
      this.currentScreen = "start";
      this.render();
    });
  }

  renderGameplayScreen() {
    if (this.sceneEl) this.sceneEl.remove();
    this.sceneEl = document.createElement("div");
    this.sceneEl.classList.add("container");
    this.currentScreen = "game";

    let htmlState = "";
    if (this.roundState === "show_result") {
      const playerImg = this.assets.images.get(
        `ksp-${this.roundResult.player}`
      ).src;
      const compImg = this.assets.images.get(
        `ksp-${this.roundResult.computer}`
      ).src;
      const resultText =
        this.roundResult.winner === "draw"
          ? "NERIJEŠENO !"
          : this.roundResult.winner === "player"
          ? "POBJEDA!"
          : "PORAZ!";

      htmlState += `<p class="gameText">Ti:</p>
        <img src="${playerImg}" class="gestureIcon" />
        <p class="resultText gameText">${resultText}</p> <br>
        <p class="gameText">Baltazorov stroj:</p>
        <img src="${compImg}" class="gestureIcon" />`;

      if (this.gameOver === 0) {
        htmlState += `
        <button class="pamtilicaBtn" id="btnNextRound">Sljedeća runda</button>
      `;
      }
      if (this.gameOver === 1) {
        htmlState += `
        <button class="pamtilicaBtn" id="btnNextRound">Završi igru</button>
      `;
      }
    }

    if (this.roundState === "countdown") {
      htmlState += `<h1>${this.countdownTime}</h1>`;
    }
    else if (this.roundState === "waiting") {
      htmlState += `<p>Prikaži ruku!</p>`;
    }

    this.sceneEl.innerHTML = `
    <div id="gameScreen">
      <button class="btn backBtn pamtilicaBtn" id="btnGiveUp">
        Odustani
      </button>
      <div class="titleRow">
        <p>
          Runda: ${this.round} <br>
          Igrač: ${this.playerWins} <br>
          Stroj: ${this.botWins}
        </p>
      </div>
      <div class="content">${htmlState}</div>
    </div>
    `;
    this.container.appendChild(this.sceneEl);

    this.sceneEl.querySelector("#btnGiveUp").addEventListener("click", () => {
      clearInterval(this.timerInterval);
      this.currentScreen = "gameover";
      this.gameResult = 0;
      this.roundState = "waiting"
      this.render();
    });

    if (this.roundState === "show_result") {
      this.sceneEl
        .querySelector("#btnNextRound")
        .addEventListener("click", () => {
          if (this.gameOver === 1) {
            this.currentScreen = "gameover";
            this.render();
          }
          if (this.gameOver === 0) {
            this.round++;
            this.startNextRound();
          }
        });
    }
  }

  renderGameOverScreen() {
    if (this.gameResult === 0) {
      this.sceneEl.innerHTML = `
    <div id="uputeScreen">
      <div class="titleRow">
        <h1>Kraj</h1>
      </div>
      <div class="content">
        <p>
          Profesor Baltazar je pobijedio! 
          Njegov stroj je opet bio brži i mudriji. 
          <br><br>
          Pokušaj ponovo !
        </p>
      </div>
      <div class="bottomRow">
        <button class="pamtilicaBtn" id="btnRestart">Nova igra</button>
        <button class="pamtilicaBtn" id="btnMainMenu">Izbornik</button>
      </div>
    </div>
    `;
    } else {
      this.sceneEl.innerHTML = `
   <div id="uputeScreen">
      <div class="titleRow">
        <h1>Kraj</h1>
      </div>
      <div class="content">    
        <p>
          Čestitam ! <br> <br>
          Uspio si nadmudriti stroj profesora Baltazara !
        </p>
      </div>
      <div class="bottomRow">
        <button class="pamtilicaBtn" id="btnRestart">Nova igra</button> <br>
        <button class="pamtilicaBtn" id="btnMainMenu">Izbornik</button>
      </div>
    </div>
    `;
    }

    this.container.appendChild(this.sceneEl);

    this.sceneEl.querySelector("#btnRestart").addEventListener("click", () => {
      this.currentScreen = "start";
      this.render();
    });

    this.btnBack = this.sceneEl.querySelector("#btnMainMenu");
    this.sceneEl.querySelector("#btnMainMenu").addEventListener("click", () => {
      this.manager.switch("StartMenu");
    });
  }

  updateFrameCount() {
    super.updateFrameCount();
  }

  async destroy() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.lastRenderedScreen = null;
    this.input.off("move", this.handleMove);
    this.input.off("click", this.handleClick);
    this.sceneEl.remove();
    this.container.innerHTML = '';
    await super.destroy();
  }

  handleMove({ x, y, i, gesture }) {
    this.updateCursor(x, y, i);

    if (this.currentScreen === "game") {
      if (
        gesture === "Victory" ||
        gesture === "Open_Palm" ||
        gesture === "Closed_Fist"
      ) {
        this.handleGesture({ gesture });
      }
    }
  }

  handleClick({ x, y }) {
    var el = document.elementFromPoint(
      x * window.innerWidth,
      y * window.innerHeight
    );

    if (!el) return;
    if (!el.id && el.parentElement) el = el.parentElement;

    if (el && el.tagName === "BUTTON") el.click();
  }
}
