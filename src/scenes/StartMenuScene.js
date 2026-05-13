import BaseScene from '@engine/BaseScene.js';

export default class StartMenuScene extends BaseScene {
  constructor(params) {
    super(params);
    this.container = document.getElementById('gameContainer');

    this.handleMove = this.handleMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.updateFrameCount = this.updateFrameCount.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleWheel = this.handleWheel.bind(this);

    this.currentIndex = 0;
    this.lastFrameGesture = null;
    this.gameCards = []; // Spremnik za trajne DOM elemente kartica

    this.isSwitching = false; // Prevents double-firing startGame
  }

  async init() {
    await this.assets.loadImage(
      'profBaltazar',
      '/pictures/startMenu/profBaltazarMainScreen.webp',
    );
    await this.assets.loadImage(
      'cursor',
      '/pictures/starCatching/starCatchingCursor.webp',
    );
    await this.assets.loadImage('goUp', '/pictures/startMenu/like.webp');
    await this.assets.loadImage('goDown', '/pictures/startMenu/dislike.webp');
    await this.assets.loadImage('click', '/pictures/startMenu/click.webp');
    await this.assets.loadImage('memoryLogo', '/pictures/memoryGame/icon.webp');
    await this.assets.loadImage(
      'enigmaMachine',
      '/pictures/enigmaMachine/enigma.webp',
    );

    /*
    await this.assets.loadImage(
      'crtanjeLogo',
      '/pictures/drawingGame/icon.webp',
    );
    await this.assets.loadImage('KSPLogo', '/pictures/kspGame/icon.webp');
    
    await this.assets.loadImage(
      'labyrinthLogo',
      '/pictures/labyrinthGame/icon.webp',
    );
    await this.assets.loadImage(
      'tictactoeLogo',
      '/pictures/tictactoeGame/krizic.webp',
    );
    await this.assets.loadImage(
      'ninjafruitLogo',
      '/pictures/ninjafruitGame/sword1.webp',
    );
    */

    this.games = [
      {
        name: 'Baltazarova anatomija čudesa',
        logo: this.assets.images.get('memoryLogo').src,
        scene: 'Memory',
      },
      {
        name: 'Enigma stroj',
        logo: this.assets.images.get('enigmaMachine').src,
        scene: 'Enigma',
      },
      /*
      { name: "Ninja fruit", logo: this.assets.images.get('ninjafruitLogo').src, scene: "NinjaFruit" },
      { name: "Crtanje", logo: this.assets.images.get('crtanjeLogo').src, scene: "Drawing" },
      { name: "Kamen papir škare", logo: this.assets.images.get('KSPLogo').src, scene: "KSP" },
      { name: "Labirint", logo: this.assets.images.get('labyrinthLogo').src, scene: "Labirint" },
      { name: "Križić-kružić", logo: this.assets.images.get('tictactoeLogo').src, scene: "TicTacToe" },
      */
    ];
    this.sceneEntryTime = performance.now();
    this.lastFrameGestures = {};

    this.styleEl = this.loadStyle('/css/Start.css');

    this.sceneEl = document.createElement('div');
    this.sceneEl.classList.add('container');
    this.sceneEl.innerHTML = `
      <div class="firstLayer layer">
        <img class="imgProfBaltazar" src="${this.assets.images.get('profBaltazar').src}" />
      </div>
      <div class="secondLayer layer">
        <div class="game-menu">
        </div>
      </div>
      <div class="thirdLayer layer">
        <table class="instructionsTable">
          <tr class="instructionsImages">
            <th><img src="${this.assets.images.get('goUp').src}" /></th>
            <th><img src="${this.assets.images.get('goDown').src}" /></th>
            <th><img src="${this.assets.images.get('click').src}" /></th>
          </tr>
          <tr class="instructionsText textStyle">
            <th>gore</th>
            <th>dolje</th>
            <th>odabir</th>
          </tr>
        </table>
      </div>
    `;

    this.container.appendChild(this.sceneEl);
    this.cursorContainer = this.sceneEl;

    // KREIRANJE KARTICA JEDNOM (Persistentni DOM)
    const menu = this.sceneEl.querySelector('.game-menu');
    this.gameCards = this.games.map((game, index) => {
      const card = document.createElement('button');
      card.className = 'textStyle game-card';
      card.innerHTML = `
        <img src="${game.logo}" alt="${game.name}">
        <span>${game.name}</span>
      `;

      card.addEventListener('click', (e) => {
        // Prevent the click from "bubbling" up and being caught by other listeners
        e.stopPropagation();

        if (index === this.currentIndex) {
          // Only start if we aren't already switching scenes
          if (!this.isSwitching) {
            this.isSwitching = true;
            this.startGame(game.scene);
          }
        } else {
          this.currentIndex = index;
          this.renderCards();
        }
      });

      menu.appendChild(card);
      return card;
    });

    this.input.on('move', this.handleMove);
    this.input.on('click', this.handleClick);
    this.input.on('frameCount', this.updateFrameCount);

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('wheel', this.handleWheel, { passive: false });

    this.renderCards();
  }

  render() {}

  updateFrameCount() {
    super.updateFrameCount();

    const timeSinceEntry = performance.now() - this.sceneEntryTime;
    if (timeSinceEntry < 500) return;

    const predictions = Array.from(this.input.handPredictions?.values() || []);
    if (!predictions.length) return;

    var interacted = false;

    predictions.forEach((pred) => {
      const { gesture, i } = pred;

      if (gesture === 'Thumb_Up') {
        if (!interacted) {
          interacted = true;
          this.scrollUp();
        }
      } else if (gesture === 'Thumb_Down') {
        if (!interacted) {
          interacted = true;
          this.scrollDown();
        }
      }

      this.lastFrameGestures[i] = gesture;
    });

    if (interacted) {
      this.sceneEntryTime = performance.now();
    }
  }

  async destroy() {
    this.input.off('move', this.handleMove);
    this.input.off('click', this.handleClick);
    await super.destroy();
    this.removeStyle(this.styleEl);
    this.sceneEl.remove();
    this.container.innerHTML = '';

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('wheel', this.handleWheel);
  }

  handleMove({ x, y, i }) {
    this.updateCursor(x, y, i);
  }

  handleClick(params) {
    // If the event has 'isTrusted: true', it means it's a real hardware click
    // which the browser handles automatically via the button's listener.
    // We ONLY want to run this logic for simulated clicks (like gestures).
    if (params.isTrusted === true) return;

    const { x, y } = params;
    const el = document.elementFromPoint(
      x * window.innerWidth,
      y * window.innerHeight,
    );

    const button = el?.closest('button');
    if (button) {
      // This will now only be called by your Gesture/AI system
      button.click();
    }
  }

  handleKeyDown(e) {
    if (e.key === 'ArrowUp') {
      this.scrollUp();
    } else if (e.key === 'ArrowDown') {
      this.scrollDown();
    } else if (e.key === 'Enter') {
      const currGame = this.games[this.currentIndex];
      if (currGame) this.startGame(currGame.scene);
    }
  }

  handleWheel(e) {
    e.preventDefault();
    if (e.deltaY < 0) {
      this.scrollUp();
    } else if (e.deltaY > 0) {
      this.scrollDown();
    }
  }

  /**
   * Sada samo ažurira klase postojećih elemenata umjesto re-renderiranja HTML-a.
   * To eliminira "flash" jer preglednik ne mora ponovno učitavati slike.
   */
  renderCards() {
    // Debugging: see if this is called unnecessarily
    if (this.lastRenderedIndex === this.currentIndex) return;
    this.lastRenderedIndex = this.currentIndex;

    this.gameCards.forEach((card, index) => {
      card.classList.toggle('active', index === this.currentIndex);
      card.classList.toggle(
        'faded',
        index === this.currentIndex - 1 || index === this.currentIndex + 1,
      );
      card.classList.toggle(
        'hidden',
        index !== this.currentIndex &&
          index !== this.currentIndex - 1 &&
          index !== this.currentIndex + 1,
      );
    });
  }

  scrollUp() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderCards();
    }
  }

  scrollDown() {
    if (this.currentIndex < this.games.length - 1) {
      this.currentIndex++;
      this.renderCards();
    }
  }

  startGame(sceneName) {
    this.manager.switch(sceneName);
  }
}
