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
    this.swordAnimationTimer = 0; 
    this.swordX = 0;
    this.swordY = 0;
    this.fruitTypes = {
      small: [
        { name: "lemon", points: 50 },
        { name: "orange", points: 50 },
        { name: "strawberry", points: 50 }
      ],
      medium: [
        { name: "apple", points: 70 },
        { name: "banana", points: 70 }
      ],
      large: [
        { name: "pineapple", points: 100 },
        { name: "watermelon", points: 100 }
      ]
    };
    this.spawnTimer = 0;
    this.baseSpawnInterval = 2500;
    this.minSpawnInterval = 600;
    
    this.handleMove = this.handleMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.updateFrameCount = this.updateFrameCount.bind(this);
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
    this.sceneEl.classList.add("container", "ninja-fruit-container");

    this.container.appendChild(this.sceneEl);

    this.cursorContainer = this.sceneEl;

    this.createMenuScreen();
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
    
    this.cursorContainer = this.sceneEl;
    
    this.sceneEl.appendChild(this.createBackground("background1"));
    this.sceneEl.appendChild(this.createOverlay("dark"));
    this.sceneEl.appendChild(this.createBackButton(() => this.createMenuScreen()));

    const title = document.createElement("h1");
    title.innerText = "Upute";
    title.className = "textStyle ninja-fruit-subtitle";

    const upute = document.createElement("p");
    upute.innerText = "Koristi pokrete ruke ispred kamere kako bi izrezao što više voća koje iskače na ekranu. Pazi da voće ne dodirne pod - izgubit ćeš bodove!";
    upute.className = "textStyle ninja-fruit-instructions";

    const btnPlay = this.createButton("Igraj", () => this.createGameScreen());

    this.sceneEl.appendChild(title);
    this.sceneEl.appendChild(upute);
    this.sceneEl.appendChild(btnPlay);
  }

  createGameScreen() {
    this.inGame = true;
    this.clearScene();
    this.resetHands();
    
    this.cursorContainer = this.sceneEl;
    
    this.sceneEl.appendChild(this.createBackground("background2"));
    this.sceneEl.appendChild(this.createOverlay("light"));

    const btnQuit = document.createElement("button");
    btnQuit.innerText = "Odustani";
    btnQuit.className = "textStyle ninja-fruit-quit-button";
    btnQuit.addEventListener("click", () => this.createMenuScreen());
    this.sceneEl.appendChild(btnQuit);

    this.scoreEl = document.createElement("div");
    this.scoreEl.className = "textStyle ninja-fruit-score";
    this.sceneEl.appendChild(this.scoreEl);

    this.elapsedTime = 0;
    this.score = 0;
    this.fruits = [];
    this.bombs = [];
    this.slices = [];
    this.gameOver = false;
    this.spawnTimer = 0;
    this.spawnInterval = this.baseSpawnInterval;

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
        
        if (fruit.y >= window.innerHeight - 50) {
          if (fruit.hasReachedPeak) {
            this.gameOver = true;
            fruit.el.remove();
            this.fruits.splice(index, 1);
            this.createEndScreen();
            return;
          } else {
            fruit.el.remove();
            this.fruits.splice(index, 1);
          }
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
    const currentSpeed = 150 + this.elapsedTime * 5;

    const reversedFruits = ['orange', 'pineapple', 'lemon'];
    const isReversed = reversedFruits.includes(fruit.name);

    const sliceOffset = fruit.size / 2.5;
    const sliceSize = fruit.size * 0.8;

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
      velocityX: -120,
      speed: currentSpeed + 150,
      rotationSpeed: -2
    });

    this.slices.push({
      el: rightSlice,
      x: originalX + sliceOffset,
      y: currentY,
      velocityX: 120,
      speed: currentSpeed + 150,
      rotationSpeed: 2
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

    this.fruits.forEach((fruit, index) => {
      const fruitCenterX = parseFloat(fruit.el.style.left) + fruit.size / 2;
      const fruitCenterY = parseFloat(fruit.el.style.top) + fruit.size / 2;
      
      const distance = Math.sqrt(
        Math.pow(this.swordX - fruitCenterX, 2) + 
        Math.pow(this.swordY - fruitCenterY, 2)
      );
      
      if (distance < fruit.size / 2 + 50) {
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
      
      if (distance < Math.min(bomb.width, bomb.height) / 2 + 50) {
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

    const statsContainer = document.createElement("div");
    statsContainer.className = "textStyle ninja-fruit-stats";
    
    const mins = Math.floor(this.elapsedTime / 60);
    const secs = Math.floor(this.elapsedTime % 60).toString().padStart(2, "0");
    statsContainer.innerHTML = `Rezultat: ${this.score}<br>Vrijeme: ${mins}:${secs}`;
    this.sceneEl.appendChild(statsContainer);

    const gameOverTitle = document.createElement("h1");
    gameOverTitle.innerText = "Kraj!";
    gameOverTitle.className = "textStyle ninja-fruit-game-over-title";

    const playAgainText = document.createElement("h2");
    playAgainText.innerText = "Igraj ponovo!";
    playAgainText.className = "textStyle ninja-fruit-play-again-text";

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("ninja-fruit-button-container");

    const playAgainBtn = this.createButton("Nova igra", () => this.createGameScreen());
    
    const menuBtn = this.createButton("Izbornik", () => this.createMenuScreen());

    buttonContainer.appendChild(playAgainBtn);
    buttonContainer.appendChild(menuBtn);

    this.sceneEl.appendChild(gameOverTitle);
    this.sceneEl.appendChild(playAgainText);
    this.sceneEl.appendChild(buttonContainer);
  }

  spawnFruit() {
    const categories = Object.keys(this.fruitTypes);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const fruits = this.fruitTypes[randomCategory];
    const randomFruit = fruits[Math.floor(Math.random() * fruits.length)];
    
    const img = document.createElement("img");
    img.src = this.assets.images.get(randomFruit.name).src;
    img.classList.add("ninja-fruit-item");

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const minLeft = screenWidth * 0.05;
    const maxLeft = screenWidth * 0.95;
    const leftPosition = Math.random() * (maxLeft - minLeft) + minLeft;
    
    const startY = screenHeight * 0.75
    img.style.top = `${startY}px`;
    img.style.left = `${leftPosition}px`;

    const initialVelocityY = -(screenHeight * 0.01 + Math.random() * screenHeight * 0.1);
    const gravity = screenHeight * 0.2;
    const maxHeight = screenHeight * 0.2;
    
    this.sceneEl.appendChild(img);
    this.fruits.push({ 
      el: img, 
      y: startY,
      x: leftPosition,
      velocityY: initialVelocityY,
      gravity: gravity,
      maxHeight: maxHeight,
      points: randomFruit.points,
      name: randomFruit.name,
      hasReachedPeak: false
    });
  }

  spawnBomb() {
    
    const img = document.createElement("img");
    img.src = this.assets.images.get("bomb").src;
    img.classList.add("ninja-fruit-item", "ninja-fruit-bomb");
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const minLeft = 0;
    const maxLeft = screenWidth * 0.9 + screenWidth * 0.05;
    const leftPosition = Math.random() * (maxLeft - minLeft) + minLeft;
    
    const startY = screenHeight * 1.1;
    img.style.top = `${startY}px`;
    img.style.left = `${leftPosition}px`;

    const initialVelocityY = -(screenHeight * 0.01 + Math.random() * screenHeight * 0.1);
    const gravity = screenHeight * 0.2;
    const maxHeight = screenHeight * 0.2;

    this.sceneEl.appendChild(img);
    this.bombs.push({ 
      el: img, 
      y: startY,
      x: leftPosition,
      velocityY: initialVelocityY,
      gravity: gravity,
      maxHeight: maxHeight,
      hasReachedPeak: false
    });
  }

  render() {}

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