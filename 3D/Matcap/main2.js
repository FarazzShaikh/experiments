import * as THREE from "https://cdn.skypack.dev/three";
import { CustomShaderMaterial, TYPES } from "../../lib/THREE-CustomShaderMaterial/build/three-csm.m.cdn.js";
import { loadShaders, loadShadersCSM } from "../../lib/glNoise/build/glNoise.m.js";
import { initHelpers, initScene } from "../../Shared/setup.js";
import lights from "../../Shared/lights.js";

function mobius(u, t, vec) {
  // flat mobius strip
  // http://www.wolframalpha.com/input/?i=M%C3%B6bius+strip+parametric+equations&lk=1&a=ClashPrefs_*Surface.MoebiusStrip.SurfaceProperty.ParametricEquations-
  u = u - 0.5;
  var v = 2 * Math.PI * t;

  var x, y, z;

  var a = 2;
  x = Math.cos(v) * (a + u * Math.cos(v / 2));
  y = Math.sin(v) * (a + u * Math.cos(v / 2));
  z = u * Math.sin(v / 2);

  vec.set(x, y, z);

  return new THREE.Vector3(x, y, z);
}

(async () => {
  const [reflecVert, reflecFrag, matVert, matFrag] = await loadShaders([
    "./shaders/refelection/vert.glsl", //
    "./shaders/refelection/frag.glsl",
    "./shaders/vert.glsl", //
    "./shaders/frag.glsl",
  ]);

  const { scene, renderer, camera, controls } = initScene();
  //   lights(scene);
  //   initHelpers(scene);

  const width = renderer.domElement.clientWidth;
  const height = renderer.domElement.clientHeight;
  const dpr = Math.min(window.devicePixelRatio, 2 || 1);
  const orthoCamera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
  orthoCamera.layers.set(1);

  camera.position.set(0, 0, -60);
  orthoCamera.position.set(0, 0, 60);

  const loader = new THREE.TextureLoader();
  loader.load("./textures/grad.png", (tex) => {
    const quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));

    quad.scale.set(width, height, 1);
    quad.layers.set(1);
    scene.add(quad);
  });

  const envFBO = new THREE.WebGLRenderTarget(width, height);
  renderer.autoClear = false;

  //   const material = new THREE.ShaderMaterial({
  //     vertexShader: reflecVert,
  //     fragmentShader: reflecFrag,
  //     uniforms: {
  //       envMap: { value: envFBO.texture },
  //       resolution: { value: [width * dpr, height * dpr] },
  //     },
  //   });

  let sphere, material;
  loader.load("./textures/a.jpeg", (tex) => {
    material = new THREE.ShaderMaterial({
      vertexShader: matVert,
      fragmentShader: matFrag,
      uniforms: {
        tMatCap: {
          type: "t",
          value: tex,
        },
        envMap: { value: envFBO.texture },
        resolution: { value: [width * dpr, height * dpr] },
        time: { value: 0 },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });

    material.uniforms.tMatCap.value.wrapS = material.uniforms.tMatCap.value.wrapT = THREE.ClampToEdgeWrapping;

    const geometry = new THREE.TorusGeometry(10, 3, 64, 256);
    // const geometry = new THREE.ParametricGeometry(mobius, 40, 40);
    // const geometry = new THREE.SphereGeometry(15, 32, 16);
    sphere = new THREE.Mesh(geometry, material);
    sphere.rotation.x = THREE.MathUtils.degToRad(45);
    sphere.rotation.y = THREE.MathUtils.degToRad(45);

    // sphere.scale.multiplyScalar(7);
    scene.add(sphere);
  });

  new THREE.FontLoader().load("../../Assets/fonts/roberto.json", function (font) {
    const geometry = new THREE.TextGeometry("Hello three.js!", {
      font: font,
      size: 5,
      height: 0.5,
    });
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.geometry.computeBoundingBox();

    console.log(mesh.geometry.boundingBox);

    mesh.rotation.y = THREE.MathUtils.degToRad(180);

    mesh.position.x += mesh.geometry.boundingBox.max.x / 2;
    mesh.position.y -= mesh.geometry.boundingBox.max.y / 2;

    // mesh.layers.set(1);

    scene.add(mesh);
  });

  function render(time) {
    controls.update();
    requestAnimationFrame(render);
    renderer.clear();

    // render background to fbo
    renderer.setRenderTarget(envFBO);
    renderer.render(scene, orthoCamera);

    // render background to screen
    renderer.setRenderTarget(null);
    renderer.render(scene, orthoCamera);
    renderer.clearDepth();

    // render geometry to screen
    renderer.render(scene, camera);

    if (sphere) sphere.rotation.z += 0.01;

    if (material) material.uniforms.time.value = time * 0.001;
  }
  render();
})();
