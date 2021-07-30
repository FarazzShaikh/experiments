vec3 _normal = normalMatrix * normal;
vec4 _mvPosition = modelViewMatrix * vec4(position, 1.0);

vVisible = step(0., dot(-normalize(_mvPosition.xyz), normalize(_normal)));

vPosition = position;
vUv = uv;