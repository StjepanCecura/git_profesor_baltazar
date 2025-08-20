import BaseScene from "@engine/BaseScene.js";
import Utils from "@engine/Utils.js";

export default class VideoPlayerScene extends BaseScene {
	constructor(params) {
		super(params);
		this.container = document.getElementById("gameContainer");

		this.handleMove = this.handleMove.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.updateFrameCount = this.updateFrameCount.bind(this);

		this.lastFrameGesture = null;
	}

	async init() {
		this.lastFrameGestures = {};

		this.styleEl = this.loadStyle("/css/VideoPlayer.css");

		const videos = [
			"/pictures/videoPlayer/Augustova_Treća_Sreća.mp4",
			"/pictures/videoPlayer/Hektorovo_otkriće_HR.mp4",
			"/pictures/videoPlayer/Vrline_iz_dubine.mp4",
		];

		this.videoQueue = this.shuffle(videos.slice());
		this.currentVideoIndex = 0;

		this.sceneEl = document.createElement("div");
		this.sceneEl.classList.add("container");
		this.sceneEl.innerHTML = `
            <video id="videoPlayer" class="video-player" id="videoPlayer" autoplay playsinline>
            </video>
        `;

		this.videoPlayer = this.sceneEl.querySelector("#videoPlayer");

		this.videoPlayer.src = this.videoQueue[this.currentVideoIndex];

		this.videoPlayer.addEventListener("ended", () => {
			this.currentVideoIndex =
				(this.currentVideoIndex + 1) % this.videoQueue.length;
			this.videoPlayer.src = this.videoQueue[this.currentVideoIndex];
			this.videoPlayer.play();
		});

		this.container.appendChild(this.sceneEl);
		this.cursorContainer = this.sceneEl;

		this.input.on("move", this.handleMove);
		this.input.on("click", this.handleClick);
		this.input.on("frameCount", this.updateFrameCount);
	}

	shuffle(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	update(dt) {
		if (!Utils.getVideoMode() && Utils.getVideoPlaying()) {
			Utils.setVideoPlaying();
			this.manager.switch("StartMenu");
		}
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
			const { gesture, x, y, i } = pred;

			if (gesture === "Thumb_Up") {
				if (!interacted) {
					interacted = true;
					this.scrollUp();
				}
			}
		});

		if (interacted) {
			this.sceneEntryTime = performance.now();
		}
	}

	async destroy() {
		this.input.off("move", this.handleMove);
		this.input.off("click", this.handleClick);
		await super.destroy();
		this.sceneEl.remove();
		this.container.innerHTML = "";
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
	}

	startGame() {
		this.manager.switch("StartMenu");
	}
}
