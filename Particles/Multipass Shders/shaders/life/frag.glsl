
uniform float uDelta;
varying vec2 vUv;

void main() {
  vec3 p = texture2D(positionField, vUv).xyz;
  vec3 tl = texture2D(lifeField, vUv).xyz;

  float l = tl.x - (uDelta * 0.05);

  //   if (distance(vec3(0.0), p) <= 0.1)
  //     l = 1.0;

  gl_FragColor = vec4(vec3(l), 1.0); //
}