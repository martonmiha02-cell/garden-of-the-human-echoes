/* ============================================================
   PROJECT DOCUMENTATION — script.js
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;


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
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxClose   = document.getElementById('lightbox-close');
  const lightboxPrev    = document.getElementById('lightbox-prev');
  const lightboxNext    = document.getElementById('lightbox-next');

  const imageItems   = Array.from(document.querySelectorAll('.image-grid__item'));
  let   currentIndex = 0;
  let   previousFocus = null;

  function getImageData(index) {
    const item    = imageItems[index];
    const img     = item?.querySelector('img');
    const caption = item?.querySelector('figcaption');
    return {
      src:     img?.src ?? '',
      alt:     img?.alt ?? '',
      caption: caption?.textContent?.trim() ?? '',
    };
  }

  function updateLightboxImage(index) {
    const data = getImageData(index);
    lightboxImg.src             = data.src;
    lightboxImg.alt             = data.alt;
    lightboxCaption.textContent = data.caption;
    lightboxCounter.textContent = `${index + 1} / ${imageItems.length}`;
    currentIndex = index;
  }

  function openLightbox(index) {
    previousFocus = document.activeElement;
    updateLightboxImage(index);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
    setupFocusTrap();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    removeFocusTrap();
    previousFocus?.focus();
  }

  function prevImage() {
    updateLightboxImage((currentIndex - 1 + imageItems.length) % imageItems.length);
  }

  function nextImage() {
    updateLightboxImage((currentIndex + 1) % imageItems.length);
  }

  document.querySelectorAll('.image-grid__btn').forEach((btn, i) => {
    btn.addEventListener('click', () => openLightbox(i));
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


  /* ── Hotspot 3D viewers ─────────────────────────────────
     Each .hotspot__canvas gets a Three.js renderer that
     auto-rotates. Initialised lazily on first hover to
     keep page load fast.
  ─────────────────────────────────────────────────────── */
  if (typeof THREE !== 'undefined') {

    function initHotspotViewer(canvas) {
      const src = canvas.dataset.src;
      if (!src || canvas._threeInit) return;
      canvas._threeInit = true;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping    = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      const w = canvas.clientWidth || 220;
      renderer.setSize(w, w, false);

      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);

      scene.add(new THREE.AmbientLight(0xffffff, 0.9));
      const key = new THREE.DirectionalLight(0xffffff, 1.2);
      key.position.set(2, 4, 3);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.35);
      fill.position.set(-2, 0, -2);
      scene.add(fill);

      // Simple auto-rotate (no OrbitControls — tooltip is small)
      let pivot = new THREE.Object3D();
      scene.add(pivot);

      const loader = new THREE.GLTFLoader();
      loader.load(src, (gltf) => {
        const model = gltf.scene;
        const box  = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3()).length();
        const ctr  = box.getCenter(new THREE.Vector3());
        model.position.sub(ctr);
        pivot.add(model);
        camera.position.set(0, size * 0.3, size * 1.6);
        camera.lookAt(0, 0, 0);
        camera.near = size / 100;
        camera.far  = size * 100;
        camera.updateProjectionMatrix();
      });

      let running = false;
      function animate() {
        if (!running) return;
        requestAnimationFrame(animate);
        pivot.rotation.y += 0.012;
        renderer.render(scene, camera);
      }

      canvas._start = () => { if (!running) { running = true; animate(); } };
      canvas._stop  = () => { running = false; };
    }

    // Lazy-init + start/stop on hotspot hover
    document.querySelectorAll('.hotspot').forEach(hotspot => {
      const canvas = hotspot.querySelector('.hotspot__canvas');
      if (!canvas) return;

      hotspot.addEventListener('mouseenter', () => {
        initHotspotViewer(canvas);
        canvas._start?.();
      });
      hotspot.addEventListener('mouseleave', () => {
        canvas._stop?.();
      });
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