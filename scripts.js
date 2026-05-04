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
  try {
    var consent = localStorage.getItem('cookie_consent');
    if (consent === 'accepted' || consent === 'rejected') {
      var banner = document.getElementById('cookieBanner');
      if (banner) banner.style.display = 'none';
    }
  } catch(e) {}
})();

/* ── Calculator Rate ── */
function calcRate() {
  var sumaEl = document.getElementById('suma');
  var aniEl  = document.getElementById('ani');
  var rataEl = document.getElementById('rata');
  if (!sumaEl || !aniEl || !rataEl) return;
  var suma = parseFloat(sumaEl.value) || 200000;
  var ani  = parseInt(aniEl.value)   || 20;
  var r = 0.065 / 12;
  var n = ani * 12;
  var rata = suma * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  rataEl.textContent = '~' + Math.round(rata).toLocaleString('ro-RO') + ' lei';
}

/* ── Modal Formular ── */
function deschideFormularDinCalculator() {
  var suma    = parseFloat(document.getElementById('suma').value) || 200000;
  var ani     = parseInt(document.getElementById('ani').value)    || 20;
  var rataText = document.getElementById('rata').textContent;
  var summary = document.getElementById('modalSummary');
  if (summary) {
    document.getElementById('summaryCredit').textContent = suma.toLocaleString('ro-RO') + ' lei';
    document.getElementById('summaryAni').textContent    = ani + ' ani';
    document.getElementById('summaryRata').textContent   = rataText + '/lună';
    summary.style.display = 'flex';
  }
  deschideModal();
}

function deschideFormular() {
  var summary = document.getElementById('modalSummary');
  if (summary) summary.style.display = 'none';
  deschideModal();
}

function deschideModal() {
  var fc = document.getElementById('formContent');
  var sm = document.getElementById('successMsg');
  var mo = document.getElementById('modalOverlay');
  if (fc) fc.style.display = 'block';
  if (sm) sm.style.display = 'none';
  if (mo) mo.classList.add('active');
}

function inchideModal() {
  var mo = document.getElementById('modalOverlay');
  if (mo) mo.classList.remove('active');
}

function inchideModalDacaFundal(e) {
  if (e.target === document.getElementById('modalOverlay')) inchideModal();
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
    alert('Prea multe cereri. Te rugăm să ne contactezi direct la 0771 494 483.');
    return false;
  }
  return true;
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
  var suma    = (document.getElementById('summaryCredit') || {textContent:'—'}).textContent;
  var ani     = (document.getElementById('summaryAni')    || {textContent:'—'}).textContent;
  var rata    = (document.getElementById('summaryRata')   || {textContent:'—'}).textContent;
  var body =
    'Cerere oferta credit%0A%0A' +
    'Nume: '     + encodeURIComponent(nume)            + '%0A' +
    'Telefon: '  + encodeURIComponent(telefon)         + '%0A' +
    'Email: '    + encodeURIComponent(email)           + '%0A' +
    'Oras: '     + encodeURIComponent(oras || '—')     + '%0A%0A' +
    'Detalii credit:%0A' +
    '- Valoare: '        + encodeURIComponent(suma)    + '%0A' +
    '- Perioada: '       + encodeURIComponent(ani)     + '%0A' +
    '- Rata estimata: '  + encodeURIComponent(rata)    + '%0A%0A' +
    'Mesaj: '    + encodeURIComponent(mesaj || '—');
  var subject = encodeURIComponent('Cerere oferta credit - ' + nume);
  window.location.href = 'mailto:dragos.pricopi@fin.imobiliare.ro?subject=' + subject + '&body=' + body;
  /* Redirect spre Thank You după trimitere */
  var fc = document.getElementById('formContent');
  var sm = document.getElementById('successMsg');
  if (fc) fc.style.display = 'none';
  if (sm) sm.style.display = 'block';
  setTimeout(function() { window.location.href = 'thank-you.html'; }, 1500);
}

/* ── Trimitere formular Contact (versiunea extinsă) ── */
function trimiteFormular() {
  if (isBot()) return;
  if (!checkRateLimit()) return;

  var nume    = sanitize((document.getElementById('fNume')    || {value:''}).value);
  var prenume = sanitize((document.getElementById('fPrenume') || {value:''}).value);
  var telefon = sanitize((document.getElementById('fTelefon') || {value:''}).value);
  var email   = sanitize((document.getElementById('fEmail')   || {value:''}).value);
  var mesaj   = sanitize((document.getElementById('fMesaj')   || {value:''}).value);
  var gdpr    = document.getElementById('gdprCheck');

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
  if (!mesaj) { alert('Te rugăm să adaugi un mesaj.'); return; }
  if (gdpr && !gdpr.checked) {
    alert('Te rugăm să accepți politica de confidențialitate pentru a continua.');
    return;
  }
  var oras    = (document.getElementById('fOras')    || {value:''}).value.trim();
  var subiect = (document.getElementById('fSubiect') || {value:''}).value;
  var numeComplet = prenume ? nume + ' ' + prenume : nume;
  var body =
    'Mesaj de pe pagina de Contact%0A%0A' +
    'Nume: '     + encodeURIComponent(numeComplet)       + '%0A' +
    'Telefon: '  + encodeURIComponent(telefon)           + '%0A' +
    'Email: '    + encodeURIComponent(email)             + '%0A' +
    'Oras: '     + encodeURIComponent(oras || '—')       + '%0A' +
    'Subiect: '  + encodeURIComponent(subiect || '—')    + '%0A%0A' +
    'Mesaj:%0A'  + encodeURIComponent(mesaj);
  var subject = encodeURIComponent('Contact website - ' + (subiect || 'Mesaj nou') + ' - ' + numeComplet);
  window.location.href = 'mailto:dragos.pricopi@fin.imobiliare.ro?subject=' + subject + '&body=' + body;
  var form = document.getElementById('contactForm');
  var sm   = document.getElementById('successMsg');
  if (form) form.style.display = 'none';
  if (sm)   sm.style.display   = 'block';
  setTimeout(function() { window.location.href = 'thank-you.html'; }, 1500);
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

/* Init calculator dacă există pe pagină */
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('rata')) calcRate();
});

/* ============================================================
   FUNCȚIONALITĂȚI NOI — UX / CONVERSIE
   ============================================================ */

/* ── Meniu Hamburger Mobil ── */
function initHamburger() {
  var btn  = document.getElementById('hamburgerBtn');
  var menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  function setOpen(open) {
    menu.classList.toggle('open', open);
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    menu.hidden = !open;
    if (open) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
  }
  btn.addEventListener('click', function() {
    var open = !menu.classList.contains('open');
    setOpen(open);
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

/* ── Sticky CTA Mobil — ascunde când cookie banner e vizibil ── */
function initStickyCTA() {
  var cta    = document.getElementById('stickyCTAMobile');
  var cookie = document.getElementById('cookieBanner');
  if (!cta) return;
  function update() {
    if (cookie && cookie.style.display !== 'none' && getComputedStyle(cookie).display !== 'none') {
      cta.style.bottom = (cookie.offsetHeight + 8) + 'px';
    } else {
      cta.style.bottom = '';
    }
  }
  update();
  window.addEventListener('resize', update);
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

  // Desktop: mouse iese din viewport
  document.addEventListener('mouseleave', function(e) {
    if (e.clientY <= 0 && !_exitShown) {
      _exitShown = true;
      overlay.classList.add('active');
      try { sessionStorage.setItem('exit_shown', '1'); } catch(e) {}
    }
  });

  // Mobil: scroll up rapid (semn că vor să plece)
  var lastY = 0, ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() {
        var y = window.scrollY;
        if (lastY - y > 80 && y < 200 && !_exitShown) {
          _exitShown = true;
          overlay.classList.add('active');
        }
        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Nu arăta dacă a fost deja arătat în această sesiune
  try {
    if (sessionStorage.getItem('exit_shown')) _exitShown = true;
  } catch(e) {}
}

function inchideExitPopup() {
  var overlay = document.getElementById('exitOverlay');
  if (overlay) overlay.classList.remove('active');
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
  // Deschidere modal formular
  var orig = window.deschideModal;
  window.deschideModal = function() {
    gtag_event('form_open');
    if (orig) orig();
  };
  // Scroll depth
  var depths = [25, 50, 75, 90];
  var reached = {};
  window.addEventListener('scroll', function() {
    var pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    depths.forEach(function(d) {
      if (pct >= d && !reached[d]) {
        reached[d] = true;
        gtag_event('scroll_depth', { depth: d });
      }
    });
  }, { passive: true });
}

/* ── Calculator Avansat ── */
function toggleCalcExtra() {
  var extra = document.getElementById('calcExtra');
  var btn   = document.getElementById('calcToggleBtn');
  if (!extra) return;
  var open = extra.classList.toggle('open');
  if (btn) btn.textContent = open ? '▲ Ascunde opțiuni avansate' : '▼ Opțiuni avansate (avans, tip dobândă)';
  calcRate();
}

function calcRate() {
  var sumaEl  = document.getElementById('suma');
  var aniEl   = document.getElementById('ani');
  var rataEl  = document.getElementById('rata');
  if (!sumaEl || !aniEl || !rataEl) return;

  var suma  = parseFloat(sumaEl.value) || 200000;
  var ani   = parseInt(aniEl.value)    || 20;

  // Opțiuni avansate
  var avansEl = document.getElementById('calcAvans');
  var tipEl   = document.getElementById('calcTipDob');
  var avans   = avansEl ? parseFloat(avansEl.value) || 0 : 0;
  var tipDob  = tipEl   ? tipEl.value : 'variabila';

  var dobanda = tipDob === 'fixa' ? 0.075 : 0.065; // 7.5% fixă, 6.5% variabilă
  var sumaCred = suma - avans;
  if (sumaCred <= 0) { rataEl.textContent = '—'; return; }

  var r = dobanda / 12;
  var n = ani * 12;
  var rata = sumaCred * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  rataEl.textContent = '~' + Math.round(rata).toLocaleString('ro-RO') + ' lei';

  // Actualizează summary avansat
  var summary = document.getElementById('calcSummary');
  if (summary && avansEl) {
    var totalDobanzi = (rata * n) - sumaCred;
    summary.innerHTML =
      'Credit: <strong>' + Math.round(sumaCred).toLocaleString('ro-RO') + ' lei</strong> · ' +
      'Dobândă: <strong>' + (dobanda * 100).toFixed(1) + '%</strong> (' + (tipDob === 'fixa' ? 'fixă' : 'variabilă IRCC') + ') · ' +
      'Total dobânzi estimate: <strong>' + Math.round(totalDobanzi).toLocaleString('ro-RO') + ' lei</strong>';
  }
}

/* ── Comparator Credite ── */
var BANCI_DATA = [
  { nume: 'Banca Transilvania', dob: 6.45, comision: 0,    asigurare: 0.20 },
  { nume: 'BCR',                dob: 6.70, comision: 0.50, asigurare: 0.18 },
  { nume: 'BRD',                dob: 6.85, comision: 0,    asigurare: 0.22 },
  { nume: 'ING Bank',           dob: 6.50, comision: 0,    asigurare: 0.15 },
  { nume: 'Raiffeisen',         dob: 6.65, comision: 0.30, asigurare: 0.20 },
  { nume: 'UniCredit',          dob: 6.90, comision: 0,    asigurare: 0.25 },
];

function updateComparator() {
  var sumaEl = document.getElementById('compSuma');
  var aniEl  = document.getElementById('compAni');
  var tipEl  = document.getElementById('compTip');
  var tbody  = document.getElementById('compTbody');
  if (!sumaEl || !tbody) return;

  var suma = parseFloat(sumaEl.value) || 200000;
  var ani  = parseInt(aniEl ? aniEl.value : 20) || 20;
  var tip  = tipEl ? tipEl.value : 'variabila';
  var n    = ani * 12;

  var rows = BANCI_DATA.map(function(b) {
    var dob = tip === 'fixa' ? b.dob + 0.5 : b.dob;
    var r   = dob / 100 / 12;
    var rata = suma * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    var dae  = dob + b.asigurare + (b.comision / ani);
    return { b: b, rata: Math.round(rata), dae: dae.toFixed(2) };
  });

  rows.sort(function(a, b) { return a.dae - b.dae; });
  var best = rows[0].b.nume;

  tbody.innerHTML = rows.map(function(r, i) {
    var isBest = i === 0;
    return '<tr' + (isBest ? ' class="best-row"' : '') + '>' +
      '<td>' + r.b.nume + (isBest ? '<span class="best-badge">Recomandat</span>' : '') + '</td>' +
      '<td><span class="comp-rata">' + r.rata.toLocaleString('ro-RO') + ' lei</span></td>' +
      '<td><span class="comp-dae">' + r.dae + '%</span></td>' +
      '<td>' + (r.b.comision > 0 ? r.b.comision + '%' : '0') + '</td>' +
      '</tr>';
  }).join('');
}

/* ── Init toate funcționalitățile la DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('rata')) calcRate();
  initHamburger();
  initBackToTop();
  initStickyCTA();
  initSocialProof();
  initExitIntent();
  initGA4Tracking();
  if (document.getElementById('compTbody')) updateComparator();
});
