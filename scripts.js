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

/* ── Google Analytics 4 — încărcat DOAR după consimțământ (GDPR) ── */
var GA_MEASUREMENT_ID = 'G-497TD3CWM4';

var _gaLoaded = false;
function incarcaAnalytics() {
  if (_gaLoaded) return;
  if (GA_MEASUREMENT_ID.indexOf('XXXX') !== -1) return; // ID neconfigurat încă
  _gaLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
  document.head.appendChild(s);

  // Conversie: ajungerea pe pagina de mulțumire = formular trimis
  if (window.location.pathname.indexOf('thank-you') !== -1) {
    gtag('event', 'generate_lead');
  }
}

/* Încarcă analytics la vizitele următoare, dacă userul a acceptat deja */
(function() {
  try {
    if (localStorage.getItem('cookie_consent') === 'accepted') incarcaAnalytics();
  } catch(e) {}
})();

/* ── Cookie Banner ── */
function inchideCookie(choice) {
  var banner = document.getElementById('cookieBanner');
  if (banner) banner.style.display = 'none';
  try {
    var v = (choice === 'accept') ? 'accepted' : 'rejected';
    localStorage.setItem('cookie_consent', v);
    localStorage.setItem('cookie_consent_at', String(Date.now()));
  } catch(e) {}
  if (choice === 'accept') incarcaAnalytics();
  window.dispatchEvent(new Event('floating-chrome-sync'));
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
function scrollToTop() {
  var root = document.scrollingElement || document.documentElement;
  try {
    root.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  } catch (e) {
    window.scrollTo(0, 0);
  }
}

function syncFloatingButtons() {
  var narrow = window.matchMedia('(max-width: 700px)').matches;
  var root = document.documentElement;

  if (!narrow) {
    root.style.removeProperty('--floating-base');
    return;
  }

  var base = 16;
  var sticky = document.getElementById('stickyCTAMobile');
  if (sticky && !sticky.hasAttribute('hidden')) {
    base += sticky.offsetHeight + 8;
  }

  root.style.setProperty('--floating-base', base + 'px');
}

function initBackToTop() {
  var btn = document.getElementById('backToTop');
  if (!btn || btn.dataset.bound === '1') return;
  btn.dataset.bound = '1';
  btn.type = 'button';

  function onScroll() {
    btn.classList.toggle('visible', window.scrollY > 400);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', syncFloatingButtons, { passive: true });
  window.addEventListener('floating-chrome-sync', syncFloatingButtons);

  btn.addEventListener('click', function(e) {
    e.preventDefault();
    scrollToTop();
  });

  syncFloatingButtons();
  onScroll();
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
    syncFloatingButtons();
  }

  sync();
  window.addEventListener('resize', sync);
  window.addEventListener('floating-chrome-sync', sync);
}

/* ── Social Proof Toast ── */
var SP_DATA = [
  { initiale: 'AM', oras: 'București',    actiune: 'a solicitat o consultare',   timp: 'acum 12 minute' },
  { initiale: 'RD', oras: 'Cluj-Napoca',  actiune: 'a calculat rata unui credit',  timp: 'acum 28 minute' },
  { initiale: 'BP', oras: 'Timișoara',    actiune: 'a trimis o cerere de ofertă',  timp: 'acum 41 minute' },
  { initiale: 'MV', oras: 'Brașov',       actiune: 'a solicitat o consultare',   timp: 'acum 1 oră' },
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
    '&body=' + encodeURIComponent('Telefon: ' + phone + '\n\nVă rog să mă contactați pentru o consultare gratuită.');
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

/* ── Google Reviews ── */
function renderStars(rating) {
  var value = Math.max(0, Math.min(5, Number(rating) || 0));
  var full = Math.round(value);
  var html = '';
  for (var i = 1; i <= 5; i++) {
    html += '<span aria-hidden="true">' + (i <= full ? '★' : '☆') + '</span>';
  }
  return html;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getReviewInitials(name) {
  var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'G';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function injectGoogleReviewSchema(data) {
  if (!data || !data.rating || !data.reviewCount || !data.reviews || !data.reviews.length) return;

  var payload = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://www.brokercreditesibiu.ro/#business',
    'name': data.placeName || 'BrokerCrediteSibiu',
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': String(data.rating),
      'reviewCount': String(data.reviewCount),
      'bestRating': '5',
      'worstRating': '1'
    },
    'review': data.reviews.slice(0, 10).map(function(review) {
      var item = {
        '@type': 'Review',
        'author': { '@type': 'Person', 'name': review.author || 'Client Google' },
        'reviewRating': {
          '@type': 'Rating',
          'ratingValue': String(review.rating),
          'bestRating': '5',
          'worstRating': '1'
        },
        'reviewBody': review.text
      };
      if (review.date) item.datePublished = review.date;
      return item;
    })
  };

  var existing = document.getElementById('google-reviews-schema');
  if (existing) existing.remove();

  var script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'google-reviews-schema';
  script.textContent = JSON.stringify(payload);
  document.head.appendChild(script);
}

function sortReviewsByDate(reviews, limit) {
  var max = limit || 10;
  return reviews.slice().sort(function(a, b) {
    var ta = a.date ? Date.parse(a.date) : 0;
    var tb = b.date ? Date.parse(b.date) : 0;
    return tb - ta;
  }).slice(0, max);
}

function initGoogleReviewsCarousel(root) {
  var track = root.querySelector('.google-reviews-track');
  var prev = root.querySelector('.google-reviews-nav--prev');
  var next = root.querySelector('.google-reviews-nav--next');
  if (!track || !prev || !next) return;

  function scrollByCard(direction) {
    var card = track.querySelector('.google-review-card');
    var gap = 14;
    var amount = card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.85;
    track.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  function updateNav() {
    var maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    var atStart = track.scrollLeft <= 4;
    var atEnd = track.scrollLeft >= maxScroll - 4;
    prev.disabled = atStart;
    next.disabled = atEnd;
    prev.classList.toggle('is-hidden', maxScroll <= 0);
    next.classList.toggle('is-hidden', maxScroll <= 0);
  }

  prev.addEventListener('click', function() { scrollByCard(-1); });
  next.addEventListener('click', function() { scrollByCard(1); });
  track.addEventListener('scroll', updateNav, { passive: true });
  window.addEventListener('resize', updateNav);
  updateNav();
}

function renderGoogleReviews(data) {
  var root = document.getElementById('googleReviews');
  if (!root) return;

  var mapsUrl = data.mapsUrl || 'https://maps.google.com/?q=Str.+Zaharia+Boiu+nr.+2+Sibiu';
  var writeUrl = data.writeReviewUrl;
  var reviews = sortReviewsByDate(Array.isArray(data.reviews) ? data.reviews : [], data.reviewsLimit || 10);
  var hasRating = data.rating && data.reviewCount;

  if (!reviews.length && !hasRating) {
    root.innerHTML =
      '<div class="google-reviews-empty">' +
        '<p>Încă nu avem recenzii afișate pe Google. Dacă ai lucrat cu mine, o recenzie de la tine mă ajută enorm să ajung la mai mulți oameni care caută un broker de încredere.</p>' +
        (writeUrl
          ? '<div class="google-reviews-actions" style="justify-content:center">' +
              '<a class="btn-review-primary" href="' + escapeHtml(writeUrl) + '" target="_blank" rel="noopener noreferrer">Lasă prima recenzie pe Google</a>' +
            '</div>'
          : '<div class="google-reviews-actions" style="justify-content:center">' +
              '<a href="' + escapeHtml(mapsUrl) + '" target="_blank" rel="noopener noreferrer">Deschide profilul pe Google Maps</a>' +
            '</div>') +
        '<p class="google-reviews-badge" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>' +
          'Recenzii Google Business Profile' +
        '</p>' +
      '</div>';
    return;
  }

  var summaryHtml =
    '<div class="google-reviews-summary">' +
      '<div class="google-reviews-score">' +
        '<div class="google-reviews-value" aria-hidden="true">' + escapeHtml(data.rating.toFixed(1)) + '</div>' +
        '<div class="google-reviews-meta">' +
          '<div class="google-reviews-stars" aria-label="Rating ' + escapeHtml(data.rating) + ' din 5">' + renderStars(data.rating) + '</div>' +
          '<p><strong>' + escapeHtml(String(data.reviewCount)) + '</strong> recenzii pe Google</p>' +
          '<p>' + escapeHtml(data.placeName || 'BrokerCrediteSibiu') + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="google-reviews-actions">' +
        '<a href="' + escapeHtml(mapsUrl) + '" target="_blank" rel="noopener noreferrer">Vezi pe Google Maps</a>' +
        (writeUrl ? '<a class="btn-review-primary" href="' + escapeHtml(writeUrl) + '" target="_blank" rel="noopener noreferrer">Lasă o recenzie</a>' : '') +
      '</div>' +
    '</div>';

  var cardsHtml = reviews.map(function(review) {
    var avatar = review.photo
      ? '<img class="google-review-avatar" src="' + escapeHtml(review.photo) + '" alt="" width="40" height="40" loading="lazy" decoding="async"/>'
      : '<span class="google-review-avatar" aria-hidden="true">' + escapeHtml(getReviewInitials(review.author)) + '</span>';

    return '<article class="google-review-card">' +
      '<div class="google-review-head">' +
        avatar +
        '<div>' +
          '<p class="google-review-author">' + escapeHtml(review.author) + '</p>' +
          (review.relative ? '<p class="google-review-time">' + escapeHtml(review.relative) + '</p>' : '') +
        '</div>' +
      '</div>' +
      '<div class="google-reviews-stars" aria-label="Rating ' + escapeHtml(review.rating) + ' din 5">' + renderStars(review.rating) + '</div>' +
      '<p class="google-review-text">' + escapeHtml(review.text) + '</p>' +
    '</article>';
  }).join('');

  root.innerHTML = summaryHtml +
    (cardsHtml
      ? '<div class="google-reviews-carousel">' +
          '<button type="button" class="google-reviews-nav google-reviews-nav--prev" aria-label="Recenzia anterioară">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>' +
          '</button>' +
          '<div class="google-reviews-track" tabindex="0" role="region" aria-label="Recenzii clienți">' +
            '<div class="google-reviews-track-inner">' + cardsHtml + '</div>' +
          '</div>' +
          '<button type="button" class="google-reviews-nav google-reviews-nav--next" aria-label="Recenzia următoare">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>' +
          '</button>' +
        '</div>'
      : '') +
    '<p class="google-reviews-badge" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>' +
      (reviews.length
        ? 'Afișăm ' + reviews.length + ' recenzii recente de pe Google' +
          (data.source === 'gbp' ? ' (Business Profile)' : '')
        : 'Recenzii preluate de pe Google') +
    '</p>';

  if (cardsHtml) initGoogleReviewsCarousel(root);
  injectGoogleReviewSchema(Object.assign({}, data, { reviews: reviews }));
}

var GOOGLE_REVIEWS_FALLBACK = {
  ok: true,
  configured: false,
  rating: null,
  reviewCount: 0,
  placeName: 'BrokerCrediteSibiu',
  mapsUrl: 'https://maps.google.com/?q=Str.+Zaharia+Boiu+nr.+2+Sibiu',
  writeReviewUrl: null,
  reviews: [],
  source: 'inline'
};

function fetchReviewsJson(url, timeoutMs) {
  var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  var timer = controller ? setTimeout(function() { controller.abort(); }, timeoutMs || 8000) : null;

  return fetch(url, {
    credentials: 'same-origin',
    signal: controller ? controller.signal : undefined
  }).then(function(res) {
    if (!res.ok) throw new Error('http_' + res.status);
    return res.json();
  }).finally(function() {
    if (timer) clearTimeout(timer);
  });
}

function loadGoogleReviewsData() {
  var urls = [
    'google-reviews.php',
    'data/google-reviews.json',
    '/google-reviews.php',
    '/data/google-reviews.json'
  ];

  function tryNext(index) {
    if (index >= urls.length) {
      return Promise.reject(new Error('all_sources_failed'));
    }
    return fetchReviewsJson(urls[index]).catch(function() {
      return tryNext(index + 1);
    });
  }

  return tryNext(0);
}

function initThankYouReviewLink() {
  var link = document.getElementById('thankyouReviewLink');
  if (!link) return;

  var mapsFallback = 'https://maps.google.com/?q=Str.+Zaharia+Boiu+nr.+2+Sibiu';

  loadGoogleReviewsData()
    .then(function(data) {
      if (data && data.writeReviewUrl) {
        link.href = data.writeReviewUrl;
      } else if (data && data.mapsUrl) {
        link.href = data.mapsUrl;
      }
    })
    .catch(function() {
      link.href = mapsFallback;
    });

  link.addEventListener('click', function() {
    gtag_event('google_review_click', { page: 'thank_you' });
  });
}

function fetchGoogleReviews() {
  var root = document.getElementById('googleReviews');
  if (!root) return;

  renderGoogleReviews(GOOGLE_REVIEWS_FALLBACK);

  loadGoogleReviewsData()
    .then(function(data) {
      if (!data || data.ok === false) throw new Error('invalid_payload');
      renderGoogleReviews(data);
    })
    .catch(function() {
      renderGoogleReviews(GOOGLE_REVIEWS_FALLBACK);
    });
}

/* ── Init toate funcționalitățile la DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', function() {
  initHamburger();
  initBackToTop();
  initStickyCTA();
  fetchGoogleReviews();
  initThankYouReviewLink();
  // Premium-minimal: scoatem widget-urile agresive
  // initSocialProof();
  // initExitIntent();
  initGA4Tracking();
});
