/* ============================================================
   DIGITAL WEDDING INVITATION — App Logic
   Aarav & Priya · 14 February 2026
   ============================================================ */

'use strict';

// ── Wedding date ────────────────────────────────────────────
const WEDDING_DATE = new Date("May 08, 2026 13:30:00 GMT+0530");

// ═══════════════════════════════════════════════════════════
//  1. PETAL RAIN
// ═══════════════════════════════════════════════════════════
(function initPetals() {
  const container = document.getElementById('petals-container');
  const symbols = ['🌸', '🌺', '✿', '❀', '🌹', '✦', '❋'];
  const COUNT = 18;

  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement('div');
    el.className = 'petal';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    const left     = Math.random() * 100;
    const duration = 8 + Math.random() * 14;
    const delay    = Math.random() * 12;
    const size     = 12 + Math.random() * 10;

    el.style.cssText = `
      left: ${left}%;
      font-size: ${size}px;
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
    `;
    container.appendChild(el);
  }
})();

// ═══════════════════════════════════════════════════════════
//  2. SCRATCH CARD
// ═══════════════════════════════════════════════════════════
(function initScratch() {
  const canvas  = document.getElementById('scratchCanvas');
  const ctx     = canvas.getContext('2d');
  const wrapper = canvas.parentElement;
  const hint    = document.getElementById('scratchHint');

  let isDrawing = false;
  let totalPixels = 0;
  let revealed = false;
  const SCRATCH_RADIUS = 28;
  const REVEAL_THRESHOLD = 0.55; // 55% scratched = auto-reveal

  // ── Size canvas to match wrapper ──
  function resize() {
    const rect = wrapper.getBoundingClientRect();
    canvas.width  = rect.width;
    canvas.height = rect.height;
    drawScratchLayer();
  }

  // ── Draw the gold foil scratch layer ──
  function drawScratchLayer() {
    const w = canvas.width, h = canvas.height;

    // Gold gradient
    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0,   '#c8a832');
    grd.addColorStop(0.3, '#e8d48b');
    grd.addColorStop(0.6, '#c5a028');
    grd.addColorStop(1,   '#d4af37');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // Subtle shimmer lines
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    for (let i = 0; i < h; i += 4) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }

    // Pattern dots
    ctx.fillStyle = 'rgba(197,160,40,0.4)';
    for (let x = 20; x < w; x += 40) {
      for (let y = 20; y < h; y += 40) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Label text
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(90,50,10,0.55)';
    ctx.font = `bold ${Math.floor(h * 0.09)}px "Cinzel Decorative", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦  Scratch Here  ✦', w / 2, h / 2 - 10);
    ctx.font = `${Math.floor(h * 0.055)}px "Jost", sans-serif`;
    ctx.fillText('Swipe to reveal the date', w / 2, h / 2 + h * 0.12);

    totalPixels = w * h;
  }

  // ── Scratch at position ──
  function scratch(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, SCRATCH_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    checkReveal();
  }

  // ── Check how much is revealed ──
  function checkReveal() {
    if (revealed) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 10) transparent++;
    }
    const ratio = transparent / (totalPixels);
    if (ratio > REVEAL_THRESHOLD) {
      revealed = true;
      hint.style.opacity = '0';
      setTimeout(() => {
        canvas.style.transition = 'opacity .8s ease';
        canvas.style.opacity = '0';
        setTimeout(() => canvas.style.display = 'none', 800);
        hint.textContent = '✦ Date Revealed! Scroll down for more ✦';
        hint.style.opacity = '1';
        hint.style.color = '#c5a028';
      }, 300);
    }
  }

  // ── Pointer helpers ──
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }

  canvas.addEventListener('mousedown',  e => { isDrawing = true; scratch(...Object.values(getPos(e))); });
  canvas.addEventListener('mousemove',  e => { if (isDrawing) scratch(...Object.values(getPos(e))); });
  canvas.addEventListener('mouseup',    () => isDrawing = false);
  canvas.addEventListener('mouseleave', () => isDrawing = false);

  canvas.addEventListener('touchstart', e => { e.preventDefault(); isDrawing = true; scratch(...Object.values(getPos(e))); }, { passive: false });
  canvas.addEventListener('touchmove',  e => { e.preventDefault(); if (isDrawing) scratch(...Object.values(getPos(e))); }, { passive: false });
  canvas.addEventListener('touchend',   () => isDrawing = false);

  // ── Init on load ──
  window.addEventListener('load', () => {
    resize();
  });
  window.addEventListener('resize', () => {
    if (!revealed) resize();
  });
})();

// ═══════════════════════════════════════════════════════════
//  3. COUNTDOWN TIMER
// ═══════════════════════════════════════════════════════════
(function initCountdown() {

  const els = {
    days:  document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins:  document.getElementById('cd-mins'),
    secs:  document.getElementById('cd-secs'),
  };

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function tick() {
    const now  = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      Object.values(els).forEach(el => el.textContent = '00');
      clearInterval(timer);
      return;
    }

    const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins  = Math.floor((diff / (1000 * 60)) % 60);
    const secs  = Math.floor((diff / 1000) % 60);

    els.days.textContent  = pad(days);
    els.hours.textContent = pad(hours);
    els.mins.textContent  = pad(mins);
    els.secs.textContent  = pad(secs);
  }

  tick();
  const timer = setInterval(tick, 1000);

})();
// ═══════════════════════════════════════════════════════════
//  4. SCROLL ANIMATIONS
// ═══════════════════════════════════════════════════════════
(function initScrollAnimations() {
  const items = document.querySelectorAll('[data-scroll]');

  if (!items.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // stagger siblings
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('[data-scroll]'));
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 120);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(el => obs.observe(el));
})();

// ═══════════════════════════════════════════════════════════
//  5. RSVP FORM
// ═══════════════════════════════════════════════════════════
function submitRSVP(e) {
  e.preventDefault();

  const btn     = document.getElementById('rsvpBtnText');
  const form    = document.getElementById('rsvpForm');
  const success = document.getElementById('rsvpSuccess');

  // Gather data
  const data = {
    name:    document.getElementById('fname').value.trim(),
    email:   document.getElementById('femail').value.trim(),
    phone:   document.getElementById('fphone').value.trim(),
    attend:  document.querySelector('input[name="attend"]:checked')?.value,
    guests:  document.getElementById('fguests').value,
    message: document.getElementById('fmsg').value.trim(),
  };

  // Loading state
  btn.textContent = 'Sending… ✦';

  // Simulate async submit (replace with Formspree / Firebase)
  setTimeout(() => {
    console.log('[RSVP submitted]', data);

    // Show success
    form.style.transition = 'opacity .4s';
    form.style.opacity = '0';
    setTimeout(() => {
      form.style.display = 'none';
      success.style.display = 'block';
    }, 400);
  }, 1400);
}

// ═══════════════════════════════════════════════════════════
//  6. PARALLAX HERO (subtle)
// ═══════════════════════════════════════════════════════════
(function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    hero.style.backgroundPositionY = `${y * 0.3}px`;
  }, { passive: true });
})();

// ═══════════════════════════════════════════════════════════
//  7. SMOOTH NAV (if nav links added later)
// ═══════════════════════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ═══════════════════════════════════════════════════════════
//  8. SECTION REVEAL ON LOAD
// ═══════════════════════════════════════════════════════════
(function sectionFade() {
  const sections = document.querySelectorAll('section:not(.hero)');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  sections.forEach(sec => {
    sec.style.opacity = '0';
    sec.style.transform = 'translateY(20px)';
    sec.style.transition = 'opacity .7s ease, transform .7s ease';
    obs.observe(sec);
  });
})();
const bgMusic = document.getElementById("bgMusic");

// volume control
bgMusic.volume = 0.15;

// try autoplay on page load
window.addEventListener("load", () => {
    const playPromise = bgMusic.play();

    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // autoplay blocked by browser
            document.addEventListener("click", startMusicOnce);
            document.addEventListener("touchstart", startMusicOnce);
        });
    }
});

// play fter first interaction if blocked
function startMusicOnce() {
    bgMusic.play();
    document.removeEventListener("click", startMusicOnce);
    document.removeEventListener("touchstart", startMusicOnce);
}
