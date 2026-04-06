/* ═══════════════════════════════════════════════════
   SnipCraft — Animated Shader Gradient Background
   WebGL canvas mimicking a ShaderGradient sphere
   with magenta/beige/lavender palette, grain, and
   organic noise-based animation.
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Configuration (mapped from ShaderGradient props) ──
  const CONFIG = {
    color1: [0.969, 0.0, 1.0],      // #f700ff — vivid magenta
    color2: [0.859, 0.729, 0.584],   // #dbba95 — warm beige
    color3: [0.816, 0.737, 0.882],   // #d0bce1 — soft lavender
    speed: 0.4,
    amplitude: 0.6,
    density: 0.7,
    frequency: 5.5,
    strength: 5.8,
    grain: 0.12,
    brightness: 1.2,
    pixelRatio: Math.min(window.devicePixelRatio, 1.5), // cap for performance
  };

  // ── Vertex Shader ──
  const VERT = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  // ── Fragment Shader ──
  const FRAG = `
    precision highp float;

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform vec3 u_color3;
    uniform float u_speed;
    uniform float u_amplitude;
    uniform float u_density;
    uniform float u_frequency;
    uniform float u_strength;
    uniform float u_grain;
    uniform float u_brightness;

    // ── Simplex-like 3D noise (optimized) ──
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    // ── FBM (Fractal Brownian Motion) for richer organic noise ──
    float fbm(vec3 p) {
      float value = 0.0;
      float amp = 0.5;
      float freq = 1.0;
      for (int i = 0; i < 5; i++) {
        value += amp * snoise(p * freq);
        freq *= 2.0;
        amp *= 0.5;
      }
      return value;
    }

    // ── Film grain ──
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);

      float t = u_time * u_speed;

      // ── Sphere-like radial mapping ──
      float r = length(p);
      float sphereFalloff = smoothstep(2.2, 0.0, r);

      // ── Primary noise field (organic flowing gradient) ──
      vec3 noiseCoord = vec3(
        p.x * u_density + sin(t * 0.3) * 0.2,
        p.y * u_density + cos(t * 0.25) * 0.15,
        t * 0.15
      );

      float n1 = fbm(noiseCoord * u_frequency * 0.18);
      float n2 = fbm(noiseCoord * u_frequency * 0.12 + vec3(5.2, 1.3, 2.8));
      float n3 = snoise(vec3(p * u_frequency * 0.08, t * 0.1));

      // ── Wave distortion (matching uAmplitude/uStrength) ──
      float wave = sin(p.x * u_strength * 0.5 + t * 0.8 + n1 * u_amplitude * 3.0) * 0.5 + 0.5;
      float wave2 = cos(p.y * u_strength * 0.4 - t * 0.5 + n2 * u_amplitude * 2.5) * 0.5 + 0.5;

      // ── Color mixing (smooth three-way blend) ──
      float mix1 = smoothstep(-0.4, 0.6, n1 + wave * 0.3);
      float mix2 = smoothstep(-0.3, 0.7, n2 + wave2 * 0.3);
      float mix3 = smoothstep(-0.5, 0.5, n3);

      vec3 color = u_color1;
      color = mix(color, u_color2, mix1);
      color = mix(color, u_color3, mix2 * 0.7);
      color = mix(color, u_color1 * 0.8 + u_color3 * 0.2, mix3 * 0.4);

      // ── Add warm glow in center ──
      float glow = exp(-r * r * 0.4) * 0.25;
      color += vec3(glow * 0.8, glow * 0.5, glow * 0.6);

      // ── Subtle iridescent shimmer ──
      float shimmer = snoise(vec3(p * 3.0, t * 0.3)) * 0.06;
      color += shimmer;

      // ── Apply sphere falloff for depth ──
      color *= sphereFalloff * 0.85 + 0.15;

      // ── Brightness ──
      color *= u_brightness;

      // ── Vignette ──
      float vignette = 1.0 - smoothstep(0.5, 1.8, r);
      color *= mix(0.7, 1.0, vignette);

      // ── Film grain ──
      float grainNoise = hash(uv * u_resolution + fract(u_time * 100.0)) - 0.5;
      color += grainNoise * u_grain;

      // ── Tone mapping (subtle) ──
      color = color / (color + 0.8) * 1.2;

      // ── Smooth dark edges for blending with page bg ──
      float edgeFade = smoothstep(0.0, 0.15, uv.y) * smoothstep(0.0, 0.1, 1.0 - uv.y);
      color *= edgeFade;

      gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
    }
  `;

  // ── Create Canvas ──
  function init() {
    const hero = document.querySelector('.sc-hero');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'sc-shader-bg';
    canvas.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      pointer-events: none;
    `;
    hero.style.position = 'relative';
    hero.insertBefore(canvas, hero.firstChild);

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      console.warn('SnipCraft: WebGL not available, falling back to CSS gradient.');
      canvas.remove();
      return;
    }

    // ── Compile Shader ──
    function compile(src, type) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }

    const vs = compile(VERT, gl.VERTEX_SHADER);
    const fs = compile(FRAG, gl.FRAGMENT_SHADER);
    if (!vs || !fs) { canvas.remove(); return; }

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Shader link error:', gl.getProgramInfoLog(program));
      canvas.remove();
      return;
    }

    gl.useProgram(program);

    // ── Geometry (full-screen quad) ──
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1,  1,  1, -1,   1, 1,
    ]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // ── Uniforms ──
    const uniforms = {};
    ['u_resolution', 'u_time', 'u_color1', 'u_color2', 'u_color3',
     'u_speed', 'u_amplitude', 'u_density', 'u_frequency',
     'u_strength', 'u_grain', 'u_brightness'].forEach(name => {
      uniforms[name] = gl.getUniformLocation(program, name);
    });

    // Set static uniforms
    gl.uniform3fv(uniforms.u_color1, CONFIG.color1);
    gl.uniform3fv(uniforms.u_color2, CONFIG.color2);
    gl.uniform3fv(uniforms.u_color3, CONFIG.color3);
    gl.uniform1f(uniforms.u_speed, CONFIG.speed);
    gl.uniform1f(uniforms.u_amplitude, CONFIG.amplitude);
    gl.uniform1f(uniforms.u_density, CONFIG.density);
    gl.uniform1f(uniforms.u_frequency, CONFIG.frequency);
    gl.uniform1f(uniforms.u_strength, CONFIG.strength);
    gl.uniform1f(uniforms.u_grain, CONFIG.grain);
    gl.uniform1f(uniforms.u_brightness, CONFIG.brightness);

    // ── Resize handler ──
    function resize() {
      const rect = hero.getBoundingClientRect();
      const dpr = CONFIG.pixelRatio;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
    }

    resize();
    window.addEventListener('resize', resize);

    // Also observe hero size changes (e.g. content load)
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(resize).observe(hero);
    }

    // ── Animation loop ──
    let startTime = performance.now();
    let rafId;
    let isVisible = true;

    // Visibility-based pause to save GPU
    const heroObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !rafId) loop();
    }, { threshold: 0.01 });
    heroObserver.observe(hero);

    function loop() {
      if (!isVisible) { rafId = null; return; }
      rafId = requestAnimationFrame(loop);

      const elapsed = (performance.now() - startTime) / 1000.0;
      gl.uniform1f(uniforms.u_time, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    loop();

    // ── Theme-aware color adjustment ──
    function updateThemeColors() {
      const theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'light') {
        // Softer, brighter palette for light mode
        gl.uniform3fv(uniforms.u_color1, [0.92, 0.15, 0.95]);   // lighter magenta
        gl.uniform3fv(uniforms.u_color2, [0.92, 0.82, 0.68]);   // warmer beige
        gl.uniform3fv(uniforms.u_color3, [0.88, 0.82, 0.94]);   // lighter lavender
        gl.uniform1f(uniforms.u_brightness, 1.4);
        gl.uniform1f(uniforms.u_grain, 0.06);
      } else {
        // Original dark mode colours
        gl.uniform3fv(uniforms.u_color1, CONFIG.color1);
        gl.uniform3fv(uniforms.u_color2, CONFIG.color2);
        gl.uniform3fv(uniforms.u_color3, CONFIG.color3);
        gl.uniform1f(uniforms.u_brightness, CONFIG.brightness);
        gl.uniform1f(uniforms.u_grain, CONFIG.grain);
      }
    }

    updateThemeColors();

    // Watch for theme changes
    const themeObserverMut = new MutationObserver(() => updateThemeColors());
    themeObserverMut.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  // ── Start when DOM ready ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
