import BaseScene from "@engine/BaseScene.js";

export default class NinjaFruitScene extends BaseScene {
  constructor(params) {
    super(params);
    this.container = document.getElementById("gameContainer");
    this.elapsedTime = 0;
    this.score = 0;
    this.fruits = [];
    this.bombs = []; // Dodano za praćenje bombi
    this.slices = []; // Dodano za praćenje kriški voća
    this.gameOver = false; // Flag za kraj igre
    this.swordAnimationTimer = 0; // Timer za animaciju mača
    this.swordX = 0; // Trenutna X pozicija mača
    this.swordY = 0; // Trenutna Y pozicija mača
    this.fruitTypes = {
      small: [
        { name: "lemon", size: 280, points: 50 },
        { name: "orange", size: 300, points: 50 },
        { name: "strawberry", size: 250, points: 50 }
      ],
      medium: [
        { name: "apple", size: 350, points: 70 },
        { name: "banana", size: 380, points: 70 }
      ],
      large: [
        { name: "pineapple", size: 450, points: 100 },
        { name: "watermelon", size: 480, points: 100 }
      ]
    };
    this.spawnTimer = 0;
    this.baseSpawnInterval = 2500; // početno vrijeme između pojavljivanja (brže)
    this.minSpawnInterval = 600; // najbrže moguće spawnjanje (brže)
    
    // Bind methods for hand tracking
    this.handleMove = this.handleMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.updateFrameCount = this.updateFrameCount.bind(this);
  }

  async init() {
    // Load CSS file
    await this.loadCSS();
    
    // Load cursor images for hand tracking (using sword as cursor)
    await this.assets.loadImage("cursor", "/pictures/ninjafruitGame/sword1.webp");
    await this.assets.loadImage("cursorTip", "/pictures/ninjafruitGame/sword1.webp");
    
    // Load background and UI images
    await this.assets.loadImage("background1", "/pictures/ninjafruitGame/background1.webp");
    await this.assets.loadImage("background2", "/pictures/ninjafruitGame/background2.webp");
    await this.assets.loadImage("backButton", "/pictures/backButton.webp");
    
    // Load sword images
    await this.assets.loadImage("sword1", "/pictures/ninjafruitGame/sword1.webp");
    await this.assets.loadImage("sword2", "/pictures/ninjafruitGame/sword2.webp");
    await this.assets.loadImage("sword3", "/pictures/ninjafruitGame/sword3.webp");
    await this.assets.loadImage("sword4", "/pictures/ninjafruitGame/sword4.webp");
    
    // Load whole fruits
    await this.assets.loadImage("apple", "/pictures/ninjafruitGame/apple.webp");
    await this.assets.loadImage("banana", "/pictures/ninjafruitGame/banana.webp");
    await this.assets.loadImage("lemon", "/pictures/ninjafruitGame/lemon.webp");
    await this.assets.loadImage("orange", "/pictures/ninjafruitGame/orange.webp");
    await this.assets.loadImage("pineapple", "/pictures/ninjafruitGame/pineapple.webp");
    await this.assets.loadImage("strawberry", "/pictures/ninjafruitGame/strawberry.webp");
    await this.assets.loadImage("watermelon", "/pictures/ninjafruitGame/watermelon.webp");

    // Load bomb
    await this.assets.loadImage("bomb", "/pictures/ninjafruitGame/bomb.webp");

    // Load fruit slices
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

    // Set up hand tracking input listeners
    this.input.on("move", this.handleMove);
    this.input.on("click", this.handleClick);
    this.input.on("frameCount", this.updateFrameCount);

    this.sceneEl = document.createElement("div");
    this.sceneEl.classList.add("container", "ninja-fruit-container");

    this.container.appendChild(this.sceneEl);

    // KLJUČNO: Postavi cursorContainer za hand tracking
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
    // Očisti sve postojeće voće, bombe i kriške kada mijenjamo scene
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
    this.sceneEl.classList.add("menu-layout");
    
    // Postavi cursorContainer za hand tracking
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
    
    // Postavi cursorContainer za hand tracking
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
    
    // Postavi cursorContainer za hand tracking
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

    // Reset game state
    this.elapsedTime = 0;
    this.score = 0;
    this.fruits = [];
    this.bombs = []; // Reset bombs array
    this.slices = []; // Reset slices array
    this.gameOver = false; // Reset game over flag
    this.spawnTimer = 0;
    this.spawnInterval = this.baseSpawnInterval;

    // Mač se prikazuje kroz hand tracking cursor - ne trebamo zasebni mač
  }

  update(dt) {
    // KLJUČNA PROMJENA: Spawn logika se izvršava SAMO kada je igra aktivna
    if (this.inGame && !this.gameOver) {
      // Dinamička promjena spawn intervala - sporija progresija
      this.spawnInterval = Math.max(
        this.minSpawnInterval,
        this.baseSpawnInterval - (this.elapsedTime * 30) // smanjuje se za 30ms po sekundi
      );

      this.spawnTimer += dt;
      if (this.spawnTimer > this.spawnInterval) {
        this.spawnTimer = 0;
        // 15% šanse za spawnjanje bombe, 85% za voće
        if (Math.random() < 0.15) {
          this.spawnBomb();
        } else {
          this.spawnFruit();
        }
      }

      // Ažuriranje vremena i score-a
      this.elapsedTime += dt / 1000;
      if (this.scoreEl) {
        const mins = Math.floor(this.elapsedTime / 60);
        const secs = Math.floor(this.elapsedTime % 60).toString().padStart(2, "0");
        this.scoreEl.innerText = `Rezultat: ${this.score}\nVrijeme: ${mins}:${secs}`;
      }

      // Ažuriranje pozicije voća s parabolic trajectory
      this.fruits.forEach((fruit, index) => {
        const deltaTime = dt / 1000; // Konvertiraj u sekunde
        
        // Ažuriraj brzinu (gravitacija)
        fruit.velocityY += fruit.gravity * deltaTime;
        
        // Ažuriraj poziciju
        fruit.y += fruit.velocityY * deltaTime;
        
        // Ažuriraj DOM element
        fruit.el.style.top = `${fruit.y}px`;

        // Označava da je voće doseglo vrh putanje (kada brzina postane pozitivna - pada prema dolje)
        if (fruit.velocityY > 0 && !fruit.hasReachedPeak) {
          fruit.hasReachedPeak = true; // Voće je doseglo vrh i sada pada
        }
        
        // Provjeri je li voće palo na pod NAKON što je doseglo vrh putanje
        if (fruit.y >= window.innerHeight - 50) { // Malo tolerancije za detekciju poda
          if (fruit.hasReachedPeak) {
            // GAME OVER - voće je palo na pod nakon što je bilo bačeno u zrak
            this.gameOver = true;
            fruit.el.remove();
            this.fruits.splice(index, 1);
            this.createEndScreen();
            return;
          } else {
            // Ukloni voće koje nikad nije doseglo vrh (edge case)
            fruit.el.remove();
            this.fruits.splice(index, 1);
          }
        }
      });

      // Ažuriranje pozicije bombi s parabolic trajectory
      this.bombs.forEach((bomb, index) => {
        const deltaTime = dt / 1000; // Konvertiraj u sekunde
        
        // Ažuriraj brzinu (gravitacija)
        bomb.velocityY += bomb.gravity * deltaTime;
        
        // Ažuriraj poziciju
        bomb.y += bomb.velocityY * deltaTime;
        
        // Ažuriraj DOM element
        bomb.el.style.top = `${bomb.y}px`;

        // Bomba se samo uklanja kada padne na pod (ne završava igru)
        if (bomb.y >= window.innerHeight - 50) { // Malo tolerancije za detekciju poda
          bomb.el.remove();
          this.bombs.splice(index, 1);
        }
      });

      // Ažuriranje pozicije kriški voća
      this.slices.forEach((slice, index) => {
        slice.y += slice.speed * (dt / 1000);
        slice.x += slice.velocityX * (dt / 1000);
        
        // Kontinuirana rotacija za prirodniji efekt
        if (slice.rotationSpeed) {
          const currentTransform = slice.el.style.transform;
          const rotationMatch = currentTransform.match(/rotate\(([^)]+)\)/);
          let currentRotation = 0;
          
          if (rotationMatch) {
            currentRotation = parseFloat(rotationMatch[1]);
          }
          
          const newRotation = currentRotation + (slice.rotationSpeed * (dt / 16.67)); // 60fps normalizirano
          slice.el.style.transform = currentTransform.replace(/rotate\([^)]+\)/, `rotate(${newRotation}deg)`);
        }
        
        slice.el.style.top = `${slice.y}px`;
        slice.el.style.left = `${slice.x}px`;

        // Ukloni kriške kada izađu izvan ekrana
        if (slice.y > window.innerHeight + 100) {
          slice.el.remove();
          this.slices.splice(index, 1);
        }
      });

      // Provjeri kolizije između mača i objekata
      this.checkCollisions();
    }
  }

  sliceFruit(fruit, originalElement, originalX) {
    const currentY = parseFloat(originalElement.style.top);
    const currentSpeed = 150 + this.elapsedTime * 5;

    // Definiraj koja voća trebaju obrnutu logiku
    const reversedFruits = ['orange', 'pineapple', 'lemon'];
    const isReversed = reversedFruits.includes(fruit.name);

    // Povećaj offset pozicije za veće razdvajanje
    const sliceOffset = fruit.size / 2.5; // Povećano za veće razdvajanje
    const sliceSize = fruit.size * 0.8; // Smanjeno na 80% originalne veličine

    // Stvori lijevu kriška - spawna se lijevo od centra
    const leftSlice = document.createElement("img");
    leftSlice.src = this.assets.images.get(`${fruit.name}slice${isReversed ? '1' : '2'}`).src;
    leftSlice.classList.add("ninja-fruit-slice", "left");
    leftSlice.style.top = `${currentY}px`;
    leftSlice.style.left = `${originalX - sliceOffset}px`;
    leftSlice.style.width = `${sliceSize}px`;
    leftSlice.style.height = `${sliceSize}px`;

    // Stvori desnu kriška - spawna se desno od centra
    const rightSlice = document.createElement("img");
    rightSlice.src = this.assets.images.get(`${fruit.name}slice${isReversed ? '2' : '1'}`).src;
    rightSlice.classList.add("ninja-fruit-slice", "right");
    rightSlice.style.top = `${currentY}px`;
    rightSlice.style.left = `${originalX + sliceOffset}px`;
    rightSlice.style.width = `${sliceSize}px`;
    rightSlice.style.height = `${sliceSize}px`;

    this.sceneEl.appendChild(leftSlice);
    this.sceneEl.appendChild(rightSlice);

    // Dodaj animacije nakon kratke pauze
    setTimeout(() => {
      leftSlice.classList.add("animated");
      rightSlice.classList.add("animated");
    }, 50);

    // Fade out efekt
    setTimeout(() => {
      leftSlice.classList.add("fading");
      rightSlice.classList.add("fading");
    }, 800);

    // Dodaj kriške u niz za animaciju
    this.slices.push({
      el: leftSlice,
      x: originalX - sliceOffset,
      y: currentY,
      velocityX: -120, // Povećana brzina za dramatičniji efekt
      speed: currentSpeed + 150, // Brže padanje
      rotationSpeed: -2 // Kontinuirana rotacija lijevo
    });

    this.slices.push({
      el: rightSlice,
      x: originalX + sliceOffset,
      y: currentY,
      velocityX: 120, // Povećana brzina za dramatičniji efekt
      speed: currentSpeed + 150, // Brže padanje
      rotationSpeed: 2 // Kontinuirana rotacija desno
    });
  }

  // createSword() metoda uklonjena - koristimo hand tracking cursor umjesto zasebnog mača

  updateSwordPosition(x, y) {
    if (this.inGame) {
      // Konvertiraj relativne koordinate (0-1) u pixel koordinate za collision detection
      this.swordX = x * window.innerWidth;
      this.swordY = y * window.innerHeight;
      
      // Cursor pozicija se automatski ažurira kroz BaseScene.updateCursor()
      // Ne trebamo ručno pozicionirati jer se koristi hand tracking cursor
    }
  }

  animateSwordSlash() {
    // Animiraj cursor sword umjesto zasebnog sword elementa
    const cursors = Array.from(this.handCursors.values());
    if (cursors.length === 0) return;

    // Animiraj prvi dostupni cursor
    const cursor = cursors[0];
    if (!cursor || !cursor.img) return;

    // Animacija mača kroz sword2, sword3, sword4, pa nazad na sword1
    const swordFrames = ["sword2", "sword3", "sword4"];
    let frameIndex = 0;

    const animate = () => {
      if (frameIndex < swordFrames.length) {
        cursor.img.src = this.assets.images.get(swordFrames[frameIndex]).src;
        frameIndex++;
        setTimeout(animate, 80); // 80ms po frame
      } else {
        // Vrati na osnovni mač
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

    // Provjeri kolizije s voćem
    this.fruits.forEach((fruit, index) => {
      const fruitCenterX = parseFloat(fruit.el.style.left) + fruit.size / 2;
      const fruitCenterY = parseFloat(fruit.el.style.top) + fruit.size / 2;
      
      // Izračunaj udaljenost između mača i voća
      const distance = Math.sqrt(
        Math.pow(this.swordX - fruitCenterX, 2) + 
        Math.pow(this.swordY - fruitCenterY, 2)
      );
      
      // Ako je mač dovoljno blizu voću (collision radius)
      if (distance < fruit.size / 2 + 50) { // 50px je collision radius mača
        this.sliceFruit(fruit, fruit.el, parseFloat(fruit.el.style.left));
        this.score += fruit.points;
        this.animateSwordSlash();
        
        // Ukloni voće iz niza i DOM-a
        fruit.el.remove();
        this.fruits.splice(index, 1);
      }
    });

    // Provjeri kolizije s bombama
    this.bombs.forEach((bomb, index) => {
      const bombCenterX = parseFloat(bomb.el.style.left) + bomb.width / 2;
      const bombCenterY = parseFloat(bomb.el.style.top) + bomb.height / 2;
      
      // Izračunaj udaljenost između mača i bombe
      const distance = Math.sqrt(
        Math.pow(this.swordX - bombCenterX, 2) + 
        Math.pow(this.swordY - bombCenterY, 2)
      );
      
      // Ako je mač dovoljno blizu bombi (collision radius)
      if (distance < Math.min(bomb.width, bomb.height) / 2 + 50) { // 50px je collision radius mača
        this.gameOver = true;
        this.animateSwordSlash();
        
        // Ukloni bombu iz niza i DOM-a
        bomb.el.remove();
        this.bombs.splice(index, 1);
        
        // Završi igru
        this.createEndScreen();
      }
    });
  }

  createEndScreen() {
    this.inGame = false;
    this.clearScene();
    this.sceneEl.classList.add("center-layout");
    
    // Postavi cursorContainer za hand tracking
    this.cursorContainer = this.sceneEl;
    
    this.sceneEl.appendChild(this.createBackground("background2"));
    this.sceneEl.appendChild(this.createOverlay("dark"));

    // Statistike igre
    const statsContainer = document.createElement("div");
    statsContainer.className = "textStyle ninja-fruit-stats";
    
    const mins = Math.floor(this.elapsedTime / 60);
    const secs = Math.floor(this.elapsedTime % 60).toString().padStart(2, "0");
    statsContainer.innerHTML = `Rezultat: ${this.score}<br>Vrijeme: ${mins}:${secs}`;
    this.sceneEl.appendChild(statsContainer);

    // Naslov "Kraj!"
    const gameOverTitle = document.createElement("h1");
    gameOverTitle.innerText = "Kraj!";
    gameOverTitle.className = "textStyle ninja-fruit-game-over-title";

    // Podnaslov "Igraj ponovo!"
    const playAgainText = document.createElement("h2");
    playAgainText.innerText = "Igraj ponovo!";
    playAgainText.className = "textStyle ninja-fruit-play-again-text";

    // Container za gumbove
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("ninja-fruit-button-container");

    // Gumb "Igraj ponovo"
    const playAgainBtn = this.createButton("Nova igra", () => this.createGameScreen());
    
    // Gumb "Izbornik"
    const menuBtn = this.createButton("Izbornik", () => this.createMenuScreen());

    buttonContainer.appendChild(playAgainBtn);
    buttonContainer.appendChild(menuBtn);

    this.sceneEl.appendChild(gameOverTitle);
    this.sceneEl.appendChild(playAgainText);
    this.sceneEl.appendChild(buttonContainer);
  }

  spawnFruit() {
    // Odaberi random kategoriju voća
    const categories = Object.keys(this.fruitTypes);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const fruits = this.fruitTypes[randomCategory];
    const randomFruit = fruits[Math.floor(Math.random() * fruits.length)];
    
    const img = document.createElement("img");
    img.src = this.assets.images.get(randomFruit.name).src;
    img.classList.add("ninja-fruit-item");
    
    // Računanje pozicije s obzirom na širinu voća
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const minLeft = 0;
    const maxLeft = screenWidth - randomFruit.size;
    const leftPosition = Math.random() * (maxLeft - minLeft) + minLeft;
    
    // Voće počinje na dnu ekrana (simulira bacanje s poda)
    const startY = screenHeight - randomFruit.size; // Počinje na dnu, ali vidljivo
    img.style.top = `${startY}px`;
    img.style.left = `${leftPosition}px`;
    
    // Postavi veličinu prema tipu voća
    img.style.width = `${randomFruit.size}px`;
    img.style.height = `${randomFruit.size}px`;

    // Parabolic trajectory parametri - optimalna visina za gameplay
    const initialVelocityY = -(1800 + Math.random() * 400); // Početna brzina prema gore (1800-2200 px/s)
    const gravity = 800; // Gravitacija (pozitivna jer povlači prema dolje)
    const maxHeight = screenHeight * 0.8; // Maksimalna visina (80% ekrana od vrha)
    
    this.sceneEl.appendChild(img);
    this.fruits.push({ 
      el: img, 
      y: startY,
      x: leftPosition,
      velocityY: initialVelocityY,
      gravity: gravity,
      maxHeight: maxHeight,
      points: randomFruit.points,
      size: randomFruit.size,
      name: randomFruit.name,
      hasReachedPeak: false // Flag za praćenje je li voće doseglo vrh putanje
    });
  }

  spawnBomb() {
    const bombWidth = 450; // Širina bombe - povećano za bolju vidljivost
    const bombHeight = 380; // Visina bombe - zadržava razumnu visinu
    
    const img = document.createElement("img");
    img.src = this.assets.images.get("bomb").src;
    img.classList.add("ninja-fruit-item", "ninja-fruit-bomb");
    
    // Računanje pozicije s obzirom na širinu bombe
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const minLeft = 0;
    const maxLeft = screenWidth - bombWidth;
    const leftPosition = Math.random() * (maxLeft - minLeft) + minLeft;
    
    // Bomba počinje na dnu ekrana (simulira bacanje s poda)
    const startY = screenHeight - bombHeight; // Počinje na dnu, ali vidljivo
    img.style.top = `${startY}px`;
    img.style.left = `${leftPosition}px`;
    
    // Postavi veličinu bombe - različite dimenzije za bolji omjer
    img.style.width = `${bombWidth}px`;
    img.style.height = `${bombHeight}px`;

    // Parabolic trajectory parametri - optimalna visina za gameplay
    const initialVelocityY = -(1800 + Math.random() * 400); // Početna brzina prema gore (1800-2200 px/s)
    const gravity = 800; // Gravitacija
    const maxHeight = screenHeight * 0.8; // Maksimalna visina (80% ekrana od vrha)

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
      hasReachedPeak: false // Flag za praćenje je li bomba dosegla vrh putanje
    });
  }

  render() {}

  handleMove({ x, y, i }) {
    this.updateCursor(x, y, i);
    this.updateSwordPosition(x, y); // Ažuriraj poziciju mača
  }

  handleClick({ x, y }) {
    const px = x * window.innerWidth;
    const py = y * window.innerHeight;
    const el = document.elementFromPoint(px, py);

    if (!el) return;

    // Rukuj klikom na gumbove i back button
    if (el.tagName === "BUTTON") {
      el.click();
    } else if (el.tagName === "IMG" && el.src && el.src.includes("backButton.webp")) {
      // Handle back button clicks
      el.click();
    }
  }

  updateFrameCount() {
    super.updateFrameCount();
  }

  async destroy() {
    // Ukloni hand tracking event listenere
    this.input.off("move", this.handleMove);
    this.input.off("click", this.handleClick);
    this.input.off("frameCount", this.updateFrameCount);

    // Remove CSS file
    const cssLink = document.querySelector('link[href="/css/ninjafruit.css"]');
    if (cssLink) {
      cssLink.remove();
    }

    await super.destroy();
    this.sceneEl.remove();
  }
}