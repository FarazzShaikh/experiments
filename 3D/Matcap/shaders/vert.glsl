varying vec2 vN;

varying vec3 eyeVector;
varying vec3 worldNormal;

uniform float time;

void main() {

  float f = gln_perlin((position * 0.3) + time);
  vec4 p = vec4(position + (f * normal), 1.);

  vec3 e = normalize(vec3(modelViewMatrix * p));
  vec3 n = normalize(normalMatrix * normal);

  vec4 worldPosition = modelMatrix * p;
  worldNormal = normalize(modelViewMatrix * vec4(normal, 0.)).xyz;
  eyeVector = normalize(worldPosition.xyz - cameraPosition);

  vec3 r = reflect(e, n);
  float m = 2. * sqrt(pow(r.x, 2.) + pow(r.y, 2.) + pow(r.z + 1., 2.));
  vN = r.xy / m + .5;

  gl_Position = projectionMatrix * modelViewMatrix * p;
}