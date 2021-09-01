import { initScene, render } from "../../Shared/setup.js";
import lights from "../../Shared/lights.js";
import { airplane } from "./airplane.js";

import * as dat from "../../lib/dat.gui.module.js";

(async () => {
  const { scene } = initScene();
  // initHelpers();
  const { light, directionalLight } = lights(scene);
  //   directionalLight.intensity = 0.5;

  const opts = {
    Offset: 0.4,
    Contrast: 3.1,
    Brightness: 1,
  };

  const { animate, update } = await airplane(scene, opts);

  const gui = new dat.gui.GUI();

  for (const o in opts) {
    gui
      .add(opts, o)
      .min(-5)
      .max(5)
      .onChange(() => {
        update(opts);
      });
  }

  render(0, (dt) => {
    animate(dt * 0.00015);
  });
})();
