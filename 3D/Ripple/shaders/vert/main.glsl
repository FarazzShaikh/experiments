// https://www.shadertoy.com/view/ldycR3

csm_Position = position;

float height = 0.1;
float sharpness = 1.5;

vec3 p = position + mouse;

float r = length(p) * 0.9;
vec3 col = hsb2rgb(vec3(0.24, 0.7, 0.4));

float a = pow(r, 2.0);
float b = sin(r * -0.5);
float c = sin(r - 0.010);
float s = sin(a - waveIntensity * 3.0 + b) * c;

col = vec3(abs(1.0 / (s * (sharpness * 10.0))) - 0.01);

vec3 wave = position + normal * min(col * height, height + 0.005);
csm_Position = mix(position, wave, waveIntensity);
vPosition = wave - position;
