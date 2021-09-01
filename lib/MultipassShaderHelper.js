import * as THREE from "https://cdn.skypack.dev/three";
import { GPUComputationRenderer } from "./GPUComputationRenderer.js";

export class MultipassShaderHelper {
  constructor(
    renderer,
    passes = {},
    {
      width = 512, //
      height = 512,
    } = {}
  ) {
    if (!renderer) {
      throw new Error("useGPGPU: Missing parameter 'renderer'.");
    }

    if (!(renderer instanceof THREE.WebGLRenderer)) {
      throw new Error(`useGPGPU: Parameter "renderer" expected type "THREE.WebGLRenderer"; Recieved "${typeof renderer}"`);
    }

    this.variables = {};
    this.compute = new GPUComputationRenderer(width, height, renderer);

    Object.keys(passes).forEach((name) => {
      const pass = passes[name];

      // Texture
      const texture = this.compute.createTexture();
      if (pass.onLoadTexture) pass.onLoadTexture(texture);

      // Variable
      const variable = this.compute.addVariable(name, pass.fragmentShader, pass.vertexShader, texture);
      this.variables[name] = variable;
    });

    Object.keys(passes).forEach((name) => {
      const pass = passes[name];

      if (pass.uniforms) {
        const cVariable = this.compute.variables.find((v) => v.name === name);
        const deps = [];

        for (const key in pass.uniforms) {
          const uniform = pass.uniforms[key];

          if (uniform.value instanceof MultipassShaderHelper.Dependency) {
            const dVariable = this.compute.variables.find((v) => v.name === key);
            deps.push(dVariable);
          } else {
            cVariable.material.uniforms[key] = uniform;
          }
        }
        this.compute.setVariableDependencies(cVariable, deps);
      }
    });

    this.textures = {};
    for (const name in this.variables) {
      this.textures[name] = (() => this.compute.getCurrentRenderTarget(this.variables[name]).texture).bind(this);
    }

    const error = this.compute.init();
    if (error !== null) {
      console.error(error);
    }
  }

  reset() {
    const error = this.compute.init();
    if (error !== null) {
      console.error(error);
    }
  }

  static Dependency = class Dependency {};
}
