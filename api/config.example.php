<?php
/**
 * Copiază ca api/config.php (nu se versionează).
 *
 * === Places API (fallback, max 5 recenzii) ===
 * 1. Activează „Places API (New)”
 * 2. API key cu restricție IP server (ex. 89.38.211.164), NU HTTP referrers
 * 3. Place ID: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
 *
 * === Google Business Profile (până la 10 recenzii) ===
 * 1. Google Cloud → OAuth Client ID (Web application)
 *    Redirect URI: https://www.brokercreditesibiu.ro/api/gbp-auth.php?action=callback
 * 2. Activează API-urile:
 *    - Google My Business API
 *    - My Business Account Management API
 *    - My Business Business Information API
 * 3. Solicită acces GBP API (Google poate aproba în câteva zile)
 * 4. Setează gbp_setup_secret (string random lung)
 * 5. Deschide în browser (o singură dată):
 *    https://www.brokercreditesibiu.ro/api/gbp-auth.php?secret=SETUP_SECRET_TAU
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

    // Opțional — se completează automat după OAuth în api/cache/gbp-credentials.json
    'gbp_refresh_token' => '',
    'gbp_account_id'    => '',
    'gbp_location_id'   => '',
];
