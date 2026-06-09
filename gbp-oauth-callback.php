<?php
declare(strict_types=1);

$bcsRoot = __DIR__ . '/_bcs';
$gbpLib = $bcsRoot . '/lib/gbp.php';
if (!is_readable($gbpLib)) {
    http_response_code(503);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Lipsește _bcs/lib/gbp.php pe server.';
    exit;
}
require_once $gbpLib;

$configFile = $bcsRoot . '/config.php';
$config = is_readable($configFile) ? require $configFile : [];

gbp_complete_oauth_callback(
    $config,
    (string) ($_GET['code'] ?? ''),
    (string) ($_GET['state'] ?? '')
);
