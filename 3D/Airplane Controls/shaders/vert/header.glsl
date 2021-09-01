
uniform float uTime;
varying float vHeight;

vec3 displace(vec3 point) {

  vec3 p = point;

  p.y += uTime * 2.0;

  gln_tFBMOpts fbmOpts = gln_tFBMOpts(1.0, 0.4, 2.3, 0.4, 1.0, 5, false, false);

  gln_tGerstnerWaveOpts A = gln_tGerstnerWaveOpts(vec2(0.0, -1.0), 0.5, 2.0);
  gln_tGerstnerWaveOpts B = gln_tGerstnerWaveOpts(vec2(0.0, 1.0), 0.25, 4.0);
  gln_tGerstnerWaveOpts C = gln_tGerstnerWaveOpts(vec2(1.0, 1.0), 0.15, 6.0);
  gln_tGerstnerWaveOpts D = gln_tGerstnerWaveOpts(vec2(1.0, 1.0), 0.4, 2.0);

  vec3 n = vec3(0.0);
  n.z += gln_normalize(gln_pfbm(p.xy + (uTime * 0.5), fbmOpts));
  n += gln_GerstnerWave(p, A, uTime).xzy;
  n += gln_GerstnerWave(p, B, uTime).xzy * 0.5;
  n += gln_GerstnerWave(p, C, uTime).xzy * 0.25;
  n += gln_GerstnerWave(p, D, uTime).xzy * 0.2;

  vHeight = n.z;

  return point + n;
}
