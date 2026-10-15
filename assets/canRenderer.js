import * as THREE from 'three';

/**
 * Singleton Offscreen 3D Renderer for Can Labels
 * Uses a single Three.js WebGLRenderer offscreen and blits frames to 2D Canvases.
 * Calibrated specifically for real metallic stamped beverage cans.
 */
export class CanRenderer {
  constructor(config = {}) {
    this.config = {
      cylTop: 0.092,       // Starts right at silver lid rim crease
      cylBot: 0.925,       // Ends right at bottom silver chime
      cylWidth: 0.764,     // Width of straight body (382 / 500)
      cylCurv: 2.2,        // Downward tilt in degrees matching lid/chime ellipses
      gapLabel: 0.0,       // Full 360 seamless sleeve wrap
      frontRot: 0.475,     // Centers "KALPA" logo facing camera
      lightInt: 1.8,       // Key light intensity
      lightAmb: 0.42,      // Low ambient preserves deep obsidian black
      lightX: -0.9,        // Key light X position
      ...config
    };

    this.width = 500;
    this.height = 1000;
    this.aspect = 0.5; // 500 / 1000

    this.initScene();
  }

  initScene() {
    // 1. Offscreen WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // 2. Scene
    this.scene = new THREE.Scene();

    // 3. Orthographic Camera centered on the cylinder
    const camW = this.aspect;
    const camH = 1.0;
    this.camera = new THREE.OrthographicCamera(
      -camW / 2, camW / 2,
      camH / 2, -camH / 2,
      0.01, 10
    );
    this.camera.position.z = 5;

    // 4. Lighting calibrated for brushed aluminum & varnish gloss
    const ambientLight = new THREE.AmbientLight(0xffffff, this.config.lightAmb);
    this.scene.add(ambientLight);

    // Main Key SpotLight for sharp specular reflection
    const spotLight = new THREE.SpotLight(0xfff8ee, this.config.lightInt * 3.2);
    spotLight.position.set(this.config.lightX, 0.8, 1.5);
    spotLight.angle = Math.PI / 3.2;
    spotLight.penumbra = 0.75;
    spotLight.decay = 1.2;
    spotLight.distance = 8;
    this.scene.add(spotLight);
    this.scene.add(spotLight.target);
    spotLight.target.position.set(0, -0.05, 0);

    // Amber edge rim lights matching the photography's warm rim reflections
    const leftAmberRim = new THREE.DirectionalLight(0xf59e0b, 1.8);
    leftAmberRim.position.set(-1.8, 0.2, 0.5);
    this.scene.add(leftAmberRim);

    const rightAmberRim = new THREE.DirectionalLight(0xea580c, 1.4);
    rightAmberRim.position.set(1.8, -0.2, 0.5);
    this.scene.add(rightAmberRim);

    // Front soft fill
    const frontFill = new THREE.DirectionalLight(0xffffff, 0.45);
    frontFill.position.set(0, 0, 2);
    this.scene.add(frontFill);

    // 5. Cylindrical Lathe Geometry accurately contoured to the can's shoulder & base
    const totalH = this.config.cylBot - this.config.cylTop; // 0.925 - 0.092 = 0.833
    const bodyRadius = (this.config.cylWidth * this.aspect) / 2; // (0.764 * 0.5) / 2 = 0.191
    const neckRadius = 0.154; // Tight radius at silver lid rim to stay 100% inside silhouette
    const chimeRadius = 0.182; // Tight radius at bottom chime

    const points = [];
    const steps = 50;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps; // 0 (bottom) to 1 (top)
      let r = bodyRadius;

      // Top shoulder inward curve towards lid (t from 0.82 to 1.0)
      if (t > 0.82) {
        const st = (t - 0.82) / 0.18;
        // Smooth Hermite curve
        const curve = st * st * (3.0 - 2.0 * st);
        r = bodyRadius - (bodyRadius - neckRadius) * curve;
      }
      // Bottom bevel inward curve towards chime (t from 0.0 to 0.08)
      else if (t < 0.08) {
        const bt = (0.08 - t) / 0.08;
        r = bodyRadius - (bodyRadius - chimeRadius) * bt;
      }

      points.push(new THREE.Vector2(r, (t - 0.5) * totalH));
    }

    const geometry = new THREE.LatheGeometry(points, 128);
    this.mesh = new THREE.Mesh(geometry);
    // Vertical placement matching the can body
    this.mesh.position.y = 0.5 - (this.config.cylTop + this.config.cylBot) / 2;
    // Downward tilt gives the elliptical curvature matching the lid and chime
    this.mesh.rotation.x = (this.config.cylCurv * Math.PI) / 180;
    this.scene.add(this.mesh);

    this.textureLoader = new THREE.TextureLoader();
  }

  /**
   * Create a custom shader material for stamped print on aluminum can
   */
  createLabelMaterial(labelUrl, onReady = null) {
    const uOffset = { value: this.config.frontRot };
    const uGap = { value: this.config.gapLabel };

    const texture = this.textureLoader.load(labelUrl, () => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      if (onReady) onReady();
    });

    // Semi-gloss varnish coating with subtle metallic aluminum undercoat
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.FrontSide,
      roughness: 0.28,
      metalness: 0.30,
      transparent: true
    });

    // Custom shader injection for seamless wrapping, gap, deep contrast, and smooth antialiased rim transitions
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uOffset = uOffset;
      shader.uniforms.uGap = uGap;

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>
        uniform float uOffset;
        uniform float uGap;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
        #ifdef USE_MAP
          // Cylindrical offset wrapping
          float _u = fract(vMapUv.x + uOffset);

          if (uGap > 0.001) {
            if (_u >= 1.0 - uGap) {
              discard;
            }
          }

          float _normU = (uGap > 0.001) ? (_u / max(1.0 - uGap, 0.001)) : _u;
          vec4 sampledDiffuseColor = texture2D(map, vec2(_normU, vMapUv.y));

          // Deepen blacks so dark ink matches the obsidian black brushed can body
          sampledDiffuseColor.rgb = pow(sampledDiffuseColor.rgb, vec3(1.15));

          // Smooth soft edge at top and bottom - eliminates plastic shrinkwrap look
          float edgeSoftness = smoothstep(1.0, 0.982, vMapUv.y) * smoothstep(0.0, 0.015, vMapUv.y);
          sampledDiffuseColor.a *= edgeSoftness;

          diffuseColor *= sampledDiffuseColor;
        #endif
        `
      );
    };

    return {
      material,
      texture,
      setOffset: (val) => {
        uOffset.value = val;
      },
      dispose: () => {
        material.dispose();
        texture.dispose();
      }
    };
  }

  /**
   * Render the 3D cylinder offscreen with the requested rotation offset
   */
  render(labelObj, offset) {
    if (!labelObj || !labelObj.material) return;
    labelObj.setOffset(offset);
    this.mesh.material = labelObj.material;
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Blit (copy) the offscreen rendered result onto a visible 2D canvas
   */
  blit(ctx2d, width, height) {
    if (!ctx2d) return;
    ctx2d.clearRect(0, 0, width, height);
    ctx2d.drawImage(this.renderer.domElement, 0, 0, width, height);
  }

  /**
   * Resize offscreen renderer buffer
   */
  resize(targetW, targetH) {
    if (!targetW || !targetH) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.width = targetW;
    this.height = targetH;
    this.aspect = targetW / targetH;
    this.renderer.setSize(targetW, targetH, false);
    this.renderer.setPixelRatio(pixelRatio);

    const camW = this.aspect;
    this.camera.left = -camW / 2;
    this.camera.right = camW / 2;
    this.camera.updateProjectionMatrix();
  }

  destroy() {
    this.renderer.dispose();
    this.mesh.geometry.dispose();
  }
}
