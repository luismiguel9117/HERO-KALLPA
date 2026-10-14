/**
 * HERO-KALLPA : Three.js + WebGL 3D Controller
 * Integración nativa de la Lata 3D (Lata-3d-) con GSAP ScrollTrigger para Shopify OS 2.0
 */

class Kallpa3DScene {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.options = Object.assign({
      modelUrl: this.container.dataset.modelUrl || null,
      energyColor: this.container.dataset.energyColor || '#fdb515',
      secondaryColor: this.container.dataset.secondaryColor || '#17f2c6',
      particleCount: parseInt(this.container.dataset.particleCount || '1200'),
      interactive: true,
      scrollLinked: true
    }, options);

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.canGroup = null;
    this.canInstance = null;
    this.rings = [];
    this.particles = null;
    this.clock = new THREE.Clock();

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isVisible = true;
    this.rafId = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Escena
    this.scene = new THREE.Scene();

    // 2. Cámara (Perspectiva cinematográfica de producto)
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    this.camera.position.set(1.2, 0.2, 6.2);

    // 3. Renderer WebGL Optimizado
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    this.container.appendChild(this.renderer.domElement);

    // 4. Iluminación de Estudio Comercial + Destellos de Energía Kallpa
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    // Softbox Izquierdo Principal
    const softboxLeft = new THREE.DirectionalLight(0xffffff, 2.8);
    softboxLeft.position.set(-4, 3, 4);
    this.scene.add(softboxLeft);

    // Softbox Derecho de Relleno (Tinte de Oro Kallpa)
    const softboxRight = new THREE.DirectionalLight(new THREE.Color(this.options.energyColor), 2.2);
    softboxRight.position.set(4, 2, 3);
    this.scene.add(softboxRight);

    // Rim Light Posterior (Resalta el borde de aluminio de la lata)
    const rimLight = new THREE.DirectionalLight(new THREE.Color(this.options.secondaryColor), 2.0);
    rimLight.position.set(0, 4, -4);
    this.scene.add(rimLight);

    // Luz de Rebote Inferior (Ilumina la base de aluminio)
    const bounceLight = new THREE.DirectionalLight(0xffffff, 1.4);
    bounceLight.position.set(0, -3, 2);
    this.scene.add(bounceLight);

    // 5. Cargar Lata 3D o Modelo GLB
    this.loadCan3D();

    // 6. Campo de Partículas de Energía Kallpa
    this.createEnergyParticles();

    // 7. Eventos & Resize
    this.bindEvents();

    // 8. Integración con GSAP ScrollTrigger
    this.initGSAPTimeline();

    // 9. Loop de Renderizado
    this.animate();
  }

  loadCan3D() {
    this.canGroup = new THREE.Group();
    this.scene.add(this.canGroup);

    // Ajustar posición inicial en el viewport (lado derecho en desktop para dejar aire al texto)
    if (window.innerWidth > 990) {
      this.canGroup.position.set(2.15, -0.15, 0);
    } else {
      this.canGroup.position.set(0.4, -0.4, 0);
    }

    // Verificar si el generador de la lata de Lata-3d- está disponible
    if (typeof window.createHighDetailCan === 'function') {
      const texLoader = new THREE.TextureLoader();
      
      const labelUrl = this.container.dataset.canLabel || 'assets/can-kalpa-label.png';
      const normalUrl = this.container.dataset.canNormal || 'assets/can-normal.png';
      const rmaoUrl = this.container.dataset.canRmao || 'assets/can-rmao.png';

      const textures = {};

      const checkAndBuild = () => {
        this.canInstance = window.createHighDetailCan(textures);
        // Escala imponente y ángulo exacto de la referencia del usuario
        this.canInstance.root.scale.set(2.45, 2.45, 2.45);
        this.canInstance.root.rotation.set(0.12, -0.68, -0.32); // Inclinación diagonal hacia la izquierda
        this.canGroup.add(this.canInstance.root);

        // Luz de contorno dorado intenso en el flanco izquierdo de la lata (flare)
        const goldRimLight = new THREE.DirectionalLight(0xffb719, 4.5);
        goldRimLight.position.set(0.8, 1.5, -1.8);
        this.scene.add(goldRimLight);
      };

      // Cargar textura principal
      texLoader.load(labelUrl, (baseTex) => {
        baseTex.colorSpace = THREE.SRGBColorSpace;
        baseTex.wrapS = THREE.RepeatWrapping;
        baseTex.wrapT = THREE.RepeatWrapping;
        textures.base = baseTex;

        texLoader.load(normalUrl, (normTex) => {
          normTex.wrapS = THREE.RepeatWrapping;
          normTex.wrapT = THREE.RepeatWrapping;
          textures.normal = normTex;

          texLoader.load(rmaoUrl, (rmaoTex) => {
            textures.rmao = rmaoTex;
            checkAndBuild();
          }, undefined, () => checkAndBuild());
        }, undefined, () => checkAndBuild());
      }, undefined, () => {
        // Si no encuentra la imagen en assets/, intenta ruta relativa de lata-3d
        texLoader.load('lata-3d/Materials/Ready/T_BeerCan_Kalpa.png', (fallbackTex) => {
          fallbackTex.colorSpace = THREE.SRGBColorSpace;
          textures.base = fallbackTex;
          checkAndBuild();
        }, undefined, () => {
          this.createProceduralEnergyCore();
        });
      });

    } else {
      this.createProceduralEnergyCore();
    }
  }

  createEnergyRings() {
    const ringRadii = [1.3, 1.6];
    ringRadii.forEach((r, idx) => {
      const ringGeom = new THREE.TorusGeometry(r, 0.015, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? new THREE.Color(this.options.energyColor) : new THREE.Color(this.options.secondaryColor),
        transparent: true,
        opacity: 0.5
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / (2.2 + idx * 0.5);
      ring.rotation.y = idx * 0.7;
      ring.position.y = 0.2;
      this.canGroup.add(ring);
      this.rings.push(ring);
    });
  }

  createProceduralEnergyCore() {
    const geomOuter = new THREE.IcosahedronGeometry(1.8, 3);
    const matOuter = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(this.options.energyColor),
      wireframe: true,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.9,
      emissive: new THREE.Color(this.options.energyColor),
      emissiveIntensity: 0.5
    });
    this.coreMesh = new THREE.Mesh(geomOuter, matOuter);
    this.canGroup.add(this.coreMesh);
    this.createEnergyRings();
  }

  createEnergyParticles() {
    const count = this.options.particleCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const c1 = new THREE.Color(this.options.energyColor);
    const c2 = new THREE.Color(this.options.secondaryColor);

    for (let i = 0; i < count; i++) {
      const radius = 2.0 + Math.random() * 8.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const mixed = c1.clone().lerp(c2, Math.random());
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  initGSAPTimeline() {
    if (typeof gsap === 'undefined') return;

    // Intro Cinematográfica
    gsap.fromTo(this.camera.position, 
      { z: 12, y: 3 },
      { z: 6.2, y: 0.2, duration: 2.4, ease: "power3.out" }
    );

    if (this.canGroup) {
      gsap.fromTo(this.canGroup.scale,
        { x: 0.1, y: 0.1, z: 0.1 },
        { x: 1, y: 1, z: 1, duration: 2, ease: "power2.out" }
      );
    }

    // ScrollTrigger para rotar la lata con el avance del scroll
    if (typeof ScrollTrigger !== 'undefined' && this.options.scrollLinked) {
      gsap.registerPlugin(ScrollTrigger);

      ScrollTrigger.create({
        trigger: this.container,
        start: "top top",
        end: "bottom top",
        scrub: 1.2,
        onUpdate: (self) => {
          const progress = self.progress;
          if (this.canGroup) {
            // Rotación 360 de la lata al descender
            this.canGroup.rotation.y = progress * Math.PI * 2.5;
            this.canGroup.rotation.x = Math.sin(progress * Math.PI) * 0.25;
            this.canGroup.position.y = -progress * 1.5;
          }
        }
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', this.onResize.bind(this));

    if (this.options.interactive) {
      window.addEventListener('mousemove', (e) => {
        this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
      });
    }

    const observer = new IntersectionObserver(([entry]) => {
      this.isVisible = entry.isIntersecting;
    }, { threshold: 0.08 });
    observer.observe(this.container);
  }

  onResize() {
    if (!this.container || !this.camera || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    if (this.canGroup) {
      if (width > 990) {
        this.canGroup.position.x = 1.4;
      } else {
        this.canGroup.position.x = 0;
      }
    }
  }

  animate() {
    this.rafId = requestAnimationFrame(this.animate.bind(this));
    if (!this.isVisible) return;

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Suavizado del Mouse (Lerp)
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.04;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.04;

    // Parallax de Cámara
    this.camera.position.x = 1.2 + this.mouse.x * 0.6;
    this.camera.position.y = 0.2 - this.mouse.y * 0.4;
    this.camera.lookAt(this.canGroup ? this.canGroup.position.x * 0.5 : 0, 0, 0);

    // Rotación sutil continua y flotación orgánica de la lata
    if (this.canGroup) {
      this.canGroup.position.y = (window.innerWidth > 990 ? 0.1 : -0.3) + Math.sin(elapsedTime * 1.5) * 0.08;
      
      if (this.canInstance) {
        this.canInstance.root.rotation.y += 0.005;
      }
      if (this.coreMesh) {
        this.coreMesh.rotation.y += 0.006;
      }

      this.rings.forEach((ring, idx) => {
        ring.rotation.z += 0.008 * (idx % 2 === 0 ? 1 : -1);
      });
    }

    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.025;
      this.particles.rotation.x = elapsedTime * 0.012;
    }

    this.renderer.render(this.scene, this.camera);
  }

  transitionSlide(slideIndex) {
    if (!this.canInstance) return;
    if (typeof gsap !== 'undefined') {
      gsap.to(this.canInstance.root.rotation, {
        y: -0.68 + (slideIndex * 0.4),
        z: -0.32 + (slideIndex * 0.05),
        duration: 1.0,
        ease: "power2.out"
      });
      gsap.fromTo(this.canInstance.root.position,
        { y: -1.05 },
        { y: -1.0, duration: 0.8, ease: "back.out(1.4)" }
      );
    }
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.onResize);
    if (this.renderer && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('kallpa-hero-3d');
  if (container) {
    window.kallpa3D = new Kallpa3DScene('kallpa-hero-3d');
  }
});

document.addEventListener('shopify:section:load', (e) => {
  if (e.target.querySelector('#kallpa-hero-3d')) {
    if (window.kallpa3D) window.kallpa3D.destroy();
    window.kallpa3D = new Kallpa3DScene('kallpa-hero-3d');
  }
});
