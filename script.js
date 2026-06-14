/* ============================================================
   PROJECT DOCUMENTATION — script.js
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ── Navigation ─────────────────────────────────────────
     Transparent over the hero, gains a solid background once
     scrolled past it. Hamburger toggles a panel on mobile, and
     the current section's link is highlighted while scrolling.
  ─────────────────────────────────────────────────────── */
  (function nav() {
    const navEl  = document.getElementById('site-nav');
    const toggle = document.getElementById('nav-toggle');
    const menu   = document.getElementById('nav-menu');
    const heroEl = document.getElementById('hero');
    if (!navEl) return;

    // Solid background once the hero is mostly scrolled away
    function onScroll() {
      const threshold = (heroEl ? heroEl.offsetHeight : window.innerHeight) - 80;
      navEl.classList.toggle('is-scrolled', window.scrollY > threshold);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile hamburger
    function closeMenu() {
      navEl.classList.remove('is-open');
      toggle?.setAttribute('aria-expanded', 'false');
    }
    toggle?.addEventListener('click', () => {
      const open = navEl.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu?.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Active-link highlight via the section in the viewport's middle band
    if ('IntersectionObserver' in window) {
      const sections = ['statement', 'artifact', 'process', 'images', 'references']
        .map(id => document.getElementById(id)).filter(Boolean);

      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          menu?.querySelectorAll('.nav__link').forEach(a => a.classList.remove('is-active'));
          menu?.querySelector(`a[href="#${e.target.id}"]`)?.classList.add('is-active');
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

      sections.forEach(s => obs.observe(s));
    }
  })();


  /* ── Scroll reveal (IntersectionObserver) ───────────────
     Observes each .reveal-section. When it enters the viewport
     its .reveal-el children fade + slide up with a stagger.
  ─────────────────────────────────────────────────────── */
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    document.querySelectorAll('.reveal-section').forEach(section => {
      const els = Array.from(section.querySelectorAll('.reveal-el'));

      // Hide elements NOW in JS — content stays visible if JS never runs
      els.forEach(el => el.classList.add('will-reveal'));

      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        els.forEach((el, i) => {
          setTimeout(() => el.classList.add('is-visible'), i * 90);
        });
        observer.disconnect();
      }, {
        threshold: 0,
        rootMargin: '0px 0px -40px 0px',
      });

      observer.observe(section);
    });
  }




  /* ── Output video: click-to-play ────────────────────────
  ─────────────────────────────────────────────────────── */
  const outputVideo = document.getElementById('output-video');
  const playBtn     = document.getElementById('play-btn');

  if (outputVideo && playBtn) {
    playBtn.addEventListener('click', () => {
      outputVideo.play().then(() => {
        playBtn.hidden = true;
        outputVideo.setAttribute('controls', '');
      }).catch(() => {
        // Browser prevented play — leave UI unchanged
      });
    });

    outputVideo.addEventListener('ended', () => {
      outputVideo.removeAttribute('controls');
      playBtn.hidden = false;
    });
  }


  /* ── Lightbox ───────────────────────────────────────────
     Keyboard-navigable modal: Esc = close, ← → = prev/next.
     Focus is trapped inside the dialog while open.
  ─────────────────────────────────────────────────────── */
  const lightbox        = document.getElementById('lightbox');
  const lightboxImg     = document.getElementById('lightbox-img');
  const lightboxVideo   = document.getElementById('lightbox-video');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxClose   = document.getElementById('lightbox-close');
  const lightboxPrev    = document.getElementById('lightbox-prev');
  const lightboxNext    = document.getElementById('lightbox-next');

  const imageItems   = Array.from(document.querySelectorAll('.image-grid__item'));
  let   currentIndex = 0;
  let   previousFocus = null;

  function getMediaData(index) {
    const item    = imageItems[index];
    const img     = item?.querySelector('img');
    const source  = item?.querySelector('video source');
    const caption = item?.querySelector('figcaption');
    const isVideo = !!source;
    return {
      type:    isVideo ? 'video' : 'image',
      src:     isVideo ? source.getAttribute('src') : (img?.getAttribute('src') ?? ''),
      alt:     img?.alt ?? '',
      caption: caption?.textContent?.trim() ?? '',
    };
  }

  function updateLightboxMedia(index) {
    const data = getMediaData(index);

    // Always pause/reset the previous video before switching
    lightboxVideo.pause();

    if (data.type === 'video') {
      lightboxImg.hidden = true;
      lightboxImg.removeAttribute('src');
      lightboxVideo.src    = data.src;
      lightboxVideo.hidden = false;
      lightboxVideo.currentTime = 0;
      lightboxVideo.play().catch(() => {});
    } else {
      lightboxVideo.hidden = true;
      lightboxVideo.removeAttribute('src');
      lightboxImg.src    = data.src;
      lightboxImg.alt    = data.alt;
      lightboxImg.hidden = false;
    }

    lightboxCaption.textContent = data.caption;
    lightboxCounter.textContent = `${index + 1} / ${imageItems.length}`;
    currentIndex = index;
  }

  function openLightbox(index) {
    previousFocus = document.activeElement;
    updateLightboxMedia(index);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
    setupFocusTrap();
  }

  function closeLightbox() {
    lightboxVideo.pause();
    lightbox.hidden = true;
    document.body.style.overflow = '';
    removeFocusTrap();
    previousFocus?.focus();
  }

  function prevImage() {
    updateLightboxMedia((currentIndex - 1 + imageItems.length) % imageItems.length);
  }

  function nextImage() {
    updateLightboxMedia((currentIndex + 1) % imageItems.length);
  }

  // Make every item clickable — images (button) and videos (wrap)
  imageItems.forEach((item, i) => {
    const trigger = item.querySelector('.image-grid__btn')
                 || item.querySelector('.image-grid__video-wrap');
    if (trigger) trigger.addEventListener('click', () => openLightbox(i));
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click',  prevImage);
  lightboxNext?.addEventListener('click',  nextImage);

  lightbox?.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox || lightbox.hidden) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  /* Focus trap */
  let trapListener = null;

  function setupFocusTrap() {
    const focusable = Array.from(
      lightbox.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.disabled);

    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    trapListener = e => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', trapListener);
  }

  function removeFocusTrap() {
    if (trapListener) {
      document.removeEventListener('keydown', trapListener);
      trapListener = null;
    }
  }


  /* ── Image grid: show 4 rows, expand on click ──────────
     4 rows × 5 columns = 20 items initially visible.
  ─────────────────────────────────────────────────────── */
  const ROWS_INITIAL = 4;
  const COLS         = 5;
  const VISIBLE      = ROWS_INITIAL * COLS; // 20

  const allGridItems  = Array.from(document.querySelectorAll('.image-grid .image-grid__item'));
  const expandBtn     = document.getElementById('gallery-expand');
  const expandLabel   = document.getElementById('gallery-expand-label');
  const hiddenCount   = allGridItems.length - VISIBLE;

  if (hiddenCount > 0 && expandBtn) {
    allGridItems.slice(VISIBLE).forEach(el => el.classList.add('is-hidden'));
    expandLabel.textContent = `Show all ${allGridItems.length} items`;

    let isExpanded = false;

    expandBtn.addEventListener('click', () => {
      if (!isExpanded) {
        allGridItems.forEach(el => el.classList.remove('is-hidden'));
        expandLabel.textContent = 'Show less';
        expandBtn.setAttribute('aria-expanded', 'true');
        expandBtn.classList.add('is-expanded');
        isExpanded = true;
      } else {
        allGridItems.slice(VISIBLE).forEach(el => el.classList.add('is-hidden'));
        expandLabel.textContent = `Show all ${allGridItems.length} items`;
        expandBtn.setAttribute('aria-expanded', 'false');
        expandBtn.classList.remove('is-expanded');
        isExpanded = false;
        document.getElementById('images')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  } else if (expandBtn) {
    expandBtn.style.display = 'none';
  }


  /* ── Artifact modal + interactive 3D viewer ─────────────
     Clicking/tapping a hotspot number opens a full modal with
     a large, drag-to-rotate / scroll-to-zoom 3D model and the
     readable description. One shared Three.js viewer.
  ─────────────────────────────────────────────────────── */
  const hotspots   = Array.from(document.querySelectorAll('.hotspot'));
  const amodal     = document.getElementById('artifact-modal');
  const amCanvas   = document.getElementById('amodal-canvas');
  const amTitle    = document.getElementById('amodal-title');
  const amText     = document.getElementById('amodal-text');
  const amIndex    = document.getElementById('amodal-index');
  const amClose    = document.getElementById('amodal-close');
  const amHint     = document.getElementById('amodal-hint');

  if (amodal && hotspots.length) {
    let viewer = null;        // lazy Three.js viewer
    let amPrevFocus = null;

    // Build the shared Three.js viewer once (on first open)
    function buildViewer() {
      if (viewer || typeof THREE === 'undefined') return;

      const renderer = new THREE.WebGLRenderer({ canvas: amCanvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping    = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 2000);
      camera.position.set(0, 0, 3);

      scene.add(new THREE.AmbientLight(0xffffff, 0.95));
      const key = new THREE.DirectionalLight(0xffffff, 1.25);
      key.position.set(2, 4, 3); scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.4);
      fill.position.set(-3, -1, -2); scene.add(fill);

      const controls = new THREE.OrbitControls(camera, amCanvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enablePan = false;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.6;
      // Stop auto-rotation once the user interacts
      controls.addEventListener('start', () => { controls.autoRotate = false; });

      const loader = new THREE.GLTFLoader();
      if (typeof MeshoptDecoder !== 'undefined') loader.setMeshoptDecoder(MeshoptDecoder);

      let current = null; // currently loaded model

      function resize() {
        const w = amCanvas.clientWidth, h = amCanvas.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }

      function load(src) {
        if (current) { scene.remove(current); current = null; }
        if (amHint) amHint.style.opacity = '0.5';
        controls.autoRotate = true;
        loader.load(src, (gltf) => {
          const model = gltf.scene;
          const box  = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3()).length();
          const ctr  = box.getCenter(new THREE.Vector3());
          model.position.sub(ctr);
          scene.add(model);
          current = model;
          camera.position.set(0, size * 0.25, size * 1.5);
          camera.near = size / 100;
          camera.far  = size * 100;
          camera.updateProjectionMatrix();
          controls.target.set(0, 0, 0);
          controls.minDistance = size * 0.6;
          controls.maxDistance = size * 4;
          controls.update();
        });
      }

      let running = false;
      function animate() {
        if (!running) return;
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }

      viewer = {
        load,
        resize,
        start() { if (!running) { running = true; animate(); } },
        stop()  { running = false; },
      };
      window.addEventListener('resize', () => { if (running) resize(); });
    }

    function openModal(hotspot) {
      const src   = hotspot.querySelector('.hotspot__canvas')?.dataset.src;
      const title = hotspot.querySelector('.hotspot__title')?.textContent || '';
      const text  = hotspot.querySelector('.hotspot__text')?.textContent || '';
      const num   = hotspot.querySelector('.hotspot__number')?.textContent || '';

      amTitle.textContent = title;
      amText.textContent  = text;
      amIndex.textContent = num ? `Element ${num}` : '';

      amPrevFocus = document.activeElement;
      amodal.hidden = false;
      document.body.style.overflow = 'hidden';
      amClose.focus();

      buildViewer();
      if (viewer) {
        // Wait one frame so the canvas has its layout size
        requestAnimationFrame(() => {
          viewer.resize();
          if (src) viewer.load(src);
          viewer.start();
        });
      }
    }

    function closeModal() {
      amodal.hidden = true;
      document.body.style.overflow = '';
      viewer?.stop();
      amPrevFocus?.focus();
    }

    // Each number opens the modal
    hotspots.forEach(hotspot => {
      const number = hotspot.querySelector('.hotspot__number');
      if (!number) return;
      number.setAttribute('tabindex', '0');
      number.setAttribute('role', 'button');
      const open = (e) => { e.stopPropagation(); openModal(hotspot); };
      number.addEventListener('click', open);
      number.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(e); }
      });
    });

    amClose.addEventListener('click', closeModal);
    amodal.addEventListener('click', (e) => { if (e.target === amodal) closeModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !amodal.hidden) closeModal();
    });
  }


  /* ── Hero video: honour reduced-motion ─────────────────
  ─────────────────────────────────────────────────────── */
  if (prefersReducedMotion) {
    const heroVideo = document.querySelector('.hero__video');
    if (heroVideo) {
      heroVideo.pause();
      heroVideo.removeAttribute('autoplay');
    }
  }

})();