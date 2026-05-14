'use strict';

const App = {
  musicPlaying: false,
  opened: false,
  weddingDate: new Date('2026-06-12T08:00:00'),
};

const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyVgVBFWl2XJxgr51diPo6mwNUL_srSEI9pc-cgQxLGTTrUxmrnqO4K2hdsKZVujyMX/exec';

function initOpening() {
  const btn = document.getElementById('btn-open');
  const opening = document.getElementById('opening');
  const main = document.getElementById('main');
  const musicBtn = document.getElementById('btn-music');
  const nav = document.getElementById('bottom-nav');

  if (!btn || !opening || !main) return;

  btn.addEventListener('click', () => {
    if (App.opened) return;
    App.opened = true;
    opening.classList.add('fade-out');

    setTimeout(() => {
      opening.style.display = 'none';
      main.classList.remove('main-hidden');
      main.classList.add('main-visible');
      main.removeAttribute('aria-hidden');
      document.body.classList.remove('body-locked');

      if (musicBtn) musicBtn.style.display = 'flex';
      if (nav) nav.classList.remove('nav-hidden');

      tryPlayMusic();
      initScrollReveal();
      initBottomNav();
    }, 900);
  });
}

function initMusic() {
  const btn = document.getElementById('btn-music');
  const audio = document.getElementById('bg-music');
  const icon = document.getElementById('music-icon');

  if (!btn || !audio) return;

  if (icon) icon.textContent = '♪';
  btn.addEventListener('click', () => toggleMusic(audio, btn, icon));
}

function toggleMusic(audio, btn, icon) {
  if (App.musicPlaying) {
    audio.pause();
    App.musicPlaying = false;
    if (btn) btn.classList.remove('playing');
    if (icon) icon.textContent = '♪';
    return;
  }

  audio.play().then(() => {
    App.musicPlaying = true;
    if (btn) btn.classList.add('playing');
    if (icon) icon.textContent = '♪';
  }).catch(() => {
    if (icon) icon.textContent = '♪';
  });
}

function tryPlayMusic() {
  const audio = document.getElementById('bg-music');
  const btn = document.getElementById('btn-music');
  const icon = document.getElementById('music-icon');

  if (!audio) return;

  audio.volume = 0.5;
  audio.play().then(() => {
    App.musicPlaying = true;
    if (btn) btn.classList.add('playing');
    if (icon) icon.textContent = '♪';
  }).catch(() => {});
}

function initCountdown() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  const now = new Date();
  const diff = App.weddingDate - now;
  const note = document.getElementById('cd-note');

  if (diff <= 0) {
    setCD('cd-days', '00');
    setCD('cd-hours', '00');
    setCD('cd-mins', '00');
    setCD('cd-secs', '00');
    if (note) note.textContent = 'Hari bahagia telah tiba.';
    return;
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  setCD('cd-days', pad(days));
  setCD('cd-hours', pad(hours));
  setCD('cd-mins', pad(mins));
  setCD('cd-secs', pad(secs));

  if (note) note.textContent = days <= 7 ? `Tinggal ${days} hari lagi.` : '';
}

function setCD(id, val) {
  const el = document.getElementById(id);
  if (el && el.textContent !== val) el.textContent = val;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach((el) => observer.observe(el));
}

function initBottomNav() {
  const links = Array.from(document.querySelectorAll('.nav-item[data-section]'));
  if (!links.length) return;

  const sections = [...new Set(links.map((link) => link.dataset.section))];

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(link.dataset.section);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const updateActive = () => {
    let current = sections[0] || '';
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 140) current = id;
    });

    links.forEach((link) => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  };

  updateActive();
  window.addEventListener('scroll', updateActive, { passive: true });
}

function initRSVP() {
  const form = document.getElementById('rsvp-form');
  if (!form) return;
  const submitBtn = document.getElementById('btn-rsvp-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.querySelector('#rsvp-name').value.trim();
    const status = form.querySelector('input[name="attend"]:checked')?.value || 'hadir';
    const message = form.querySelector('#rsvp-msg').value.trim();

    if (!name) {
      shake(form.querySelector('#rsvp-name'));
      return;
    }

    setSubmitting(submitBtn, true);

    try {
      await submitRSVP({ name, status, message });
      saveRSVP({ name, status, message, time: Date.now() });
      form.reset();
      showToast('Terima kasih! RSVP Anda telah terkirim.');
    } catch (error) {
      console.error('Gagal mengirim RSVP:', error);
      showToast('RSVP gagal dikirim. Coba lagi sebentar.');
    } finally {
      setSubmitting(submitBtn, false);
    }
  });
}

async function submitRSVP(payload) {
  await fetch(RSVP_ENDPOINT, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify(payload),
  });
}

function saveRSVP(entry) {
  const list = getRSVPList();
  list.unshift(entry);
  localStorage.setItem('wedding_rsvp', JSON.stringify(list.slice(0, 50)));
}

function getRSVPList() {
  try {
    return JSON.parse(localStorage.getItem('wedding_rsvp') || '[]');
  } catch {
    return [];
  }
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function copyRek(btn) {
  const text = btn.dataset.copy;
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    const original = btn.textContent;
    btn.textContent = 'Tersalin';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btn.textContent = 'Tersalin';
    setTimeout(() => {
      btn.textContent = 'Salin Nomor';
    }, 2000);
  });
}

function shake(el) {
  if (!el) return;
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake .4s ease';
  el.addEventListener('animationend', () => {
    el.style.animation = '';
  }, { once: true });
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '92px',
    left: '50%',
    transform: 'translateX(-50%) translateY(20px)',
    background: 'var(--green)',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '999px',
    fontSize: '.78rem',
    fontFamily: 'var(--font-body)',
    zIndex: '9999',
    opacity: '0',
    transition: 'all .35s ease',
    whiteSpace: 'nowrap',
    boxShadow: '0 8px 24px rgba(0,0,0,.18)',
    maxWidth: 'calc(100vw - 40px)',
    textAlign: 'center',
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 350);
  }, 2600);
}

function setSubmitting(btn, isSubmitting) {
  if (!btn) return;
  btn.disabled = isSubmitting;
  btn.textContent = isSubmitting ? 'Mengirim...' : 'Kirim';
  btn.style.opacity = isSubmitting ? '.75' : '1';
  btn.style.cursor = isSubmitting ? 'wait' : 'pointer';
}

const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}`;
document.head.appendChild(shakeStyle);

document.addEventListener('DOMContentLoaded', () => {
  initOpening();
  initMusic();
  initCountdown();
  initRSVP();
});

window.copyRek = copyRek;
