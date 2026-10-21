/**
 * HERO-KALLPA : Three.js + WebGL 3D Controller
 * Carga directa del Modelo Final Oficial FBX (SM_BeerCan_A.fbx) + CanRefinerPro.js
 * Extraído directamente del repositorio https://github.com/luismiguel9117/Lata-3d-.git
 * Incluye:
 * - Renderizado Three.js PBR 3D con iluminación de estudio y RoomEnvironment HDR
 * - Seguimiento de cursor fluido y orgánico en la lata 3D
 * - Mismo seguimiento de cursor aplicado sincronizadamente a todos los granos de cacao flotantes
 * - Switch de Alternancia entre Modo 3D (Three.js WebGL) y Modo 2D (Foto Estudio)
 */

import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { smoothCanBody, buildRealisticCanRimAndBase } from './CanRefinerPro.js';

class Kallpa3DScene {
  constructor(containerId = 'kallpa-hero-3d', options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const ds = this.container.dataset || {};
    this.options = Object.assign({
      fbxPath: ds.fbxPath || 'assets/SM_BeerCan_A.fbx',
      canLabel: ds.canLabel || 'assets/can-kalpa-label.png',
      canBase: ds.canBase || 'assets/can-base.png',
      canNormal: ds.canNormal || 'assets/can-normal.png',
      canRmao: ds.canRmao || 'assets/can-rmao.png',
      energyColor: ds.energyColor || '#fdb515',
      secondaryColor: ds.secondaryColor || '#ff9100',
      interactive: true,
      scrollLinked: true
    }, options);

    this.mode = '2d-anim'; // '2d-anim' (Cilíndrica 2D) | '3d' (Three.js) | '2d' (Estudio)
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.canGroup = null;
    this.bodyMesh = null;
    this.alumMesh = null;
    this.loadedTextures = {};
    this.clock = new THREE.Clock();

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.mouseVec2 = new THREE.Vector2(-999, -999);
    this.raycaster = new THREE.Raycaster();
    this.isCanHovered = false;
    this.liftVal = 0;
    this.targetLift = 0;
    this.liftVal2D = 0;
    this.targetLift2D = 0;
    this.isVisible = true;
    this.rafId = null;

    // Elementos de cacao flotantes con física de planos
    this.cacaoBeans = [];
    this.container2D = null;
    this.can2dCard = null;

    // Posición y orientación base calibradas para encuadre publicitario Hero
    const winW = (typeof window !== 'undefined') ? window.innerWidth : 1200;
    this.isMobile = winW <= 768;
    this.isTablet = winW > 768 && winW <= 990;

    this.basePosX = this.isMobile ? 0.0 : this.isTablet ? 1.05 : 1.85;
    this.basePosY = this.isMobile ? -0.82 : this.isTablet ? -0.65 : -0.55;
    this.baseRotX = 0.06;
    this.baseRotY = 0.0;
    this.baseRotZ = this.isMobile ? -0.18 : -0.22;

    this.init();
  }

  async init() {
    const width = this.container.clientWidth || (this.container.parentElement && this.container.parentElement.clientWidth) || window.innerWidth;
    const height = this.container.clientHeight || (this.container.parentElement && this.container.parentElement.clientHeight) || window.innerHeight;

    this.isMobile = width <= 768;
    this.isTablet = width > 768 && width <= 990;
    this.basePosX = this.isMobile ? 0.0 : this.isTablet ? 1.05 : 1.85;
    this.basePosY = this.isMobile ? -0.82 : this.isTablet ? -0.65 : -0.55;
    this.baseRotZ = this.isMobile ? -0.18 : -0.22;

    // 1. Escena Three.js
    this.scene = new THREE.Scene();

    // 2. Cámara (Perspectiva de Estudio Fotográfico)
    this.camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1000);
    const camZ = this.isMobile ? 7.6 : 7.0;
    this.camera.position.set(0, 0, camZ);

    // 3. Renderer WebGL con fidelidad de color
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    this.container.appendChild(this.renderer.domElement);

    // Entorno HDR de estudio para reflejos metálicos brillantes en el aluminio
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    // 4. Iluminación Comercial de Estudio Fotográfico
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd0d5dd, 1.2);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    // Softbox Izquierdo Principal
    const softboxLeft = new THREE.DirectionalLight(0xffffff, 2.2);
    softboxLeft.position.set(-3.5, 2.5, 3.5);
    this.scene.add(softboxLeft);

    // Softbox Derecho de Relleno (Acento Ámbar Suave)
    const softboxRight = new THREE.DirectionalLight(0xfff5e6, 1.4);
    softboxRight.position.set(3.5, 2.0, 3.0);
    this.scene.add(softboxRight);

    // Luz de Borde Superior para la Tapa de Aluminio brillante
    const topRimLight = new THREE.DirectionalLight(0xffffff, 2.2);
    topRimLight.position.set(0.2, 5.0, 0.8);
    this.scene.add(topRimLight);

    // Halo Dorado de Contorno
    const goldRim = new THREE.DirectionalLight(0xffb719, 3.5);
    goldRim.position.set(-1.5, 1.5, -2.5);
    this.scene.add(goldRim);

    // Luz de Rebote Inferior (Ilumina el bisel y base de aluminio)
    const baseBounceLight = new THREE.DirectionalLight(0xffffff, 2.0);
    baseBounceLight.position.set(0, -1.5, 2.2);
    this.scene.add(baseBounceLight);

    const baseBackBounce = new THREE.DirectionalLight(0xffffff, 1.8);
    baseBackBounce.position.set(0, -1.5, -2.2);
    this.scene.add(baseBackBounce);

    // 5. Cargar Texturas Oficiales
    await this.preloadTextures();

    // 6. Cargar Modelo FBX y Refinar con CanRefinerPro
    this.loadFBXModel(this.options.fbxPath);

    // 7. Inicializar Elementos de Cacao y Vista 2D
    this.initCacaoBeans();
    this.init2DCan();

    // 8. Eventos, Resize y Switch 2D/3D
    this.bindEvents();
    this.bindSwitchEvents();

    // 9. Integración con GSAP ScrollTrigger
    this.initGSAPTimeline();

    // Sincronizar explícitamente el modo inicial preseleccionado: 2D Animada
    this.setMode('2d-anim');

    // 10. Loop de Renderizado
    this.animate();
  }

  initCacaoBeans() {
    const elements = document.querySelectorAll('.cacao-bean');
    this.cacaoBeans = Array.from(elements).map(el => ({
      element: el,
      depth: parseFloat(el.dataset.depth || '0.04')
    }));
  }

  init2DCan() {
    this.container2D = document.getElementById('kallpa-hero-2d-can');
    this.container2DAnim = document.getElementById('kallpa-hero-2d-anim');
    this.can2dCard = document.getElementById('hero-2d-can-card');

    if (this.can2dCard) {
      this.can2dCard.addEventListener('pointerenter', () => {
        this.targetLift2D = 1.0;
      });
      this.can2dCard.addEventListener('pointerleave', () => {
        this.targetLift2D = 0.0;
      });
    }
  }

  bindSwitchEvents() {
    const switchEl = document.getElementById('kalpa-dimension-switch');
    if (!switchEl) return;

    switchEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.dim-switch-btn');
      if (btn && btn.dataset.mode) {
        e.preventDefault();
        e.stopPropagation();
        this.setMode(btn.dataset.mode);
      }
    });
  }

  setMode(newMode) {
    if (newMode !== '2d' && newMode !== '2d-anim' && newMode !== '3d') return;
    this.mode = newMode;
    this.targetLift = 0;
    this.liftVal = 0;
    this.targetLift2D = 0;
    this.liftVal2D = 0;
    this.isCanHovered = false;

    const switchEl = document.getElementById('kalpa-dimension-switch');
    const btn2d = document.getElementById('btn-dim-2d');
    const btn2dAnim = document.getElementById('btn-dim-2d-anim');
    const btn3d = document.getElementById('btn-dim-3d');
    const container3D = this.container;
    const container2DAnim = this.container2DAnim || document.getElementById('kallpa-hero-2d-anim');
    const container2D = this.container2D || document.getElementById('kallpa-hero-2d-can');
    const devPanel = document.getElementById('dev-control-panel');

    if (switchEl) switchEl.setAttribute('data-active', newMode);
    if (btn2d) {
      btn2d.classList.toggle('is-active', newMode === '2d');
      btn2d.setAttribute('aria-checked', newMode === '2d');
    }
    if (btn2dAnim) {
      btn2dAnim.classList.toggle('is-active', newMode === '2d-anim');
      btn2dAnim.setAttribute('aria-checked', newMode === '2d-anim');
    }
    if (btn3d) {
      btn3d.classList.toggle('is-active', newMode === '3d');
      btn3d.setAttribute('aria-checked', newMode === '3d');
    }

    // 1. Contenedor 3D WebGL (Three.js)
    if (container3D) {
      const is3D = newMode === '3d';
      container3D.style.display = is3D ? 'block' : 'none';
      container3D.style.opacity = is3D ? '1' : '0';
      container3D.style.visibility = is3D ? 'visible' : 'hidden';
      container3D.style.pointerEvents = is3D ? 'auto' : 'none';
      if (is3D) {
        this.onResize();
      }
    }

    // 2. Contenedor 2D Animada (Offscreen Canvas Cilíndrico de Kallpa Repo)
    if (container2DAnim) {
      const is2DAnim = newMode === '2d-anim';
      container2DAnim.style.display = is2DAnim ? 'block' : 'none';
      container2DAnim.style.opacity = is2DAnim ? '1' : '0';
      container2DAnim.style.visibility = is2DAnim ? 'visible' : 'hidden';
      container2DAnim.style.pointerEvents = is2DAnim ? 'auto' : 'none';
      if (is2DAnim && window.kallpa2DAnim) {
        window.kallpa2DAnim.spinCycleStart = performance.now();
        window.kallpa2DAnim.lastAmbientSpinTime = performance.now();
        if (typeof window.kallpa2DAnim.renderCanFrame === 'function') {
          window.kallpa2DAnim.renderCanFrame(window.kallpa2DAnim.currentOffset);
        }
      }
    }

    // 3. Contenedor 2D Foto Estudio HD
    if (container2D) {
      const is2DFoto = newMode === '2d';
      container2D.style.display = is2DFoto ? 'block' : 'none';
      container2D.style.opacity = is2DFoto ? '1' : '0';
      container2D.style.visibility = is2DFoto ? 'visible' : 'hidden';
      container2D.style.pointerEvents = is2DFoto ? 'auto' : 'none';
    }

    // Giro de bienvenida 360° al pasar al modo 3D
    if (newMode === '3d' && this.canGroup && typeof gsap !== 'undefined') {
      gsap.fromTo(this.canGroup.rotation, 
        { y: this.baseRotY + Math.PI * 2 }, 
        { y: this.baseRotY, duration: 1.2, ease: "power2.out" }
      );
    }

    // Mostrar panel de calibración solo en modo 3D
    if (devPanel) {
      devPanel.style.display = (newMode === '3d') ? 'block' : 'none';
      devPanel.classList.toggle('is-visible', newMode === '3d');
    }
  }

  async preloadTextures() {
    const texLoader = new THREE.TextureLoader();
    const files = {
      kalpaBase: this.options.canLabel,
      readyBase: this.options.canBase,
      readyNormal: this.options.canNormal,
      readyRMAO: this.options.canRmao
    };

    const loadPromises = Object.entries(files).map(([key, url]) => {
      return new Promise((resolve) => {
        texLoader.load(
          url,
          (tex) => {
            if (key.includes('Base')) tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            this.loadedTextures[key] = tex;
            resolve();
          },
          undefined,
          () => {
            // Fallback a lata-3d directo si la ruta assets falla
            const fallbackPath = key === 'kalpaBase' ? 'lata-3d/Materials/Ready/T_BeerCan_Kalpa.png'
                               : key === 'readyBase' ? 'lata-3d/Materials/Ready/T_BeerCan_BaseColor.png'
                               : key === 'readyNormal' ? 'lata-3d/Materials/Ready/T_BeerCan_Normal.png'
                               : 'lata-3d/Materials/Ready/T_BeerCan_RMAO.png';
            texLoader.load(fallbackPath, (fbTex) => {
              if (key.includes('Base')) fbTex.colorSpace = THREE.SRGBColorSpace;
              fbTex.wrapS = THREE.RepeatWrapping;
              fbTex.wrapT = THREE.RepeatWrapping;
              this.loadedTextures[key] = fbTex;
              resolve();
            }, undefined, () => resolve());
          }
        );
      });
    });

    await Promise.all(loadPromises);
  }

  splitCanGeometry(sourceGeo, meshMatrix) {
    const geo = sourceGeo.index ? sourceGeo.toNonIndexed() : sourceGeo.clone();
    if (meshMatrix) {
      geo.applyMatrix4(meshMatrix);
    }
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;

    const bPos = [], bUV = [];
    const aPos = [], aUV = [];

    for (let i = 0; i < pos.count; i += 3) {
      const y1 = pos.getY(i), y2 = pos.getY(i + 1), y3 = pos.getY(i + 2);
      const avgY = (y1 + y2 + y3) / 3;

      const isBody = (avgY > 7.95 && avgY < 162.05);
      const targetP = isBody ? bPos : aPos;
      const targetU = isBody ? bUV : aUV;

      for (let c = 0; c < 3; c++) {
        const idx = i + c;
        targetP.push(pos.getX(idx), pos.getY(idx), pos.getZ(idx));
        if (uv) targetU.push(uv.getX(idx), uv.getY(idx));
      }
    }

    const bodyGeo = new THREE.BufferGeometry();
    bodyGeo.setAttribute('position', new THREE.Float32BufferAttribute(bPos, 3));
    if (uv) bodyGeo.setAttribute('uv', new THREE.Float32BufferAttribute(bUV, 2));
    bodyGeo.computeVertexNormals();

    const alumGeo = new THREE.BufferGeometry();
    alumGeo.setAttribute('position', new THREE.Float32BufferAttribute(aPos, 3));
    if (uv) alumGeo.setAttribute('uv', new THREE.Float32BufferAttribute(aUV, 2));
    alumGeo.computeVertexNormals();

    return { bodyGeo, alumGeo };
  }

  loadFBXModel(path) {
    const fbxLoader = new FBXLoader();
    
    const tryLoad = (filePath) => {
      fbxLoader.load(
        filePath,
        (fbx) => {
          let originalChildMesh = null;
          fbx.traverse((child) => {
            if (child.isMesh && !originalChildMesh) {
              originalChildMesh = child;
            }
          });

          if (originalChildMesh) {
            originalChildMesh.updateMatrix();
            const { bodyGeo, alumGeo } = this.splitCanGeometry(originalChildMesh.geometry, originalChildMesh.matrix);

            // Refinamiento Pro de CanRefinerPro.js
            const smoothBodyGeometry = smoothCanBody(bodyGeo);
            const smoothAlumGeometry = buildRealisticCanRimAndBase(alumGeo);

            this.bodyMesh = new THREE.Mesh(smoothBodyGeometry);
            this.bodyMesh.name = "Can_BodyPrint";
            this.bodyMesh.castShadow = true;

            this.alumMesh = new THREE.Mesh(smoothAlumGeometry);
            this.alumMesh.name = "Can_AluminumParts";
            this.alumMesh.castShadow = true;

            // Centrar el pivote del FBX exactamente en su punto medio (Y = 82.67)
            const centerY = 82.67;
            this.bodyMesh.position.y = -centerY;
            this.alumMesh.position.y = -centerY;

            this.canGroup = new THREE.Group();
            this.canGroup.name = "Can_Model_Root";
            this.canGroup.add(this.bodyMesh);
            this.canGroup.add(this.alumMesh);

            // Altura de lata calibrada (2.65 en desktop, 2.25 en móvil) para encajar en el Hero
            const targetCanHeight = this.isMobile ? 2.25 : 2.65;
            const scaleFactor = targetCanHeight / 165.35;
            this.canGroup.scale.setScalar(scaleFactor);

            // Posición y rotación iniciales
            this.canGroup.position.set(this.basePosX, this.basePosY, 0);
            this.canGroup.rotation.set(this.baseRotX, this.baseRotY, this.baseRotZ);

            // Aplicar materiales ANTES de insertar en la escena para evitar cualquier frame sin etiqueta
            this.applyMaterials();
            this.scene.add(this.canGroup);
            if (this.renderer && this.camera) {
              this.renderer.render(this.scene, this.camera);
            }
          }
        },
        undefined,
        (err) => {
          console.warn("Fallo cargando " + filePath + ", intentando ruta alternativa...", err);
          if (filePath !== 'lata-3d/Models/SM_BeerCan_A.fbx') {
            tryLoad('lata-3d/Models/SM_BeerCan_A.fbx');
          }
        }
      );
    };

    tryLoad(path);
  }

  applyMaterials() {
    const baseTex = this.loadedTextures.kalpaBase || this.loadedTextures.readyBase;
    const normalTex = this.loadedTextures.readyNormal;
    const rmaoTex = this.loadedTextures.readyRMAO;

    // 1. Cuerpo impreso con la etiqueta KALPA (Acabado Semi-Matte Seda de Alta Fidelidad)
    if (this.bodyMesh) {
      this.bodyMesh.material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xffffff),
        metalness: 0.18,
        roughness: 0.36,
        clearcoat: 0.12,
        clearcoatRoughness: 0.25,
        map: baseTex || null,
        normalMap: normalTex || null,
        normalScale: new THREE.Vector2(0.8, 0.8),
        side: THREE.FrontSide,
        depthWrite: true
      });
    }

    // 2. Partes de Aluminio Puro (Tapa superior, anilla, borde y base - Brillo Metálico Plateado)
    if (this.alumMesh) {
      this.alumMesh.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xffffff),
        metalness: 0.90,
        roughness: 0.16,
        envMapIntensity: 2.2,
        map: this.loadedTextures.readyBase || null,
        normalMap: normalTex || null,
        side: THREE.DoubleSide,
        depthWrite: true
      });
    }
  }

  transitionSlide(slideIndex) {
    if (!this.canGroup) return;

    const baseZ = this.isMobile ? -0.18 : -0.22;
    const baseY = this.isMobile ? -0.82 : (this.isTablet ? -0.65 : -0.55);

    // Variaciones elegantes según el slide, manteniendo el logo frontal KALPA visible
    const slideAngles = [
      { rotY: 0.0,   rotZ: baseZ,        posY: baseY },        // Slide 1: CAFÉ DE VRAEM (Frontal con inclinación hero)
      { rotY: 0.22,  rotZ: baseZ + 0.06, posY: baseY },        // Slide 2: COLD BREW (Leve giro de perfil)
      { rotY: -0.20, rotZ: baseZ - 0.02, posY: baseY }         // Slide 3: ENERGÍA PURA (Giro dinámico inverso)
    ];

    const target = slideAngles[slideIndex % slideAngles.length];

    if (typeof gsap !== 'undefined') {
      gsap.to(this, {
        baseRotY: target.rotY,
        baseRotZ: target.rotZ,
        duration: 1.0,
        ease: "power2.out"
      });
      gsap.fromTo(this,
        { basePosY: target.posY - 0.06 },
        { basePosY: target.posY, duration: 0.75, ease: "back.out(1.4)" }
      );
    } else {
      this.baseRotY = target.rotY;
      this.baseRotZ = target.rotZ;
      this.basePosY = target.posY;
    }

    if (window.kallpa2DAnim && typeof window.kallpa2DAnim.setSlide === 'function') {
      window.kallpa2DAnim.setSlide(slideIndex);
    }
  }

  initGSAPTimeline() {
    if (typeof gsap === 'undefined') return;

    const targetCamZ = this.isMobile ? 7.6 : 7.0;
    gsap.fromTo(this.camera.position, 
      { z: 12, y: 2 },
      { z: targetCamZ, y: 0, duration: 2.2, ease: "power3.out" }
    );

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
            this.canGroup.rotation.y = 0.28 + progress * Math.PI * 1.8;
            this.canGroup.position.y = -0.45 - progress * 1.6;
          }
        }
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', this.onResize.bind(this));

    if (this.options.interactive) {
      // Seguimiento de cursor magnético en toda la ventana y detección de hover en toda la botella
      window.addEventListener('pointermove', (e) => {
        this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;

        // Detección de Hover en Modo 3D con Raycasting Three.js sobre toda la geometría de la lata
        if (this.mode === '3d' && this.renderer && this.camera && this.canGroup) {
          const rect = this.renderer.domElement.getBoundingClientRect();
          if (
            e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom
          ) {
            this.mouseVec2.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouseVec2.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            this.raycaster.setFromCamera(this.mouseVec2, this.camera);
            const targets = [];
            if (this.bodyMesh) targets.push(this.bodyMesh);
            if (this.alumMesh) targets.push(this.alumMesh);

            const intersects = this.raycaster.intersectObjects(targets.length ? targets : this.canGroup.children, true);
            const isHovered = intersects.length > 0;
            this.isCanHovered = isHovered;
            this.targetLift = isHovered ? 1.0 : 0.0;
            if (this.container) {
              this.container.style.cursor = isHovered ? 'grab' : 'default';
            }
          } else {
            this.isCanHovered = false;
            this.targetLift = 0.0;
            if (this.container) this.container.style.cursor = 'default';
          }
        }

        // Detección de Hover en Modo 2D
        if (this.mode === '2d' && this.can2dCard) {
          const rect2d = this.can2dCard.getBoundingClientRect();
          const isInside = (
            e.clientX >= rect2d.left && e.clientX <= rect2d.right &&
            e.clientY >= rect2d.top && e.clientY <= rect2d.bottom
          );
          this.targetLift2D = isInside ? 1.0 : 0.0;
          this.can2dCard.style.cursor = isInside ? 'grab' : 'default';
        }
      }, { passive: true });

      window.addEventListener('pointerleave', () => {
        this.mouse.targetX = 0;
        this.mouse.targetY = 0;
        this.targetLift = 0.0;
        this.targetLift2D = 0.0;
        this.isCanHovered = false;
        if (this.container) this.container.style.cursor = 'default';
      });
    }

    // Escuchar cambio de diapositivas del carrusel hero
    document.addEventListener('kallpa:slidechange', (e) => {
      if (typeof e.detail?.index === 'number') {
        this.transitionSlide(e.detail.index);
      }
    });

    const observer = new IntersectionObserver(([entry]) => {
      this.isVisible = entry.isIntersecting;
    }, { threshold: 0.08 });
    observer.observe(this.container);
  }

  onResize() {
    if (!this.container || !this.camera || !this.renderer) return;
    const width = this.container.clientWidth || (this.container.parentElement && this.container.parentElement.clientWidth) || window.innerWidth;
    const height = this.container.clientHeight || (this.container.parentElement && this.container.parentElement.clientHeight) || window.innerHeight;

    this.isMobile = width <= 768;
    this.isTablet = width > 768 && width <= 990;

    this.camera.aspect = width / height;
    this.camera.position.z = this.isMobile ? 7.6 : 7.0;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    if (this.canGroup) {
      this.basePosX = this.isMobile ? 0.0 : this.isTablet ? 1.05 : 1.85;
      this.basePosY = this.isMobile ? -0.82 : this.isTablet ? -0.65 : -0.55;
      this.baseRotZ = this.isMobile ? -0.18 : -0.22;
      this.canGroup.position.x = this.basePosX;
      this.canGroup.position.y = this.basePosY;
      this.canGroup.rotation.z = this.baseRotZ;
    }
  }

  animate() {
    this.rafId = requestAnimationFrame(this.animate.bind(this));
    if (!this.isVisible) return;

    const elapsedTime = this.clock.getElapsedTime();

    // 1. Suavizado del mouse con inercia elástica
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.045;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.045;

    // 2. Interpolación suave de la física de levantamiento (Hover Lift)
    this.liftVal += (this.targetLift - this.liftVal) * 0.085;
    this.liftVal2D += (this.targetLift2D - this.liftVal2D) * 0.085;

    // 3. Movimiento de perspectiva de cámara Three.js
    this.camera.position.x = this.mouse.x * 0.45;
    this.camera.position.y = -this.mouse.y * 0.35;
    this.camera.lookAt(0, 0, 0);

    // 4. SEGUIMIENTO DE CURSOR, INCLINACIÓN Y ELEVACIÓN EN LA LATA THREE.JS 3D
    if (this.canGroup) {
      // Elevación hacia arriba (0.24 unidades Three.js) y sutil escalado (+5%) en hover
      const liftY = this.liftVal * 0.24;
      const liftRotZ = this.liftVal * 0.035;
      const liftScale = 1.0 + (this.liftVal * 0.05);

      this.canGroup.position.y = this.basePosY + liftY + Math.sin(elapsedTime * 1.5) * 0.035 - (this.mouse.y * 0.12);
      this.canGroup.position.x = this.basePosX + Math.cos(elapsedTime * 1.1) * 0.015 + (this.mouse.x * 0.14);
      this.canGroup.rotation.y = this.baseRotY + Math.sin(elapsedTime * 0.8) * 0.025 + (this.mouse.x * 0.22);
      this.canGroup.rotation.z = this.baseRotZ + liftRotZ + Math.cos(elapsedTime * 1.1) * 0.015 + (this.mouse.y * 0.09);
      this.canGroup.rotation.x = this.baseRotX + Math.sin(elapsedTime * 0.9) * 0.015 - (this.mouse.y * 0.10);

      const targetCanHeight = this.isMobile ? 2.25 : 2.65;
      const baseScaleFactor = targetCanHeight / 165.35;
      this.canGroup.scale.setScalar(baseScaleFactor * liftScale);
    }

    // 5. APLICAR EL MISMO SEGUIMIENTO DE CURSOR A TODOS LOS ELEMENTOS FLOTANTES DE CACAO
    if (this.cacaoBeans && this.cacaoBeans.length) {
      this.cacaoBeans.forEach(b => {
        const mult = b.depth * 380;
        const px = (this.mouse.x * mult).toFixed(2);
        const py = (this.mouse.y * mult).toFixed(2);
        const rx = (-this.mouse.y * (b.depth * 95)).toFixed(2);
        const ry = (this.mouse.x * (b.depth * 95)).toFixed(2);
        b.element.style.transform = `translate3d(${px}px, ${py}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
    }

    // 6. Seguimiento de cursor y elevación en la lata 2D (cuando está activo el modo 2D)
    if (this.can2dCard) {
      const px = (this.mouse.x * 24).toFixed(2);
      const py = (this.mouse.y * 20).toFixed(2);
      const float2dY = Math.sin(elapsedTime * 1.8) * 8;
      const lift2dPx = this.liftVal2D * 22; // 22px de elevación hacia arriba
      const lift2dScale = 1.0 + (this.liftVal2D * 0.05); // +5% de escala en hover
      const lift2dRotZ = this.liftVal2D * 2.0;
      const tilt2dX = (-this.mouse.y * 8).toFixed(2);
      const tilt2dY = (this.mouse.x * 11).toFixed(2);

      this.can2dCard.style.transform = `
        translate3d(${px}px, ${(float2dY + parseFloat(py) - lift2dPx).toFixed(2)}px, 0)
        rotateX(${tilt2dX}deg)
        rotateY(${tilt2dY}deg)
        rotateZ(${(-11 + lift2dRotZ).toFixed(2)}deg)
        scale(${lift2dScale.toFixed(3)})
      `;
    }

    // 7. Renderizar Three.js en Modo 3D
    if (this.mode === '3d') {
      this.renderer.render(this.scene, this.camera);
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

// Inicialización automática
window.initKallpa3DScene = function() {
  const container = document.getElementById('kallpa-hero-3d');
  if (container) {
    window.kallpa3D = new Kallpa3DScene('kallpa-hero-3d');
    console.log('⚡ Hero Kallpa 3D Three.js + Cacao Parallax + Switch 2D/3D montado con éxito.');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.initKallpa3DScene();
});

document.addEventListener('shopify:section:load', (e) => {
  if (e.target.querySelector('#kallpa-hero-3d')) {
    if (window.kallpa3D) window.kallpa3D.destroy();
    window.initKallpa3DScene();
  }
});
