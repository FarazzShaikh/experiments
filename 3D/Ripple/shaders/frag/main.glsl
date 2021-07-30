csm_DiffuseColor = vec4(0.953, 0.545, 0.627, 1.0);

float dx = vPosition.x;
float dy = vPosition.y;
float dz = vPosition.z;
float dist = sqrt(dx * dx + dy * dy + dz * dz) * 10.0;

vec4 white = vec4(1.0, 1.0, 1.0, 1.0);

float fac = dist * waveIntensity;

csm_DiffuseColor = mix(csm_DiffuseColor, white, fac);