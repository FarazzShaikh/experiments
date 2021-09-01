varying vec3 vColor;
varying vec2 vUv;

void main() {
  vUv = uv;

  vec3 n = gln_curl(position * 5.0);
  vColor = n;

  gl_Position = vec4(position, 1.0);
}