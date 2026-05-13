/* ═══════════════════════════════════════════════════
   WEDDING INVITATION — Zee & Gaze
   Script: Modular Vanilla JS
═══════════════════════════════════════════════════ */

'use strict';

/* ── STATE ── */
const App = {
  musicPlaying: false,
  opened: false,
  weddingDate: new Date('2026-06-12T08:00:00'),
};

/* ════════════════════════════════════════════
   OPENING SCREEN
════════════════════════════════════════════ */
function initOpening() {
  const btn     = document.getElementById('btn-open');
  const opening = document.getElementById('opening');
  const main    = document.getElementById('main');
  const musicBtn = document.getElementById('btn-music');
  const nav     = document.getElementById('bottom-nav');

  if (!btn || !opening || !main) return;

  btn.addEventListener('click', () => {
    if (App.opened) return;
    App.opened = true;

    /* Fade out opening */
    opening.classList.add('fade-out');

    setTimeout(() => {
      opening.style.display = 'none';

      /* Show main content */
      main.classList.remove('main-hidden');
      main.classList.add('main-visible');
      main.removeAttribute('aria-hidden');

      /* Unlock scroll */
      document.body.classList.remove('body-locked');

      /* Show fixed UI */
      if (musicBtn) { musicBtn.style.display = 'flex'; }
      if (nav) { nav.classList.remove('nav-hidden'); }

      /* Try autoplay music */
      tryPlayMusic();

      /* Init scroll features */
      initScrollReveal();
      initParallax();

    }, 900);
  });

  /* Read guest name from URL param */
  const params = new URLSearchParams(window.location.search);
  const guestEl = document.getElementById('guest-name');
  if (guestEl && params.get('to')) {
    guestEl.textContent = decodeURIComponent(params.get('to'));
  }
}

/* ════════════════════════════════════════════
   MUSIC PLAYER
════════════════════════════════════════════ */
function initMusic() {
  const btn   = document.getElementById('btn-music');
  const audio = document.getElementById('bg-music');
  const icon  = document.getElementById('music-icon');

  if (!btn || !audio) return;

  btn.addEventListener('click', () => toggleMusic(audio, btn, icon));
}

function toggleMusic(audio, btn, icon) {
  if (App.musicPlaying) {
    audio.pause();
    App.musicPlaying = false;
    if (icon) icon.textContent = '🎵';
    if (btn)  btn.classList.remove('playing');
  } else {
    audio.play().then(() => {
      App.musicPlaying = true;
      if (icon) icon.textContent = '🔇';
      if (btn)  btn.classList.add('playing');
    }).catch(() => {
      /* Autoplay blocked — show hint */
      if (icon) icon.textContent = '🎵';
    });
  }
}

function tryPlayMusic() {
  const audio = document.getElementById('bg-music');
  const btn   = document.getElementById('btn-music');
  const icon  = document.getElementById('music-icon');
  if (!audio) return;
  audio.volume = 0.5;
  audio.play().then(() => {
    App.musicPlaying = true;
    if (icon) icon.textContent = '🔇';
    if (btn)  btn.classList.add('playing');
  }).catch(() => { /* blocked — user must click */ });
}

/* ════════════════════════════════════════════
   COUNTDOWN TIMER
════════════════════════════════════════════ */
function initCountdown() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  const now  = new Date();
  const diff = App.weddingDate - now;
  const note = document.getElementById('cd-note');

  if (diff <= 0) {
    setCD('cd-days','00'); setCD('cd-hours','00');
    setCD('cd-mins','00'); setCD('cd-secs','00');
    if (note) note.textContent = '🎊 Hari Bahagia Telah Tiba! Marhaban ya Pengantin!';
    return;
  }

  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000)  / 60000);
  const secs  = Math.floor((diff % 60000)    / 1000);

  setCD('cd-days',  pad(days));
  setCD('cd-hours', pad(hours));
  setCD('cd-mins',  pad(mins));
  setCD('cd-secs',  pad(secs));

  if (note && days <= 7) {
    note.textContent = `Tinggal ${days} hari lagi — Alhamdulillah 🌿`;
  }
}

function setCD(id, val) {
  const el = document.getElementById(id);
  if (el && el.textContent !== val) el.textContent = val;
}
function pad(n) { return String(n).padStart(2, '0'); }

/* ════════════════════════════════════════════
   SCROLL REVEAL (IntersectionObserver)
════════════════════════════════════════════ */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        /* Stagger children */
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
}

/* ════════════════════════════════════════════
   PARALLAX (light — opening bg only)
════════════════════════════════════════════ */
function initParallax() {
  const hero = document.querySelector('.section-hero');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    /* Subtle depth shift on leaf corners */
    document.querySelectorAll('.lc-tl, .lc-tr').forEach(el => {
      el.style.transform = `translateY(${y * 0.04}px)`;
    });
  }, { passive: true });
}

/* ════════════════════════════════════════════
   BOTTOM NAV — Smooth Scroll + Active State
════════════════════════════════════════════ */
function initBottomNav() {
  const links = document.querySelectorAll('.nav-item[data-section]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.dataset.section;
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* Active section highlight */
  const sections = ['hero','couple','event','rsvp','gift'];
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 120) current = id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.dataset.section === current);
    });
  }, { passive: true });
}

/* ════════════════════════════════════════════
   RSVP FORM
════════════════════════════════════════════ */
function initRSVP() {
  const form = document.getElementById('rsvp-form');
  if (!form) return;

  renderRSVPList();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name    = form.querySelector('#rsvp-name').value.trim();
    const attend  = form.querySelector('input[name="attend"]:checked')?.value || 'hadir';
    const message = form.querySelector('#rsvp-msg').value.trim();

    if (!name) {
      shake(form.querySelector('#rsvp-name'));
      return;
    }

    const entry = { name, attend, message, time: Date.now() };
    saveRSVP(entry);
    renderRSVPList();
    form.reset();
    showToast('Terima kasih! Ucapan Anda telah terkirim 💚');
  });
}

function saveRSVP(entry) {
  const list = getRSVPList();
  list.unshift(entry);
  localStorage.setItem('wedding_rsvp', JSON.stringify(list.slice(0, 50)));
}

function getRSVPList() {
  try { return JSON.parse(localStorage.getItem('wedding_rsvp') || '[]'); } catch { return []; }
}

function renderRSVPList() {
  const container = document.getElementById('rsvp-list');
  if (!container) return;
  const list = getRSVPList();

  if (!list.length) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-soft);font-size:.8rem;padding:12px 0">Belum ada ucapan. Jadilah yang pertama! 🌿</p>';
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="rsvp-item">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span class="rsvp-item-name">${escHtml(item.name)}</span>
        <span class="rsvp-item-status ${item.attend === 'hadir' ? 'status-hadir' : 'status-tidak'}">
          ${item.attend === 'hadir' ? '✅ Hadir' : '🙏 Tidak Hadir'}
        </span>
      </div>
      ${item.message ? `<p class="rsvp-item-msg">"${escHtml(item.message)}"</p>` : ''}
    </div>
  `).join('');
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ════════════════════════════════════════════
   GIFT — Copy Rekening
════════════════════════════════════════════ */
function copyRek(btn) {
  const text = btn.dataset.copy;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✅ Tersalin!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
  }).catch(() => {
    /* Fallback */
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    btn.textContent = '✅ Tersalin!';
    setTimeout(() => { btn.textContent = 'Salin Nomor'; }, 2000);
  });
}

/* ════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════ */
function shake(el) {
  el.style.animation = 'none';
  el.offsetHeight; /* reflow */
  el.style.animation = 'shake .4s ease';
  el.addEventListener('animationend', () => el.style.animation = '', { once: true });
}

function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position:'fixed', bottom:'90px', left:'50%', transform:'translateX(-50%) translateY(20px)',
    background:'var(--forest)', color:'#fff', padding:'12px 24px',
    borderRadius:'50px', fontSize:'.82rem', fontFamily:'var(--font-body)',
    zIndex:'9999', opacity:'0', transition:'all .35s ease',
    whiteSpace:'nowrap', boxShadow:'0 4px 20px rgba(0,0,0,.2)',
    maxWidth:'calc(100vw - 40px)', textAlign:'center',
  });
  document.body.appendChild(t);
  requestAnimationFrame(() => {
    t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => t.remove(), 400);
  }, 3000);
}

/* Add shake keyframe dynamically */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes shake {
  0%,100%{transform:translateX(0)}
  20%{transform:translateX(-6px)}
  40%{transform:translateX(6px)}
  60%{transform:translateX(-4px)}
  80%{transform:translateX(4px)}
}`;
document.head.appendChild(shakeStyle);

/* ════════════════════════════════════════════
   INIT — DOM Ready
════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initOpening();
  initMusic();
  initCountdown();
  initRSVP();
  initBottomNav();
});

/* Expose copyRek globally (used inline onclick) */
window.copyRek = copyRek;
