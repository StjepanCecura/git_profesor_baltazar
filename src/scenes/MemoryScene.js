import BaseScene from '@engine/BaseScene.js';

export default class MemoryGameScene extends BaseScene {
  constructor(params) {
    super(params);
    this.container = document.getElementById('gameContainer');
    this.currentScreen = 'start';

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
    await this.assets.loadImage('backButton', '/pictures/backButton.webp');
    await this.assets.loadImage(
      'cursor',
      '/pictures/starCatching/starCatchingCursor.webp',
    );

    const assetImages = [
      'background_game',
      'background_instructions',
      'background_title',
    ];
    for (const name of assetImages) {
      await this.assets.loadImage(name, `/pictures/memoryGame/${name}.png`);
    }

    this.cardPairs = [
      ['Kablovi', 'Žile'],
      ['Kamera', 'Oči'],
      ['Metalna konstrukcija', 'Kosti'],
      ['Racunalo', 'Mozak'],
      ['Slusalice', 'Usi'],
      ['Pumpa', 'Srce'],
      //      ['Drobilica', 'Zubi'],
      //      ['Detektor', 'Jezik'],
      //      ['Usisavac', 'Nos'],
      ['Ventilator', 'Pluća'],
    ];

    for (const pair of this.cardPairs) {
      for (const name of pair) {
        await this.assets.loadImage(name, `/pictures/memoryGame/${name}.png`);
      }
    }
    await this.assets.loadImage(
      'mem-card-back',
      '/pictures/memoryGame/memory-card-back.png',
    );

    this.styleEl = this.loadStyle('/css/Memory.css');

    this.sceneEl = document.createElement('div');
    this.sceneEl.classList.add('container');
    this.render();

    this.input.on('move', this.handleMove);
    this.input.on('click', this.handleClick);
    this.input.on('frameCount', this.updateFrameCount);
  }

  startNewGame() {
    this.score = 0;
    this.timeLeft = 120;
    this.flippedCards = [];
    this.matchedCards.clear();

    this.setupCards();

    if (this.timerInterval) clearInterval(this.timerInterval);

    // store start time
    this.startTime = Date.now();
    this.duration = 300 * 1000; // 5 minutes/300 seconds in ms

    this.timerInterval = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      const remaining = Math.max(0, this.duration - elapsed);

      this.timeLeft = Math.ceil(remaining / 1000);

      if (remaining <= 0) {
        this.timeLeft = 0;
        clearInterval(this.timerInterval);

        this.currentScreen = 'gameover';
        this.gameResult = 0;
        this.render();
        return;
      }

      // only update UI, no full render
      this.updateGameplayUI();
    }, 1000); // faster tick, smoother updates

    this.currentScreen = 'game';
    this.render();
  }
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }
  setupCards() {
    let allCards = [];

    this.cardPairs.forEach((pair, pairIndex) => {
      pair.forEach((type) => {
        allCards.push({
          type,
          pairId: pairIndex,
          flipped: false,
          matched: false,
        });
      });
    });

    // shuffle
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }

    // assign ids AFTER shuffle
    this.cards = allCards.map((card, index) => ({
      ...card,
      id: index,
    }));
  }

  onCardClick(index) {
    const card = this.cards[index];

    if (card.flipped || card.matched || this.flippedCards.length === 2) return;

    card.flipped = true;
    this.flippedCards.push(card);

    this.updateGameplayUI();

    if (this.flippedCards.length === 2) {
      setTimeout(() => this.checkMatch(), 800);
    }
  }

  checkMatch() {
    const [cardA, cardB] = this.flippedCards;

    if (cardA.pairId === cardB.pairId) {
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
    this.updateGameplayUI();
    if (this.cards.every((c) => c.matched)) {
      clearInterval(this.timerInterval);
      this.gameResult = 1;
      this.currentScreen = 'gameover';
      this.render();
    }
  }

  render() {
    if (this.lastRenderedScreen === this.currentScreen) return;
    this.lastRenderedScreen = this.currentScreen;

    if (this.sceneEl) this.sceneEl.remove();

    this.sceneEl = document.createElement('div');
    this.sceneEl.classList.add('container');
    this.container.innerHTML = '';

    switch (this.currentScreen) {
      case 'start':
        this.renderStartScreen();
        break;
      case 'rules':
        this.renderRulesScreen();
        break;
      case 'game':
        this.renderGameplayScreen();
        break;
      case 'gameover':
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
        <h1>Memory</h1>
      </div>
      <div class="bottomRow">
          <button id="btnNewGame" class="memoryBtn">Nova Igra</button>
      </div>
    </div>
    `;

    this.container.appendChild(this.sceneEl);

    this.sceneEl.querySelector('#btnNewGame').addEventListener('click', () => {
      this.currentScreen = 'rules';
      this.render();
    });

    this.btnBack = this.sceneEl.querySelector('#btnBack');
    this.sceneEl.querySelector('#btnBack').addEventListener('click', () => {
      this.manager.switch('StartMenu');
    });
  }

  renderRulesScreen() {
    this.sceneEl.innerHTML = `
    <div id="uputeScreen">
      <button class="btn backBtn" id="btnBack">
        <img src="${this.assets.images.get('backButton').src}" height="100%"/>
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

    this.sceneEl.querySelector('#btnStart').addEventListener('click', () => {
      this.startNewGame();
    });

    this.sceneEl.querySelector('#btnBack').addEventListener('click', () => {
      this.currentScreen = 'start';
      this.render();
    });
  }

  renderGameplayScreen() {
    if (!this.sceneEl || !this.sceneEl.querySelector('#gameScreen')) {
      if (this.sceneEl) this.sceneEl.remove();

      this.sceneEl = document.createElement('div');
      this.sceneEl.classList.add('container');

      // CREATE CARDS WITH BACK IMAGE
      const gridHTML = this.cards
        .map(
          (card) => `
      <div class="card" data-index="${card.id}">
        <img src="${this.assets.images.get('mem-card-back').src}" data-current="back" />
      </div>`,
        )
        .join('');

      // FULL SCREEN LAYOUT
      this.sceneEl.innerHTML = `
      <div id="gameScreen">
        <div class="topBar">
          <button class="btn backBtn memoryBtn" id="btnGiveUp">Odustani</button>
          <div id="gameInfo" class="scoreTime">
            Rezultat: ${this.score} | Vrijeme: ${this.formatTime(this.timeLeft)}
          </div>
        </div>
        <div class="gridWrapper">
          <div class="card-grid">
            ${gridHTML}
          </div>
        </div>
      </div>
    `;

      this.container.appendChild(this.sceneEl);

      // cache elements
      this.gridEl = this.sceneEl.querySelector('.card-grid');
      this.infoEl = this.sceneEl.querySelector('#gameInfo');
      this.cardElements = this.gridEl.querySelectorAll('.card');

      // attach listeners
      this.cardElements.forEach((cardEl) => {
        cardEl.addEventListener('click', () => {
          const index = parseInt(cardEl.getAttribute('data-index'));
          this.onCardClick(index);
        });
      });

      this.sceneEl.querySelector('#btnGiveUp').addEventListener('click', () => {
        clearInterval(this.timerInterval);
        this.currentScreen = 'gameover';
        this.gameResult = 0;
        this.render();
      });
    }

    // ALWAYS update UI
    this.updateGameplayUI();
  }

  updateGameplayUI() {
    if (!this.gridEl || !this.infoEl) return;

    // update score + time
    this.infoEl.textContent = `Rezultat: ${this.score} | Vrijeme: ${this.formatTime(this.timeLeft)}`;

    // update cards
    this.cardElements.forEach((cardEl, index) => {
      const card = this.cards[index];
      const img = cardEl.querySelector('img');

      const newSrc =
        card.flipped || card.matched
          ? this.assets.images.get(card.type).src
          : this.assets.images.get('mem-card-back').src;

      if (img.dataset.current !== newSrc) {
        img.src = newSrc;
        img.dataset.current = newSrc;
      }
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

    this.sceneEl.querySelector('#btnRestart').addEventListener('click', () => {
      this.currentScreen = 'start';
      this.render();
    });

    this.btnBack = this.sceneEl.querySelector('#btnMainMenu');
    this.sceneEl.querySelector('#btnMainMenu').addEventListener('click', () => {
      this.manager.switch('StartMenu');
    });
  }

  updateFrameCount() {
    super.updateFrameCount();
  }

  async destroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.lastRenderedScreen = null;
    this.input.off('move', this.handleMove);
    this.input.off('click', this.handleClick);
    this.sceneEl.remove();
    this.container.innerHTML = '';
    await super.destroy();
  }

  handleMove({ x, y, i }) {
    this.updateCursor(x, y, i);
  }

  handleClick({ x, y }) {
    const rect = document.body.getBoundingClientRect();

    let el = document.elementFromPoint(
      rect.left + x * rect.width,
      rect.top + y * rect.height,
    );

    if (!el) return;

    // ALWAYS resolve to meaningful parent
    const button = el.closest('button');
    if (button) {
      button.click();
      return;
    }

    const card = el.closest('.card');
    if (card) {
      card.click(); // IMPORTANT: trigger DOM click
      return;
    }
  }
}
