<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/gbp.php';

$configFile = __DIR__ . '/config.php';
$config = is_readable($configFile) ? require $configFile : [];
$action = $_GET['action'] ?? 'start';
$secret = $_GET['secret'] ?? '';

if (!gbp_verify_setup_secret($config, $secret) && $action !== 'callback') {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Acces interzis. Folosește URL-ul cu gbp_setup_secret corect.';
    exit;
}

$clientId = trim((string) ($config['gbp_client_id'] ?? ''));
$clientSecret = trim((string) ($config['gbp_client_secret'] ?? ''));

if ($clientId === '' || $clientSecret === '') {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Completează gbp_client_id și gbp_client_secret în api/config.php';
    exit;
}

if ($action === 'start') {
    $state = bin2hex(random_bytes(16));
    gbp_write_json(gbp_cache_path('gbp-oauth-state.json'), [
        'state' => $state,
        'created_at' => time(),
    ]);

    $params = http_build_query([
        'client_id'     => $clientId,
        'redirect_uri'  => gbp_oauth_redirect_uri($config),
        'response_type' => 'code',
        'scope'         => 'https://www.googleapis.com/auth/business.manage',
        'access_type'   => 'offline',
        'prompt'        => 'consent',
        'state'         => $state,
    ]);

    header('Location: https://accounts.google.com/o/oauth2/v2/auth?' . $params);
    exit;
}

if ($action === 'callback') {
    $code = $_GET['code'] ?? '';
    $state = $_GET['state'] ?? '';
    $savedState = gbp_read_json(gbp_cache_path('gbp-oauth-state.json'));

    if ($code === '' || $state === '' || !$savedState || !hash_equals((string) $savedState['state'], $state)) {
        http_response_code(400);
        echo 'OAuth invalid sau expirat. Reîncepe conectarea.';
        exit;
    }

    $body = http_build_query([
        'code'          => $code,
        'client_id'     => $clientId,
        'client_secret' => $clientSecret,
        'redirect_uri'  => gbp_oauth_redirect_uri($config),
        'grant_type'    => 'authorization_code',
    ]);

    $tokenResult = gbp_http_request('POST', 'https://oauth2.googleapis.com/token', [
        'Content-Type: application/x-www-form-urlencoded',
    ], $body);

    if (!$tokenResult['ok']) {
        http_response_code(502);
        echo 'Nu am putut obține tokenul: ' . htmlspecialchars($tokenResult['error'] ?? 'unknown', ENT_QUOTES, 'UTF-8');
        exit;
    }

    $tokenData = $tokenResult['data'];
    $refreshToken = $tokenData['refresh_token'] ?? '';
    $accessToken = $tokenData['access_token'] ?? '';

    if ($refreshToken === '' || $accessToken === '') {
        http_response_code(502);
        echo 'Google nu a returnat refresh_token. Reîncearcă cu prompt=consent (deconectează aplicația din contul Google și reconectează).';
        exit;
    }

    gbp_write_json(gbp_cache_path('gbp-credentials.json'), [
        'refresh_token' => $refreshToken,
        'connected_at'  => gmdate('c'),
    ]);

    $expiresIn = (int) ($tokenData['expires_in'] ?? 3600);
    gbp_write_json(gbp_cache_path('gbp-access.json'), [
        'access_token' => $accessToken,
        'expires_at'   => time() + $expiresIn,
    ]);

    $discover = gbp_discover_location($config, $accessToken);
    if ($discover['ok']) {
        $existing = gbp_read_json(gbp_cache_path('gbp-credentials.json')) ?? [];
        gbp_write_json(gbp_cache_path('gbp-credentials.json'), array_merge($existing, [
            'account_id'  => $discover['account_id'],
            'location_id' => $discover['location_id'],
            'place_title' => $discover['place_title'],
        ]));
    }

    @unlink(gbp_cache_path('gbp-oauth-state.json'));
    @unlink(gbp_cache_path('reviews.json'));

    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"><title>Google Business conectat</title></head><body style="font-family:sans-serif;max-width:560px;margin:40px auto;padding:0 16px;">';
    echo '<h1>Google Business Profile conectat</h1>';
    if ($discover['ok']) {
        echo '<p>Locație detectată: <strong>' . htmlspecialchars($discover['place_title'], ENT_QUOTES, 'UTF-8') . '</strong></p>';
        echo '<p>Account ID: <code>' . htmlspecialchars($discover['account_id'], ENT_QUOTES, 'UTF-8') . '</code><br>';
        echo 'Location ID: <code>' . htmlspecialchars($discover['location_id'], ENT_QUOTES, 'UTF-8') . '</code></p>';
    } else {
        echo '<p>Token salvat, dar locația nu a putut fi detectată automat. Completează manual <code>gbp_account_id</code> și <code>gbp_location_id</code> în config.</p>';
        echo '<p>Eroare: ' . htmlspecialchars($discover['error'] ?? 'unknown', ENT_QUOTES, 'UTF-8') . '</p>';
    }
    echo '<p>Recenziile (până la 10) vor apărea pe site după refresh. Poți închide această pagină.</p>';
    echo '<p><a href="/">Înapoi la site</a></p></body></html>';
    exit;
}

http_response_code(404);
echo 'Acțiune necunoscută.';
