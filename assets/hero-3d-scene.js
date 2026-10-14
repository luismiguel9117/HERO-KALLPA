/**
 * HERO-KALLPA : Three.js + WebGL 3D Controller
 * Integración nativa con GSAP + ScrollTrigger para Shopify OS 2.0
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
    this.coreMesh = null;
    this.innerMesh = null;
    this.rings = [];
    this.particles = null;
    this.loadedModel = null;
    this.clock = new THREE.Clock();

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollY = 0;
    this.isVisible = true;
    this.rafId = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Escena
    this.scene = new THREE.Scene();

    // 2. Cámara
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 7.5);

    // 3. Renderer WebGL Optimizado
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    // Canvas DOM
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    this.container.appendChild(this.renderer.domElement);

    // 4. Luces Cinemáticas
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(new THREE.Color(this.options.energyColor), 3.5);
    dirLight1.position.set(5, 5, 5);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(new THREE.Color(this.options.secondaryColor), 2.5);
    dirLight2.position.set(-5, -3, 3);
    this.scene.add(dirLight2);

    const pointLight = new THREE.PointLight(new THREE.Color(this.options.energyColor), 4, 15);
    pointLight.position.set(0, 0, 0);
    this.scene.add(pointLight);

    // 5. Cargar Modelo GLB o Generar Núcleo Procedural Kallpa
    if (this.options.modelUrl && typeof THREE.GLTFLoader !== 'undefined') {
      this.loadGLBModel(this.options.modelUrl);
    } else {
      this.createProceduralEnergyCore();
    }

    // 6. Campo de Partículas Estelares Kallpa
    this.createEnergyParticles();

    // 7. Eventos & Resize
    this.bindEvents();

    // 8. Integración con GSAP ScrollTrigger si está presente
    this.initGSAPTimeline();

    // 9. Loop de Renderizado
    this.animate();
  }

  createProceduralEnergyCore() {
    this.coreGroup = new THREE.Group();
    this.scene.add(this.coreGroup);

    // Esfera exterior geométrica con emisión de energía
    const geomOuter = new THREE.IcosahedronGeometry(2.1, 3);
    const matOuter = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(this.options.energyColor),
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.9,
      emissive: new THREE.Color(this.options.energyColor),
      emissiveIntensity: 0.4
    });
    this.coreMesh = new THREE.Mesh(geomOuter, matOuter);
    this.coreGroup.add(this.coreMesh);

    // Núcleo Interior Radiante
    const geomInner = new THREE.SphereGeometry(1.3, 32, 32);
    const matInner = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(this.options.energyColor),
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.8
    });
    this.innerMesh = new THREE.Mesh(geomInner, matInner);
    this.coreGroup.add(this.innerMesh);

    // Anillos Orbitales de Energía
    const ringRadii = [2.9, 3.4];
    ringRadii.forEach((r, idx) => {
      const ringGeom = new THREE.TorusGeometry(r, 0.025, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? new THREE.Color(this.options.energyColor) : new THREE.Color(this.options.secondaryColor),
        transparent: true,
        opacity: 0.7
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / (2 + idx * 0.7);
      ring.rotation.y = idx * 0.8;
      this.coreGroup.add(ring);
      this.rings.push(ring);
    });
  }

  createEnergyParticles() {
    const count = this.options.particleCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const c1 = new THREE.Color(this.options.energyColor);
    const c2 = new THREE.Color(this.options.secondaryColor);

    for (let i = 0; i < count; i++) {
      const radius = 2.5 + Math.random() * 8.0;
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
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  loadGLBModel(url) {
    const loader = new THREE.GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        this.loadedModel = gltf.scene;
        this.loadedModel.scale.set(1.5, 1.5, 1.5);
        this.loadedModel.position.set(0, 0, 0);
        this.scene.add(this.loadedModel);

        if (this.coreGroup) {
          this.scene.remove(this.coreGroup);
        }
      },
      undefined,
      (error) => {
        console.warn('Error cargando modelo GLB, manteniendo núcleo procedural Kallpa:', error);
      }
    );
  }

  initGSAPTimeline() {
    if (typeof gsap === 'undefined') return;

    // Intro Cinematográfica
    gsap.fromTo(this.camera.position, 
      { z: 14, y: 3 },
      { z: 7.5, y: 0, duration: 2.2, ease: "power3.out" }
    );

    if (this.coreMesh) {
      gsap.fromTo(this.coreMesh.scale,
        { x: 0.1, y: 0.1, z: 0.1 },
        { x: 1, y: 1, z: 1, duration: 2, ease: "elastic.out(1, 0.75)" }
      );
    }

    // ScrollTrigger para rotar y transformar con el scroll
    if (typeof ScrollTrigger !== 'undefined' && this.options.scrollLinked) {
      gsap.registerPlugin(ScrollTrigger);

      ScrollTrigger.create({
        trigger: this.container,
        start: "top top",
        end: "bottom top",
        scrub: 1.2,
        onUpdate: (self) => {
          const progress = self.progress;
          if (this.coreGroup) {
            this.coreGroup.rotation.y = progress * Math.PI * 1.5;
            this.coreGroup.position.y = -progress * 2.0;
            this.coreGroup.position.x = progress * 1.5;
          }
          if (this.loadedModel) {
            this.loadedModel.rotation.y = progress * Math.PI * 2;
            this.loadedModel.position.y = -progress * 2.0;
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

    // IntersectionObserver para detener render si no está en pantalla
    const observer = new IntersectionObserver(([entry]) => {
      this.isVisible = entry.isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(this.container);
  }

  onResize() {
    if (!this.container || !this.camera || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    this.rafId = requestAnimationFrame(this.animate.bind(this));

    if (!this.isVisible) return;

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Suavizado del Mouse (Lerp)
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Parallax de Cámara
    this.camera.position.x = this.mouse.x * 0.8;
    this.camera.position.y = -this.mouse.y * 0.5;
    this.camera.lookAt(0, 0, 0);

    // Animación del Núcleo Procedural
    if (this.coreGroup) {
      this.coreMesh.rotation.y += 0.005;
      this.coreMesh.rotation.x += 0.003;

      // Pulsación orgánica del núcleo interior
      const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.08;
      this.innerMesh.scale.set(pulse, pulse, pulse);

      this.rings.forEach((ring, idx) => {
        ring.rotation.z += 0.008 * (idx % 2 === 0 ? 1 : -1);
      });
    }

    if (this.loadedModel) {
      this.loadedModel.rotation.y += 0.004;
    }

    // Partículas orbitando suavemente
    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.03;
      this.particles.rotation.x = elapsedTime * 0.015;
    }

    this.renderer.render(this.scene, this.camera);
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

// Inicialización global automática para Shopify Liquid
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('kallpa-hero-3d');
  if (container) {
    window.kallpa3D = new Kallpa3DScene('kallpa-hero-3d');
  }
});

// Soporte de recarga en caliente del Theme Editor de Shopify
document.addEventListener('shopify:section:load', (e) => {
  if (e.target.querySelector('#kallpa-hero-3d')) {
    if (window.kallpa3D) window.kallpa3D.destroy();
    window.kallpa3D = new Kallpa3DScene('kallpa-hero-3d');
  }
});
