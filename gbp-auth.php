<?php
declare(strict_types=1);

$bcsRoot = __DIR__ . '/_bcs';
$gbpLib = $bcsRoot . '/lib/gbp.php';
if (!is_readable($gbpLib)) {
    http_response_code(503);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Lipsește _bcs/lib/gbp.php pe server. Rulează /bcs-check.php pentru diagnostic.';
    exit;
}
require_once $gbpLib;

$configFile = $bcsRoot . '/config.php';
$config = is_readable($configFile) ? require $configFile : [];
$action = $_GET['action'] ?? 'start';
$secret = $_GET['secret'] ?? '';

if (!gbp_verify_setup_secret($config, $secret)) {
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
    echo 'Completează gbp_client_id și gbp_client_secret în _bcs/config.php';
    exit;
}

$redirectUri = gbp_oauth_redirect_uri($config);

if ($action === 'info') {
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"><title>GBP OAuth info</title></head><body style="font-family:sans-serif;max-width:640px;margin:40px auto;padding:0 16px;">';
    echo '<h1>Redirect URI pentru Google Cloud</h1>';
    echo '<p>Adaugă <strong>exact</strong> acest URL în OAuth client → Authorized redirect URIs:</p>';
    echo '<p><code style="word-break:break-all;">' . htmlspecialchars($redirectUri, ENT_QUOTES, 'UTF-8') . '</code></p>';
    echo '<p>site_url din config: <code>' . htmlspecialchars(gbp_site_url($config), ENT_QUOTES, 'UTF-8') . '</code></p>';
    echo '<p><a href="?secret=' . rawurlencode($secret) . '">Continuă conectarea Google</a></p>';
    echo '</body></html>';
    exit;
}

if ($action !== 'start') {
    http_response_code(404);
    echo 'Acțiune necunoscută.';
    exit;
}

$state = bin2hex(random_bytes(16));
gbp_write_json(gbp_cache_path('gbp-oauth-state.json'), [
    'state' => $state,
    'created_at' => time(),
]);

$params = http_build_query([
    'client_id'     => $clientId,
    'redirect_uri'  => $redirectUri,
    'response_type' => 'code',
    'scope'         => 'https://www.googleapis.com/auth/business.manage',
    'access_type'   => 'offline',
    'prompt'        => 'consent',
    'state'         => $state,
]);

header('Location: https://accounts.google.com/o/oauth2/v2/auth?' . $params);
exit;
