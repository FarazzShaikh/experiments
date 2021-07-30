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

(async () => {
  const { defines: vdefines, header: vheader, main: vmain } = await loadShadersCSM(v);
  const { defines: fdefines, header: fheader, main: fmain } = await loadShadersCSM(f);

  const { scene, renderer, camera } = initScene();
  camera.position.set(0, 0, -4);

  const { directionalLight, light: _light } = lights(scene);
  directionalLight.intensity = 0.6;
  _light.intensity = 0.6;

  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("");
  const texture = loader.load("./textures/earth-mask.jpeg");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  const disk = loader.load("./textures/circle-sprite.png");

  const geometry = new THREE.IcosahedronGeometry(1, 64);
  console.log(geometry.attributes.position.count);

  const material = new CustomShaderMaterial({
    baseMaterial: TYPES.POINTS,
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
      earthMask: {
        value: texture,
      },
      diskShape: {
        value: disk,
      },
    },
    passthrough: {
      color: 0xb2b1b9,
      size: 0.03,
    },
  });

  const mesh = new THREE.Points(geometry, material);
  const axialTilt = (23.4 * Math.PI) / 180;

  mesh.geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(-axialTilt));

  scene.add(mesh);

  const innerGlobe = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x595260, transparent: true, opacity: 0.5 }));
  innerGlobe.scale.setScalar(0.99);
  scene.add(innerGlobe);

  const earthAxis = new THREE.Vector3(Math.sin(axialTilt), Math.cos(axialTilt), 0).normalize();

  render(0, (time) => {
    mesh.rotateOnAxis(earthAxis, 0.01); // axis must be normalized

    if (material && material.uniforms) {
      material.uniforms.time.value = time;
    }
  });
})();
