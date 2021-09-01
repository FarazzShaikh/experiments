varying vec2 vUv;
uniform float uDelta;
uniform vec3 uAccleration;

void main() {
  vec3 p = texture2D(positionField, vUv).xyz;
  vec3 tv = texture2D(velocityField, vUv).xyz;

  vec3 v = tv;
  v += uAccleration * uDelta;

  gl_FragColor = vec4(v, 1.0); //
}