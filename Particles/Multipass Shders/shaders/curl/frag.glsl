varying vec3 vColor;
varying vec2 vUv;

void main() {
  vec3 p = texture2D(positionField, vUv).xyz;
  vec3 n = gln_curl(p * 0.1);

  gl_FragColor = vec4(n, 1.0); //
}