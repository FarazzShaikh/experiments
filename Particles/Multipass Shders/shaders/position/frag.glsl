varying vec2 vUv;
uniform float uDelta;

void main() {
  vec3 tp = texture2D(positionField, vUv).xyz;
  vec3 v = texture2D(velocityField, vUv).xyz;
  vec3 f = texture2D(flowField, vUv).xyz;

  vec3 p = tp;
  p += (v * f) * uDelta;

  float w = 15.0;

  if (p.x > w) {
    p.x = -0.0;
  } else if (p.x < -w) {
    p.x = 0.0;
  }

  if (p.y > w) {
    p.y = -0.0;
  } else if (p.y < -w) {
    p.y = 0.0;
  }

  if (p.z > w) {
    p.z = -0.0;
  } else if (p.z < -w) {
    p.z = 0.0;
  }

  gl_FragColor = vec4(p, 1.0); //
}