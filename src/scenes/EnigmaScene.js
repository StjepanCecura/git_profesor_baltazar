import BaseScene from "@engine/BaseScene.js";

export default class EnigmaScene extends BaseScene {
  constructor(params) {
    super(params);
    this.container = document.getElementById("gameContainer");
    this.stateName = "menu";

    // Enigma internal state (rotors are indexed right-to-left: [0] = rightmost/fast)
    this.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.ROTORS = {
      I: { wiring: "EKMFLGDQVZNTOWYHXUSPAIBRCJ", notch: "Q" },
      II: { wiring: "AJDKSIRUXBLHWTMCQGZNPYFVOE", notch: "E" },
      III: { wiring: "BDFHJLCPRTXVZNYEIWGAKMUSQO", notch: "V" },
      IV: { wiring: "ESOVPZJAYQUIRHXLNFTGKDCMWB", notch: "J" },
      V: { wiring: "VZBRGITYUPSDNHLXAWMJQOFECK", notch: "Z" },
    };
    // keep an ordered list of rotor names for cycling left/right
    this.ROTOR_ORDER = Object.keys(this.ROTORS);

    this.REFLECTORS = {
      B: "YRUHQSLDPXNGOKMIEBFZCWVJAT",
      C: "FVPJIAOYEDRZXWGCTKUQSBNMHL",
    };

    // runtime state
    this.state = {
      rotors: [
        { type: "I", ring: 0, pos: 0 },
        { type: "II", ring: 0, pos: 0 },
        { type: "III", ring: 0, pos: 0 },
      ],
      reflector: Array.from(this.REFLECTORS["B"]),
      plugboard: {}, // e.g. { A: 'G', G: 'A' }
      outputText: "",
    };

    // UI refs
    this.sceneEl = null;
    this.modalRoot = null;
    this.outputEl = null;
    this.rotorRowEl = null;
    this.keyboardEl = null;
    this.plugboardEl = null;
    this.clearOutputBtn = null;

    // Input bindings
    this.handleMove = this.handleMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.updateFrameCount = this.updateFrameCount.bind(this);

    // internal helpers bound
    this._pressKey = this._pressKey.bind(this);
  }

  // ---------- Lifecycle ----------
  async init() {
    // optional assets — load if you want (kept consistent with other scenes)
    try {
      await this.assets.loadImage("backButton", "/pictures/backButton.webp");
    } catch (e) {
      // ignore if asset missing
    }

    // optional external CSS (you can place a fresh css file at /css/enigma.css)
    this.styleEl = this.loadStyle("/css/enigma.css");

    // setup input listeners
    this.input.on("move", this.handleMove);
    this.input.on("click", this.handleClick);
    this.input.on("frameCount", this.updateFrameCount);

    // create initial UI
    this.createMenuScreen();
  }

  // ---------- Utility ----------
  idx(c) {
    return this.alphabet.indexOf(c);
  }
  mod(n, m) {
    return ((n % m) + m) % m;
  }
  wiringMapFromString(s) {
    return s.split("").map((c) => this.idx(c));
  }

  // ---------- Screen Creation ----------
  clearScreen() {
    if (this.container) this.container.innerHTML = "";
    this.sceneEl = null;
  }

  createMenuScreen() {
    this.clearScreen();
    this.stateName = "menu";

    this.sceneEl = document.createElement("div");
    this.sceneEl.className = "container enigma-container";
    this.sceneEl.innerHTML = `
      <div class="firstLayer layer">
        <button class="btn" id="btnBack">${
          this.assets.images.get("backButton")
            ? `<img src="${
                this.assets.images.get("backButton").src
              }" height="100%"/>`
            : "Back"
        }</button>
      </div>
      <div class="secondLayer layer">
        <h1 class="textStyle enigma-title">Enigma</h1>
      </div>
      <div class="thirdLayer layer">
        <button class="textStyle btn enigma-menu-button" id="btnMachine">Open Machine</button>
        <button class="textStyle btn enigma-menu-button" id="btnSettings">Settings</button>
      </div>
    `;
    this.container.appendChild(this.sceneEl);

    const btnBack = this.sceneEl.querySelector("#btnBack");
    btnBack.addEventListener("click", () => this.manager.switch("StartMenu"));

    const btnMachine = this.sceneEl.querySelector("#btnMachine");
    btnMachine.addEventListener("click", () => this.createMachineScreen());

    const btnSettings = this.sceneEl.querySelector("#btnSettings");
    btnSettings.addEventListener("click", () => this.createSettingsScreen());

    this.cursorContainer = this.sceneEl;
  }

  createSettingsScreen() {
    // simple settings: pick reflector, reset plugboard, default rotor selection
    this.clearScreen();
    this.stateName = "settings";

    this.sceneEl = document.createElement("div");
    this.sceneEl.className = "container enigma-settings-container";
    this.sceneEl.innerHTML = `
    <button id="btnBack" class="btn enigma-back-button" aria-label="Back">
      ${
        this.assets.images.get
          ? `<img src="${
              (this.assets.images.get("backButton") || {}).src ||
              "/pictures/backButton.webp"
            }" alt="Back"/>`
          : '<img src="/pictures/backButton.webp" alt="Back"/>'
      }
    </button>

    <h1 class="enigma-settings-title">Settings</h1>

    <div class="enigma-settings-panel">
      <div class="enigma-setting-row">
        <div class="enigma-setting-label">Reflector</div>
        <div class="enigma-setting-control">
          <select id="reflectorSelect" class="enigma-select" aria-label="Reflector type">
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
      </div>

      <div class="enigma-setting-row">
        <div class="enigma-setting-label">Plugboard</div>
        <div class="enigma-setting-control">
          <button id="resetPlugboard" class="enigma-reset-btn" aria-label="Reset plugboard">Reset Plugboard</button>
        </div>
      </div>

      <p class="enigma-settings-note">Choose the reflector type (B or C). Resetting the plugboard will clear all pairings immediately.</p>
    </div>
  `;

    this.container.appendChild(this.sceneEl);

    // Back button -> menu
    const btnBack = this.sceneEl.querySelector("#btnBack");
    if (btnBack)
      btnBack.addEventListener("click", () => this.createMenuScreen());

    // Reflector default selection: detect current reflector string
    const sel = this.sceneEl.querySelector("#reflectorSelect");
    if (sel) {
      // pick C if current reflector equals REFLECTORS['C'], else default to B
      const currentRefl = (this.state.reflector || []).join("");
      sel.value = currentRefl === (this.REFLECTORS["C"] || "") ? "C" : "B";

      sel.addEventListener("change", (e) => {
        const v = e.target.value;
        if (this.REFLECTORS[v]) {
          this.state.reflector = this.REFLECTORS[v].split("");
        }
      });
    }

    // Reset plugboard
    const btnReset = this.sceneEl.querySelector("#resetPlugboard");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        this.state.plugboard = {};
        // Use a nicer in-scene confirmation if you prefer; window.alert is fine for now.
        window.alert("Plugboard reset.");
      });
    }

    this.cursorContainer = this.sceneEl;
  }

  createMachineScreen() {
    this.clearScreen();
    this.stateName = "machine";
    this.state.outputText = "";

    // build main interface
    this.sceneEl = document.createElement("div");
    this.sceneEl.className = "container enigma-machine-container";
    // inside createMachineScreen() — replace the firstLayer HTML chunk with:
    this.sceneEl.innerHTML = `
  <div class="firstLayer layer">
    <button id="btnBack" class="btn enigma-back-button" aria-label="Back">
      ${
        this.assets.images.get
          ? `<img src="${
              (this.assets.images.get("backButton") || {}).src ||
              "/pictures/backButton.webp"
            }" alt="Back"/>`
          : '<img src="/pictures/backButton.webp" alt="Back"/>'
      }
    </button>
  </div>

  <div class="secondLayer layer">
    <div id="output" class="output">Type using the keyboard below — output will appear here.</div>
    <button id="clearOutputBtn" class="clear-btn">Clear Output</button>
    <div class="controls">
      <div class="rotor-row" id="rotorRow"></div>
    </div>
  </div>

  <div class="thirdLayer layer">
    <div class="keyboard" id="keyboard"></div>
    <div class="small" style="text-align:center;margin-top:8px">QWERTY keyboard — tap letters to encrypt</div>
  </div>

  <div class="fourthLayer layer">
    <div class="plugboard" id="plugboard"></div>
    <div class="small" style="text-align:center;margin-top:8px">Tap two letters to create a plugboard connection. Tap a connected letter to remove its plug.</div>
  </div>

  <div id="modalRoot"></div>
`;

    this.container.appendChild(this.sceneEl);

    // refs
    this.outputEl = this.sceneEl.querySelector("#output");
    this.rotorRowEl = this.sceneEl.querySelector("#rotorRow");
    this.keyboardEl = this.sceneEl.querySelector("#keyboard");
    this.plugboardEl = this.sceneEl.querySelector("#plugboard");
    this.modalRoot = this.sceneEl.querySelector("#modalRoot");
    this.clearOutputBtn = this.sceneEl.querySelector("#clearOutputBtn");

    this.sceneEl
      .querySelector("#btnBack")
      .addEventListener("click", () => this.createMenuScreen());
    this.clearOutputBtn.addEventListener("click", () => {
      this.state.outputText = "";
      this.updateOutputArea();
    });

    // render interactive pieces
    this.renderRotors();
    this.renderKeyboard();
    this.renderPlugboard();

    // support keyboard input
    window.addEventListener(
      "keydown",
      (this._nativeKeydownHandler = (e) => {
        const ch = (e.key || "").toUpperCase();
        // qwerty subset
        if (this.alphabet.includes(ch) && this.qwerty.includes(ch)) {
          e.preventDefault();
          this._pressKey(ch);
        }
      })
    );

    this.cursorContainer = this.sceneEl;
  }

  // ---------- Rendering helpers ----------
  renderRotors() {
    if (!this.rotorRowEl) return;
    this.rotorRowEl.innerHTML = "";

    // Render visual left -> right; internal indices are [2,1,0]
    for (let uiIndex = 0; uiIndex < 3; uiIndex++) {
      const internalIndex = 2 - uiIndex; // convert visual slot to internal
      const r = this.state.rotors[internalIndex];

      const el = document.createElement("div");
      el.className = "rotor";
      el.dataset.slotIndex = internalIndex;

      // Build the two-line control: rotor type selector (left/right) and ring selector (− / value / +)
      el.innerHTML = `
        <div class="rotor-top-menu">
          <button class="rotor-arrow left" data-slot="${internalIndex}" data-action="prevType">◀</button>
          <div class="rotor-type-display">${r.type}</div>
          <button class="rotor-arrow right" data-slot="${internalIndex}" data-action="nextType">▶</button>
        </div>
        <div class="letter">${this.alphabet[r.pos]}</div>
        <div class="rotor-ring-menu">
          <button class="ring-btn minus" data-slot="${internalIndex}" data-action="decRing">−</button>
          <div class="ring-display">${r.ring + 1}</div>
          <button class="ring-btn plus" data-slot="${internalIndex}" data-action="incRing">+</button>
        </div>
      `;

      // attach handlers for arrows and ring buttons using event delegation on the rotor element
      el.querySelectorAll("button").forEach((btn) => {
        const action = btn.dataset.action;
        const slot = Number(btn.dataset.slot);
        if (!action) return;
        btn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          if (action === "prevType") this.cycleRotorType(slot, -1);
          else if (action === "nextType") this.cycleRotorType(slot, 1);
          else if (action === "decRing") this.changeRing(slot, -1);
          else if (action === "incRing") this.changeRing(slot, 1);
        });
      });

      // clicking the rotor body (outside buttons) still opens reflector for the reflector position; for rotor, open picker if you still want it
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        // open rotor picker modal if user long-clicks or wants a detailed view
        // (kept commented — you can enable if you want)
        // this.openRotorPicker(internalIndex);
      });

      this.rotorRowEl.appendChild(el);
    }

    // Reflector block to the right of rotors
    const reflEl = document.createElement("div");
    reflEl.className = "rotor reflector";
    reflEl.innerHTML = `
      <div class="rotor-top-menu">
        <button class="rotor-arrow left" id="reflectorPrev">◀</button>
        <div class="rotor-type-display">REF</div>
        <button class="rotor-arrow right" id="reflectorNext">▶</button>
      </div>
      <div class="letter">REF</div>
      <div class="rotor-ring-menu">
        <div class="ring-display small">Pairs: 13</div>
      </div>
    `;
    // reflector previous/next to switch between B and C quickly
    reflEl.querySelector("#reflectorPrev")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleReflector(-1);
    });
    reflEl.querySelector("#reflectorNext")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleReflector(1);
    });

    // allow opening the full reflector editor by clicking the REF area (optional)
    reflEl.addEventListener("click", (e) => {
      e.stopPropagation();
      this.openReflectorEditor();
    });

    this.rotorRowEl.appendChild(reflEl);
  }

  // helper: cycle rotor type left (-1) or right (+1) among available rotor names
  cycleRotorType(internalIndex, direction) {
    const order = this.ROTOR_ORDER;
    const current = this.state.rotors[internalIndex].type;
    let i = order.indexOf(current);
    if (i === -1) i = 0;
    i = this.mod(i + direction, order.length);
    this.state.rotors[internalIndex].type = order[i];
    // optionally reset position so user can clearly see effect
    this.state.rotors[internalIndex].pos = 0;
    this.renderRotors();
    this.updateOutputArea();
  }

  // helper: change ring setting by delta (-1 or +1)
  changeRing(internalIndex, delta) {
    let r = this.state.rotors[internalIndex].ring + delta;
    r = this.mod(r, 26);
    this.state.rotors[internalIndex].ring = r;
    this.renderRotors();
    this.updateOutputArea();
  }

  // helper: toggle reflector B <-> C
  toggleReflector(direction) {
    // treat direction irrelevant — just toggle B<->C
    const current = (this.state.reflector || []).join("");
    if (current === this.REFLECTORS["C"]) this.state.reflector = this.REFLECTORS["B"].split("");
    else this.state.reflector = this.REFLECTORS["C"].split("");
    this.renderRotors();
    this.updateOutputArea();
  }

  // --- new keyboard rows definition ---
  qwertyRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ];

  // --- new renderKeyboard() ---
  renderKeyboard() {
    // keyboardEl is the parent container; clear it
    this.keyboardEl.innerHTML = "";

    // build each row container
    this.qwertyRows.forEach((row, rowIndex) => {
      const rowDiv = document.createElement("div");
      rowDiv.className = "keyboard-row";

      // Add a spacer in the second row so the keys visually center (optional)
      // For aesthetics: add left & right padding on shorter rows by applying width constraints via CSS.
      row.forEach((key) => {
        const b = document.createElement("button");
        b.className = "key";
        b.textContent = key;
        b.addEventListener("click", () => this._pressKey(key));
        rowDiv.appendChild(b);
      });

      this.keyboardEl.appendChild(rowDiv);
    });
  }

  

  renderPlugboard() {
    this.plugboardEl.innerHTML = "";
    for (const c of this.alphabet) {
      const p = document.createElement("div");
      p.className = "plug";
      p.textContent = c;
      if (this.state.plugboard[c])
        p.textContent = c + "\u2194" + this.state.plugboard[c];
      p.addEventListener("click", () => this.togglePlug(c));
      this.plugboardEl.appendChild(p);
    }
  }

  // ---------- Plugboard interactions ----------
  plugSelection = null;
  togglePlug(letter) {
    if (this.state.plugboard[letter]) {
      const peer = this.state.plugboard[letter];
      delete this.state.plugboard[letter];
      delete this.state.plugboard[peer];
      this.renderPlugboard();
      return;
    }
    if (!this.plugSelection) {
      this.plugSelection = letter;
      this.highlightPlug(letter);
      return;
    }
    if (this.plugSelection === letter) {
      this.plugSelection = null;
      this.renderPlugboard();
      return;
    }
    // create connection
    this.state.plugboard[this.plugSelection] = letter;
    this.state.plugboard[letter] = this.plugSelection;
    this.plugSelection = null;
    this.renderPlugboard();
  }
  highlightPlug(letter) {
    this.renderPlugboard();
    const nodes = Array.from(this.plugboardEl.children);
    for (const n of nodes) {
      if (n.textContent.startsWith(letter))
        n.style.background = "rgba(234,179,8,0.12)";
    }
  }

  // ---------- Rotor picker modal ----------
  openRotorPicker(index) {
    this.modalRoot.innerHTML = "";
    const modal = document.createElement("div");
    modal.className = "modal-back";
    modal.innerHTML = `
      <div class="modal">
        <h3>Choose rotor for slot ${index + 1}</h3>
        <div class="rotor-list" id="rotorList"></div>
        <div style="margin-top:8px"><label class="small">Ring setting (1-26): <input id="ringInput" type="number" min="1" max="26" value="${
          this.state.rotors[index].ring + 1
        }"/></label></div>
        <div><button id="closePicker">Cancel</button></div>
      </div>
    `;
    this.modalRoot.appendChild(modal);
    const list = modal.querySelector("#rotorList");
    Object.keys(this.ROTORS).forEach((name) => {
      const item = document.createElement("div");
      item.className = "rotor-item";
      item.textContent = name + " — notch " + this.ROTORS[name].notch;
      item.addEventListener("click", () => {
        const ringVal = Number(modal.querySelector("#ringInput").value) - 1;
        this.state.rotors[index].type = name;
        this.state.rotors[index].ring = this.mod(ringVal, 26);
        this.state.rotors[index].pos = 0;
        this.closeModal();
        this.renderRotors();
      });
      list.appendChild(item);
    });
    modal
      .querySelector("#closePicker")
      .addEventListener("click", () => this.closeModal());
    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.closeModal();
    });
  }

  closeModal() {
    if (this.modalRoot) this.modalRoot.innerHTML = "";
  }

  // ---------- Reflector editor ----------
  openReflectorEditor() {
    this.modalRoot.innerHTML = "";
    const modal = document.createElement("div");
    modal.className = "modal-back";
    modal.innerHTML = `
      <div class="modal">
        <h3>Edit Reflector Pairs</h3>
        <div class="reflect-grid" id="reflectGrid"></div>
        <div style="margin-top:10px;text-align:right"><button id="clearRefl">Reset</button> <button id="saveRefl">Done</button></div>
      </div>
    `;
    this.modalRoot.appendChild(modal);
    const grid = modal.querySelector("#reflectGrid");
    let pairs = this.buildPairsFromReflector(this.state.reflector);
    let selection = null;

    const redraw = () => {
      grid.innerHTML = "";
      for (const c of this.alphabet) {
        const btn = document.createElement("div");
        btn.className = "pair-btn";
        btn.textContent = c;
        const mapped = pairs[c] || null;
        if (mapped) btn.textContent = c + "↔" + mapped;
        btn.addEventListener("click", () => {
          if (pairs[c]) {
            const peer = pairs[c];
            delete pairs[c];
            delete pairs[peer];
            selection = null;
            redraw();
            return;
          }
          if (!selection) {
            selection = c;
            btn.style.background = "rgba(234,179,8,0.12)";
            return;
          }
          if (selection === c) {
            selection = null;
            redraw();
            return;
          }
          pairs[selection] = c;
          pairs[c] = selection;
          selection = null;
          redraw();
        });
        grid.appendChild(btn);
      }
    };
    redraw();

    modal.querySelector("#clearRefl").addEventListener("click", () => {
      pairs = {};
      for (let i = 0; i < 13; i++) {
        const a = this.alphabet[2 * i],
          b = this.alphabet[2 * i + 1];
        pairs[a] = b;
        pairs[b] = a;
      }
      redraw();
    });

    modal.querySelector("#saveRefl").addEventListener("click", () => {
      const arr = [];
      for (const c of this.alphabet) arr.push(pairs[c] || c);
      this.state.reflector = arr;
      this.closeModal();
      this.renderRotors();
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.closeModal();
    });
  }

  buildPairsFromReflector(arr) {
    const m = {};
    for (let i = 0; i < 26; i++) m[this.alphabet[i]] = arr[i];
    return m;
  }

  // ---------- Encryption core ----------
  stepRotorsBeforeKey() {
    const r = this.state.rotors;
    const right = r[0],
      middle = r[1],
      left = r[2];
    const rightNotch = this.ROTORS[right.type].notch;
    const middleNotch = this.ROTORS[middle.type].notch;

    // double-step
    if (this.alphabet[middle.pos] === middleNotch) {
      middle.pos = this.mod(middle.pos + 1, 26);
      left.pos = this.mod(left.pos + 1, 26);
    }
    if (this.alphabet[right.pos] === rightNotch) {
      middle.pos = this.mod(middle.pos + 1, 26);
    }
    right.pos = this.mod(right.pos + 1, 26);
  }

  plugSub(c) {
    return this.state.plugboard[c] || c;
  }

  rotorForward(rotor, letter) {
    const wiring = this.wiringMapFromString(this.ROTORS[rotor.type].wiring);
    const p = this.idx(letter);
    const shifted = this.mod(p + rotor.pos - rotor.ring, 26);
    const wired = wiring[shifted];
    const out = this.mod(wired - rotor.pos + rotor.ring, 26);
    return this.alphabet[out];
  }

  rotorBackward(rotor, letter) {
    const wiring = this.wiringMapFromString(this.ROTORS[rotor.type].wiring);
    const p = this.idx(letter);
    const shifted = this.mod(p + rotor.pos - rotor.ring, 26);
    const iw = wiring.indexOf(shifted);
    const out = this.mod(iw - rotor.pos + rotor.ring, 26);
    return this.alphabet[out];
  }

  reflect(letter) {
    const i = this.idx(letter);
    const mapped = this.state.reflector[i];
    return mapped || letter;
  }

  encodeLetter(ch) {
    if (!this.alphabet.includes(ch)) return ch;
    this.stepRotorsBeforeKey();
    let c = this.plugSub(ch);
    for (let i = 0; i < 3; i++) c = this.rotorForward(this.state.rotors[i], c);
    c = this.reflect(c);
    for (let i = 2; i >= 0; i--)
      c = this.rotorBackward(this.state.rotors[i], c);
    c = this.plugSub(c);
    this.state.outputText += c;
    this.updateOutputArea();
    this.renderRotors();
    return c;
  }

  // ---------- Input handling ----------
  _pressKey(k) {
    this.encodeLetter(k);
  }

  updateOutputArea() {
    if (this.outputEl) this.outputEl.textContent = this.state.outputText;
  }

  // ---------- Click/move handlers to integrate with engine input system ----------
  handleMove({ x, y, i }) {
    this.updateCursor(x, y, i);
  }

  handleClick({ x, y }) {
    const px = x * window.innerWidth;
    const py = y * window.innerHeight;
    const el = document.elementFromPoint(px, py);
    if (!el) return;
    if (el.tagName === "BUTTON") el.click();
    else if (
      el.tagName === "IMG" &&
      el.src &&
      el.src.includes("backButton.webp")
    )
      el.click();
    else if (
      el.dataset &&
      el.dataset.x !== undefined &&
      el.dataset.y !== undefined
    ) {
      // not used here, but left for compatibility
    } else if (el.classList.contains("key") && el.textContent) {
      this._pressKey(el.textContent.trim());
    } else if (el.classList.contains("plug")) {
      // get letter and forward to click handler
      const letter = el.textContent[0];
      this.togglePlug(letter);
    }
  }

  updateFrameCount() {
    super.updateFrameCount();
  }

  // ---------- Destroy ----------
  async destroy() {
    this.input.off("move", this.handleMove);
    this.input.off("click", this.handleClick);
    this.input.off("frameCount", this.updateFrameCount);

    if (this._nativeKeydownHandler) {
      window.removeEventListener("keydown", this._nativeKeydownHandler);
      this._nativeKeydownHandler = null;
    }

    super.destroy();
    if (this.sceneEl && this.sceneEl.parentNode) this.sceneEl.remove();
  }
}
