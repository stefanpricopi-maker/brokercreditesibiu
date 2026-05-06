/* ============================================================
   BrokerCrediteSibiu — components.js
   Injectează dinamic: SVG symbols, nav, footer, cookie banner
   ============================================================ */

(function() {

  /* ── Config site ── */
  var PHONE     = '+40771494483';
  var PHONE_DISPLAY = '0771 494 483';
  var WA_URL    = 'https://wa.me/40771494483?text=Bun%C4%83%20ziua%2C%20sunt%20interesat%20de%20o%20consulta%C8%9Bie%20gratuit%C4%83.';

  /* ── Detectează pagina activă ── */
  var path = window.location.pathname.split('/').pop() || 'index.html';

  function isActive(href) {
    if (href === 'index.html' && (path === '' || path === 'index.html')) {
      return ' class="active" aria-current="page"';
    }
    return path === href ? ' class="active" aria-current="page"' : '';
  }

  /* ── SVG Symbols (WhatsApp + iconițe comune) ── */
  var SVG_DEFS = [
    '<svg class="svg-defs" xmlns="http://www.w3.org/2000/svg" width="0" height="0" focusable="false" aria-hidden="true">',
    '  <defs>',
    '    <symbol id="icon-wa" viewBox="0 0 24 24">',
    '      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>',
    '    </symbol>',
    '    <symbol id="icon-phone" viewBox="0 0 24 24">',
    '      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" fill="none" stroke="currentColor" stroke-width="2"/>',
    '    </symbol>',
    '    <symbol id="icon-home" viewBox="0 0 24 24">',
    '      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2"/>',
    '    </symbol>',
    '    <symbol id="icon-shield" viewBox="0 0 24 24">',
    '      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" stroke-width="2"/>',
    '    </symbol>',
    '    <symbol id="icon-clock" viewBox="0 0 24 24">',
    '      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>',
    '      <polyline points="12 6 12 12 16 14" fill="none" stroke="currentColor" stroke-width="2"/>',
    '    </symbol>',
    '    <symbol id="icon-check" viewBox="0 0 24 24">',
    '      <polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" stroke-width="2"/>',
    '    </symbol>',
    '    <symbol id="icon-globe" viewBox="0 0 24 24">',
    '      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>',
    '      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2"/>',
    '      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="none" stroke="currentColor" stroke-width="2"/>',
    '    </symbol>',
    '    <symbol id="icon-user" viewBox="0 0 24 24">',
    '      <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/>',
    '      <path d="M6 20v-2a6 6 0 0 1 12 0v2" fill="none" stroke="currentColor" stroke-width="2"/>',
    '    </symbol>',
    '  </defs>',
    '</svg>'
  ].join('\n');

  /* ── Nav HTML ── */
  /* Nav homepage (cu buton formular) vs nav pagini secundare (cu link-uri) */
  var isHomepage = (path === 'index.html' || path === '');

  var NAV_CTA = isHomepage
    ? '<button class="nav-cta" aria-label="Programează o consultație gratuită" onclick="deschideFormular()">Consultație gratuită</button>'
    : '<a class="nav-cta" href="index.html#contact" aria-label="Programează o consultație gratuită">Consultație gratuită</a>';

  var NAV_LOGO = isHomepage
    ? '<div class="nav-logo" aria-label="BrokerCrediteSibiu">Broker<span>Credite</span>Sibiu</div>'
    : '<a class="nav-logo" href="index.html" aria-label="BrokerCrediteSibiu — Acasă">Broker<span>Credite</span>Sibiu</a>';

  var NAV_HTML = [
    '<nav class="nav" role="navigation" aria-label="Navigație principală">',
    '  <div class="nav-inner">',
    '    ' + NAV_LOGO,
    '    <div class="nav-links">',
    '      <a href="index.html"' + isActive('index.html') + '>Acasă</a>',
    '      <a href="index.html#servicii">Servicii</a>',
    '      <a href="index.html#despre-mine">Despre mine</a>',
    '      <a href="index.html#contact">Contact</a>',
    '    </div>',
    '    <button class="hamburger" id="hamburgerBtn" type="button" aria-label="Deschide meniul" aria-controls="mobileMenu" aria-expanded="false">',
    '      <span class="hamburger-line" aria-hidden="true"></span>',
    '      <span class="hamburger-line" aria-hidden="true"></span>',
    '      <span class="hamburger-line" aria-hidden="true"></span>',
    '    </button>',
    '    <div class="nav-right">',
    '      <div class="nav-phone">',
    '        <a href="tel:' + PHONE + '" aria-label="Sună la ' + PHONE_DISPLAY + '">📞 ' + PHONE_DISPLAY + '</a>',
    '      </div>',
    '      ' + NAV_CTA,
    '    </div>',
    '  </div>',
    '</nav>'
  ].join('\n');

  /* ── Footer HTML ── */
  var FOOTER_HTML = [
    '<footer class="footer" role="contentinfo">',
    '  <div class="container">',
    '    <div class="footer-top">',
    '      <div class="footer-col">',
    '        <h4>BrokerCrediteSibiu</h4>',
    '        <p>Broker de credite imobiliare autorizat, activ în toată România.</p>',
    '        <div class="social-links">',
    '          <span class="social-btn" title="Facebook" aria-label="Facebook (în curând)" aria-disabled="true">f</span>',
    '          <span class="social-btn" title="Instagram" aria-label="Instagram (în curând)" aria-disabled="true">in</span>',
    '          <span class="social-btn" title="LinkedIn" aria-label="LinkedIn (în curând)" aria-disabled="true">li</span>',
    '        </div>',
    '      </div>',
    '      <div class="footer-col">',
    '        <h4>Contact</h4>',
    '        <a href="tel:' + PHONE + '" aria-label="Sună la ' + PHONE_DISPLAY + '">📞 ' + PHONE_DISPLAY + '</a>',
    '        <a href="mailto:dragos.pricopi@fin.imobiliare.ro">dragos.pricopi@fin.imobiliare.ro</a>',
    '        <a href="' + WA_URL + '" target="_blank" rel="noopener" aria-label="Scrie pe WhatsApp">WhatsApp</a>',
    '        <p class="footer-address">Str. Zaharia Boiu nr. 2, Sibiu</p>',
    '      </div>',
    '      <div class="footer-col">',
    '        <h4>Servicii</h4>',
'        <a href="index.html#servicii">Toate serviciile</a>',
  '        <a href="credit-ipotecar.html">Credit ipotecar</a>',
  '        <a href="refinantare.html">Refinanțare</a>',
  '        <a href="noua-casa.html">Noua Casă</a>',
  '        <a href="credit-cu-ipoteca.html">Credit cu ipotecă</a>',
    '      </div>',
    '      <div class="footer-col">',
    '        <h4>Resurse</h4>',
  '        <a href="index.html#contact">Contact</a>',
  '        <a href="index.html#contact">Consultație gratuită</a>',
  '        <a href="index.html#contact">Contact</a>',
    '      </div>',
    '    </div>',
    '    <div class="footer-bottom">',
    '      <span class="footer-copy">© 2025 BrokerCrediteSibiu. Toate drepturile rezervate.</span>',
    '      <div class="footer-legal">',
    '        <a href="politica-confidentialitate.html">Politica de confidențialitate</a>',
    '        <a href="politica-confidentialitate.html#gdpr">GDPR</a>',
    '        <a href="cookies.html">Cookies</a>',
    '      </div>',
    '    </div>',
    '  </div>',
    '</footer>'
  ].join('\n');

  /* ── Cookie Banner HTML ── */
  var COOKIE_HTML = [
    '<div class="cookie-banner" id="cookieBanner" role="dialog" aria-label="Politica de cookies">',
    '  <p>Folosim cookie-uri pentru a îmbunătăți experiența pe site. Prin continuarea navigării ești de acord cu',
    '    <a href="cookies.html">Politica de cookie-uri</a> și',
    '    <a href="politica-confidentialitate.html">Politica de confidențialitate</a>.',
    '  </p>',
    '  <div class="cookie-btns">',
    '    <button class="cookie-reject" onclick="inchideCookie(\'reject\')" aria-label="Refuză cookie-urile neesențiale">Refuz</button>',
    '    <button class="cookie-accept" onclick="inchideCookie(\'accept\')" aria-label="Acceptă cookie-urile">Accept</button>',
    '  </div>',
    '</div>'
  ].join('\n');

  /* ── Inject în DOM ── */
  document.addEventListener('DOMContentLoaded', function() {

    /* Favicon */
    if (!document.querySelector('link[rel="icon"], link[rel="shortcut icon"]')) {
      document.head.insertAdjacentHTML('beforeend',
        '<link rel="icon" href="favicon.svg" type="image/svg+xml"/>'
      );
    }

    /* SVG defs — înainte de orice */
    var svgDiv = document.createElement('div');
    svgDiv.innerHTML = SVG_DEFS;
    document.body.insertBefore(svgDiv.firstChild, document.body.firstChild);

    /* Nav — înlocuiește placeholder-ul sau inserează la început */
    var navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
      navPlaceholder.outerHTML = NAV_HTML;
    } else {
      var skipLink = document.querySelector('.skip-link');
      var insertAfter = skipLink || document.body.firstChild;
      var navDiv = document.createElement('div');
      navDiv.innerHTML = NAV_HTML;
      if (skipLink) {
        skipLink.insertAdjacentHTML('afterend', NAV_HTML);
      } else {
        document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
      }
    }

    /* Footer — înlocuiește placeholder sau inserează înainte de </body> */
    var footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
      footerPlaceholder.outerHTML = FOOTER_HTML;
    } else {
      /* Inserează înaintea cookie banner sau la final */
      var cookiePlaceholder = document.getElementById('cookie-placeholder');
      if (cookiePlaceholder) {
        cookiePlaceholder.insertAdjacentHTML('beforebegin', FOOTER_HTML);
      } else {
        document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);
      }
    }

    /* Cookie Banner */
    var cookiePlaceholder = document.getElementById('cookie-placeholder');
    if (cookiePlaceholder) {
      cookiePlaceholder.outerHTML = COOKIE_HTML;
    } else {
      document.body.insertAdjacentHTML('beforeend', COOKIE_HTML);
    }

    /* Sticky CTA, Back to Top, Social Proof, Exit Popup */
    var STICKY_CTA = `
  <!-- Sticky CTA Mobil -->
  <div class="sticky-cta-mobile" id="stickyCTAMobile" role="complementary" aria-label="Contact rapid">
    <a class="scm-phone" href="tel:+40771494483" aria-label="Sună la 0771 494 483">📞 Sună acum</a>
    <a class="scm-wa" href="https://wa.me/40771494483?text=Bun%C4%83%20ziua%2C%20sunt%20interesat%20de%20o%20consulta%C8%9Bie%20gratuit%C4%83." target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
      <svg class="scm-wa-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      WhatsApp
    </a>
  </div>`;
    var BACK_TO_TOP = `
  <!-- Buton Înapoi Sus -->
  <button class="back-to-top" id="backToTop" aria-label="Înapoi la începutul paginii">
    <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>
  </button>`;
    var SOCIAL_PROOF = `
  <!-- Social Proof Toast -->
  <div class="social-proof-toast" id="socialProofToast" role="status" aria-live="polite">
    <div class="sp-avatar" aria-hidden="true">AM</div>
    <div class="sp-text">
      <strong>A. din București</strong> a solicitat o consultație
      <span class="sp-time">acum 12 minute</span>
    </div>
    <button class="sp-close" onclick="inchideSocialProof()" aria-label="Închide notificarea">×</button>
  </div>`;
    var EXIT_POPUP = `
  <!-- Exit Intent Popup -->
  <div class="exit-overlay" id="exitOverlay" role="dialog" aria-modal="true" aria-labelledby="exitTitle" onclick="if(event.target===this)inchideExitPopup()">
    <div class="exit-popup">
      <button class="exit-popup-close" onclick="inchideExitPopup()" aria-label="Închide">✕</button>
      <div class="exit-emoji" aria-hidden="true">🏠</div>
      <span class="exit-badge">✓ Consultație 100% gratuită</span>
      <h3 id="exitTitle">Înainte să pleci...</h3>
      <p>Lasă-mi numărul de telefon și te sun în maxim 30 de minute cu o analiză personalizată. Fără obligații.</p>
      <div class="exit-form">
        <input type="tel" id="exitPhone" placeholder="07xx xxx xxx" aria-label="Număr de telefon"/>
        <button onclick="trimiteExitForm()">Sună-mă</button>
      </div>
      <span class="exit-skip" onclick="inchideExitPopup()" role="button" tabindex="0">Nu mulțumesc, plec fără consultație</span>
    </div>
  </div>`;
    var GA4 = `
  <!-- Google Analytics 4 — înlocuiți G-XXXXXXXX cu ID-ul vostru -->
  <!-- <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXX', {
      page_title: document.title,
      page_location: window.location.href
    });
  </script> -->`;

    document.body.insertAdjacentHTML('beforeend', STICKY_CTA);
    document.body.insertAdjacentHTML('beforeend', BACK_TO_TOP);
    // Premium-minimal: scoatem widget-urile agresive (social proof + exit intent)
    // document.body.insertAdjacentHTML('beforeend', SOCIAL_PROOF);
    // document.body.insertAdjacentHTML('beforeend', EXIT_POPUP);
    document.head.insertAdjacentHTML('beforeend', GA4);

    /* Mobile menu — inserează după nav */
    var navEl = document.querySelector('.nav');
    if (navEl) navEl.insertAdjacentHTML('afterend', `
  <!-- Mobile Menu -->
  <nav class="mobile-menu" id="mobileMenu" role="navigation" aria-label="Meniu mobil" aria-hidden="true" hidden>
    <div class="mobile-menu-inner">
      <a href="index.html" id="mmHome">Acasă</a>
      <a href="index.html#servicii" id="mmServicii">Servicii</a>
      <a href="index.html#despre-mine" id="mmDespre">Despre mine</a>
      <a href="index.html#contact" id="mmContact">Contact</a>
      <a href="index.html#contact" class="mobile-cta">Consultație gratuită →</a>
    </div>
  </nav>`);

    /* Evidențiază link activ în mobile menu */
    var path2 = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.mobile-menu a').forEach(function(a) {
      if (a.getAttribute('href') === path2) a.classList.add('active');
    });

    /* Evidențiază linkul activ în nav (după injectare) */
    document.querySelectorAll('.nav-links a').forEach(function(a) {
      if (a.getAttribute('href') === path) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });

  });

})();
