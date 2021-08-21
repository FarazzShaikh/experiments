import * as THREE from "https://cdn.skypack.dev/three";
import { CustomShaderMaterial, TYPES } from "../../lib/THREE-CustomShaderMaterial/build/three-csm.m.cdn.js";
import { loadShaders, loadShadersCSM } from "../../lib/glNoise/build/glNoise.m.js";
import { initHelpers, initScene } from "../../Shared/setup.js";
import lights from "../../Shared/lights.js";

(async () => {
  const [matVert, matFrag] = await loadShaders([
    "./shaders/vert.glsl", //
    "./shaders/frag.glsl",
  ]);

  const { scene, renderer, camera, controls } = initScene();
  lights(scene);
  camera.position.set(0, 0, 60);

  const loader = new THREE.TextureLoader();
  loader.load("./textures/a.jpeg", (tex) => {
    const material = new THREE.ShaderMaterial({
      vertexShader: matVert,
      fragmentShader: matFrag,
      uniforms: {
        tMatCap: {
          type: "t",
          value: tex,
        },
      },
    });

    material.uniforms.tMatCap.value.wrapS = material.uniforms.tMatCap.value.wrapT = THREE.ClampToEdgeWrapping;

    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
  });

  function render() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();
})();
