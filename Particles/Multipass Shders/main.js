import * as THREE from "https://cdn.skypack.dev/three";
import { initScene, render } from "../../Shared/setup.js";
import lights from "../../Shared/lights.js";

import { CustomShaderMaterial, TYPES } from "../../lib/THREE-CustomShaderMaterial/build/three-csm.m.cdn.js";
import { loadShadersCSM, loadShadersRaw, loadShaders } from "../../lib/glNoise/build/glNoise.m.js";
import { MultipassShaderHelper } from "../../lib/MultipassShaderHelper.js";

import * as dat from "../../lib/dat.gui.module.js";

function fillVelocityTexture(texture) {
  const theArray = texture.image.data;

  for (let k = 0, kl = theArray.length; k < kl; k += 4) {
    const x = Math.random() - 0.5;
    const y = Math.random() - 0.5;
    const z = Math.random() - 0.5;

    theArray[k + 0] = x * 10;
    theArray[k + 1] = y * 10;
    theArray[k + 2] = z * 10;
    theArray[k + 3] = 1;
  }
}

function fillPositionTexture(texture) {
  const theArray = texture.image.data;

  for (let k = 0, kl = theArray.length; k < kl; k += 4) {
    const x = 0;
    const y = 0;
    const z = 0;

    theArray[k + 0] = x;
    theArray[k + 1] = y;
    theArray[k + 2] = z;
    theArray[k + 3] = 1;
  }
}

async function makePasses() {
  const [cVert, cFrag] = await loadShaders([
    "./shaders/curl/vert.glsl", //
    "./shaders/curl/frag.glsl",
  ]);

  const [vVert, vFrag, pVert, pFrag, lVert, lFrag] = await loadShadersRaw([
    "./shaders/velocity/vert.glsl", //
    "./shaders/velocity/frag.glsl",
    "./shaders/position/vert.glsl", //
    "./shaders/position/frag.glsl",
    "./shaders/life/vert.glsl", //
    "./shaders/life/frag.glsl",
  ]);

  const passes = {
    velocityField: {
      vertexShader: vVert,
      fragmentShader: vFrag,
      uniforms: {
        uDelta: { value: 0 },
        uAccleration: { value: new THREE.Vector3().setScalar(0.2) },

        velocityField: { value: new MultipassShaderHelper.Dependency() },
        positionField: { value: new MultipassShaderHelper.Dependency() },
      },
      onLoadTexture: (t) => fillVelocityTexture(t),
    },
    positionField: {
      vertexShader: pVert,
      fragmentShader: pFrag,
      uniforms: {
        uDelta: { value: 0 },

        velocityField: { value: new MultipassShaderHelper.Dependency() },
        positionField: { value: new MultipassShaderHelper.Dependency() },
        flowField: { value: new MultipassShaderHelper.Dependency() },
      },
      onLoadTexture: (t) => fillPositionTexture(t),
    },
    flowField: {
      vertexShader: cVert,
      fragmentShader: cFrag,

      uniforms: {
        positionField: { value: new MultipassShaderHelper.Dependency() },
      },
    },
  };

  return passes;
}

const createShaderMaterial = async () => {
  const particleVertexShader = await loadShadersCSM({
    header: "./shaders/particle/vert/header.glsl", //
    main: "./shaders/particle/vert/main.glsl", //
  });

  const material = new CustomShaderMaterial({
    baseMaterial: TYPES.POINTS,
    vShader: particleVertexShader,
    uniforms: {
      positionField: {
        value: null,
      },
      lifeField: {
        value: null,
      },
      uTime: {
        value: 0,
      },
      pointColor: {
        value: new THREE.Color("#F38BA0"),
      },
    },
    passthrough: {
      size: 0.3,
      transparent: true,
      opacity: 0.1,
    },
  });
  return material;
};

(async () => {
  const { scene, renderer, camera, controls } = initScene();
  camera.position.setScalar(25);

  const geom = new THREE.IcosahedronGeometry(3, 64);
  const material = await createShaderMaterial();
  const mesh = new THREE.Points(geom, material);
  scene.add(mesh);

  const passes = await makePasses();
  const gpu = new MultipassShaderHelper(renderer, passes);
  console.log(gpu);

  const gui = new dat.gui.GUI();
  gui.domElement.parentElement.style.zIndex = 1000;

  const obj = {
    Reset: () => {
      gpu.reset();
    },
  };
  gui.add(obj, "Reset");

  const clock = new THREE.Clock();
  render(0, () => {
    const delta = clock.getDelta();
    if (material && material.uniforms) {
      const { positionField, velocityField } = gpu.variables;

      const positionTexture = gpu.textures.positionField();

      material.uniforms.positionField.value = positionTexture;

      velocityField.material.uniforms.uDelta.value = delta;
      positionField.material.uniforms.uDelta.value = delta;
      gpu.compute.compute();
    }
  });
})();
