import * as THREE from 'three';

export class WebGLScene {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    // Dimensions
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Mouse Tracking
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollProgress = 0;

    // Framerate monitor variables
    this.fps = 60;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.perfTimer = 0;
    this.lowPerformanceMode = false;

    // Configuration Options
    this.config = {
      nucleusBaseSpeed: 0.003,
      nucleusHoverSpeed: 0.015,
      nucleusMorphAmplitude: 0.12,
      nucleusResolution: 3, // Highly optimized low-poly detail
      particleCount: 2200
    };

    // Current State
    this.nucleusSpeed = this.config.nucleusBaseSpeed;
    this.nucleusMorphFactor = 1.0;
    this.isHoveringNucleus = false;

    this.init();
  }

  init() {
    // 1. Scene, Camera & Renderer
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x04010a, 0.08);

    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 100);
    this.camera.position.z = 6;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Spawn Elements
    this.createStarfield();
    this.createNucleus();
    this.createLights();

    // 3. Listeners
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));

    // 4. Start Render Loop
    this.animate();
  }

  // Helper to generate a glowing circle texture programmatically
  createCircleGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(0, 242, 254, 0.8)');
    gradient.addColorStop(0.5, 'rgba(155, 81, 224, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  createStarfield() {
    const count = this.config.particleCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorCyan = new THREE.Color(0x00f2fe);
    const colorPink = new THREE.Color(0xec38bc);
    const colorPurple = new THREE.Color(0x9b51e0);

    for (let i = 0; i < count; i++) {
      // Create a spiral galaxy look
      const r = Math.random() * 35 + 2;
      const theta = Math.random() * Math.PI * 2 + (r * 0.1); // spiral arm factor
      const y = (Math.random() - 0.5) * (18 / (r * 0.2 + 1)); // flatter in outer regions

      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * r;

      // Color interpolation
      const mixedColor = colorCyan.clone();
      const rand = Math.random();
      if (rand > 0.6) {
        mixedColor.lerp(colorPink, Math.random());
      } else if (rand > 0.3) {
        mixedColor.lerp(colorPurple, Math.random());
      }
      
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.12,
      map: this.createCircleGlowTexture(),
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  createNucleus() {
    this.nucleusGroup = new THREE.Group();

    // 1. Core Morphing Geometry
    // We use a high detail Icosahedron so vertices morph smoothly
    this.nucleusGeom = new THREE.IcosahedronGeometry(1.6, this.config.nucleusResolution);
    
    // Cache original vertex positions for mathematics offsets in render loop
    this.originalPositions = this.nucleusGeom.attributes.position.clone();

    // 2. Custom Hologram wireframe look
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending
    });

    this.nucleusWire = new THREE.Mesh(this.nucleusGeom, wireMaterial);
    this.nucleusGroup.add(this.nucleusWire);

    // 3. Glowing Particle Overlay (Vertex nodes)
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xec38bc,
      size: 0.08,
      map: this.createCircleGlowTexture(),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.nucleusPoints = new THREE.Points(this.nucleusGeom, pointsMaterial);
    this.nucleusGroup.add(this.nucleusPoints);

    // Add everything to scene
    this.scene.add(this.nucleusGroup);
  }

  createLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f2fe, 1.5);
    dirLight.position.set(5, 5, 5);
    this.scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x9b51e0, 2, 10);
    pointLight.position.set(-3, -3, -3);
    this.scene.add(pointLight);
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  onMouseMove(e) {
    // Standard normalize mapping [-1, 1]
    this.mouse.targetX = (e.clientX / this.width) * 2 - 1;
    this.mouse.targetY = -(e.clientY / this.height) * 2 + 1;
  }

  // Triggered on page scroll in main script
  updateScrollProgress(progress) {
    this.scrollProgress = progress;
  }

  // Handles mouse intersections to hover speed nucleus
  checkIntersections() {
    // Generate a simple circular area intersection for efficiency over raycasting
    const distToCenter = Math.sqrt(this.mouse.targetX * this.mouse.targetX + this.mouse.targetY * this.mouse.targetY);
    
    // Center intersection check
    if (distToCenter < 0.3) {
      this.isHoveringNucleus = true;
      this.nucleusSpeed = THREE.MathUtils.lerp(this.nucleusSpeed, this.config.nucleusHoverSpeed, 0.08);
      this.nucleusMorphFactor = THREE.MathUtils.lerp(this.nucleusMorphFactor, 2.8, 0.08);
    } else {
      this.isHoveringNucleus = false;
      this.nucleusSpeed = THREE.MathUtils.lerp(this.nucleusSpeed, this.config.nucleusBaseSpeed, 0.05);
      this.nucleusMorphFactor = THREE.MathUtils.lerp(this.nucleusMorphFactor, 1.0, 0.05);
    }
  }

  // Procedural morphing formulas using multi-octave math
  morphNucleus(time) {
    const positionAttr = this.nucleusGeom.attributes.position;
    const count = positionAttr.count;

    const vOriginal = new THREE.Vector3();
    const vNew = new THREE.Vector3();
    const normal = new THREE.Vector3(); // Reuse single instance!

    const speedTime = time * 2.0;

    for (let i = 0; i < count; i++) {
      vOriginal.fromBufferAttribute(this.originalPositions, i);

      // Procedural mathematical offset along the normalized normal vector (spherical surface)
      normal.copy(vOriginal).normalize();
      
      // Multi-frequency wave combinations (Noise simulation)
      const noise = Math.sin(vOriginal.x * 2.2 + speedTime) * 0.15 +
                    Math.cos(vOriginal.y * 1.8 - speedTime) * 0.12 +
                    Math.sin(vOriginal.z * 2.5 + speedTime * 0.5) * 0.08;

      const offset = noise * this.config.nucleusMorphAmplitude * this.nucleusMorphFactor;
      vNew.copy(vOriginal).addScaledVector(normal, offset);

      positionAttr.setXYZ(i, vNew.x, vNew.y, vNew.z);
    }

    positionAttr.needsUpdate = true;
  }

  // Auto scaling features if device lags
  monitorPerformance(currentTime) {
    this.frameCount++;
    const delta = currentTime - this.lastFrameTime;
    
    if (delta >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.frameCount = 0;
      this.lastFrameTime = currentTime;

      // Update Top HUD Telemetry
      const fpsEl = document.getElementById('hud-val-fps');
      if (fpsEl) {
        fpsEl.textContent = `${this.fps} FPS`;
      }

      // Safe guard against slow GPUs (Mobile or older laptops)
      if (this.fps < 40 && !this.lowPerformanceMode) {
        this.perfTimer++;
        if (this.perfTimer >= 3) { // Consistent frame drops
          this.optimizePerformance();
        }
      } else {
        this.perfTimer = 0;
      }
    }
  }

  optimizePerformance() {
    this.lowPerformanceMode = true;
    console.warn("WebGL Scene: Frame rate is below 40FPS. Initiating performance auto-optimization.");
    
    // 1. Lower pixel ratio to 1
    this.renderer.setPixelRatio(1);
    
    // 2. Halve Particle Counts
    const oldAttr = this.starfield.geometry.attributes.position;
    const newCount = Math.floor(oldAttr.count / 2);
    
    const newGeom = new THREE.BufferGeometry();
    const newPos = new Float32Array(newCount * 3);
    const newColors = new Float32Array(newCount * 3);

    for(let i=0; i<newCount; i++) {
      newPos[i*3] = oldAttr.getX(i);
      newPos[i*3+1] = oldAttr.getY(i);
      newPos[i*3+2] = oldAttr.getZ(i);

      newColors[i*3] = this.starfield.geometry.attributes.color.getX(i);
      newColors[i*3+1] = this.starfield.geometry.attributes.color.getY(i);
      newColors[i*3+2] = this.starfield.geometry.attributes.color.getZ(i);
    }

    newGeom.setAttribute('position', new THREE.BufferAttribute(newPos, 3));
    newGeom.setAttribute('color', new THREE.BufferAttribute(newColors, 3));
    
    this.starfield.geometry.dispose();
    this.starfield.geometry = newGeom;
  }

  // Panning & zooming paths across scroll progress
  interpolateCameraAndNucleus() {
    const p = this.scrollProgress; // 0 to 1

    // Camera and Nucleus positions coordinates based on scroll progress depth
    let targetCamZ = 6;
    let targetCamY = 0;
    let targetCamX = 0;

    let targetNucX = 0;
    let targetNucY = 0;
    let targetNucZ = 0;
    let targetNucScale = 1.0;

    if (p <= 0.25) {
      // Stage 1: Hero to About (0.0 to 0.25)
      // Slide nucleus to the right for About card layout, camera shifts slightly left
      const progress = p / 0.25;
      targetNucX = THREE.MathUtils.lerp(0, 1.8, progress);
      targetNucY = THREE.MathUtils.lerp(0, -0.2, progress);
      targetCamX = THREE.MathUtils.lerp(0, -0.3, progress);
      targetCamZ = THREE.MathUtils.lerp(6, 5.2, progress);
      targetNucScale = THREE.MathUtils.lerp(1.0, 0.9, progress);
    } 
    else if (p > 0.25 && p <= 0.55) {
      // Stage 2: About to Projects (0.25 to 0.55)
      // Nucleus recedes into background, camera zooms out to reveal wider perspective
      const progress = (p - 0.25) / 0.3;
      targetNucX = THREE.MathUtils.lerp(1.8, -1.8, progress);
      targetNucY = THREE.MathUtils.lerp(-0.2, 0.8, progress);
      targetCamZ = THREE.MathUtils.lerp(5.2, 7.5, progress);
      targetCamY = THREE.MathUtils.lerp(0, -0.5, progress);
      targetNucScale = THREE.MathUtils.lerp(0.9, 0.55, progress);
    } 
    else if (p > 0.55 && p <= 0.8) {
      // Stage 3: Projects to Journey (0.55 to 0.8)
      // Plunging deep down. Nucleus turns into vertical constellation center
      const progress = (p - 0.55) / 0.25;
      targetNucX = THREE.MathUtils.lerp(-1.8, 0, progress);
      targetNucY = THREE.MathUtils.lerp(0.8, -2.5, progress);
      targetCamZ = THREE.MathUtils.lerp(7.5, 9.0, progress);
      targetCamY = THREE.MathUtils.lerp(-0.5, -1.5, progress);
      targetNucScale = THREE.MathUtils.lerp(0.55, 0.4, progress);
    } 
    else {
      // Stage 4: Journey to Contact (0.8 to 1.0)
      // Nucleus zooms back to primary center point
      const progress = (p - 0.8) / 0.2;
      targetNucX = THREE.MathUtils.lerp(0, 0, progress);
      targetNucY = THREE.MathUtils.lerp(-2.5, 0, progress);
      targetCamX = THREE.MathUtils.lerp(-0.3, 0, progress);
      targetCamY = THREE.MathUtils.lerp(-1.5, 0, progress);
      targetCamZ = THREE.MathUtils.lerp(9.0, 5.8, progress);
      targetNucScale = THREE.MathUtils.lerp(0.4, 1.0, progress);
    }

    // Smooth interpolations using frame rate independent dampings
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, 0.05);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, 0.05);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetCamZ, 0.05);

    this.nucleusGroup.position.x = THREE.MathUtils.lerp(this.nucleusGroup.position.x, targetNucX, 0.05);
    this.nucleusGroup.position.y = THREE.MathUtils.lerp(this.nucleusGroup.position.y, targetNucY, 0.05);
    this.nucleusGroup.position.z = THREE.MathUtils.lerp(this.nucleusGroup.position.z, targetNucZ, 0.05);

    const currentScale = this.nucleusGroup.scale.x;
    const finalScale = THREE.MathUtils.lerp(currentScale, targetNucScale, 0.05);
    this.nucleusGroup.scale.set(finalScale, finalScale, finalScale);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const time = performance.now() * 0.001;

    // 1. Performance monitoring
    this.monitorPerformance(performance.now());

    // 2. Inertial mouse tracking
    this.mouse.x = THREE.MathUtils.lerp(this.mouse.x, this.mouse.targetX, 0.06);
    this.mouse.y = THREE.MathUtils.lerp(this.mouse.y, this.mouse.targetY, 0.06);

    // 3. Central Nucleus checks
    this.checkIntersections();
    this.morphNucleus(time);

    // Rotates Nucleus
    this.nucleusWire.rotation.y += this.nucleusSpeed;
    this.nucleusWire.rotation.x += this.nucleusSpeed * 0.4;
    this.nucleusPoints.rotation.y += this.nucleusSpeed;
    this.nucleusPoints.rotation.x += this.nucleusSpeed * 0.4;

    // 4. Parallax calculations
    // Subtly tilts camera relative to mouse coordinates
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera.position.x += this.mouse.x * 0.25;
    this.camera.position.y += this.mouse.y * 0.25;

    // Swirl starfield relative to mouse movement
    this.starfield.rotation.y = time * 0.015 + (this.mouse.x * 0.08);
    this.starfield.rotation.x = this.mouse.y * 0.05;

    // 5. Scroll coordinates pathing
    this.interpolateCameraAndNucleus();

    // 6. Smooth light/dark WebGL colors interpolation
    const isLightTheme = document.body.classList.contains('light-theme');
    const targetFogColor = isLightTheme ? new THREE.Color(0xf3f1f7) : new THREE.Color(0x030006);
    this.scene.fog.color.lerp(targetFogColor, 0.08);

    // 7. Draw loop
    this.renderer.render(this.scene, this.camera);
  }
}
