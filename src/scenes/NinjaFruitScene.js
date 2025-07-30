import BaseScene from "@engine/BaseScene.js";

export default class NinjaFruitScene extends BaseScene {
  constructor(params) {
    super(params);
    this.container = document.getElementById("gameContainer");
    this.elapsedTime = 0;
    this.score = 0;
    this.fruits = [];
    this.slices = []; // Dodano za praćenje kriški voća
    this.gameOver = false; // Flag za kraj igre
    this.swordEl = null; // Element mača
    this.swordAnimationTimer = 0; // Timer za animaciju mača
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
    this.baseSpawnInterval = 4000; // početno vrijeme između pojavljivanja
    this.minSpawnInterval = 800; // najbrže moguće spawnjanje
    
    // Bind methods for hand tracking
    this.handleMove = this.handleMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.updateFrameCount = this.updateFrameCount.bind(this);
  }

  async init() {
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

    this.cursorContainer = this.container;

    this.sceneEl = document.createElement("div");
    this.sceneEl.classList.add("container");
    this.sceneEl.style.display = "flex";
    this.sceneEl.style.flexDirection = "column";
    this.sceneEl.style.alignItems = "center";
    this.sceneEl.style.justifyContent = "space-between";
    this.sceneEl.style.height = "100%";
    this.sceneEl.style.position = "relative";

    this.container.appendChild(this.sceneEl);

    this.createMenuScreen();
  }

  clearScene() {
    this.sceneEl.innerHTML = "";
    // Očisti sve postojeće voće i kriške kada mijenjamo scene
    this.fruits = [];
    this.slices = [];
    this.gameOver = false;
    this.swordEl = null;
    this.spawnTimer = 0;
  }

  createBackground(name) {
    const bg = document.createElement("div");
    bg.style.position = "absolute";
    bg.style.top = "0";
    bg.style.left = "0";
    bg.style.width = "100%";
    bg.style.height = "100%";
    bg.style.backgroundImage = `url('${this.assets.images.get(name).src}')`;
    bg.style.backgroundSize = "cover";
    bg.style.backgroundPosition = "center";
    bg.style.zIndex = "0";
    return bg;
  }

  createOverlay(opacity, color = "0,0,0") {
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = `rgba(${color}, ${opacity})`;
    overlay.style.zIndex = "1";
    return overlay;
  }

  createBackButton(onClick) {
    const back = document.createElement("img");
    back.src = this.assets.images.get("backButton").src;
    back.style.position = "absolute";
    back.style.top = "4em";
    back.style.left = "4em";
    back.style.height="220px";
    back.style.marginTop = "4em";
    back.style.marginLeft = "4em";
    back.style.cursor = "pointer";
    back.style.zIndex = "1000";
    back.addEventListener("click", onClick);
    return back;
  }

  createButton(text, onClick) {
    const btn = document.createElement("button");
    btn.innerText = text;
    btn.className = "textStyle";
    btn.style.backgroundColor = "#008782";
    btn.style.color = "white";
    btn.style.fontSize = "6vw";
    btn.style.padding = "1em 2em";
    btn.style.margin = "2em auto 4em auto";
    btn.style.border = "none";
    btn.style.borderRadius = "12px";
    btn.style.cursor = "pointer";
    btn.style.zIndex = "2";
    btn.style.position = "relative";
    btn.addEventListener("click", onClick);
    return btn;
  }

  createMenuScreen() {
    this.inGame = false;
    this.clearScene();
    this.sceneEl.appendChild(this.createBackground("background1"));

    this.sceneEl.appendChild(this.createBackButton(() => this.manager.switch('StartMenu')));

    const title = document.createElement("h1");
    title.innerText = "Ninja Fruit";
    title.className = "textStyle";
    title.style.fontSize = "12vw";
    title.style.marginTop = "2em";
    title.style.color = "#fff";
    title.style.zIndex = "2";
    title.style.position = "relative";
    title.style.alignSelf = "center";

    const btnStart = this.createButton("Nova igra", () => this.createUputeScreen());

    this.sceneEl.style.justifyContent = "space-between";
    this.sceneEl.appendChild(title);
    this.sceneEl.appendChild(btnStart);
  }

  createUputeScreen() {
    this.inGame = false;
    this.clearScene();
    this.sceneEl.appendChild(this.createBackground("background1"));
    this.sceneEl.appendChild(this.createOverlay(0.8));

    this.sceneEl.appendChild(this.createBackButton(() => this.createMenuScreen()));

    const title = document.createElement("h1");
    title.innerText = "Upute";
    title.className = "textStyle";
    title.style.fontSize = "8vw";
    title.style.color = "white";
    title.style.zIndex = "2";
    title.style.position = "relative";
    title.style.marginTop = "2em";

    const upute = document.createElement("p");
    upute.innerText =
      "Koristi pokrete ruke ispred kamere kako bi izrezao što više voća koje iskače na ekranu. Pazi da voće ne dodirne pod - izgubit ćeš bodove!";
    upute.className = "textStyle";
    upute.style.color = "white";
    upute.style.fontSize = "4vw";
    upute.style.textAlign = "center";
    upute.style.maxWidth = "80%";
    upute.style.zIndex = "2";
    upute.style.position = "relative";
    upute.style.marginTop = "2em";

    const btnPlay = this.createButton("Igraj", () => this.createGameScreen());

    this.sceneEl.appendChild(title);
    this.sceneEl.appendChild(upute);
    this.sceneEl.appendChild(btnPlay);
  }

  createGameScreen() {
    this.inGame = true;
    this.clearScene();
    this.sceneEl.appendChild(this.createBackground("background2"));
    this.sceneEl.appendChild(this.createOverlay(0.5, "255,255,255"));

    const btnQuit = document.createElement("button");
    btnQuit.innerText = "Odustani";
    btnQuit.className = "textStyle";
    btnQuit.style.position = "absolute";
    btnQuit.style.top = "2em";
    btnQuit.style.left = "2em";
    btnQuit.style.fontSize = "4em";
    btnQuit.style.zIndex = "1000";
    btnQuit.style.padding = "1em 1em";
    btnQuit.style.backgroundColor = "#c00";
    btnQuit.style.color = "white";
    btnQuit.style.border = "none";
    btnQuit.style.borderRadius = "8px";
    btnQuit.style.cursor = "pointer";
    btnQuit.addEventListener("click", () => this.createMenuScreen());
    this.sceneEl.appendChild(btnQuit);

    this.scoreEl = document.createElement("div");
    this.scoreEl.className = "textStyle";
    this.scoreEl.style.position = "absolute";
    this.scoreEl.style.top = "2em";
    this.scoreEl.style.right = "2em";
    this.scoreEl.style.fontSize = "4em";
    this.scoreEl.style.color = "black";
    this.scoreEl.style.zIndex = "99";
    this.sceneEl.appendChild(this.scoreEl);

    // Reset game state
    this.elapsedTime = 0;
    this.score = 0;
    this.fruits = [];
    this.slices = []; // Reset slices array
    this.gameOver = false; // Reset game over flag
    this.spawnTimer = 0;
    this.spawnInterval = this.baseSpawnInterval;

    // Dodaj mač na ekran
    this.createSword();
    
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
        this.spawnFruit();
      }

      // Ažuriranje vremena i score-a
      this.elapsedTime += dt / 1000;
      if (this.scoreEl) {
        const mins = Math.floor(this.elapsedTime / 60);
        const secs = Math.floor(this.elapsedTime % 60).toString().padStart(2, "0");
        this.scoreEl.innerText = `Rezultat: ${this.score}\nVrijeme: ${mins}:${secs}`;
      }

      // Ažuriranje pozicije voća
      this.fruits.forEach((fruit, index) => {
        fruit.y += fruit.speed * (dt / 1000);
        fruit.el.style.top = `${fruit.y}px`;

        // Ako voće izađe izvan dna ekrana – GAME OVER
        if (fruit.y > window.innerHeight) {
          this.gameOver = true;
          fruit.el.remove();
          this.fruits.splice(index, 1);
          this.createEndScreen();
          return;
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
    }
  }

  sliceFruit(fruit, originalElement, originalX) {
    const currentY = parseFloat(originalElement.style.top);
    const currentSpeed = 80 + this.elapsedTime * 3;

    // Definiraj koja voća trebaju obrnutu logiku
    const reversedFruits = ['orange', 'pineapple', 'lemon'];
    const isReversed = reversedFruits.includes(fruit.name);

    // Povećaj offset pozicije za veće razdvajanje
    const sliceOffset = fruit.size / 2.5; // Povećano za veće razdvajanje
    const sliceSize = fruit.size * 0.8; // Smanjeno na 80% originalne veličine

    // Stvori lijevu kriška - spawna se lijevo od centra
    const leftSlice = document.createElement("img");
    leftSlice.src = this.assets.images.get(`${fruit.name}slice${isReversed ? '1' : '2'}`).src;
    leftSlice.style.position = "absolute";
    leftSlice.style.top = `${currentY}px`;
    leftSlice.style.left = `${originalX - sliceOffset}px`;
    leftSlice.style.width = `${sliceSize}px`;
    leftSlice.style.height = `${sliceSize}px`;
    leftSlice.style.zIndex = "15";
    leftSlice.style.transition = "transform 0.5s ease-out, opacity 1s ease-out";
    leftSlice.style.transform = "rotate(-15deg) scale(1)";

    // Stvori desnu kriška - spawna se desno od centra
    const rightSlice = document.createElement("img");
    rightSlice.src = this.assets.images.get(`${fruit.name}slice${isReversed ? '2' : '1'}`).src;
    rightSlice.style.position = "absolute";
    rightSlice.style.top = `${currentY}px`;
    rightSlice.style.left = `${originalX + sliceOffset}px`;
    rightSlice.style.width = `${sliceSize}px`;
    rightSlice.style.height = `${sliceSize}px`;
    rightSlice.style.zIndex = "15";
    rightSlice.style.transition = "transform 0.5s ease-out, opacity 1s ease-out";
    rightSlice.style.transform = "rotate(15deg) scale(1)";

    this.sceneEl.appendChild(leftSlice);
    this.sceneEl.appendChild(rightSlice);

    // Dodaj animacije nakon kratke pauze
    setTimeout(() => {
      leftSlice.style.transform = "rotate(-25deg) scale(0.9)";
      rightSlice.style.transform = "rotate(25deg) scale(0.9)";
    }, 50);

    // Fade out efekt
    setTimeout(() => {
      leftSlice.style.opacity = "0.7";
      rightSlice.style.opacity = "0.7";
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

  createSword() {
    this.swordEl = document.createElement("img");
    this.swordEl.src = this.assets.images.get("sword1").src;
    this.swordEl.style.position = "absolute";
    this.swordEl.style.width = "150px";
    this.swordEl.style.height = "150px";
    this.swordEl.style.zIndex = "20";
    this.swordEl.style.pointerEvents = "none"; // Ne blokira klikove
    this.swordEl.style.transition = "all 0.1s ease-out";
    this.swordEl.style.opacity = "0.8";
    this.swordEl.style.left = "50%";
    this.swordEl.style.top = "50%";
    this.swordEl.style.transform = "translate(-50%, -50%)"; // Centriraj na početku
    this.sceneEl.appendChild(this.swordEl);

    // Prati pokrete miša kao fallback
    this.sceneEl.addEventListener("mousemove", (e) => {
      if (this.swordEl && this.inGame) {
        const rect = this.sceneEl.getBoundingClientRect();
        const x = e.clientX - rect.left - 75; // Centriraj mač
        const y = e.clientY - rect.top - 75;
        this.swordEl.style.left = `${x}px`;
        this.swordEl.style.top = `${y}px`;
        this.swordEl.style.transform = "none"; // Ukloni centriranje kad se miče mišem
      }
    });
  }

  updateSwordPosition(x, y) {
    if (this.swordEl && this.inGame) {
      // Konvertiraj relativne koordinate (0-1) u pixel koordinate
      const pixelX = x * window.innerWidth - 75; // Oduzmi pola širine mača
      const pixelY = y * window.innerHeight - 75; // Oduzmi pola visine mača
      
      this.swordEl.style.left = `${pixelX}px`;
      this.swordEl.style.top = `${pixelY}px`;
      this.swordEl.style.transform = "none"; // Ukloni centriranje
    }
  }

  animateSwordSlash() {
    if (!this.swordEl) return;

    // Animacija mača kroz sword2, sword3, sword4, pa nazad na sword1
    const swordFrames = ["sword2", "sword3", "sword4"];
    let frameIndex = 0;

    const animate = () => {
      if (frameIndex < swordFrames.length) {
        this.swordEl.src = this.assets.images.get(swordFrames[frameIndex]).src;
        frameIndex++;
        setTimeout(animate, 80); // 80ms po frame
      } else {
        // Vrati na osnovni mač
        setTimeout(() => {
          if (this.swordEl) {
            this.swordEl.src = this.assets.images.get("sword1").src;
          }
        }, 150);
      }
    };
    animate();
  }

  createEndScreen() {
    this.inGame = false;
    this.clearScene();
    this.sceneEl.appendChild(this.createBackground("background2"));
    this.sceneEl.appendChild(this.createOverlay(0.8)); // 80% dimming

    // Statistike igre
    const statsContainer = document.createElement("div");
    statsContainer.style.position = "relative";
    statsContainer.style.top = "2em";
    statsContainer.style.textAlign = "center";
    statsContainer.style.right = "2em";
    statsContainer.style.color = "white";
    statsContainer.style.fontSize = "4em";
    statsContainer.style.marginTop = "4em";
    statsContainer.style.marginLeft = "4em";
    statsContainer.style.zIndex = "2";
    statsContainer.className = "textStyle";
    
    const mins = Math.floor(this.elapsedTime / 60);
    const secs = Math.floor(this.elapsedTime % 60).toString().padStart(2, "0");
    statsContainer.innerHTML = `Rezultat: ${this.score}<br>Vrijeme: ${mins}:${secs}`;
    this.sceneEl.appendChild(statsContainer);

    // Naslov "Kraj!"
    const gameOverTitle = document.createElement("h1");
    gameOverTitle.innerText = "Kraj!";
    gameOverTitle.className = "textStyle";
    gameOverTitle.style.fontSize = "10vw";
    gameOverTitle.style.color = "white";
    gameOverTitle.style.zIndex = "2";
    gameOverTitle.style.position = "relative";
    gameOverTitle.style.textAlign = "center";
    gameOverTitle.style.marginTop = "2em";

    // Podnaslov "Igraj ponovo!"
    const playAgainText = document.createElement("h2");
    playAgainText.innerText = "Igraj ponovo!";
    playAgainText.className = "textStyle";
    playAgainText.style.fontSize = "6vw";
    playAgainText.style.color = "white";
    playAgainText.style.zIndex = "2";
    playAgainText.style.position = "relative";
    playAgainText.style.textAlign = "center";
    playAgainText.style.marginTop = "-1em";

    // Container za gumbove
    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.flexDirection = "column";
    buttonContainer.style.alignItems = "center";
    buttonContainer.style.gap = "0.5em";
    buttonContainer.style.marginTop = "5em";
    buttonContainer.style.marginBottom = "4em";
    buttonContainer.style.margin = "3em auto 0em";

    // Gumb "Igraj ponovo"
    const playAgainBtn = this.createButton("Nova igra", () => this.createGameScreen());
    
    // Gumb "Izbornik"
    const menuBtn = this.createButton("Izbornik", () => this.createMenuScreen());

    buttonContainer.appendChild(playAgainBtn);
    buttonContainer.appendChild(menuBtn);

    this.sceneEl.style.justifyContent = "center";
    this.sceneEl.style.alignItems = "center";
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
    img.style.position = "absolute";
    
    // Voće se spawna potpuno izvan ekrana
    img.style.top = `-${randomFruit.size + 50}px`;
    
    // Računanje pozicije s obzirom na širinu voća
    const screenWidth = window.innerWidth;
    const minLeft = 0;
    const maxLeft = screenWidth - randomFruit.size;
    const leftPosition = Math.random() * (maxLeft - minLeft) + minLeft;
    img.style.left = `${leftPosition}px`;
    
    // Postavi veličinu prema tipu voća
    img.style.width = `${randomFruit.size}px`;
    img.style.height = `${randomFruit.size}px`;
    img.style.transition = "transform 0.2s";
    img.style.zIndex = "10";
    img.style.cursor = "pointer";

    // Dodaj click event za bodovanje i rezanje
    img.addEventListener("click", () => {
      this.sliceFruit(randomFruit, img, leftPosition);
      this.score += randomFruit.points;
      this.animateSwordSlash(); // Animiraj mač
      
      // Ukloni originalno voće iz niza i DOM-a
      const index = this.fruits.findIndex(fruit => fruit.el === img);
      if (index > -1) {
        this.fruits.splice(index, 1);
      }
      img.remove();
    });

    const speed = 80 + this.elapsedTime * 3; // sporija progresija brzine (3 umjesto 10)
    this.sceneEl.appendChild(img);
    this.fruits.push({ 
      el: img, 
      y: -(randomFruit.size + 50),
      speed,
      points: randomFruit.points,
      size: randomFruit.size
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

    if (el.tagName === "BUTTON") {
      el.click();
    } else if (el.tagName === "IMG" && this.inGame) {
      // Provjeri je li kliknuto voće
      const fruitIndex = this.fruits.findIndex(fruit => fruit.el === el);
      if (fruitIndex > -1) {
        el.click(); // Triggeriraj click event voća
      }
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

    await super.destroy();
    this.sceneEl.remove();
  }
}