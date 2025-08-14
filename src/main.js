import Engine from "@engine/Engine.js";
import SceneManager from "@engine/SceneManager.js";
import InputManager from "@engine/InputManager.js";
import AssetManager from "@engine/AssetManager.js";
import BaseScene from "@engine/BaseScene.js";
import SjekacVockiScene from "@scenes/SjekacVockiScene.js"; 
import TicTacToeScene from "@scenes/TicTacToeScene.js";
import StartMenuScene from "@scenes/StartMenuScene.js";
import DrawingScene from "@scenes/DrawingScene.js";
import PamtilicaScene from "@scenes/PamtilicaScene.js";
import KSPScene from "@scenes/KSPScene.js";
import LetimirScene from "@scenes/LetimirScene";
import SpojiCudoScene from "@scenes/SpojiCudoScene.js";

(async () => {
  const videoEl = document.querySelector("#inputVideo");

  const input = new InputManager({ videoElement: videoEl });
  const assets = new AssetManager();
  const scenes = new SceneManager();

  scenes.register("StartMenu", StartMenuScene);
  scenes.register("Drawing", DrawingScene);
  scenes.register("Pamtilica", PamtilicaScene);
  scenes.register("KSP", KSPScene);
  scenes.register("TicTacToe", TicTacToeScene);
  scenes.register("SjekacVocki", SjekacVockiScene);
  scenes.register("Letimir", LetimirScene);
  //scenes.register("SpojiCudo", SpojiCudoScene);

  const engine = new Engine({
    sceneManager: scenes,
    inputManager: input,
    assetManager: assets,
  });
  await engine.init();

  await scenes.switch("StartMenu");
  engine.start();
})();
