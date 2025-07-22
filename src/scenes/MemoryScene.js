import BaseScene from "@engine/BaseScene.js";

export default class MemoryGameScene extends BaseScene {
  constructor(params) {
    super(params);
    this.container = document.getElementById("gameContainer");
    this.currentScreen = "start";

    this.handleMove = this.handleMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.updateFrameCount = this.updateFrameCount.bind(this);

    this.cards = [];
    this.flippedCards = [];
    this.matchedCards = new Set();

    this.score = 0;
    this.timeLeft = 120;
    this.gameResult = 0;

    this.timerInterval = null;
  }

  async init() {
    await this.assets.loadImage("backButton", "/pictures/backButton.webp");
    await this.assets.loadImage(
      "cursor",
      "/pictures/starCatching/starCatchingCursor.webp"
    );

    const assetImages = [
      "background_game",
      "background_instructions",
      "background_title",
    ];
    for (const name of assetImages) {
      await this.assets.loadImage(name, `/pictures/memoryGame/${name}.png`);
    }
    for (let i = 1; i <= 6; i++) {
      await this.assets.loadImage(
        `mem-card${i}`,
        `/pictures/memoryGame/memory-card${i}.png`
      );
    }
    await this.assets.loadImage(
      "mem-card-back",
      "/pictures/memoryGame/memory-card-back.png"
    );

    this.styleEl = this.loadStyle("/css/Memory.css");

    this.sceneEl = document.createElement("div");
    this.sceneEl.classList.add("container");
    this.render();

    this.input.on("move", this.handleMove);
    this.input.on("click", this.handleClick);
    this.input.on("frameCount", this.updateFrameCount);
  }

  startNewGame() {
    this.score = 0;
    this.timeLeft = 120;
    this.flippedCards = [];
    this.matchedCards.clear();

    this.setupCards();

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.currentScreen = "gameover";
        this.gameResult = 0;
        clearInterval(this.timerInterval);
      } else {
        this.renderGameplayScreen();
      }
    }, 1000);

    this.currentScreen = "game";
    this.render();
  }
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }
  setupCards() {
    const cardTypes = [];
    for (let i = 1; i <= 6; i++) {
      cardTypes.push(`mem-card${i}`);
    }

    const allCards = [...cardTypes, ...cardTypes];
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }

    this.cards = allCards.map((type, index) => ({
      id: index,
      type,
      flipped: false,
      matched: false,
    }));
  }

  onCardClick(index) {
    const card = this.cards[index];

    if (card.flipped || card.matched || this.flippedCards.length === 2) return;

    card.flipped = true;
    this.flippedCards.push(card);

    this.renderGameplayScreen();

    if (this.flippedCards.length === 2) {
      setTimeout(() => this.checkMatch(), 800);
    }
  }
  checkMatch() {
    const [cardA, cardB] = this.flippedCards;

    if (cardA.type === cardB.type) {
      cardA.matched = true;
      cardB.matched = true;
      this.matchedCards.add(cardA.id);
      this.matchedCards.add(cardB.id);
      this.score += 10;
    } else {
      cardA.flipped = false;
      cardB.flipped = false;
    }

    this.flippedCards = [];
    this.renderGameplayScreen();

    if (this.cards.every((c) => c.matched)) {
      clearInterval(this.timerInterval);
      this.gameResult = 1;
      this.currentScreen = "gameover";
      this.render();
    }
  }

  update(dt) {}

  render() {
    if (this.lastRenderedScreen === this.currentScreen) return;
    this.lastRenderedScreen = this.currentScreen;

    if (this.sceneEl) this.sceneEl.remove();

    this.sceneEl = document.createElement("div");
    this.sceneEl.classList.add("container");

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

  renderStartScreen() {
    this.sceneEl.innerHTML = `<div id="startScreen">
      <button class="btn backBtn" id="btnBack">
        <img src="${this.assets.images.get("backButton").src}" height="100%"/>
      </button>
      <div class="titleRow">
        <h1>Memory</h1>
      </div>
      <div class="bottomRow">
          <button id="btnNewGame" class="memoryBtn">Nova Igra</button>
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

  renderRulesScreen() {
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
          Okreći po dvije kartice i pronađi sve iste parove. 
          Ako se ne podudaraju, zatvaraju se.<br> <br>
          Zapamti gdje se nalaze i otkrij sve parove!
        </p>
      </div>
      <div class="bottomRow">
        <button class="memoryBtn" id="btnStart">Igraj</button>
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

    let gridHTML = this.cards
      .map(
        (card) => `
      <div class="card" data-index="${card.id}">
        <img src="${
          card.flipped || card.matched
            ? this.assets.images.get(card.type).src
            : this.assets.images.get("mem-card-back").src
        }"/>
      </div>`
      )
      .join("");

    this.sceneEl.innerHTML = `
    <div id="gameScreen">
      <button class="btn backBtn memoryBtn" id="btnGiveUp">
        Odustani
      </button>
      <div class="titleRow">
        <p>Rezultat: ${this.score}<br> Vrijeme: ${this.formatTime(this.timeLeft)}</p>
      </div>
      <div class="card-grid">${gridHTML}</div>
    </div>`;
    this.container.appendChild(this.sceneEl);

    this.sceneEl.querySelector("#btnGiveUp").addEventListener("click", () => {
      clearInterval(this.timerInterval);
      this.currentScreen = "gameover";
      this.gameResult = 0;
      this.render();
    });

    this.sceneEl.querySelectorAll(".card").forEach((cardEl) => {
      cardEl.addEventListener("click", (e) => {
        const index = parseInt(cardEl.getAttribute("data-index"));
        this.onCardClick(index);
      });
    });
  }

  renderGameOverScreen() {
    if (this.gameResult === 0) {
      this.sceneEl.innerHTML = `
    <div id="overScreen">
      <div class="titleRow">
        <h1>Kraj</h1>
      </div>
      <div class="content">
        <p>
          Tvoje vrijeme je isteklo.
          Nažalost, nisi uspio pronaći sve parove. 
          <br><br>
          Pokušaj ponovo, siguran sam da ćeš uspjeti!
        </p>
      </div>
      <div class="bottomRow">
        <button class="memoryBtn" id="btnRestart">Nova igra</button>
        <button class="memoryBtn" id="btnMainMenu">Izbornik</button>
      </div>
    </div>
    `;
    } else {
      this.sceneEl.innerHTML = `
   <div id="overScreen">
      <div class="titleRow">
        <h1>Kraj</h1>
      </div>
      <div class="content">    
        <p>
          Čestitam ! <br> <br>
          Pronašao si sve parove kartica sa Baltazarovim stvarima !
        </p>
      </div>
      <div class="bottomRow">
        <button class="memoryBtn" id="btnRestart">Nova igra</button> <br>
        <button class="memoryBtn" id="btnMainMenu">Izbornik</button>
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
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.lastRenderedScreen = null;
    this.input.off("move", this.handleMove);
    this.input.off("click", this.handleClick);
    this.sceneEl.remove();
    await super.destroy();
  }

  handleMove({ x, y, i }) {
    this.updateCursor(x, y, i);
  }

  handleClick({ x, y }) {
    const el = document.elementFromPoint(
      x * window.innerWidth,
      y * window.innerHeight
    );
    if (el && el.tagName === "BUTTON") el.click();

    const cardEl = el.closest(".card");
    if (cardEl) {
      const index = parseInt(cardEl.getAttribute("data-index"));
      if (!isNaN(index)) {
        this.onCardClick(index);
      }
    }
  }
}
