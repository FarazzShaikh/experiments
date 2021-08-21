uniform sampler2D envMap;
uniform vec2 resolution;

varying vec3 eyeVector;
varying vec3 worldNormal;
varying vec3 viewDirection;

float ior = 2.42;

float Fresnel(vec3 eyeVector, vec3 worldNormal) {
  //   return pow(1.0 + dot(eyeVector, worldNormal), 3.0);
  return 1.0 - clamp(dot(eyeVector, worldNormal), 0.0, 1.0);
}

void main() {
  // get screen coordinates
  vec2 uv = gl_FragCoord.xy / resolution;

  vec3 normal = worldNormal;
  // calculate refraction and add to the screen coordinates
  vec3 refracted = refract(eyeVector, normal, 1.0 / ior);
  uv += refracted.xy;

  // sample the background texture
  vec4 tex = texture2D(envMap, uv);

  vec4 color = tex;

  // calculate the Fresnel ratio
  float f = Fresnel(eyeVector, normal);

  // mix the refraction color and reflection color
  color.rgb = mix(vec3(1.0, 0.0, 1.0), vec3(1.0), f);

  gl_FragColor = vec4(vec3(f), 1.0);
}