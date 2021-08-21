varying float vHeight;

uniform vec3 waterColor;
uniform vec3 waterHighlight;

uniform float offset;
uniform float contrast;
uniform float brightness;

vec3 calcColor() {

  float mask = (vHeight - offset) * contrast;

  vec3 diffuseColor = mix(waterColor, waterHighlight, mask);

    diffuseColor *= brightness;

  return diffuseColor;
}
