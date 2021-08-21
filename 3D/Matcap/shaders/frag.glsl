uniform sampler2D tMatCap;

varying vec2 vN;

uniform sampler2D envMap;
uniform vec2 resolution;

varying vec3 eyeVector;
varying vec3 worldNormal;
varying vec3 viewDirection;

float ior = 2.42;

// level is [0,5], assumed to be a whole number
vec3 rainbow(float level) {

  float r = float(level <= 2.0) + float(level > 4.0) * 0.5;
  float g = max(1.0 - abs(level - 2.0) * 0.5, 0.0);
  float b = (1.0 - (level - 4.0) * 0.5) * float(level >= 4.0);
  return vec3(r, g, b);
}

vec3 smoothRainbow(float x) {
  float level1 = floor(x * 6.0);
  float level2 = min(6.0, floor(x * 6.0) + 1.0);

  vec3 a = rainbow(level1);
  vec3 b = rainbow(level2);

  return mix(a, b, fract(x * 6.0));
}

float h = 0.5;
vec3 firstColor = vec3(0.988, 0.341, 0.369);
vec3 middleColor = vec3(0.565, 0.835, 0.925);

vec3 grad(float val) { return mix(firstColor, middleColor, pow(val, 6.0)); }

float fresnel() {

  float f = dot(eyeVector, worldNormal);

  //   float f = 1.0 - pow(1.0 + dot(eyeVector, worldNormal), 3.0);

  return f;
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
  vec3 color = tex.rgb;

  float f = fresnel();

  vec3 base = texture2D(tMatCap, vN).rgb;
  vec3 final = mix(color, grad(f), f) * (base + 0.9);

  gl_FragColor = vec4(final, 1.);
}