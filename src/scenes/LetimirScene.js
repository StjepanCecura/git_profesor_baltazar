import BaseScene from "@engine/BaseScene.js";

export default class LetimirScene extends BaseScene {
  constructor(params) {
    super(params);
    this.container = document.getElementById("gameContainer") || document.body;

    this.birdY = 300;
    this.velocity = 0;
    this.gravity = 0.15;
    this.jumpStrength = -4.5;
    this.pipes = [];
    this.pipeGap = 250;
    this.score = 0;
    this.frame = 0;
    this.isGameRunning = false;
    this.waitingForFist = true;
    this.backgroundIndex = 0;
    this.birdFrameIndex = 0;
    this.birdFrameDelay = 0;

    this.backgrounds = [
      '/pictures/letimirGame/background_1.jpg',
      '/pictures/letimirGame/background_2.jpg',
      '/pictures/letimirGame/background_3.jpg'
    ];

    this.birdFramesSrc = [
      "/pictures/letimirGame/baltazar_1.png",
      "/pictures/letimirGame/baltazar_2.png",
      "/pictures/letimirGame/baltazar_4.png",
      "/pictures/letimirGame/baltazar_5.png",
      "/pictures/letimirGame/baltazar_6.png"
    ];

    this.birdFrames = [];
    this.pipeImg = null;
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  async init() {
    await this.assets.loadImage("backButton", "/pictures/backButton.webp");
    await this.assets.loadImage("cursor", "/pictures/starCatching/starCatchingCursor.webp");
    this.setFavicon("pictures/letimirGame/Icon.png");

    
    this.sceneEl = document.createElement('div');
    this.sceneEl.classList.add('container');
    this.sceneEl.style.position = 'relative';
    this.sceneEl.style.backgroundImage = `url('${this.backgrounds[this.backgroundIndex]}')`;
    this.sceneEl.style.backgroundSize = 'cover';

    this.styleEl = this.loadStyle("/css/Letimir.css");

    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0px';
    this.canvas.style.left = '0px';
    this.ctx = this.canvas.getContext('2d');
    this.sceneEl.appendChild(this.canvas);

    this.scoreDisplay = document.createElement('div');
    this.scoreDisplay.style.position = 'absolute';
    this.scoreDisplay.style.top = '10px';
    this.scoreDisplay.style.left = '10px';
    this.scoreDisplay.style.color = 'white';
    this.scoreDisplay.style.fontSize = '24px';
    this.scoreDisplay.style.fontFamily = 'Arial, sans-serif';
    this.scoreDisplay.style.zIndex = '2';
    this.scoreDisplay.textContent = "Score: 0";
    this.sceneEl.appendChild(this.scoreDisplay);

    this.startScreen = document.createElement('div');
    this.startScreen.style.position = 'absolute';
    this.startScreen.style.top = '0px';
    this.startScreen.style.left = '0px';
    this.startScreen.style.background = 'rgba(0, 0, 0, 0.8)';
    this.startScreen.style.display = 'flex';
    this.startScreen.style.justifyContent = 'center';
    this.startScreen.style.alignItems = 'center';
    this.startScreen.style.zIndex = '3';
    this.startScreen.style.width = '100%';
    this.startScreen.style.height = '100%';

    const startImg = document.createElement('img');
    startImg.src = '/pictures/letimirGame/img_45.png';
    startImg.style.width = '100%';
    startImg.style.height = '100%';
    startImg.style.objectFit = 'cover';

    startImg.style.opacity = '0';
    startImg.style.transition = 'opacity 0.5s ease-in-out';

    startImg.onload = () => {
    startImg.style.opacity = '1';
    };

    this.startScreen.appendChild(startImg);
    this.sceneEl.appendChild(this.startScreen);

    this.finalScoreMessage = document.createElement('div');
    this.finalScoreMessage.style.position = 'absolute';
    this.finalScoreMessage.style.bottom = '50px';
    this.finalScoreMessage.style.left = '50%';
    this.finalScoreMessage.style.transform = 'translateX(-50%)';
    this.finalScoreMessage.style.color = 'white';
    this.finalScoreMessage.style.fontSize = '20px';
    this.finalScoreMessage.style.fontWeight = 'bold';
    this.finalScoreMessage.style.fontFamily = 'Arial, sans-serif';
    this.finalScoreMessage.style.display = 'none';
    this.finalScoreMessage.style.zIndex = '4';
    this.sceneEl.appendChild(this.finalScoreMessage);

    this.container.appendChild(this.sceneEl);

    this.birdFrames = await Promise.all(
      this.birdFramesSrc.map(src => this.loadImage(src))
    );

    this.pipeImg = await this.loadImage('/pictures/letimirGame/greenpipe.png');

    this.video = document.createElement('video');
    this.video.setAttribute('playsinline', '');
    this.video.style.display = 'none';
    this.sceneEl.appendChild(this.video);

    this.hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    this.hands.onResults(this.onHandsResults.bind(this));

    this.camera = new window.Camera(this.video, {
      onFrame: async () => {
        await this.hands.send({ image: this.video });
      },
      width: 640,
      height: 480
    });

    await this.camera.start();

    this.resize();
    window.addEventListener("resize", () => this.resize());

    this.loop();
  }

    setFavicon(iconURL) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.getElementsByTagName("head")[0].appendChild(link);
    }
    link.href = iconURL;
  }

  resize() {
    const maxWidth = this.container.clientWidth || window.innerWidth;
    const maxHeight = this.container.clientHeight || window.innerHeight;
    const aspectRatio = 9 / 16;

    let width = maxWidth;
    let height = width / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    this.canvas.width = width;
    this.canvas.height = height;

    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    this.sceneEl.style.width = width + 'px';
    this.sceneEl.style.height = height + 'px';

    this.sceneEl.style.position = 'absolute';
    this.sceneEl.style.top = '50%';
    this.sceneEl.style.left = '50%';
    this.sceneEl.style.transform = 'translate(-50%, -50%)';
    this.createCustomCursor();
    this.createBackButton();
  }

  isFist(landmarks) {
    const fingers = [[8, 5], [12, 9], [16, 13], [20, 17]];
    return fingers.every(([tip, base]) => landmarks[tip].y > landmarks[base].y);
  }

    resetGame() {
        this.birdY = 300;
        this.velocity = 0;
        this.pipes = [];
        this.score = 0;
        this.frame = 0;
        this.birdFrameIndex = 0;
        this.backgroundIndex = 0;
        this.sceneEl.style.backgroundImage = `url('${this.backgrounds[this.backgroundIndex]}')`;
        this.scoreDisplay.textContent = "Score: 0";
        this.finalScoreMessage.style.display = "none";
        this.isGameRunning = true;

        if (this.cursorEl) {
            this.cursorEl.style.display = 'none';
        }
    }

    spawnPipe() {
    const margin = 50;
    const minGapY = margin;
    const maxGapY = this.canvas.height - this.pipeGap - margin;

    let gapY;

    if (this.pipes.length === 0) {
        gapY = Math.floor(Math.random() * (maxGapY - minGapY) + minGapY);
    } else {
        const lastGapY = this.pipes[this.pipes.length - 1].gapY;
        const minDistanceBetweenGaps = 220;

        let tries = 0;
        do {
        gapY = Math.floor(Math.random() * (maxGapY - minGapY) + minGapY);
        tries++;
        if (tries > 50) break;
        } while (Math.abs(gapY - lastGapY) < minDistanceBetweenGaps);
    }

    this.pipes.push({ x: this.canvas.width, gapY, scored: false });
    }

    update() {
    if (!this.isGameRunning) return;

    this.velocity += this.gravity;
    this.birdY += this.velocity;
    this.birdY = Math.max(0, Math.min(this.canvas.height - this.birdFrames[0].height, this.birdY));


    if (
        this.frame % 120 === 0 &&
        (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.canvas.width - 250)
    ) {
        this.spawnPipe();
    }

    const birdLeft = 100;
    const birdRight = birdLeft + this.birdFrames[0].width;
    const birdTop = this.birdY;
    const birdBottom = this.birdY + this.birdFrames[0].height;

    for (let pipe of this.pipes) {
        pipe.x -= 2;

        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + this.pipeImg.width;

        const horizontallyOverlapping = birdRight > pipeLeft && birdLeft < pipeRight;

    if (horizontallyOverlapping) {
        if (birdTop < pipe.gapY || birdBottom > pipe.gapY + this.pipeGap) {
            this.isGameRunning = false;
            this.waitingForFist = true;
            this.finalScoreMessage.textContent = "GAME OVER! FINAL SCORE: " + this.score;
            this.finalScoreMessage.style.display = "block";
            this.startScreen.style.display = "flex";

            if (this.cursorEl) {
                this.cursorEl.style.display = 'block';
            }

            return;
        }
    }

        if (!pipe.scored && pipeRight < birdLeft) {
        pipe.scored = true;
        this.score++;
        this.scoreDisplay.textContent = "Score: " + this.score;

        if (this.score % 5 === 0 && this.backgroundIndex < this.backgrounds.length - 1) {
            this.backgroundIndex++;
            this.sceneEl.style.backgroundImage = `url('${this.backgrounds[this.backgroundIndex]}')`;
        }
        }
    }

    this.pipes = this.pipes.filter(p => p.x + this.pipeImg.width > 0);
    }

    draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const pipeWidth = this.pipeImg.width;
    const pipeHeight = this.pipeImg.height;
    const pipeAspectRatio = pipeHeight / pipeWidth;

    for (let pipe of this.pipes) {

        const bottomPipeY = pipe.gapY + this.pipeGap;
        const bottomPipeHeight = this.canvas.height - bottomPipeY;

        //this.ctx.strokeStyle = 'red';
        //this.ctx.lineWidth = 2;
        //this.ctx.strokeRect(pipe.x, bottomPipeY, pipeWidth, bottomPipeHeight);

        let drawHeight = bottomPipeHeight;
        let srcHeight = pipeHeight;

        if (drawHeight < pipeHeight) {
        srcHeight = pipeHeight * (drawHeight / pipeHeight);
        }

        this.ctx.drawImage(
        this.pipeImg,
        0, pipeHeight - srcHeight, 
        pipeWidth, srcHeight,  
        pipe.x, bottomPipeY, 
        pipeWidth, drawHeight 
        );

        const topPipeHeight = pipe.gapY;

        //this.ctx.strokeRect(pipe.x, 0, pipeWidth, topPipeHeight);

        drawHeight = topPipeHeight;
        srcHeight = pipeHeight;
        if (drawHeight < pipeHeight) {
        srcHeight = pipeHeight * (drawHeight / pipeHeight);
        }

        this.ctx.save();
        this.ctx.translate(pipe.x + pipeWidth / 2, topPipeHeight);
        this.ctx.scale(1, -1);

        this.ctx.drawImage(
        this.pipeImg,
        0, 0,
        pipeWidth, srcHeight,
        -pipeWidth / 2, 0,
        pipeWidth, drawHeight
        );
        this.ctx.restore();
    }

    this.birdFrameDelay++;
    if (this.birdFrameDelay % 20 === 0) {
        this.birdFrameIndex = (this.birdFrameIndex + 1) % this.birdFrames.length;
    }
    this.ctx.drawImage(this.birdFrames[this.birdFrameIndex], 100, this.birdY);

    //this.ctx.strokeStyle = 'red';
    //this.ctx.lineWidth = 2;
    //const birdLeft = 100;
    //const birdTop = this.birdY;
    //const birdWidth = this.birdFrames[0].width;
    //const birdHeight = this.birdFrames[0].height;
    //this.ctx.strokeRect(birdLeft, birdTop, birdWidth, birdHeight);
    }

    loop() {
        this.frame++;
        if (this.isGameRunning) {
            this.update();
        }
        this.draw();

        this.checkCursorHoverOnBackButton();

        requestAnimationFrame(() => this.loop());
    }

  createCustomCursor() {
    this.cursorEl = document.createElement("img");
    this.cursorEl.src = this.assets.images.get("cursor").src;
    this.cursorEl.style.position = "absolute";
    this.cursorEl.style.width = "250px";
    this.cursorEl.style.height = "250px";
    this.cursorEl.style.pointerEvents = "none";
    this.cursorEl.style.zIndex = "1000";
    document.body.appendChild(this.cursorEl);

    window.addEventListener("mousemove", (e) => {
        this.cursorEl.style.left = e.pageX + "px";
        this.cursorEl.style.top = e.pageY + "px";
    });
}

    createBackButton() {
    const backButton = document.createElement("button");
    backButton.id = "btnBack";
    backButton.innerHTML = `<img src="/pictures/backButton.webp" height="80"/>`;
    backButton.style.position = "absolute";
    backButton.style.top = "10px";
    backButton.style.left = "10px";
    backButton.style.zIndex = "1000";
    backButton.style.border = "none";
    backButton.style.background = "transparent";
    backButton.style.cursor = "pointer";
    backButton.style.transition = "filter 0.3s ease";

    backButton.addEventListener("click", () => this.manager.switch('StartMenu'));

    backButton.addEventListener("mouseenter", () => {
        backButton.style.filter = "brightness(1.2)";
        this.manager.switch('StartMenu');
    });

    backButton.addEventListener("mouseleave", () => {
        backButton.style.filter = "brightness(1)";
    });

    document.body.appendChild(backButton);
}

    moveCursorWithFinger(landmarks) {
        const indexFinger = landmarks[8];

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let x = (1 - indexFinger.x) * viewportWidth;
        let y = indexFinger.y * viewportHeight;

        const sensitivity = 1.6;

        const cursorWidth = this.cursorEl ? this.cursorEl.offsetWidth || 40 : 40;
        const cursorHeight = this.cursorEl ? this.cursorEl.offsetHeight || 40 : 40;

        x = x - cursorWidth / 2;
        y = y - cursorHeight / 2;

        let centerX = viewportWidth / 2;
        let centerY = viewportHeight / 2;

        x = centerX + (x - centerX) * sensitivity;
        y = centerY + (y - centerY) * sensitivity;

        x = Math.min(Math.max(0, x), viewportWidth - cursorWidth);
        y = Math.min(Math.max(0, y), viewportHeight - cursorHeight);

        if (this.cursorEl) {
            this.cursorEl.style.left = `${x}px`;
            this.cursorEl.style.top = `${y}px`;
        }
    }

    onHandsResults(results) {
        if (results.multiHandLandmarks?.length > 0) {
            const landmarks = results.multiHandLandmarks[0];

            if (this.isFist(landmarks)) {
                if (this.waitingForFist) {
                    this.startScreen.style.display = "none";
                    this.waitingForFist = false;
                    this.resetGame();
                } else if (this.isGameRunning) {
                    this.velocity = this.jumpStrength;
                }
            }

            this.moveCursorWithFinger(landmarks);
        }
    }

    checkCursorHoverOnBackButton() {
        const backButton = document.getElementById("btnBack");
        if (!backButton || !this.cursorEl) return;

        const cursorRect = this.cursorEl.getBoundingClientRect();
        const backRect = backButton.getBoundingClientRect();

        const isOverlapping = !(
            cursorRect.right < backRect.left ||
            cursorRect.left > backRect.right ||
            cursorRect.bottom < backRect.top ||
            cursorRect.top > backRect.bottom
        );

        if (isOverlapping) {
            if (this.manager.current !== 'StartMenu') {
                this.manager.switch('StartMenu');
            }
        }
    }

    async destroy() {
        if (this.cursorEl) {
            this.cursorEl.remove();
        }
        const backButton = document.getElementById("btnBack");
        if (backButton) {
            backButton.remove();
        }
        await super.destroy();
        this.sceneEl.remove();
    }
}