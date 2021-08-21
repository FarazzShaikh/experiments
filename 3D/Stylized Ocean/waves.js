import * as THREE from "https://cdn.skypack.dev/three";
import { loadShadersCSM } from "../../lib/glNoise/build/glNoise.m.js";
import { CustomShaderMaterial, TYPES } from "../../lib/THREE-CustomShaderMaterial/build/three-csm.m.cdn.js";

function hex(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
}

var hex2rgb = (str) => {
  return hex(str).map((x) => x / 255);
};

const pVert = {
  header: "./shaders/vert/header.glsl",
  main: "./shaders/vert/main.glsl",
};
const pFrag = {
  defines: "",
  header: "./shaders/frag/header.glsl",
  main: "./shaders/frag/main.glsl",
};

export async function waves(scene, opts) {
  const material = new CustomShaderMaterial({
    baseMaterial: TYPES.PHONG,
    vShader: await loadShadersCSM(pVert),
    fShader: await loadShadersCSM(pFrag),
    uniforms: {
      uTime: { value: 0 },
      waterColor: {
        value: new THREE.Color("#52a7f7"),
      },
      waterHighlight: {
        value: new THREE.Color("#b3ffff"),
      },
      offset: {
        value: opts.Offset,
      },
      contrast: {
        value: opts.Contrast,
      },
      brightness: {
        value: opts.Brightness,
      },
    },
    passthrough: {
      side: THREE.DoubleSide,
      flatShading: true,
      color: 0x68c3c0,
      shininess: 1,
    },
  });

  const geometry = new THREE.PlaneGeometry(5, 5, 32, 32);
  const plane = new THREE.Mesh(geometry, material);
  plane.rotateX(-Math.PI / 2);
  scene.add(plane);

  function update(opts) {
    material.uniforms.offset.value = opts.Offset;
    material.uniforms.contrast.value = opts.Contrast;
    material.uniforms.brightness.value = opts.Brightness;
  }

  function animate(dt) {
    if (material && material.uniforms) {
      material.uniforms.uTime.value = dt;
    }
  }

  return { animate, update };
}
