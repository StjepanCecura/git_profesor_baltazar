import BaseScene from "@engine/BaseScene.js";

export default class NinjaFruitScene extends BaseScene {
  constructor(params) {
    super(params);
    this.container = document.getElementById("gameContainer");
    this.elapsedTime = 0;
    this.score = 0;
    this.fruits = [];
    this.bombs = [];
    this.slices = [];
    this.gameOver = false;
    this.lives = 3;
    this.swordAnimationTimer = 0;
    this.swordX = 0;
    this.swordY = 0;
    this.fruitTypes = {
      small: [
        { name: "lemon", size: 120, points: 50 },
        { name: "orange", size: 130, points: 50 },
        { name: "strawberry", size: 110, points: 50 }
      ],
      medium: [
        { name: "apple", size: 120, points: 70 },
        { name: "banana", size: 170, points: 70 }
      ],
      large: [
        { name: "pineapple", size: 190, points: 100 },
        { name: "watermelon", size: 210, points: 100 }
      ]
    };
    this.spawnTimer = 0;
    this.baseSpawnInterval = 3200;
    this.minSpawnInterval = 1200;

    this.handleMove = this.handleMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.updateFrameCount = this.updateFrameCount.bind(this);

    this.fruitScale = 1;
    this.screenFactor = 1;
  }

  async init() {
    await this.loadCSS();

    await this.assets.loadImage("cursor", "/pictures/ninjafruitGame/sword1.webp");
    await this.assets.loadImage("cursorTip", "/pictures/ninjafruitGame/sword1.webp");

    await this.assets.loadImage("background1", "/pictures/ninjafruitGame/background1.webp");
    await this.assets.loadImage("background2", "/pictures/ninjafruitGame/background2.webp");
    await this.assets.loadImage("backButton", "/pictures/backButton.webp");

    await this.assets.loadImage("sword1", "/pictures/ninjafruitGame/sword1.webp");
    await this.assets.loadImage("sword2", "/pictures/ninjafruitGame/sword2.webp");
    await this.assets.loadImage("sword3", "/pictures/ninjafruitGame/sword3.webp");
    await this.assets.loadImage("sword4", "/pictures/ninjafruitGame/sword4.webp");

    await this.assets.loadImage("apple", "/pictures/ninjafruitGame/apple.webp");
    await this.assets.loadImage("banana", "/pictures/ninjafruitGame/banana.webp");
    await this.assets.loadImage("lemon", "/pictures/ninjafruitGame/lemon.webp");
    await this.assets.loadImage("orange", "/pictures/ninjafruitGame/orange.webp");
    await this.assets.loadImage("pineapple", "/pictures/ninjafruitGame/pineapple.webp");
    await this.assets.loadImage("strawberry", "/pictures/ninjafruitGame/strawberry.webp");
    await this.assets.loadImage("watermelon", "/pictures/ninjafruitGame/watermelon.webp");

    await this.assets.loadImage("bomb", "/pictures/ninjafruitGame/bomb.webp");

    await this.assets.loadImage("appleslice1", "/pictures/ninjafruitGame/appleslice1.webp");
    await this.assets.loadImage("appleslice2", "/pictures/ninjafruitGame/appleslice2.webp");
    await this.assets.loadImage("bananaslice1", "/pictures/ninjafruitGame/bananaslice1.webp");
    await this.assets.loadImage("bananaslice2", "/pictures/ninjafruitGame/bananaslice2.webp");
    await this.assets.loadImage("lemonslice1", "/pictures/ninjafruitGame/lemonslice1.webp");
    await this.assets.loadImage("lemonslice2", "/pictures/ninjafruitGame/lemonslice2.webp");
    await this.assets.loadImage("orangeslice1", "/pictures/ninjafruitGame/orangeslice1.webp");
    await this.assets.loadImage("orangeslice2", "/pictures/ninjafruitGame/orangeslice2.webp");
    await this.assets.loadImage("pineappleslice1", "/pictures/ninjafruitGame/pineappleslice1.webp");
    await this.assets.loadImage("pineappleslice2", "/pictures/ninjafruitGame/pineappleslice2.webp");
    await this.assets.loadImage("strawberryslice1", "/pictures/ninjafruitGame/strawberryslice1.webp");
    await this.assets.loadImage("strawberryslice2", "/pictures/ninjafruitGame/strawberryslice2.webp");
    await this.assets.loadImage("watermelonslice1", "/pictures/ninjafruitGame/watermelonslice1.webp");
    await this.assets.loadImage("watermelonslice2", "/pictures/ninjafruitGame/watermelonslice2.webp");

    this.input.on("move", this.handleMove);
    this.input.on("click", this.handleClick);
    this.input.on("frameCount", this.updateFrameCount);

    this.sceneEl = document.createElement("div");
    this.updateFruitScale();
    this.sceneEl.classList.add("container", "ninja-fruit-container");

    this.container.appendChild(this.sceneEl);

    this.cursorContainer = this.sceneEl;

    this.createMenuScreen();
    window.addEventListener("resize", this.updateFruitScale.bind(this));
  }

  async loadCSS() {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = '/css/ninjafruit.css';
      link.onload = () => resolve();
      link.onerror = () => reject(new Error('Failed to load CSS'));
      document.head.appendChild(link);
    });
  }

  clearScene() {
    this.sceneEl.innerHTML = "";
    this.sceneEl.className = "container ninja-fruit-container";
    this.fruits = [];
    this.bombs = [];
    this.slices = [];
    this.gameOver = false;
    this.spawnTimer = 0;
  }

  createBackground(name) {
    const bg = document.createElement("div");
    bg.classList.add("ninja-fruit-background");
    bg.style.backgroundImage = `url('${this.assets.images.get(name).src}')`;
    return bg;
  }

  createOverlay(type = "dark") {
    const overlay = document.createElement("div");
    overlay.classList.add("ninja-fruit-overlay", type);
    return overlay;
  }

  createBackButton(onClick) {
    const back = document.createElement("img");
    back.src = this.assets.images.get("backButton").src;
    back.classList.add("ninja-fruit-back-button");
    back.addEventListener("click", onClick);
    return back;
  }

  createButton(text, onClick) {
    const btn = document.createElement("button");
    btn.innerText = text;
    btn.className = "textStyle ninja-fruit-button";
    btn.addEventListener("click", onClick);
    return btn;
  }

  createMenuScreen() {
    this.inGame = false;
    this.clearScene();
    this.resetHands();
    this.sceneEl.classList.add("menu-layout");

    this.cursorContainer = this.sceneEl;

    this.sceneEl.appendChild(this.createBackground("background1"));
    this.sceneEl.appendChild(this.createBackButton(() => this.manager.switch('StartMenu')));

    const title = document.createElement("h1");
    title.innerText = "Ninja Fruit";
    title.className = "textStyle ninja-fruit-title";

    const btnStart = this.createButton("Nova igra", () => this.createUputeScreen());

    this.sceneEl.appendChild(title);
    this.sceneEl.appendChild(btnStart);
  }

  createUputeScreen() {
    this.inGame = false;
    this.clearScene();
    this.resetHands();

    this.sceneEl.classList.add("instructions-layout");

    this.cursorContainer = this.sceneEl;

    this.sceneEl.appendChild(this.createBackground("background1"));
    this.sceneEl.appendChild(this.createOverlay("dark"));
    this.sceneEl.appendChild(this.createBackButton(() => this.createMenuScreen()));

    const instructionsCard = document.createElement("div");
    instructionsCard.className = "ninja-fruit-instructions-card";

    const title = document.createElement("h1");
    title.innerText = "Upute";
    title.className = "textStyle ninja-fruit-subtitle";

    const upute = document.createElement("p");
    upute.innerText = "Koristi pokrete ruke ispred kamere kako bi izrezao što više voća koje iskače na ekranu. Pazi da voće ne dodirne pod - izgubit ćeš bodove!";
    upute.className = "textStyle ninja-fruit-instructions";

    const btnPlay = this.createButton("Igraj", () => this.createGameScreen());

    instructionsCard.appendChild(title);
    instructionsCard.appendChild(upute);
    instructionsCard.appendChild(btnPlay);

    this.sceneEl.appendChild(instructionsCard);
  }

  createGameScreen() {
    this.inGame = true;
    this.clearScene();
    this.lives = 3;
    this.resetHands();

    this.cursorContainer = this.sceneEl;

    this.sceneEl.appendChild(this.createBackground("background2"));
    this.sceneEl.appendChild(this.createOverlay("light"));

    const gameHeader = document.createElement("div");
    gameHeader.className = "ninja-fruit-game-header";

    this.livesEl = document.createElement("div");
    this.livesEl.className = "ninja-fruit-lives-container";
    gameHeader.appendChild(this.livesEl);

    this.updateLivesUI();

    this.scoreEl = document.createElement("div");
    this.scoreEl.className = "textStyle ninja-fruit-score";
    gameHeader.appendChild(this.scoreEl);

    this.sceneEl.appendChild(gameHeader);

    const btnQuit = document.createElement("button");
    btnQuit.innerHTML = "&#x2715;";
    btnQuit.className = "ninja-fruit-exit-icon-btn";
    btnQuit.addEventListener("click", () => this.createMenuScreen());
    this.sceneEl.appendChild(btnQuit);

    this.elapsedTime = 0;
    this.score = 0;
    this.fruits = [];
    this.bombs = [];
    this.slices = [];
    this.gameOver = false;
    this.spawnTimer = 0;
    this.spawnInterval = this.baseSpawnInterval;
  }

  updateLivesUI() {
    if (!this.livesEl) return;
    this.livesEl.innerHTML = "";

    const maxLives = 3;

    for (let i = 1; i <= maxLives; i++) {
      const heart = document.createElement("span");
      heart.className = "ninja-fruit-heart";

      if (i <= this.lives) {
        heart.innerHTML = "&#x2764;";
        heart.classList.add("full");
      } else {
        heart.innerHTML = "&#x2764;";
        heart.classList.add("empty");
      }
      this.livesEl.appendChild(heart);
    }
  }

  update(dt) {
    if (this.inGame && !this.gameOver) {
      this.spawnInterval = Math.max(
        this.minSpawnInterval,
        this.baseSpawnInterval - (this.elapsedTime * 30)
      );

      this.spawnTimer += dt;
      if (this.spawnTimer > this.spawnInterval) {
        this.spawnTimer = 0;
        if (Math.random() < 0.15) {
          this.spawnBomb();
        } else {
          this.spawnFruit();
        }
      }

      this.elapsedTime += dt / 1000;
      if (this.scoreEl) {
        const mins = Math.floor(this.elapsedTime / 60);
        const secs = Math.floor(this.elapsedTime % 60).toString().padStart(2, "0");
        this.scoreEl.innerText = `Rezultat: ${this.score}\nVrijeme: ${mins}:${secs}`;
      }

      this.fruits.forEach((fruit, index) => {
        const deltaTime = dt / 1000;
        fruit.velocityY += fruit.gravity * deltaTime;

        fruit.y += fruit.velocityY * deltaTime;

        fruit.el.style.top = `${fruit.y}px`;

        if (fruit.velocityY > 0 && !fruit.hasReachedPeak) {
          fruit.hasReachedPeak = true;
        }

        if (fruit.hasReachedPeak && fruit.y >= window.innerHeight - 50) {
          fruit.el.remove();
          this.fruits.splice(index, 1);

          this.loseLife();
          return;
        }
      });

      this.bombs.forEach((bomb, index) => {
        const deltaTime = dt / 1000;

        bomb.velocityY += bomb.gravity * deltaTime;

        bomb.y += bomb.velocityY * deltaTime;

        bomb.el.style.top = `${bomb.y}px`;

        if (bomb.y >= window.innerHeight - 50) {
          bomb.el.remove();
          this.bombs.splice(index, 1);
        }
      });

      this.slices.forEach((slice, index) => {
        slice.y += slice.speed * (dt / 1000);
        slice.x += slice.velocityX * (dt / 1000);

        if (slice.rotationSpeed) {
          const currentTransform = slice.el.style.transform;
          const rotationMatch = currentTransform.match(/rotate\(([^)]+)\)/);
          let currentRotation = 0;

          if (rotationMatch) {
            currentRotation = parseFloat(rotationMatch[1]);
          }

          const newRotation = currentRotation + (slice.rotationSpeed * (dt / 16.67));
          slice.el.style.transform = currentTransform.replace(/rotate\([^)]+\)/, `rotate(${newRotation}deg)`);
        }

        slice.el.style.top = `${slice.y}px`;
        slice.el.style.left = `${slice.x}px`;

        if (slice.y > window.innerHeight + 100) {
          slice.el.remove();
          this.slices.splice(index, 1);
        }
      });

      this.checkCollisions();
    }
  }

  sliceFruit(fruit, originalElement, originalX) {
    const currentY = parseFloat(originalElement.style.top);
    const rect = originalElement.getBoundingClientRect();

    const sliceSize = rect.width * 0.8;
    const sliceOffset = sliceSize / 2;

    const baseSpeed = 650 + this.elapsedTime * 12;
    const currentSpeed = baseSpeed * this.screenFactor * 1.1;

    const reversedFruits = ['orange', 'pineapple', 'lemon'];
    const isReversed = reversedFruits.includes(fruit.name);

    const leftSlice = document.createElement("img");
    leftSlice.src = this.assets.images.get(`${fruit.name}slice${isReversed ? '1' : '2'}`).src;
    leftSlice.classList.add("ninja-fruit-slice", "left");
    leftSlice.style.top = `${currentY}px`;
    leftSlice.style.left = `${originalX - sliceOffset}px`;
    leftSlice.style.width = `${sliceSize}px`;
    leftSlice.style.height = `${sliceSize}px`;

    const rightSlice = document.createElement("img");
    rightSlice.src = this.assets.images.get(`${fruit.name}slice${isReversed ? '2' : '1'}`).src;
    rightSlice.classList.add("ninja-fruit-slice", "right");
    rightSlice.style.top = `${currentY}px`;
    rightSlice.style.left = `${originalX + sliceOffset}px`;
    rightSlice.style.width = `${sliceSize}px`;
    rightSlice.style.height = `${sliceSize}px`;

    this.sceneEl.appendChild(leftSlice);
    this.sceneEl.appendChild(rightSlice);

    setTimeout(() => {
      leftSlice.classList.add("animated");
      rightSlice.classList.add("animated");
    }, 50);

    setTimeout(() => {
      leftSlice.classList.add("fading");
      rightSlice.classList.add("fading");
    }, 800);

    this.slices.push({
      el: leftSlice,
      x: originalX - sliceOffset,
      y: currentY,
      velocityX: -140 * this.screenFactor,
      speed: currentSpeed + 380,
      rotationSpeed: -2.8
    });

    this.slices.push({
      el: rightSlice,
      x: originalX + sliceOffset,
      y: currentY,
      velocityX: 140 * this.screenFactor,
      speed: currentSpeed + 380,
      rotationSpeed: 2.8
    });
  }

  updateSwordPosition(x, y) {
    if (this.inGame) {
      this.swordX = x * window.innerWidth;
      this.swordY = y * window.innerHeight;
    }
  }

  animateSwordSlash() {
    const cursors = Array.from(this.handCursors.values());
    if (cursors.length === 0) return;

    const cursor = cursors[0];
    if (!cursor || !cursor.img) return;

    const swordFrames = ["sword2", "sword3", "sword4"];
    let frameIndex = 0;

    const animate = () => {
      if (frameIndex < swordFrames.length) {
        cursor.img.src = this.assets.images.get(swordFrames[frameIndex]).src;
        frameIndex++;
        setTimeout(animate, 80);
      } else {
        setTimeout(() => {
          if (cursor.img) {
            cursor.img.src = this.assets.images.get("sword1").src;
          }
        }, 150);
      }
    };
    animate();
  }

  checkCollisions() {
    if (!this.inGame || this.gameOver) return;

    const hitTolerance = 45 * this.screenFactor;

    this.fruits.forEach((fruit, index) => {
      const fruitCenterX = parseFloat(fruit.el.style.left) + fruit.size / 2;
      const fruitCenterY = parseFloat(fruit.el.style.top) + fruit.size / 2;

      const distance = Math.sqrt(
        Math.pow(this.swordX - fruitCenterX, 2) +
        Math.pow(this.swordY - fruitCenterY, 2)
      );

      if (distance < (fruit.size / 2) + hitTolerance) {
        this.sliceFruit(fruit, fruit.el, parseFloat(fruit.el.style.left));
        this.score += fruit.points;
        this.animateSwordSlash();

        fruit.el.remove();
        this.fruits.splice(index, 1);
      }
    });

    this.bombs.forEach((bomb, index) => {
      const bombCenterX = parseFloat(bomb.el.style.left) + bomb.width / 2;
      const bombCenterY = parseFloat(bomb.el.style.top) + bomb.height / 2;

      const distance = Math.sqrt(
        Math.pow(this.swordX - bombCenterX, 2) +
        Math.pow(this.swordY - bombCenterY, 2)
      );

      if (distance < Math.min(bomb.width, bomb.height) / 2 + hitTolerance) {
        this.gameOver = true;
        this.animateSwordSlash();

        bomb.el.remove();
        this.bombs.splice(index, 1);
        this.createEndScreen();
      }
    });
  }

  createEndScreen() {
    this.inGame = false;
    this.clearScene();
    this.sceneEl.classList.add("center-layout");

    this.cursorContainer = this.sceneEl;

    this.sceneEl.appendChild(this.createBackground("background2"));
    this.sceneEl.appendChild(this.createOverlay("dark"));

    const endCard = document.createElement("div");
    endCard.className = "ninja-fruit-end-card";

    const gameOverTitle = document.createElement("h1");
    gameOverTitle.innerText = "Kraj!";
    gameOverTitle.className = "textStyle ninja-fruit-game-over-title";
    endCard.appendChild(gameOverTitle);

    const statsContainer = document.createElement("div");
    statsContainer.className = "textStyle ninja-fruit-stats";

    const mins = Math.floor(this.elapsedTime / 60);
    const secs = Math.floor(this.elapsedTime % 60).toString().padStart(2, "0");
    statsContainer.innerHTML = `<p>Rezultat: <span>${this.score}</span></p><p>Vrijeme: <span>${mins}:${secs}</span></p>`;
    endCard.appendChild(statsContainer);

    const playAgainText = document.createElement("h2");
    playAgainText.innerText = "Igraj ponovo!";
    playAgainText.className = "textStyle ninja-fruit-play-again-text";
    endCard.appendChild(playAgainText);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("ninja-fruit-button-container");

    const playAgainBtn = this.createButton("Nova igra", () => this.createGameScreen());

    const menuBtn = this.createButton("Izbornik", () => this.createMenuScreen());

    buttonContainer.appendChild(playAgainBtn);
    buttonContainer.appendChild(menuBtn);
    endCard.appendChild(buttonContainer);

    this.sceneEl.appendChild(endCard);
  }

  spawnFruit() {
    const categories = Object.keys(this.fruitTypes);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const fruits = this.fruitTypes[randomCategory];
    const randomFruit = fruits[Math.floor(Math.random() * fruits.length)];
    const size = randomFruit.size * this.fruitScale;

    const img = document.createElement("img");
    img.src = this.assets.images.get(randomFruit.name).src;
    img.classList.add("ninja-fruit-item");

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const padding = screenWidth * 0.05;
    const maxLeft = screenWidth - size - padding;
    const minLeft = padding;
    const leftPosition = Math.random() * (maxLeft - minLeft) + minLeft;

    const startY = screenHeight - size;
    img.style.top = `${startY}px`;
    img.style.left = `${leftPosition}px`;

    img.style.width = `${size}px`;
    img.style.height = `${size}px`;

    const initialVelocityY = -((1800 + Math.random() * 400) * this.screenFactor);
    const gravity = 1800 * Math.sqrt(this.screenFactor);

    const maxHeight = screenHeight * 0.8;

    this.sceneEl.appendChild(img);
    this.fruits.push({
      el: img,
      y: startY,
      x: leftPosition,
      velocityY: initialVelocityY,
      gravity: gravity,
      maxHeight: maxHeight,
      points: randomFruit.points,
      size: size,
      name: randomFruit.name,
      hasReachedPeak: false
    });
  }

  spawnBomb() {
    const scale = this.fruitScale;
    const bombWidth = 170 * scale;
    const bombHeight = 150 * scale;

    const img = document.createElement("img");
    img.src = this.assets.images.get("bomb").src;
    img.classList.add("ninja-fruit-item", "ninja-fruit-bomb");

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const minLeft = 0;
    const maxLeft = screenWidth - bombWidth;
    const leftPosition = Math.random() * (maxLeft - minLeft) + minLeft;

    const startY = screenHeight - bombHeight;
    img.style.top = `${startY}px`;
    img.style.left = `${leftPosition}px`;

    img.style.width = `${bombWidth}px`;
    img.style.height = `${bombHeight}px`;

    const initialVelocityY = -((1800 + Math.random() * 400) * this.screenFactor);
    const gravity = 1800 * Math.sqrt(this.screenFactor);
    const maxHeight = screenHeight * 0.3;

    this.sceneEl.appendChild(img);
    this.bombs.push({
      el: img,
      y: startY,
      x: leftPosition,
      velocityY: initialVelocityY,
      gravity: gravity,
      maxHeight: maxHeight,
      width: bombWidth,
      height: bombHeight,
      hasReachedPeak: false
    });
  }

  updateFruitScale() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    let scale;

    if (h < 500 && w > h) {
      scale = 0.5;
    }
    else if (w < 480) {
      scale = 0.55;
    }
    else if (w < 768) {
      scale = 0.7;
    }
    else if (w < 1400) {
      scale = 0.9;
    }
    else if (w < 2200) {
      scale = 1.15;
    }
    else {
      scale = 1.35;
    }

    if (h >= 2500) {
      scale = 2.5;
    }

    if (w >= 3500 && w > h) {
      scale *= 1.4;
    }

    if (w >= 1024 && w <= 1600 && h <= 900) {
      scale *= 0.85;
    }

    this.fruitScale = scale;
    this.screenFactor = Math.max(1, h / 1080);
  }

  loseLife() {
    this.lives--;

    if (this.updateLivesUI) {
      this.updateLivesUI();
    }

    if (this.lives <= 0) {
      this.gameOver = true;
      this.createEndScreen();
    }
  }

  render() { }

  handleMove({ x, y, i }) {
    this.updateCursor(x, y, i);
    this.updateSwordPosition(x, y);
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
    }
  }

  updateFrameCount() {
    super.updateFrameCount();
  }

  async destroy() {
    this.input.off("move", this.handleMove);
    this.input.off("click", this.handleClick);
    this.input.off("frameCount", this.updateFrameCount);

    const cssLink = document.querySelector('link[href="/css/ninjafruit.css"]');
    if (cssLink) {
      cssLink.remove();
    }

    await super.destroy();
    this.sceneEl.remove();
  }
}