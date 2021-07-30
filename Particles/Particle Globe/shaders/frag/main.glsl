// csm_DiffuseColor = vColor;
csm_DiffuseColor = vec4(1., 1., 1., 1.0);

vec4 shapeData = texture2D(diskShape, gl_PointCoord);
if (shapeData.a < 0.0625)
  discard;

vec2 uv = vUv;

vec4 mask = texture2D(earthMask, uv);
if (length(mask.rgb) > 1.0)
  discard;

if (floor(vVisible + 0.1) == 0.0)
  csm_DiffuseColor.rgb = vec3(0.078, 0.118, 0.38);
//   discard;
