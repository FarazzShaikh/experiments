import * as THREE from "https://cdn.skypack.dev/three";
import { initScene, render, initHelpers } from "../../Shared/setup.js";
import lights from "../../Shared/lights.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "../../lib/dat.gui.module.js";

const cloneGltf = (gltf) => {
  const clone = {
    animations: gltf.animations,
    scene: gltf.scene.clone(true),
  };

  const skinnedMeshes = {};

  gltf.scene.traverse((node) => {
    if (node.isSkinnedMesh) {
      skinnedMeshes[node.name] = node;
    }
  });

  const cloneBones = {};
  const cloneSkinnedMeshes = {};

  clone.scene.traverse((node) => {
    if (node.isBone) {
      cloneBones[node.name] = node;
    }

    if (node.isSkinnedMesh) {
      cloneSkinnedMeshes[node.name] = node;
    }
  });

  for (let name in skinnedMeshes) {
    const skinnedMesh = skinnedMeshes[name];
    const skeleton = skinnedMesh.skeleton;
    const cloneSkinnedMesh = cloneSkinnedMeshes[name];

    const orderedCloneBones = [];

    for (let i = 0; i < skeleton.bones.length; ++i) {
      const cloneBone = cloneBones[skeleton.bones[i].name];
      orderedCloneBones.push(cloneBone);
    }

    cloneSkinnedMesh.bind(new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses), cloneSkinnedMesh.matrixWorld);
  }

  return clone;
};

(async () => {
  const { scene, camera } = initScene();
  camera.position.set(4, 2, 6);
  //   initHelpers();
  lights(scene);

  const loader = new GLTFLoader();
  const texture = new THREE.TextureLoader().load("./Assets/Diffuse.png");
  texture.flipY = false;
  texture.encoding = THREE.sRGBEncoding;

  const gui = new dat.gui.GUI();
  gui.domElement.parentElement.style.zIndex = 1000;

  const morphTargets = {};

  const head = await new Promise((res, rej) => {
    loader.load(`./Assets/head.gltf`, (object) => {
      const group = object.scene;

      group.traverse((child) => {
        if (child.isMesh) {
          child.material.metalness = 0;
          child.material.map = texture;
          child.material.vertexColors = false;
        }
      });

      res(object);
    });
  });

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const k = `${i}x${j}`;
      morphTargets[k] = {};

      const instance = cloneGltf(head).scene;
      instance.position.x = (i - 1) * 1.5;
      instance.position.y = (j - 1) * 1.5;

      const group = instance.children[0].children[2];

      group.children.forEach((child) => {
        child.morphTargetInfluences = child.morphTargetInfluences.map(() => Math.random());

        for (const key in child.morphTargetDictionary) {
          const index = child.morphTargetDictionary[key];
          if (Array.isArray(morphTargets[k][key])) {
            morphTargets[k][key].push({ index, child });
          } else {
            morphTargets[k][key] = [];
            morphTargets[k][key].push({ index, child });
          }
        }
      });

      scene.add(instance);
    }
  }

  const params = {};
  for (const _key in morphTargets) {
    const folder = gui.addFolder(_key);
    params[_key] = {};
    for (const key in morphTargets[_key]) {
      const { child, index } = morphTargets[_key][key][0];
      params[_key][key] = child.morphTargetInfluences[index];

      folder
        .add(params[_key], key, 0, 1)
        .step(0.01)
        .onChange(function () {
          morphTargets[_key][key].forEach((t) => {
            const { child, index } = t;
            child.morphTargetInfluences[index] = params[_key][key];
          });
        });
    }
  }

  const randomize = {
    shape: () => {
      for (const _key in morphTargets) {
        for (const key in morphTargets[_key]) {
          const rand = Math.random();
          params[_key][key] = rand;
          morphTargets[_key][key].forEach((t) => {
            const { child, index } = t;
            child.morphTargetInfluences[index] = params[_key][key];
          });
        }
      }

      gui.updateDisplay();
    },
  };
  gui.add(randomize, "shape").name("Randomize Shape");

  render(0, () => {});
})();
