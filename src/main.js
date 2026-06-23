import './style.css';
import { WebGLScene } from './scene.js';

// Global variables
let webGLSceneInstance = null;
let audioCtx = null;
let soundEnabled = false;

// Audio Drone variables
let oscDrone = null;
let filterDrone = null;
let analyserNode = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize WebGL Scene
  try {
    webGLSceneInstance = new WebGLScene('webgl-canvas');
  } catch (error) {
    console.error("Failed to initialize WebGL Scene:", error);
  }

  // 2. Setup Interactions
  initCustomCursor();
  initAudioEngine();
  initMagneticButtons();
  init3DTagCloud();
  init3DCardTilt();
  initScrollPipeline();
  initProjectModals();
  initContactForm();
  
  // Custom Premium Modules
  initGitHubGraph();
  initCommandHUD();
  initAIChatbot();
  initResumeDownload();
  
  // Premium Overhaul Scripts
  initHeroTypewriter();
  initStatsCounter();
  initCopyEmail();
  initThemeToggle();

  // Premium Sci-Fi HUD Modules
  initCyberShellTerminal();
  initAgriAICockpit();
  initHUDCardScanners();
});

/* ----------------------------------------------------
   1. CUSTOM TRAILING DUAL-RING CURSOR WITH COORDINATES
------------------------------------------------------- */
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const glow = document.getElementById('custom-cursor-glow');
  const coordsTag = document.getElementById('cursor-coords-tag');
  const hudCoords = document.getElementById('hud-val-coords');
  if (!cursor || !glow) return;

  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    target.x = e.clientX;
    target.y = e.clientY;

    cursor.style.left = `${target.x}px`;
    cursor.style.top = `${target.y}px`;

    // Real-Time HUD Coordinates telemetry
    if (coordsTag) {
      coordsTag.textContent = `${target.x}, ${target.y}`;
    }
    if (hudCoords) {
      hudCoords.textContent = `X: ${target.x}px | Y: ${target.y}px`;
    }

    // Modulate synthesizer filtering cutoff in real-time
    modulateDroneSound(target.x);
  });

  function updateGlowPosition() {
    current.x += (target.x - current.x) * 0.15;
    current.y += (target.y - current.y) * 0.15;

    glow.style.left = `${current.x}px`;
    glow.style.top = `${current.y}px`;

    requestAnimationFrame(updateGlowPosition);
  }
  updateGlowPosition();

  window.addEventListener('mousedown', () => {
    cursor.classList.add('active');
    glow.classList.add('active');
    playSynthSound('click');
  });

  window.addEventListener('mouseup', () => {
    cursor.classList.remove('active');
    glow.classList.remove('active');
  });

  const hoverables = 'a, button, .project-card, .skill-3d-tag, .form-input, .modal-close, .git-cell, .chat-chip, .cmd-item, .copy-email-btn, .hud-slider, .shell-input-field';
  
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverables)) {
      glow.classList.add('hovering');
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('.project-card') || e.target.closest('.cmd-item') || e.target.closest('.copy-email-btn')) {
        playSynthSound('hover');
      }
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverables)) {
      glow.classList.remove('hovering');
    }
  });
}

/* ----------------------------------------------------
   2. REAL-TIME SYNTHESIZED WEB AUDIO & SPACE DRONE
------------------------------------------------------- */
function initAudioEngine() {
  const toggleBtn = document.getElementById('sound-toggle');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    
    if (soundEnabled) {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      toggleBtn.classList.add('active');
      toggleBtn.querySelector('.sound-text').textContent = 'AUDIO: ON';
      playSynthSound('success');
      
      // Ignite modulating saw space drone
      startDroneSpaceSynth();
    } else {
      toggleBtn.classList.remove('active');
      toggleBtn.querySelector('.sound-text').textContent = 'AUDIO: OFF';
      
      // Stop dynamic drone
      stopDroneSpaceSynth();
    }
  });
}

function modulateDroneSound(clientX) {
  if (!soundEnabled || !audioCtx || !filterDrone) return;
  const ratio = clientX / window.innerWidth;
  const cutoff = 150 + ratio * 1600;
  filterDrone.frequency.setTargetAtTime(cutoff, audioCtx.currentTime, 0.05);
  
  const freqEl = document.getElementById('hud-val-freq');
  if (freqEl) {
    freqEl.textContent = `${Math.round(cutoff)} Hz`;
  }
}

function startDroneSpaceSynth() {
  if (!audioCtx) return;
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  try {
    oscDrone = audioCtx.createOscillator();
    oscDrone.type = 'sawtooth';
    oscDrone.frequency.setValueAtTime(65.41, audioCtx.currentTime); // C2 key frequency
    
    filterDrone = audioCtx.createBiquadFilter();
    filterDrone.type = 'lowpass';
    filterDrone.Q.setValueAtTime(7.5, audioCtx.currentTime);
    
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 64;
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime); // Soft drone gain
    
    // Direct routing path
    oscDrone.connect(filterDrone);
    filterDrone.connect(gainNode);
    gainNode.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);
    
    oscDrone.start();
    
    startAudioVisualizer();
  } catch (error) {
    console.error("Failed to start space drone synthesizer:", error);
  }
}

function stopDroneSpaceSynth() {
  try {
    if (oscDrone) {
      oscDrone.stop();
      oscDrone.disconnect();
      oscDrone = null;
    }
    if (filterDrone) {
      filterDrone.disconnect();
      filterDrone = null;
    }
    const freqEl = document.getElementById('hud-val-freq');
    if (freqEl) {
      freqEl.textContent = 'OFF';
    }
  } catch (e) {
    console.error("Failed to stop space drone:", e);
  }
}

function startAudioVisualizer() {
  const toggleBtn = document.getElementById('sound-toggle');
  if (!toggleBtn || !analyserNode) return;
  
  let canvas = document.getElementById('audio-visualizer-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'audio-visualizer-canvas';
    canvas.className = 'audio-visualizer-canvas';
    toggleBtn.appendChild(canvas);
  }
  
  const ctx = canvas.getContext('2d');
  canvas.width = toggleBtn.offsetWidth;
  canvas.height = 8;
  
  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  function draw() {
    if (!soundEnabled) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    requestAnimationFrame(draw);
    
    analyserNode.getByteTimeDomainData(dataArray);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = document.body.classList.contains('light-theme') ? '#9b51e0' : '#00f2fe';
    ctx.beginPath();
    
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }
  
  draw();
}

function playSynthSound(type) {
  if (!soundEnabled || !audioCtx) return;

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'hover') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.05);

    gain.gain.setValueAtTime(0.012, now);
    gain.gain.linearRampToValueAtTime(0.0, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.05);
  } 
  else if (type === 'click') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.0, now + 0.08);

    osc.start(now);
    osc.stop(now + 0.08);
  } 
  else if (type === 'success') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.linearRampToValueAtTime(0.0, now + 0.25);

    osc.start(now);
    osc.stop(now + 0.25);
  }
}

/* ----------------------------------------------------
   3. MAGNETIC BUTTONS ATTRACTION SYSTEM
------------------------------------------------------- */
function initMagneticButtons() {
  const btns = document.querySelectorAll('.btn-magnetic');
  
  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const btnX = rect.left + rect.width / 2;
      const btnY = rect.top + rect.height / 2;
      
      const offsetX = e.clientX - btnX;
      const offsetY = e.clientY - btnY;
      
      btn.style.transform = `translate(${offsetX * 0.35}px, ${offsetY * 0.35}px)`;
      
      const span = btn.querySelector('span');
      if (span) {
        span.style.transform = `translate(${offsetX * 0.15}px, ${offsetY * 0.15}px)`;
      }
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
      const span = btn.querySelector('span');
      if (span) {
        span.style.transform = 'translate(0px, 0px)';
      }
    });
  });
}

/* ----------------------------------------------------
   4. DYNAMIC 3D DRAGGABLE FIBONACCI TAG CLOUD
------------------------------------------------------- */
function init3DTagCloud() {
  const container = document.getElementById('skills-3d-container');
  if (!container) return;

  const skills = [
    'Python', 'JavaScript', 'SQL', 'React.js', 
    'Next.js', 'Firebase', 'Node.js', 'Streamlit', 
    'Scikit-learn', 'TensorFlow', 'OpenCV', 'CatBoost',
    'NLP', 'OCR', 'GitHub', 'Figma', 'Kaggle'
  ];

  container.innerHTML = '';

  const tags = [];
  const radius = 100;

  let rotationX = 0.005;
  let rotationY = 0.005;
  let isDragging = false;
  let prevMouseX = 0;
  let prevMouseY = 0;

  const count = skills.length;
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;

    const tag = document.createElement('span');
    tag.className = 'skill-3d-tag';
    tag.textContent = skills[i];
    tag.style.position = 'absolute';
    tag.style.transformOrigin = 'center';
    tag.style.fontFamily = 'var(--font-mono)';
    tag.style.fontSize = '0.7rem';
    tag.style.padding = '4px 8px';
    tag.style.border = '1px solid rgba(155, 81, 224, 0.15)';
    tag.style.background = 'rgba(10, 3, 20, 0.75)';
    tag.style.borderRadius = '4px';
    tag.style.color = 'var(--text-bright)';
    tag.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
    tag.style.whiteSpace = 'nowrap';
    
    container.appendChild(tag);

    tags.push({
      element: tag,
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta),
      z: radius * Math.cos(phi)
    });
  }

  function rotateCloud() {
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);

    tags.forEach(t => {
      const x1 = t.x * cosY - t.z * sinY;
      const z1 = t.z * cosY + t.x * sinY;

      const y2 = t.y * cosX - z1 * sinX;
      const z2 = z1 * cosX + t.y * sinX;

      t.x = x1;
      t.y = y2;
      t.z = z2;

      const depthScale = (t.z + radius) / (2 * radius) + 0.35;
      const opacity = (t.z + radius) / (2 * radius) * 0.7 + 0.2;

      const screenX = t.x;
      const screenY = t.y;

      t.element.style.transform = `translate3d(${screenX}px, ${screenY}px, 0px) scale(${depthScale})`;
      t.element.style.opacity = opacity;
      t.element.style.zIndex = Math.round(depthScale * 100);

      if (t.z > 0) {
        t.element.style.color = 'var(--color-cyan)';
        t.element.style.borderColor = 'rgba(0, 242, 254, 0.3)';
      } else {
        t.element.style.color = 'var(--text-muted)';
        t.element.style.borderColor = 'rgba(155, 81, 224, 0.1)';
      }
    });

    if (!isDragging) {
      rotationX = rotationX * 0.95 + 0.001 * 0.05;
      rotationY = rotationY * 0.95 + 0.001 * 0.05;
    }
  }

  function renderLoop() {
    rotateCloud();
    requestAnimationFrame(renderLoop);
  }
  renderLoop();

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMouseX;
    const deltaY = e.clientY - prevMouseY;

    rotationY = deltaX * 0.005;
    rotationX = -deltaY * 0.005;

    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch triggers
  container.addEventListener('touchstart', (e) => {
    isDragging = true;
    prevMouseX = e.touches[0].clientX;
    prevMouseY = e.touches[0].clientY;
  });

  container.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - prevMouseX;
    const deltaY = e.touches[0].clientY - prevMouseY;

    rotationY = deltaX * 0.005;
    rotationX = -deltaY * 0.005;

    prevMouseX = e.touches[0].clientX;
    prevMouseY = e.touches[0].clientY;
  });

  container.addEventListener('touchend', () => {
    isDragging = false;
  });
}

/* ----------------------------------------------------
   5. NATIVE CSS 3D CARD PERSPECTIVE TILT
------------------------------------------------------- */
function init3DCardTilt() {
  const cards = document.querySelectorAll('.project-tilt');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const width = rect.width;
      const height = rect.height;

      const tiltX = ((y / height) - 0.5) * -20; 
      const tiltY = ((x / width) - 0.5) * 20;

      card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });
}

/* ----------------------------------------------------
   6. SCROLL COORDINATES PIPELINE (NAV/TIMELINE/SKILLS)
------------------------------------------------------- */
function initScrollPipeline() {
  const header = document.getElementById('main-header');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  const timelineProgress = document.getElementById('timeline-progress');
  const timelineSection = document.getElementById('timeline');
  const timelineReveals = document.querySelectorAll('.timeline-reveal');

  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  if (mobileNavToggle && mobileNavDrawer) {
    mobileNavToggle.addEventListener('click', () => {
      const isOpen = mobileNavDrawer.classList.toggle('open');
      mobileNavToggle.classList.toggle('active');
      mobileNavDrawer.setAttribute('aria-hidden', !isOpen);
    });

    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNavDrawer.classList.remove('open');
        mobileNavToggle.classList.remove('active');
        mobileNavDrawer.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // Trigger skill bar filling when scrolled into view
  const skillsSection = document.getElementById('skills');
  const skillFills = document.querySelectorAll('.meter-fill');
  let skillsAnimated = false;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollY / docHeight : 0;

    if (webGLSceneInstance) {
      webGLSceneInstance.updateScrollProgress(progress);
    }

    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Skills animation trigger
    if (skillsSection && !skillsAnimated) {
      const rect = skillsSection.getBoundingClientRect();
      if (rect.top < window.innerHeight - 150) {
        skillFills.forEach(fill => {
          fill.style.width = fill.parentElement.previousElementSibling.querySelector('.meter-val').textContent;
        });
        skillsAnimated = true;
      }
    }

    let currentSection = 'hero';
    sections.forEach(sec => {
      const secTop = sec.offsetTop - 200;
      const secHeight = sec.offsetHeight;
      if (scrollY >= secTop && scrollY < secTop + secHeight) {
        currentSection = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === currentSection) {
        link.classList.add('active');
      }
    });

    if (timelineSection && timelineProgress) {
      const rect = timelineSection.getBoundingClientRect();
      const sectionHeight = rect.height;
      const viewOffset = window.innerHeight - 200;

      if (rect.top < viewOffset && rect.bottom > 0) {
        const filled = (viewOffset - rect.top) / sectionHeight;
        const boundedFill = Math.max(0, Math.min(100, filled * 100));
        timelineProgress.style.height = `${boundedFill}%`;
      }
    }

    timelineReveals.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        el.classList.add('active');
      }
    });
  });
}

/* ----------------------------------------------------
   7. PROJECT SPECS OVERLAY MODALS ENGINE
------------------------------------------------------- */
const projectsDetails = [
  {
    title: "AgriServe Platform",
    tech: "React / Python (Flask) / SQL / Machine Learning",
    role: "Full Stack Developer - Agriculture Tech",
    img: "/src/assets/project1_preview.jpg",
    desc: "AgriServe is a full-stack web and mobile portal built to connect farmers, laborers, and fertilizer suppliers. It streamlines labor allocation, calculates machinery amortization schedules (EMI), and provides a booking interface for supplies. The application won 4th place at the Vishesh 2K24 inter-college project expo.",
    features: [
      "Labor Allocator: Channels nearby manual farm workers coordinates-based",
      "EMI Calculator: Computes machinery interest rates and amortization plans",
      "Fertilizer Supplier: Direct supplies ordering portal with SQL persistence",
      "Vishesh 2K24 Laurels: Secured 4th place among 90+ competing projects"
    ],
    link: "#"
  },
  {
    title: "AI Multi-Agent Career Guidance System",
    tech: "Python / Multi-Agent AI / Google Cloud / Gemini APIs",
    role: "AI System Developer - Career Agent Orchestration",
    img: "/src/assets/project2_preview.jpg",
    desc: "A collaborative multi-agent AI system designed to evaluate student profiles and recommend optimized career paths. Using orchestrator and specialist agent nodes, it makes structured career path decisions through agent collaboration. Showcased at Google Agentathon 2025 as part of a Guinness World Record hackathon.",
    features: [
      "Multi-Agent scaffold coordinating orchestrator and worker nodes",
      "Profile Evaluator: Performs semantic assessment of academic achievements",
      "Career Recommender: Suggests pathways based on cooperative AI decisions",
      "Guinness World Record Event: Displayed at GDG Agentathon 2025"
    ],
    link: "#"
  },
  {
    title: "AI-Based Smart Irrigation Advisor",
    tech: "Python / Machine Learning / Weather REST APIs",
    role: "Machine Learning Engineer - Predictive Ecology",
    img: "/src/assets/project3_preview.jpg",
    desc: "An irrigation recommendation engine integrating real-time weather API telemetry with predictive ML algorithms. Maps local precipitation, soil humidity, and atmospheric temperature to recommend precise soil moisture replenishment levels, reducing water waste by up to 30%.",
    features: [
      "Real-Time Telemetry: Pulls regional weather metrics via REST APIs",
      "ML Saturation Estimator: Maps climatic indexes to soil moisture levels",
      "Eco-Friendly Operation: Minimizes water resources waste by 30%",
      "Deployment: Deployed in interactive Streamlit web environments"
    ],
    link: "#"
  },
  {
    title: "AI & Data Analytics Dashboard",
    tech: "Python / Pandas / NumPy / Power BI",
    role: "AI & Data Analytics Intern",
    img: "/src/assets/project3_preview.jpg",
    desc: "Developed during the Industry Internship Program. Applies machine learning models on structured datasets to extract valuable business analytics insights. Built complete Python data pipelines and loaded dashboards in Power BI for professional reporting.",
    features: [
      "Data Wrangling: Processes structured datasets using Python & Pandas",
      "Statistical Inference: Fits ML models to extract business analytics",
      "Visualization: Deploys Power BI dashboards for corporate reporting",
      "Data Pipelines: Automates raw CSV parsing and feature computations"
    ],
    link: "#"
  },
  {
    title: "Computer Vision & AIML Suite",
    tech: "Python / OpenCV / Supervised ML",
    role: "AIML Project Intern - Edunet",
    img: "/src/assets/project1_preview.jpg",
    desc: "Developed as part of the Edunet internship in collaboration with Microsoft & SAP. Covers real-world supervised learning models and OpenCV vision pipelines to build and deploy automated image thresholding and classification tools.",
    features: [
      "OpenCV Image Processing: Custom grayscale and threshold filter models",
      "Supervised Learning: Benchmarks SVM, Random Forest, and classifiers",
      "Model Deployment: Packs algorithms into operational Python environments",
      "Microsoft & SAP Collaboration: Aligned with corporate business requirements"
    ],
    link: "#"
  },
  {
    title: "AI EdTech Ecosystem",
    tech: "React / Firebase / Google Gemini API",
    role: "Full Stack Architect - EdTech",
    img: "/src/assets/project2_preview.jpg",
    desc: "An academic administration scheduler automating classroom logistics. Uses Google Gemini API to serve student tutor assistants, hosts databases on Firebase, and runs node-based algorithms to solve classroom timetabling constraints.",
    features: [
      "Timetabling Solver: Auto-resolves teacher availability conflicts",
      "Gemini Tutor Agent: Conversational chatbot providing course support",
      "Firebase Database: Synchronizes logs, attendances, and credentials",
      "Interactive HUD: Premium glassmorphic panel mapping scheduler outputs"
    ],
    link: "#"
  }
];

function initProjectModals() {
  const cards = document.querySelectorAll('.project-card');
  const modal = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const closeBackdrop = document.getElementById('modal-close-backdrop');

  if (!modal || !closeBtn) return;

  const mTitle = document.getElementById('modal-title');
  const mTech = document.getElementById('modal-tech');
  const mRole = document.getElementById('modal-role');
  const mDesc = document.getElementById('modal-description-full');
  const mFeatures = document.getElementById('modal-features-list');
  const mImg = document.getElementById('modal-img');
  const mLink = document.getElementById('modal-visit-link');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.getAttribute('data-project'));
      const details = projectsDetails[idx];
      if (!details) return;

      mTitle.textContent = details.title;
      mTech.textContent = details.tech;
      mRole.textContent = details.role;
      mDesc.textContent = details.desc;
      mImg.src = details.img;
      mImg.alt = details.title;
      mLink.href = details.link || '#';

      mFeatures.innerHTML = '';
      details.features.forEach(feat => {
        const li = document.createElement('li');
        li.textContent = feat;
        mFeatures.appendChild(li);
      });

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      playSynthSound('success');
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
    playSynthSound('click');
  };

  closeBtn.addEventListener('click', closeModal);
  closeBackdrop.addEventListener('click', closeModal);
}

/* ----------------------------------------------------
   8. REAL-TIME FORM VALIDATION & PARTICLE EXPLOSION
------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('form-submit-btn');
  const canvas = document.getElementById('contact-particles');

  if (!form || !submitBtn || !canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId = null;

  function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const inputs = form.querySelectorAll('.form-input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const errorMsg = document.getElementById(`${input.name}-error`);
      if (errorMsg) {
        if (input.checkValidity()) {
          errorMsg.classList.remove('visible');
          input.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        } else {
          errorMsg.classList.add('visible');
          input.style.borderColor = 'var(--color-pink)';
        }
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let allValid = true;
    inputs.forEach(input => {
      const errorMsg = document.getElementById(`${input.name}-error`);
      if (!input.checkValidity()) {
        allValid = false;
        if (errorMsg) errorMsg.classList.add('visible');
        input.style.borderColor = 'var(--color-pink)';
      }
    });

    if (allValid) {
      playSynthSound('success');

      const btnRect = submitBtn.getBoundingClientRect();
      const parentRect = canvas.getBoundingClientRect();
      
      const burstX = btnRect.left - parentRect.left + btnRect.width / 2;
      const burstY = btnRect.top - parentRect.top + btnRect.height / 2;

      triggerParticleExplosion(burstX, burstY);

      const originalText = submitBtn.querySelector('span').textContent;
      submitBtn.querySelector('span').textContent = 'TRANSMISSION RECEIVED - SUCCESS';
      submitBtn.classList.remove('btn-primary');
      submitBtn.style.background = 'rgba(155, 81, 224, 0.15)';
      submitBtn.style.color = 'var(--color-cyan)';
      submitBtn.style.borderColor = 'var(--color-cyan)';

      form.reset();

      setTimeout(() => {
        submitBtn.querySelector('span').textContent = originalText;
        submitBtn.removeAttribute('style');
        submitBtn.classList.add('btn-primary');
      }, 4000);
    } else {
      playSynthSound('click');
    }
  });

  function triggerParticleExplosion(x, y) {
    particles = [];
    const count = 100;
    const colors = ['#00f2fe', '#ec38bc', '#9b51e0', '#ffffff'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 3;

      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: Math.random() * 2.5 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: Math.random() * 0.02 + 0.012
      });
    }

    if (animId) cancelAnimationFrame(animId);
    animateParticles();
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach(p => {
      if (p.alpha > 0) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.07;
        p.vx *= 0.98;
        p.alpha -= p.decay;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        active = true;
      }
    });

    if (active) {
      animId = requestAnimationFrame(animateParticles);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}

/* ----------------------------------------------------
   9. INTERACTIVE GLOWING GITHUB GRAPH MATRIX
------------------------------------------------------- */
function initGitHubGraph() {
  const graph = document.getElementById('github-graph');
  const log = document.getElementById('git-graph-log');
  if (!graph || !log) return;

  const totalCells = 112; 
  const commitLogPool = [
    "Optimized Firebase data reads in AGRISERVE module",
    "Tuned Streamlit layout configs for Smart Irrigation cockpit",
    "Fixed OCR contour parsing threshold inside OpenCV scripts",
    "Wrote timetabling auto-collision solvers inside EdTech portal",
    "Deployed CatBoost salary sorting variables (accuracy: ~86.5%)",
    "Linked Google Gemini orchestrators inside Multi-Agent pipelines",
    "Contributed structured dataset translation segments to Telugu LLM",
    "Synthesized Web Audio frequency clocks inside sound engine",
    "Added mobile hamburger drawer bounds to navigation overlays",
    "Corrected perspective limits on CSS interactive card hover scripts",
    "Modified Three.js nucleus vector displacements inside render loop"
  ];

  graph.innerHTML = '';

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'git-cell';
    
    const rand = Math.random();
    let level = 0;
    let bgColor = 'rgba(255, 255, 255, 0.03)';
    
    if (rand > 0.85) {
      level = 4;
      bgColor = 'rgba(0, 242, 254, 0.95)';
    } else if (rand > 0.7) {
      level = 3;
      bgColor = 'rgba(0, 242, 254, 0.65)';
    } else if (rand > 0.5) {
      level = 2;
      bgColor = 'rgba(155, 81, 224, 0.45)';
    } else if (rand > 0.3) {
      level = 1;
      bgColor = 'rgba(155, 81, 224, 0.2)';
    }

    cell.style.backgroundColor = bgColor;
    cell.style.color = level > 2 ? 'var(--color-cyan)' : 'var(--color-purple)';
    cell.setAttribute('data-level', level);

    cell.addEventListener('mouseenter', () => {
      if (level > 0) {
        const commitMsg = commitLogPool[Math.floor(Math.random() * commitLogPool.length)];
        log.textContent = `Commit Active: ${commitMsg}`;
      } else {
        log.textContent = "No commits registered on this calendar date.";
      }
      playSynthSound('hover');
    });

    cell.addEventListener('mouseleave', () => {
      log.textContent = "Hover grid nodes to read repository commits";
    });

    graph.appendChild(cell);
  }
}

/* ----------------------------------------------------
   10. HUD COMMAND CONSOLE SYSTEM (CTRL + K)
------------------------------------------------------- */
const hudCommands = [
  { title: "Jump to Home", category: "NAVIGATION", action: () => scrollToSection('hero') },
  { title: "Jump to About", category: "NAVIGATION", action: () => scrollToSection('about') },
  { title: "Jump to Skills", category: "NAVIGATION", action: () => scrollToSection('skills') },
  { title: "Jump to Projects", category: "NAVIGATION", action: () => scrollToSection('projects') },
  { title: "Jump to Journey Timeline", category: "NAVIGATION", action: () => scrollToSection('timeline') },
  { title: "Jump to Achievements Awards", category: "NAVIGATION", action: () => scrollToSection('achievements') },
  { title: "Jump to Contact Card", category: "NAVIGATION", action: () => scrollToSection('contact') },
  { title: "Download Resume PDF", category: "UTILITY", action: () => triggerResumeDownload() },
  { title: "Toggle UI Sound System", category: "UTILITY", action: () => document.getElementById('sound-toggle').click() },
  { title: "Toggle AI Buddy Chatbot", category: "UTILITY", action: () => toggleAIChatbot() }
];

function initCommandHUD() {
  const hud = document.getElementById('cmd-hud');
  const trigger = document.getElementById('cmd-menu-trigger');
  const closeBackdrop = document.getElementById('cmd-hud-close-backdrop');
  const searchInput = document.getElementById('cmd-hud-search-input');
  const resultsContainer = document.getElementById('cmd-hud-results');

  if (!hud || !trigger || !searchInput || !resultsContainer) return;

  let activeIndex = 0;
  let filteredCommands = [...hudCommands];

  const openHUD = () => {
    hud.classList.add('active');
    hud.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    searchInput.value = '';
    filterResults('');
    setTimeout(() => searchInput.focus(), 100);
    playSynthSound('success');
  };

  const closeHUD = () => {
    hud.classList.remove('active');
    hud.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
    playSynthSound('click');
  };

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (hud.classList.contains('active')) {
        closeHUD();
      } else {
        openHUD();
      }
    }
    
    if (e.key === 'Escape' && hud.classList.contains('active')) {
      closeHUD();
    }
  });

  trigger.addEventListener('click', openHUD);
  closeBackdrop.addEventListener('click', closeHUD);

  searchInput.addEventListener('input', (e) => {
    filterResults(e.target.value);
  });

  function filterResults(query) {
    const q = query.toLowerCase();
    filteredCommands = hudCommands.filter(cmd => 
      cmd.title.toLowerCase().includes(q) || cmd.category.toLowerCase().includes(q)
    );
    
    activeIndex = 0;
    renderResults();
  }

  function renderResults() {
    resultsContainer.innerHTML = '';
    
    if (filteredCommands.length === 0) {
      resultsContainer.innerHTML = '<div class="cmd-item" style="color:var(--text-muted);font-family:var(--font-mono);font-size:0.8rem;justify-content:center;">No matching system commands found.</div>';
      return;
    }

    filteredCommands.forEach((cmd, idx) => {
      const item = document.createElement('div');
      item.className = `cmd-item ${idx === activeIndex ? 'selected' : ''}`;
      
      item.innerHTML = `
        <div class="cmd-item-left">
          <span class="cmd-item-icon">&gt;_</span>
          <div class="cmd-header-stack">
            <span class="cmd-item-title">${cmd.title}</span>
          </div>
        </div>
        <span class="cmd-item-badge">${cmd.category}</span>
      `;

      item.addEventListener('mouseenter', () => {
        activeIndex = idx;
        renderResults();
      });

      item.addEventListener('click', () => {
        cmd.action();
        closeHUD();
      });

      resultsContainer.appendChild(item);
    });
  }

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % filteredCommands.length;
      renderResults();
      playSynthSound('hover');
    } 
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + filteredCommands.length) % filteredCommands.length;
      renderResults();
      playSynthSound('hover');
    } 
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[activeIndex]) {
        filteredCommands[activeIndex].action();
        closeHUD();
      }
    }
  });
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
    playSynthSound('click');
  }
}

/* ----------------------------------------------------
   11. FLOATING CLIENT-SIDE AI ASSISTANT CHATBOT
------------------------------------------------------- */
const botResponses = {
  agriserve: "AGRISERVE is M Vittal Rao's AI-Powered Agriculture Support Platform. It features localized farm worker hiring services, EMI machinery calculators, real-time fertilizer booking portals, toll-free farm assistance channels, and regional Telugu language translation modules to support local Indian farmers.",
  irrigation: "The Smart Irrigation Advisor uses machine learning algorithms in Python to compile historical weather datasets and localized telemetry to recommend precise moisture replenishment levels, reducing water waste by up to 30%. Deployed in Streamlit cockpits.",
  skills: "M Vittal Rao's stack comprises:\n• Languages: Python, JavaScript, SQL\n• Frontend: React.js, Next.js, HTML5/CSS3, Tailwind CSS\n• Backend: Firebase, Node.js, Streamlit\n• AI/ML: Scikit-learn, TensorFlow, OpenCV, CatBoost, NLP, OCR\n• Platforms: GitHub, VS Code, Kaggle, Figma",
  education: "M Vittal Rao is pursuing his Bachelor of Technology (B.Tech) in Computer Science at Malla Reddy Engineering College (MREC). He builds AI apps focusing on social impact and automated logistics.",
  prescription: "The Medical Prescription Reader AI reads cursive medicine notations from prescriptions. It runs OpenCV grayscale filter algorithms to threshold visual inputs, processes characters using OCR engines, and formats dosage summaries inside an AI chatbot environment.",
  resume: "You can download M Vittal Rao's full resume using the dedicated action buttons in the Hero section or by hitting the Command HUD [Ctrl+K] download shortcut!",
  salary: "The Salary Prediction System utilizes CatBoost and Scikit-learn classification models to sort professional salary levels. Deployed in Streamlit, it compiles accuracy scores at ~86.5%.",
  multiagent: "The Multi-Agent AI Learning System (hackathon winner) coordinates orchestrator agents with Google Gemini APIs. It scrapes web resources, generates PPT slides, builds summaries, and runs QA quizzes automatically.",
  general: "Hello! I am M Vittal Rao's AI Buddy. I can summarize his B.Tech studies, details about AGRISERVE AgTech, ML platforms, and professional skills stack. What would you like to explore?"
};

function initAIChatbot() {
  const chatWidget = document.getElementById('chat-widget');
  const chatHeader = document.getElementById('chat-header-trigger');
  const chatForm = document.getElementById('chat-input-form');
  const chatInput = document.getElementById('chat-input-field');
  const chatMessages = document.getElementById('chat-messages');
  const chatChips = document.querySelectorAll('.chat-chip');

  if (!chatWidget || !chatHeader || !chatForm || !chatInput || !chatMessages) return;

  chatHeader.addEventListener('click', toggleAIChatbot);

  chatChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query');
      if (query) {
        handleUserQuery(query);
      }
    });
  });

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = chatInput.value.trim();
    if (query) {
      handleUserQuery(query);
      chatInput.value = '';
    }
  });

  function handleUserQuery(query) {
    appendMessage(query, 'user');
    playSynthSound('click');

    const typingIndicator = appendTypingIndicator();
    chatMessages.scrollTop = chatMessages.scrollHeight;

    let response = botResponses.general;
    const q = query.toLowerCase();

    if (q.includes('agriserve') || q.includes('agriculture') || q.includes('farmer')) {
      response = botResponses.agriserve;
    } else if (q.includes('irrigation') || q.includes('water')) {
      response = botResponses.irrigation;
    } else if (q.includes('skill') || q.includes('programming') || q.includes('stack') || q.includes('python')) {
      response = botResponses.skills;
    } else if (q.includes('education') || q.includes('college') || q.includes('mrec') || q.includes('b.tech') || q.includes('timetable') || q.includes('school')) {
      response = botResponses.education;
    } else if (q.includes('prescription') || q.includes('ocr') || q.includes('medical') || q.includes('handwritten')) {
      response = botResponses.prescription;
    } else if (q.includes('resume') || q.includes('download')) {
      response = botResponses.resume;
    } else if (q.includes('salary') || q.includes('catboost') || q.includes('prediction')) {
      response = botResponses.salary;
    } else if (q.includes('multi-agent') || q.includes('gemini') || q.includes('agent') || q.includes('hackathon')) {
      response = botResponses.multiagent;
    }

    setTimeout(() => {
      typingIndicator.remove();
      appendTypingMessage(response, 'bot');
    }, 850);
  }

  function appendMessage(text, sender) {
    const bubble = document.createElement('div');
    bubble.className = `chat-message ${sender}`;
    bubble.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return bubble;
  }

  function appendTypingIndicator() {
    const bubble = document.createElement('div');
    bubble.className = 'chat-message bot typing-msg';
    bubble.innerHTML = `
      <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    chatMessages.appendChild(bubble);
    return bubble;
  }

  function appendTypingMessage(text, sender) {
    const bubble = document.createElement('div');
    bubble.className = `chat-message ${sender}`;
    chatMessages.appendChild(bubble);

    const formattedText = text.replace(/\n/g, '<br>');
    let i = 0;
    
    function type() {
      if (i < formattedText.length) {
        if (formattedText.substr(i, 4) === '<br>') {
          bubble.innerHTML += '<br>';
          i += 4;
        } else if (formattedText.substr(i, 2) === '• ') {
          bubble.innerHTML += '• ';
          i += 2;
        } else {
          bubble.innerHTML += formattedText.charAt(i);
          i++;
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
        setTimeout(type, 15);
      } else {
        playSynthSound('success');
      }
    }
    type();
  }
}

function toggleAIChatbot() {
  const widget = document.getElementById('chat-widget');
  if (widget) {
    const isCollapsed = widget.classList.toggle('collapsed');
    playSynthSound('click');
    widget.setAttribute('aria-expanded', !isCollapsed);
  }
}

/* ----------------------------------------------------
   12. RESUME DOWNLOAD HANDLERS
------------------------------------------------------- */
function initResumeDownload() {
  const btns = document.querySelectorAll('.resume-download-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', triggerResumeDownload);
  });
}

function triggerResumeDownload() {
  playSynthSound('success');
  
  const notification = document.createElement('div');
  notification.className = 'glass-panel';
  notification.style.position = 'fixed';
  notification.style.bottom = '100px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%) translateY(40px)';
  notification.style.padding = '16px 28px';
  notification.style.zIndex = '3000';
  notification.style.border = '1px solid var(--color-cyan)';
  notification.style.color = 'var(--text-bright)';
  notification.style.fontFamily = 'var(--font-mono)';
  notification.style.fontSize = '0.75rem';
  notification.style.boxShadow = '0 0 20px rgba(0, 242, 254, 0.3)';
  notification.style.opacity = '0';
  notification.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease';
  
  notification.innerHTML = `
    <span style="color:var(--color-cyan);margin-right:8px;">DOWNLOAD:</span> 
    M_Vittal_Rao_Resume.pdf initiated successfully.
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(-50%) translateY(0)';
    notification.style.opacity = '1';
  }, 100);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(-50%) translateY(40px)';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 400);
  }, 4000);
}

/* ----------------------------------------------------
   13. DYNAMIC HERO MULTI-STRING TYPEWRITER
------------------------------------------------------- */
function initHeroTypewriter() {
  const element = document.getElementById('hero-typewriter');
  if (!element) return;

  const roles = [
    "AI & Full Stack Developer",
    "Building Smart Solutions for Agriculture",
    "Building Automated Academics for Education"
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typingSpeed = 80;

  function typeCycle() {
    const currentRole = roles[roleIdx];
    
    if (isDeleting) {
      element.textContent = currentRole.substring(0, charIdx - 1);
      charIdx--;
      typingSpeed = 40; // Faster deleting speed
    } else {
      element.textContent = currentRole.substring(0, charIdx + 1);
      charIdx++;
      typingSpeed = 80; // Standard typing speed
    }

    // Finished typing full word
    if (!isDeleting && charIdx === currentRole.length) {
      isDeleting = true;
      typingSpeed = 2200; // Hold word for 2.2s before deleting
    } 
    // Finished deleting word
    else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      typingSpeed = 400; // Brief pause before typing next word
    }

    setTimeout(typeCycle, typingSpeed);
  }

  typeCycle();
}

/* ----------------------------------------------------
   14. VIEWPORT INTERSECTION SCROLL STATISTICS COUNTER
------------------------------------------------------- */
function initStatsCounter() {
  const countElements = document.querySelectorAll('.count-trigger');
  if (countElements.length === 0) return;

  const observerOptions = {
    root: null,
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetValue = parseInt(el.getAttribute('data-target'));
        animateCount(el, targetValue);
        observer.unobserve(el); // Animate only once
      }
    });
  }, observerOptions);

  countElements.forEach(el => observer.observe(el));

  function animateCount(el, target) {
    let start = 0;
    const duration = 1500; // 1.5s duration
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing curve (easeOutQuad)
      const ease = progress * (2 - progress);
      const currentVal = Math.ceil(ease * target);
      
      el.textContent = currentVal;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target; // Ensure exact final value
      }
    }

    requestAnimationFrame(step);
  }
}

/* ----------------------------------------------------
   15. CONTACT PANEL EMAIL CLIPBOARD COPY
------------------------------------------------------- */
function initCopyEmail() {
  const btn = document.getElementById('copy-email-btn');
  const emailText = document.getElementById('email-text');
  const btnText = document.getElementById('copy-btn-text');

  if (!btn || !emailText || !btnText) return;

  btn.addEventListener('click', () => {
    const rawEmail = emailText.textContent.trim();

    // Clipboard copy execution
    navigator.clipboard.writeText(rawEmail).then(() => {
      playSynthSound('success');
      
      // UI feedback updates
      btnText.textContent = "COPIED!";
      btn.style.borderColor = "var(--color-pink)";
      btn.style.background = "rgba(236, 56, 188, 0.15)";
      btn.style.color = "var(--color-pink)";

      // Restore parameters after 2.5s
      setTimeout(() => {
        btnText.textContent = "COPY";
        btn.removeAttribute('style');
      }, 2500);
    }).catch(err => {
      console.error("Clipboard copy failed: ", err);
    });
  });
}

/* ----------------------------------------------------
   16. DYNAMIC SYSTEM LIGHT / DARK THEME TOGGLE
------------------------------------------------------- */
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  const currentTheme = localStorage.getItem('theme');
  
  // Set saved preference on load
  if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
    updateThemeIcon(true);
  }

  btn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    
    // Save preference
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    // Update button icons
    updateThemeIcon(isLight);
    
    // Play synth beep!
    playSynthSound('success');
  });

  function updateThemeIcon(isLight) {
    const iconContainer = btn.querySelector('.theme-toggle-icon');
    if (!iconContainer) return;

    if (isLight) {
      // Sun SVG
      iconContainer.innerHTML = `
        <svg class="sun-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
      `;
    } else {
      // Moon SVG
      iconContainer.innerHTML = `
        <svg class="moon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
      `;
    }
  }
}

/* ----------------------------------------------------
   17. INTERACTIVE CYBER SHELL TERMINAL ENGINE
------------------------------------------------------- */
function initCyberShellTerminal() {
  const input = document.getElementById('shell-input-field');
  const output = document.getElementById('shell-output');
  if (!input || !output) return;

  const cmdHistory = [];
  let historyIndex = -1;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const command = input.value.trim();
      input.value = '';
      
      if (command) {
        cmdHistory.push(command);
        historyIndex = cmdHistory.length;
        executeShellCommand(command);
      }
    } 
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        input.value = cmdHistory[historyIndex];
      }
    } 
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < cmdHistory.length - 1) {
        historyIndex++;
        input.value = cmdHistory[historyIndex];
      } else {
        historyIndex = cmdHistory.length;
        input.value = '';
      }
    }
  });

  function printRow(text, type = '') {
    const row = document.createElement('div');
    row.className = `shell-row ${type}`;
    row.innerHTML = text;
    output.appendChild(row);
    output.scrollTop = output.scrollHeight;
  }

  function executeShellCommand(cmd) {
    printRow(`vittal@mvr-core:~$ ${cmd}`, 'user-msg');
    playSynthSound('click');

    const cleanCmd = cmd.toLowerCase().trim();

    setTimeout(() => {
      switch (cleanCmd) {
        case 'help':
          printRow('SECURE ACCESSIBILITY DICTIONARY', 'system-msg');
          printRow('  help     - Prints secure shell protocol guidelines.');
          printRow('  skills   - Visualizes core language arrays & deep ML modules.');
          printRow('  projects - Renders diagnostic Agri-tech and EdTech deployment specifications.');
          printRow('  clear    - Flushes console readout buffer.');
          printRow('  system   - Executes neon page coordinate laser calibration sweeps.');
          printRow('  audio    - Toggles real-time Space saw-drone background synthesizer.');
          break;

        case 'skills':
          printRow('--- ECOLOGICAL SKILLS LOGIC MATRIX ---', 'system-msg');
          printRow('PYTHON:      [████████████████████] 92% - EXPERT');
          printRow('JAVASCRIPT:  [██████████████████░░] 88% - ADVANCED');
          printRow('SQL DATA:    [████████████████░░░░] 80% - STABLE');
          printRow('REACT/NEXT:  [█████████████████░░░] 85% - FLUENT');
          printRow('SCIKIT/CATB: [█████████████████░░░] 86% - ACCURATE');
          printRow('GEMINI API:  [█████████████████░░░] 88% - MULTI-AGENT');
          printRow('OPENCV VISION:[████████████████░░░░] 80% - CV RUNNING');
          break;

        case 'projects':
          printRow('--- PIPELINES ACTIVE SYSTEM BINDINGS ---', 'system-msg');
          printRow('1. AGRISERVE AI   - Multilingual regional agricultural coordinator - React, Firebase.');
          printRow('2. SMART IRRIG    - Meteorological low-saturation moisture calculator - ML, Streamlit.');
          printRow('3. EDTECH ENGINE  - Conflict-free classroom timetabling orchestrator.');
          printRow('4. PRESCRIPTION CV- CV contours read cursive prescription dosage logs.');
          printRow('5. CATBOOST WAGE  - High-precision wage categorizer (86.5% validation score).');
          printRow('6. MULTI-AGENT    - Hackathon PPT slides auto-orchestrator using Gemini.');
          break;

        case 'clear':
          output.innerHTML = '';
          break;

        case 'system':
          printRow('INITIALIZING SECURE SYSTEMS MULTI-LAYER SCAN...', 'system-msg');
          triggerSystemSweepOverlay();
          setTimeout(() => {
            printRow('  CORE WEBGL ENGINE: COMPLIANT (60FPS LOCKED)', 'success-msg');
            printRow('  COORDINATE BLUEPRINT ARRAYS: ONLINE', 'success-msg');
            printRow('  EMULATOR COCKPITS: CONNECTED', 'success-msg');
            printRow('DIAGNOSTICS SECURED - HUD SYSTEM 100% OPERATIONAL.', 'success-msg');
          }, 1200);
          break;

        case 'audio':
          const soundToggler = document.getElementById('sound-toggle');
          if (soundToggler) {
            soundToggler.click();
            printRow(`SYSTEM DRONE STATE SWAPPED - SOUND RUNNING: ${soundEnabled ? 'ON' : 'OFF'}`, 'success-msg');
          } else {
            printRow('ERROR: Audio controls not responding.', 'error-msg');
          }
          break;

        default:
          printRow(`shell: command not found: "${cmd}". Type 'help' for secure protocols.`, 'error-msg');
      }
    }, 180);
  }

  function triggerSystemSweepOverlay() {
    let sweep = document.createElement('div');
    sweep.className = 'matrix-screen-scan';
    document.body.appendChild(sweep);
    playSynthSound('success');
    setTimeout(() => sweep.remove(), 3100);
  }
}

/* ----------------------------------------------------
   18. INTERACTIVE AGRI-AI TELEMETRY SIMULATOR
------------------------------------------------------- */
function initAgriAICockpit() {
  const soilSlider = document.getElementById('slider-soil-moisture');
  const solarSlider = document.getElementById('slider-solar-radiation');
  const humidSlider = document.getElementById('slider-humidity');

  const soilVal = document.getElementById('val-soil-moisture');
  const solarVal = document.getElementById('val-solar-radiation');
  const humidVal = document.getElementById('val-humidity');

  const gaugeFill = document.getElementById('gauge-fill-moisture');
  const percentText = document.getElementById('prediction-percent');
  const adviceText = document.getElementById('moisture-advice');
  const pumpText = document.getElementById('pump-status');

  if (!soilSlider || !solarSlider || !humidSlider || !gaugeFill || !percentText) return;

  function recalculateAgriAI() {
    const soil = parseInt(soilSlider.value);
    const solar = parseInt(solarSlider.value);
    const humid = parseInt(humidSlider.value);

    // Update Slider numerical readouts
    if (soilVal) soilVal.textContent = `${soil}%`;
    if (solarVal) solarVal.textContent = `${solar} W/m²`;
    if (humidVal) humidVal.textContent = `${humid}%`;

    // Mathematical ML Emulated Index
    let score = Math.round((100 - soil) * 0.55 + (solar / 12) * 0.35 + (100 - humid) * 0.1);
    score = Math.max(0, Math.min(100, score));

    // Update Numerical gauge percentages
    percentText.textContent = `${score}%`;

    // Update SVG gauge fill track (stroke-dasharray="251.2", fill is 251.2 to 0 offset)
    const offsetVal = 251.2 - (251.2 * score) / 100;
    gaugeFill.style.strokeDashoffset = offsetVal;

    // Trigger state changes based on emulated moisture index levels
    if (score >= 68) {
      if (adviceText) {
        adviceText.textContent = "CRITICAL DEHYDRATION - IRRIGATE NOW";
        adviceText.style.color = "var(--color-pink)";
      }
      if (pumpText) {
        pumpText.textContent = "PUMP DIRECT ACTIVE - 40L/min";
        pumpText.style.color = "var(--color-pink)";
      }
      gaugeFill.style.stroke = "var(--color-pink)";
      gaugeFill.style.filter = "drop-shadow(0 0 5px var(--color-pink))";
    } 
    else if (score >= 40) {
      if (adviceText) {
        adviceText.textContent = "MODERATE DRYNESS - STANDBY MODE";
        adviceText.style.color = "var(--color-cyan)";
      }
      if (pumpText) {
        pumpText.textContent = "STANDBY LOGIC";
        pumpText.style.color = "var(--color-cyan)";
      }
      gaugeFill.style.stroke = "var(--color-cyan)";
      gaugeFill.style.filter = "drop-shadow(0 0 5px var(--color-cyan))";
    } 
    else {
      if (adviceText) {
        adviceText.textContent = "OPTIMAL SATURATION - IDLE FLOW";
        adviceText.style.color = "#27c93f";
      }
      if (pumpText) {
        pumpText.textContent = "IDLE - ECO SYSTEM";
        pumpText.style.color = "#27c93f";
      }
      gaugeFill.style.stroke = "#27c93f";
      gaugeFill.style.filter = "drop-shadow(0 0 5px #27c93f)";
    }
  }

  // Bind input sliders triggers
  soilSlider.addEventListener('input', () => {
    recalculateAgriAI();
    playSynthSound('hover');
  });
  solarSlider.addEventListener('input', () => {
    recalculateAgriAI();
    playSynthSound('hover');
  });
  humidSlider.addEventListener('input', () => {
    recalculateAgriAI();
    playSynthSound('hover');
  });

  // Launch initial calibration
  recalculateAgriAI();
}

/* ----------------------------------------------------
   19. DYNAMIC DUAL-BRACKET CARD SCAN OVERLAYS
------------------------------------------------------- */
function initHUDCardScanners() {
  const cards = document.querySelectorAll('.cyber-card');
  cards.forEach(card => {
    if (!card.querySelector('.card-laser-scanner')) {
      const scanner = document.createElement('div');
      scanner.className = 'card-laser-scanner';
      card.appendChild(scanner);
    }
  });
}

