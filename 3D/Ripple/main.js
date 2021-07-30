import * as THREE from "https://cdn.skypack.dev/three";
import { CustomShaderMaterial, TYPES } from "../../lib/THREE-CustomShaderMaterial/build/three-csm.m.cdn.js";
import { loadShadersCSM } from "../../lib/glNoise/build/glNoise.m.js";
import { initScene, render } from "../../Shared/setup.js";
import lights from "../../Shared/lights.js";

const v = {
  defines: "./shaders/vert/defines.glsl",
  header: "./shaders/vert/header.glsl",
  main: "./shaders/vert/main.glsl",
};

const f = {
  defines: "./shaders/frag/defines.glsl",
  header: "./shaders/frag/header.glsl",
  main: "./shaders/frag/main.glsl",
};

function IntersectionProvider_mousedown(element, camera, callback) {
  const raycaster = new THREE.Raycaster();

  console.log(element);
  element.addEventListener(
    "pointerdown",
    (event) => {
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      callback(raycaster);
    },
    false
  );
}

(async () => {
  const { defines: vdefines, header: vheader, main: vmain } = await loadShadersCSM(v);
  const { defines: fdefines, header: fheader, main: fmain } = await loadShadersCSM(f);

  const { scene, renderer, camera, controls } = initScene();
  camera.position.set(3, 3, 3);

  const { directionalLight, light: _light } = lights(scene);
  directionalLight.intensity = 0.6;
  _light.intensity = 0.6;

  const geometry = new THREE.IcosahedronGeometry(1, 128);
  console.log(geometry.attributes.position.count);
  const material = new CustomShaderMaterial({
    baseMaterial: TYPES.PHONG,
    vShader: {
      defines: vdefines,
      header: vheader,
      main: vmain,
    },
    fShader: {
      defines: fdefines,
      header: fheader,
      main: fmain,
    },
    uniforms: {
      time: {
        value: 0,
      },
      mouse: {
        value: new THREE.Vector3().setScalar(1),
      },
      waveIntensity: {
        value: 0,
      },
    },
    passthrough: {
      roughness: 0.7,
      shinyness: 0.5,
      flatShading: true,
    },
  });

  const mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);

  renderer.domElement.addEventListener("pointerup", () => {
    controls.enabled = true;
  });

  IntersectionProvider_mousedown(renderer.domElement, camera, (raycaster) => {
    const intersects = raycaster.intersectObject(mesh);

    if (intersects.length != 0) {
      const pos = intersects[0].point;
      controls.enabled = false;

      if (material) {
        material.uniforms.mouse.value = pos;
        material.uniforms.waveIntensity.value = 1;
      }
    }
  });

  render(0, (time) => {
    if (material && material.uniforms) {
      material.uniforms.time.value = time;
      material.uniforms.waveIntensity.value = THREE.MathUtils.lerp(material.uniforms.waveIntensity.value, 0, 0.02);
    }
  });
})();
