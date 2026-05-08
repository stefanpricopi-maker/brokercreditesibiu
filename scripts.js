/* ============================================================
   BrokerCrediteSibiu — scripts.js
   JavaScript comun pentru toate paginile
   ============================================================ */

/* ── FAQ Toggle ── */
function toggleFaq(el) {
  var icon = el.querySelector('.faq-icon');
  var ans  = el.nextElementSibling;
  var isOpen = ans.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach(function(a) { a.classList.remove('open'); });
  document.querySelectorAll('.faq-icon').forEach(function(i) { i.classList.remove('open'); });
  document.querySelectorAll('.faq-q').forEach(function(q) { q.setAttribute('aria-expanded', 'false'); });
  if (!isOpen) {
    ans.classList.add('open');
    icon.classList.add('open');
    el.setAttribute('aria-expanded', 'true');
  }
}

/* ── Cookie Banner ── */
function inchideCookie(choice) {
  var banner = document.getElementById('cookieBanner');
  if (banner) banner.style.display = 'none';
  try {
    var v = (choice === 'accept') ? 'accepted' : 'rejected';
    localStorage.setItem('cookie_consent', v);
    localStorage.setItem('cookie_consent_at', String(Date.now()));
  } catch(e) {}
}

/* Ascunde bannerul dacă utilizatorul a ales deja (accept/refuz) */
(function() {
  function hideIfConsented() {
    try {
      var consent = localStorage.getItem('cookie_consent');
      if (consent === 'accepted' || consent === 'rejected') {
        var banner = document.getElementById('cookieBanner');
        if (banner) banner.style.display = 'none';
      }
    } catch(e) {}
  }

  // banner-ul e injectat din `components.js` pe DOMContentLoaded,
  // deci verificăm și imediat, și după ce DOM-ul e gata.
  hideIfConsented();
  document.addEventListener('DOMContentLoaded', hideIfConsented);
})();

/* ── Modal Formular ── */
function deschideFormular() {
  scrollTo('contact');
}

/* ── Sanitizare input (elimină HTML/script tags) ── */
function sanitize(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/* ── Validare email format ── */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ── Validare telefon format (RO) ── */
function isValidPhone(phone) {
  return /^(\+40|0040|40|0)?7\d{8}$/.test(phone.replace(/[\s\-]/g, ''));
}

/* ── Anti-bot: verifică honeypot field ── */
function isBot() {
  var hp = document.getElementById('website_url');
  return hp && hp.value.length > 0;
}

/* ── Rate limiting simplu (max 3 trimiteri per sesiune) ── */
var _submitCount = 0;
function checkRateLimit() {
  _submitCount++;
  if (_submitCount > 3) {
    alert('Prea multe cereri. Te rog să mă contactezi direct la 0771 494 483.');
    return false;
  }
  return true;
}

function setFormError(msg) {
  var box = document.getElementById('formError');
  if (!box) { alert(msg); return; }
  box.textContent = msg;
  box.hidden = false;
}

function clearFormError() {
  var box = document.getElementById('formError');
  if (!box) return;
  box.textContent = '';
  box.hidden = true;
}

/* ── Trimitere Email ── */
function trimiteEmail() {
  if (isBot()) return;
  if (!checkRateLimit()) return;

  var nume    = sanitize((document.getElementById('fNume')    || {value:''}).value);
  var telefon = sanitize((document.getElementById('fTelefon') || {value:''}).value);
  var email   = sanitize((document.getElementById('fEmail')   || {value:''}).value);
  var oras    = sanitize((document.getElementById('fOras')    || {value:''}).value);
  var mesaj   = sanitize((document.getElementById('fMesaj')   || {value:''}).value);

  if (!nume || !telefon || !email) {
    alert('Te rugăm să completezi câmpurile obligatorii: Nume, Telefon și Email.');
    return;
  }
  if (!isValidEmail(email)) {
    alert('Te rugăm să introduci o adresă de email validă.');
    return;
  }
  if (!isValidPhone(telefon)) {
    alert('Te rugăm să introduci un număr de telefon valid (ex: 07xx xxx xxx).');
    return;
  }
  var body =
    'Cerere oferta credit%0A%0A' +
    'Nume: '     + encodeURIComponent(nume)            + '%0A' +
    'Telefon: '  + encodeURIComponent(telefon)         + '%0A' +
    'Email: '    + encodeURIComponent(email)           + '%0A' +
    'Oras: '     + encodeURIComponent(oras || '—')     + '%0A%0A' +
    'Mesaj: '    + encodeURIComponent(mesaj || '—');
  var subject = encodeURIComponent('Cerere oferta credit - ' + nume);
  window.location.href = 'mailto:dragos.pricopi@fin.imobiliare.ro?subject=' + subject + '&body=' + body;
  setTimeout(function() { window.location.href = 'thank-you.html'; }, 1500);
}

/* ── Trimitere formular Contact (versiunea extinsă) ── */
function trimiteFormular() {
  if (isBot()) return;
  if (!checkRateLimit()) return;
  clearFormError();

  var nume    = sanitize((document.getElementById('fNume')    || {value:''}).value);
  var prenume = sanitize((document.getElementById('fPrenume') || {value:''}).value);
  var telefon = sanitize((document.getElementById('fTelefon') || {value:''}).value);
  var email   = sanitize((document.getElementById('fEmail')   || {value:''}).value);
  var mesaj   = sanitize((document.getElementById('fMesaj')   || {value:''}).value);
  var gdpr    = document.getElementById('gdprCheck');

  if (!nume || !telefon || !email) {
    setFormError('Completează câmpurile obligatorii: Nume, Telefon și Email.');
    return;
  }
  if (!isValidEmail(email)) {
    setFormError('Introdu o adresă de email validă.');
    return;
  }
  if (!isValidPhone(telefon)) {
    setFormError('Introdu un număr de telefon valid (ex: 07xx xxx xxx).');
    return;
  }
  if (!mesaj) { setFormError('Adaugă un mesaj (câteva detalii despre situația ta).'); return; }
  if (gdpr && !gdpr.checked) {
    setFormError('Bifează acordul pentru Politica de confidențialitate ca să pot să te contactez.');
    return;
  }

  var form = document.getElementById('contactForm');
  if (form && typeof form.submit === 'function') {
    form.submit();
  }
}

/* ── Indicator program lucru (pagina Contact) ── */
(function() {
  var badge = document.getElementById('statusBadge');
  if (!badge) return;
  var now  = new Date();
  var day  = now.getDay();
  var time = now.getHours() * 60 + now.getMinutes();
  if (day >= 1 && day <= 5 && time >= 540 && time < 1080) {
    badge.style.display = 'inline-flex';
  }
})();

/* ── Scroll smooth spre secțiuni interne ── */
function scrollTo(id) {
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ============================================================
   FUNCȚIONALITĂȚI NOI — UX / CONVERSIE
   ============================================================ */

/* ── Meniu Hamburger Mobil ── */
function initHamburger() {
  var btn  = document.getElementById('hamburgerBtn');
  var menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  var lastFocus = null;

  function focusFirstInMenu() {
    var first = menu.querySelector('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (first) first.focus();
  }
  function setOpen(open) {
    menu.classList.toggle('open', open);
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    menu.hidden = !open;
    if (open) {
      lastFocus = document.activeElement;
      document.documentElement.style.overflow = 'hidden';
      setTimeout(focusFirstInMenu, 0);
    } else {
      document.documentElement.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus();
      } else {
        btn.focus();
      }
    }
  }
  btn.addEventListener('click', function() {
    var open = !menu.classList.contains('open');
    setOpen(open);
  });
  menu.addEventListener('click', function(e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (a) setOpen(false);
  });
  document.addEventListener('click', function(e) {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      setOpen(false);
    }
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') setOpen(false);
  });
}

/* ── Buton Înapoi Sus ── */
function initBackToTop() {
  var btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', function() {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── Sticky CTA Mobil — doar viewport îngust; offset deasupra cookie ── */
function initStickyCTA() {
  var cta    = document.getElementById('stickyCTAMobile');
  var cookie = document.getElementById('cookieBanner');
  if (!cta) return;

  function sync() {
    var narrow = window.matchMedia('(max-width: 700px)').matches;
    if (!narrow) {
      cta.setAttribute('hidden', '');
      cta.style.bottom = '';
      return;
    }
    cta.removeAttribute('hidden');
    if (cookie && cookie.style.display !== 'none' && getComputedStyle(cookie).display !== 'none') {
      cta.style.bottom = (cookie.offsetHeight + 8) + 'px';
    } else {
      cta.style.bottom = '';
    }
  }

  sync();
  window.addEventListener('resize', sync);
}

/* ── Social Proof Toast ── */
var SP_DATA = [
  { initiale: 'AM', oras: 'București',    actiune: 'a solicitat o consultație',   timp: 'acum 12 minute' },
  { initiale: 'RD', oras: 'Cluj-Napoca',  actiune: 'a calculat rata unui credit',  timp: 'acum 28 minute' },
  { initiale: 'BP', oras: 'Timișoara',    actiune: 'a trimis o cerere de ofertă',  timp: 'acum 41 minute' },
  { initiale: 'MV', oras: 'Brașov',       actiune: 'a solicitat o consultație',   timp: 'acum 1 oră' },
  { initiale: 'CS', oras: 'Iași',         actiune: 'a calculat rata unui credit',  timp: 'acum 2 ore' },
  { initiale: 'DP', oras: 'Sibiu',        actiune: 'a trimis o cerere de ofertă',  timp: 'acum 3 ore' },
];

function initSocialProof() {
  var toast = document.getElementById('socialProofToast');
  if (!toast) return;

  var idx = 0;
  function showNext() {
    var d = SP_DATA[idx % SP_DATA.length];
    idx++;
    var avatar = toast.querySelector('.sp-avatar');
    var text   = toast.querySelector('.sp-text');
    if (avatar) avatar.textContent = d.initiale;
    if (text) text.innerHTML =
      '<strong>' + d.initiale[0] + '. din ' + d.oras + '</strong> ' + d.actiune +
      ' <span class="sp-time">' + d.timp + '</span>';
    toast.classList.add('visible');
    setTimeout(function() { toast.classList.remove('visible'); }, 5000);
  }

  // Prima apariție după 8 secunde, apoi la fiecare 25 secunde
  setTimeout(function() {
    showNext();
    setInterval(showNext, 25000);
  }, 8000);
}

function inchideSocialProof() {
  var toast = document.getElementById('socialProofToast');
  if (toast) toast.classList.remove('visible');
}

/* ── Exit Intent Popup ── */
var _exitShown = false;
function initExitIntent() {
  var overlay = document.getElementById('exitOverlay');
  if (!overlay) return;

  try {
    if (sessionStorage.getItem('exit_shown')) _exitShown = true;
  } catch (e) {}

  function showExitOnce() {
    if (_exitShown) return;
    _exitShown = true;
    overlay.classList.add('active');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    try {
      sessionStorage.setItem('exit_shown', '1');
    } catch (e) {}
  }

  // Doar desktop: cursorul părăsește pagina pe sus (intent de închidere tab).
  // Scroll-ul mobil declanșa fals (ex. bounce la început de pagină).
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.documentElement.addEventListener('mouseleave', function(e) {
      if (e.clientY <= 0) showExitOnce();
    });
  }
}

function inchideExitPopup() {
  var overlay = document.getElementById('exitOverlay');
  if (overlay) overlay.classList.remove('active');
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
}

function trimiteExitForm() {
  var tel = document.getElementById('exitPhone');
  if (!tel || !tel.value.trim()) {
    tel.focus();
    return;
  }
  var phone = sanitize(tel.value.trim());
  if (!isValidPhone(phone)) {
    alert('Te rugăm să introduci un număr de telefon valid.');
    return;
  }
  window.location.href = 'mailto:dragos.pricopi@fin.imobiliare.ro' +
    '?subject=' + encodeURIComponent('Cerere callback rapid') +
    '&body=' + encodeURIComponent('Telefon: ' + phone + '\n\nVă rog să mă contactați pentru o consultație gratuită.');
  inchideExitPopup();
  gtag_event('exit_intent_submit');
}

/* ── Google Analytics 4 Event Tracking ── */
function gtag_event(action, params) {
  if (typeof gtag === 'function') {
    gtag('event', action, params || {});
  }
}

function initGA4Tracking() {
  // Click telefon
  document.querySelectorAll('a[href^="tel:"]').forEach(function(el) {
    el.addEventListener('click', function() {
      gtag_event('phone_click', { method: 'click' });
    });
  });
  // Click WhatsApp
  document.querySelectorAll('a[href*="wa.me"]').forEach(function(el) {
    el.addEventListener('click', function() {
      gtag_event('whatsapp_click');
    });
  });
  // Deschidere formular (scroll la Contact)
  document.querySelectorAll('[onclick="deschideFormular()"]').forEach(function(el) {
    el.addEventListener('click', function() {
      gtag_event('form_open');
    });
  });
  // Scroll depth (calcul stabil + mai ieftin pe scroll)
  var depths = [25, 50, 75, 90];
  var reached = {};
  var maxScroll = 0;
  function recomputeMaxScroll() {
    maxScroll = Math.max(1, (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight);
  }
  recomputeMaxScroll();
  window.addEventListener('resize', recomputeMaxScroll);
  window.addEventListener('scroll', function() {
    var pct = Math.round((window.scrollY / maxScroll) * 100);
    depths.forEach(function(d) {
      if (pct >= d && !reached[d]) {
        reached[d] = true;
        gtag_event('scroll_depth', { depth: d });
      }
    });
  }, { passive: true });
}

/* ── Init toate funcționalitățile la DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', function() {
  initHamburger();
  initBackToTop();
  initStickyCTA();
  // Premium-minimal: scoatem widget-urile agresive
  // initSocialProof();
  // initExitIntent();
  initGA4Tracking();
});
