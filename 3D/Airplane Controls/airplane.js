import * as THREE from "https://cdn.skypack.dev/three";
import { GLTFLoader } from "https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader.js";

function map(x, in_min, in_max, out_min, out_max) {
  return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

export async function airplane(scene, opts) {
  const loader = new GLTFLoader();
  let mixer;
  let clock = new THREE.Clock();

  const plane = await new Promise((res, rej) => {
    loader.load(
      // resource URL
      "./Assets/plane/scene.gltf",
      // called when the resource is loaded
      function (gltf) {
        gltf.scene.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = true;
            o.material.matalness = 0;
            o.material.roughness = 0;
            o.material.shinyness = 1;
            o.material.flatShading = true;
          }
        });

        mixer = new THREE.AnimationMixer(gltf.scene);
        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });

        res(gltf.scene);
      }
    );
  });

  plane.scale.setScalar(1.2);
  plane.rotation.y = Math.PI;

  console.log(plane);
  scene.add(plane);

  const targetPos = new THREE.Vector2(0, 1);

  const ele = document.querySelector("canvas");
  function onMove(e) {
    let target = e.target;
    let _x = e.clientX;
    let _y = e.clientY;
    if (e.type === "deviceorientation") {
      _x = e.beta;
      _y = e.gamma;
      target = ele;
    }

    const rect = target.getBoundingClientRect();
    const x = _x - rect.left - rect.width / 2;
    const y = _y - rect.top - rect.height / 2;

    let final_x = map(x, -rect.width / 2, rect.width / 2, -2, 2);
    let final_y = map(y, rect.height / 2, -rect.height / 2, 1.2, 3);

    if (e.type === "deviceorientation") {
      final_x = map(_x, 0, 360, -2, 2);
      final_y = map(_y, 0, 360, 0.7, 3);
    }

    targetPos.x = final_x;
    targetPos.y = final_y;
  }

  ele.addEventListener("mousemove", onMove);

  function update(opts) {}

  function animate(time) {
    if (mixer) {
      var delta = clock.getDelta();
      mixer.update(delta);
    }
  }

  return { animate, update };
}
