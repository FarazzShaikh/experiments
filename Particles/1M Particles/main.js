import * as THREE from "https://cdn.skypack.dev/three";
import { CustomShaderMaterial, TYPES } from "../../lib/THREE-CustomShaderMaterial/build/three-csm.m.cdn.js";
import { loadShadersCSM } from "../../lib/glNoise/build/glNoise.m.js";
import { initScene, render } from "../../Shared/setup.js";
import lights from "../../Shared/lights.js";

const v = {
  defines: "./shaders/particle_defines.glsl",
  header: "./shaders/particle_header.glsl",
  main: "./shaders/particle_main.glsl",
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
  camera.position.set(10, 10, 10);

  lights(scene);

  const loader = new THREE.TextureLoader();
  const disk = loader.load("./textures/circle-sprite.png");

  const geometry = new THREE.IcosahedronGeometry(4, 138);
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
      uShift: {
        value: 0,
      },
      uShape: {
        value: disk,
      },
      uScale: {
        value: window.innerHeight / 2,
      },
      uTime: {
        value: 0,
      },
      uTargetPos: {
        value: new THREE.Vector3(0),
      },
    },
    passthrough: {
      size: 0.05,
    },
  });

  const points = new THREE.Points(geometry, material);

  scene.add(points);

  const targetPos = new THREE.Vector3();

  renderer.domElement.addEventListener("pointermove", (event) => {
    var vec = new THREE.Vector3(); // create once and reuse
    var pos = new THREE.Vector3(); // create once and reuse
    vec.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    var distance = -camera.position.z / vec.z;
    pos.copy(camera.position).add(vec.multiplyScalar(distance));
    targetPos.x = pos.x;
    targetPos.y = pos.y;
    targetPos.z = pos.z;
  });

  render(0, (time) => {
    if (material && material.uniforms) {
      material.uniforms.uTime.value = time * 0.001;
      //   const p = new THREE.Vector3(targetPos).sub(material.uniforms.uTargetPos.value).multiplyScalar(0.05);
      material.uniforms.uTargetPos.value = targetPos;
    }
  });
})();
