<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$bcsRoot = __DIR__ . '/_bcs';
$cacheDir = $bcsRoot . '/cache';
$gbpLib = $bcsRoot . '/lib/gbp.php';
$configFile = $bcsRoot . '/config.php';

$result = [
    'ok'             => true,
    'php_version'    => PHP_VERSION,
    'curl'           => extension_loaded('curl'),
    'bcs_dir'        => is_dir($bcsRoot),
    'gbp_lib'        => is_readable($gbpLib),
    'config'         => is_readable($configFile),
    'cache_dir'      => is_dir($cacheDir),
    'cache_writable' => is_dir($cacheDir) && is_writable($cacheDir),
    'errors'         => [],
];

if (!$result['bcs_dir']) {
    $result['ok'] = false;
    $result['errors'][] = 'Lipsește folderul _bcs/ — încarcă-l în public_html.';
}
if (!$result['gbp_lib']) {
    $result['ok'] = false;
    $result['errors'][] = 'Lipsește _bcs/lib/gbp.php';
}
if (!$result['config']) {
    $result['errors'][] = 'Lipsește _bcs/config.php — copiază din config.example.php';
}
if (!$result['curl']) {
    $result['errors'][] = 'Extensia PHP curl nu e activă (necesară pentru Google API)';
}
if (!$result['cache_writable']) {
    $result['errors'][] = 'Folderul _bcs/cache/ nu e scriibil — setează permisiune 755';
}

if ($result['config']) {
    $config = require $configFile;
    $result['config_ok'] = is_array($config);
    if (!$result['config_ok']) {
        $result['ok'] = false;
        $result['errors'][] = 'config.php nu returnează un array valid';
    } else {
        $result['places_configured'] = trim((string) ($config['api_key'] ?? '')) !== ''
            && trim((string) ($config['place_id'] ?? '')) !== '';
        $result['gbp_oauth_configured'] = trim((string) ($config['gbp_client_id'] ?? '')) !== ''
            && trim((string) ($config['gbp_client_secret'] ?? '')) !== '';
    }
}

if ($result['gbp_lib']) {
    require_once $gbpLib;
    $result['gbp_lib_loads'] = true;
}

echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
