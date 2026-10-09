// ============================================================
// BURGUNDY & GOLD — Old Money Editorial
// ============================================================

// ---- ENVELOPE INTRO — the signature opening.
// Pure CSS transitions; JS only toggles classes on a timed chain.
// Click/tap (or Enter/Space) anywhere on the overlay to open it.
// ★ BUYER: to remove the intro entirely, delete the #envelope-intro
// block in index.html AND this whole section here.
// ---------------------------------------------------------------------------
(function(){
  const intro = document.getElementById('envelope-intro');
  if (!intro) return;

  // Lock page scroll until the envelope is opened.
  document.body.classList.add('env-locked');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let opened = false;

  function dismiss(){
    intro.remove();
    document.body.classList.remove('env-locked');
  }

  function openEnvelope(){
    if (opened) return;
    opened = true;
    if (reduced) { dismiss(); return; }
    intro.classList.add('opened');                    // flap rotates open (rotateX 180deg), seal breaks
    setTimeout(() => intro.classList.add('flap-back'), 700);   // opened flap drops behind the letter plane
    setTimeout(() => intro.classList.add('letter-up'), 780);   // letter card slides up out of the envelope
    setTimeout(() => intro.classList.add('fading'), 2150);     // overlay fades out
    setTimeout(dismiss, 3050);                                 // remove from DOM, restore scroll
  }

  intro.addEventListener('click', openEnvelope);
  intro.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); }
  });
})();

// ---- Countdown to Saturday, September 18, 2027 at 4:00 PM (local) ----
// ★ BUYER: change the date/time below to your own wedding date.
const WEDDING_DATE = new Date('2027-09-18T16:00:00');
function pad2(n){ return String(n).padStart(2,'0'); }
function set(id, v){ document.getElementById(id).textContent = v; }
let timer;
function tick(){
  const now = new Date();
  let diff = Math.max(0, WEDDING_DATE - now); // ms remaining, never negative
  const d = Math.floor(diff / 864e5); diff -= d * 864e5;
  const h = Math.floor(diff / 36e5);  diff -= h * 36e5;
  const m = Math.floor(diff / 6e4);   diff -= m * 6e4;
  const s = Math.floor(diff / 1e3);
  set('d', d);
  set('h', pad2(h)); set('m', pad2(m)); set('s', pad2(s));
  if (WEDDING_DATE - now <= 0) {
    // The day has arrived — freeze the counters at zero.
    clearInterval(timer);
  }
}
tick();
timer = setInterval(tick, 1000);

// ---- Nav: shadow on scroll + mobile menu ----
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), {passive:true});
document.querySelector('.menu-btn').addEventListener('click', () =>
  document.querySelector('#nav .links').classList.toggle('open'));
document.querySelectorAll('#nav .links a').forEach(a =>
  a.addEventListener('click', () => document.querySelector('#nav .links').classList.remove('open')));

// ---- FAQ accordion (one open at a time) ----
document.querySelectorAll('.acc button').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement, was = item.classList.contains('open');
    document.querySelectorAll('.acc').forEach(x => x.classList.remove('open'));
    if (!was) item.classList.add('open');
  });
});

// ---- Gentle reveal on scroll ----
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
}, {threshold: 0.12});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---- Background music: plays ONLY when the guest taps the toggle.
// No autoplay — browsers block it anyway, and it is rude at a wedding. ----
const music = document.getElementById('wedding-music');
const musicBtn = document.getElementById('music-toggle');
const musicLabel = musicBtn.querySelector('.mt-label');
musicBtn.addEventListener('click', () => {
  if (music.paused) {
    music.play().then(() => {
      musicBtn.classList.add('playing');
      musicBtn.setAttribute('aria-label', 'Pause background music');
      musicLabel.textContent = 'Playing';
    }).catch(() => {
      // Audio could not start (e.g. missing file) — stay silent, no error shown.
      musicLabel.textContent = 'Unavailable';
    });
  } else {
    music.pause();
    musicBtn.classList.remove('playing');
    musicBtn.setAttribute('aria-label', 'Play background music');
    musicLabel.textContent = 'Music';
  }
});

// ---- RSVP → emailed to the couple via FormSubmit (free, no account).
// ★ BUYER: replace the address below with YOUR email, then open the site,
// submit the form once yourself, and click the activation link FormSubmit
// emails you. After that, every guest RSVP lands straight in your inbox.
// ---------------------------------------------------------------------------
const RSVP_EMAIL = "your@email.com";

const rsvpForm = document.getElementById('rsvp-form');
const rsvpDone = document.getElementById('rsvp-done');
const rsvpError = document.getElementById('rsvp-error');
const rsvpSubmit = document.getElementById('rsvp-submit');

function showRsvpDone(){
  rsvpForm.classList.add('hidden');
  rsvpError.classList.add('hidden');
  rsvpDone.classList.remove('hidden');
  rsvpDone.scrollIntoView({behavior:'smooth', block:'center'});
}
function showRsvpError(){
  rsvpError.classList.remove('hidden');
  rsvpError.scrollIntoView({behavior:'smooth', block:'center'});
}

rsvpForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!rsvpForm.checkValidity()) { rsvpForm.reportValidity(); return; }
  rsvpSubmit.disabled = true;
  rsvpSubmit.textContent = 'Sending…';
  rsvpError.classList.add('hidden');

  const data = Object.fromEntries(new FormData(rsvpForm).entries());
  data._subject = "New wedding RSVP — Vivienne & Alexander";

  fetch("https://formsubmit.co/ajax/" + RSVP_EMAIL, {
    method: "POST",
    headers: {"Content-Type": "application/json", "Accept": "application/json"},
    body: JSON.stringify(data)
  })
  .then(res => {
    if (!res.ok) throw new Error("bad response: " + res.status);
    return res.json();
  })
  .then(json => {
    // FormSubmit answers {success: true} when the message is accepted.
    if (json && json.success === true) {
      showRsvpDone();
    } else {
      showRsvpError(); // server answered, but did not confirm — treat as failure
    }
  })
  .catch(() => {
    showRsvpError(); // network failure — tell the guest, don't fake success
  })
  .finally(() => {
    // NOTE: success is NEVER shown here. Only the paths above decide.
    rsvpSubmit.disabled = false;
    rsvpSubmit.textContent = 'Send RSVP';
  });
});
