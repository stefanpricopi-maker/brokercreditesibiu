<?php
/**
 * Copiază ca _bcs/config.php (nu se versionează).
 *
 * === Places API (fallback, max 5 recenzii) ===
 * 1. Activează „Places API (New)”
 * 2. API key cu restricție IP server (ex. 89.38.211.164), NU HTTP referrers
 * 3. Place ID: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
 *
 * === Google Business Profile (până la 10 recenzii) ===
 * 1. Google Cloud → OAuth Client ID (Web application)
 *    Redirect URI (exact, fără slash final):
 *    https://www.brokercreditesibiu.ro/gbp-oauth-callback.php
 *    Verifică URL-ul: /gbp-auth.php?action=info&secret=SETUP_SECRET
 * 2. Activează API-urile GBP (Account Management, Business Information, My Business)
 * 3. Solicită acces GBP API (Google poate aproba în câteva zile)
 * 4. Setează gbp_setup_secret (string random lung)
 * 5. Deschide în browser (o singură dată):
 *    https://www.brokercreditesibiu.ro/gbp-auth.php?secret=SETUP_SECRET_TAU
 * 6. Dacă locația nu e detectată (ex. Quota exceeded), așteaptă 30 min (fără retry),
 *    apoi: /gbp-discover.php?secret=SETUP_SECRET
 *    Sau cu Account ID: /gbp-discover.php?secret=SETUP_SECRET&account_id=123456789
 *
 * Deploy cPanel:
 * - PHP în rădăcina site-ului: ping.php, google-reviews.php, gbp-auth.php, gbp-oauth-callback.php → 644
 * - _bcs/ (config + cache + lib) → foldere 755, .htaccess blochează accesul HTTP
 * - test: /ping.php → {"ok":true,"service":"php"}
 */
return [
    'site_url' => 'https://www.brokercreditesibiu.ro',

    // Places API
    'api_key'   => 'AIza...',
    'place_id'  => 'ChIJ...',
    'cache_ttl' => 86400,

    // Google Business Profile OAuth
    'gbp_client_id'     => '....apps.googleusercontent.com',
    'gbp_client_secret' => 'GOCSPX-...',
    'gbp_setup_secret'  => 'schimba-cu-un-string-random-lung',
    // 'gbp_redirect_uri' => 'https://www.brokercreditesibiu.ro/gbp-oauth-callback.php',

    'gbp_refresh_token' => '',
    'gbp_account_id'    => '',
    'gbp_location_id'   => '',
];
