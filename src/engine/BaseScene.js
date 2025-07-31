export default class BaseScene {
  constructor({ assets, input, manager, useColorIndicator = false }) {
    this.assets = assets;
    this.input = input;
    this.manager = manager;
    this.handCursors = new Map();
    this.handSmoothed = new Map(); 
    this.handLastSeen = new Map();
    this.cursorContainer = document.body;
    this.useColourIndicator = useColorIndicator;
    this.cursorOffset = () => ({ x: 0, y: 0 });

    this.MAX_MISSING_FRAMES = 5;
    this.SMOOTHING = 0.5;
    this.frameCount = 0;
  }

  updateFrameCount(){
    this.frameCount ++;
    this.handCursors.forEach((_, id) => {
      if (this.frameCount - (this.handLastSeen.get(id) || 0) > this.MAX_MISSING_FRAMES) {
        this.removeCursor(id);
      }
    });
  }

  createCursor(id) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('cursor-wrapper');

    const img = document.createElement('img');
    img.classList.add('mouse_pointer');
    img.id = `cursor_${id}`;
    img.src = this.assets.images.get('cursor').src;

    Object.assign(img.style, {
      pointerEvents: 'none',
      backgroundSize: 'cover',
      display: 'block'
    });

    wrapper.appendChild(img);
    wrapper.img = img;

    if (this.useColourIndicator) {
      const indicator = document.createElement('div');
      indicator.classList.add('cursor-indicator');
      indicator.style.backgroundColor = '#000';
      indicator.style.maskImage = `url(${this.assets.images.get('cursorTip').src})`;
      indicator.style.webkitMaskImage = `url(${this.assets.images.get('cursorTip').src})`;
      wrapper.appendChild(indicator);
      wrapper.indicator = indicator;
    }

    Object.assign(wrapper.style, {
      position: 'absolute',
      pointerEvents: 'none',
      display: 'block'
    });

    this.cursorContainer.appendChild(wrapper);
    this.handCursors.set(id, wrapper);
    return wrapper;
  }


  removeCursor(id) {
    if (this.handCursors.has(id)) {
      this.handCursors.get(id).remove();
      this.handCursors.delete(id);
    }
    this.handSmoothed.delete(id);
    this.handLastSeen.delete(id);
  }

  loadStyle(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    return link;
  }

  removeStyle(link) {
    if (link && link.parentNode) link.parentNode.removeChild(link);
  }

  updateCursor(xNorm, yNorm, id) {
    if (!this.handCursors.has(id)) {
      this.createCursor(id);
      this.handSmoothed.set(id, { x: xNorm, y: yNorm });
    }

    const cursor = this.handCursors.get(id);
    const state = this.handSmoothed.get(id);

    state.x += (xNorm - state.x) * this.SMOOTHING;
    state.y += (yNorm - state.y) * this.SMOOTHING;

    const px = Math.min(
      window.innerWidth + cursor.clientWidth,
      window.innerWidth * state.x
    );
    const py = Math.min(
      window.innerHeight + cursor.clientHeight,
      window.innerHeight * state.y
    );

    const img = cursor.img || cursor;
    const offset = this.cursorOffset(img);
    cursor.style.display = 'block';
    cursor.style.left = `${px + offset.x}px`;
    cursor.style.top = `${py + offset.y}px`;

    this.handLastSeen.set(id, this.frameCount);
  }

  async init() {}

  update(dt) {
  }

  resetHands() {
    this.handCursors.forEach(c => c.remove());
    this.handCursors.clear();

    this.handSmoothed.clear();
    this.handLastSeen.clear();
  }

  render() {}

  async destroy() {
    this.handCursors.forEach((c) => c.remove());
    this.handCursors.clear();
  }

  async waitForImage(key) {
    const timeout = 5000;
    const start = Date.now();

    return new Promise((resolve, reject) => {
      const check = () => {
        const img = this.assets.images.get(key);
        if (img && img.src) {
          resolve(img.src);
        } else if (Date.now() - start > timeout) {
          reject(`Slika '${key}' se nije učitala unutar 5 sekundi.`);
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }
}