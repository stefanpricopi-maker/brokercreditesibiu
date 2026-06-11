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
if (!is_array($config)) {
    $config = [];
}

$secret = $_GET['secret'] ?? '';
if (!gbp_verify_setup_secret($config, $secret)) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Acces interzis. Folosește URL-ul cu gbp_setup_secret corect.';
    exit;
}

$accountId = preg_replace('/\D+/', '', (string) ($_GET['account_id'] ?? ''));
$locationId = preg_replace('/\D+/', '', (string) ($_GET['location_id'] ?? ''));
$resource = trim((string) ($_GET['resource'] ?? ''));
$auto = isset($_GET['auto']) && $_GET['auto'] === '1';

if ($resource !== '' && preg_match('#accounts/(\d+)/locations/(\d+)#', $resource, $m)) {
    $accountId = $m[1];
    $locationId = $m[2];
}

header('Content-Type: text/html; charset=utf-8');

function gbp_discover_page_start(string $title): void
{
    echo '<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"><title>' . htmlspecialchars($title, ENT_QUOTES, 'UTF-8') . '</title></head>';
    echo '<body style="font-family:sans-serif;max-width:640px;margin:40px auto;padding:0 16px;line-height:1.5;">';
}

function gbp_discover_browser_help(): void
{
    $snippetHook = <<<'JS'
(function () {
  const hits = new Set();
  const scan = function (text) {
    if (!text) return;
    var s = String(text);
    var m, rePair = /accounts\/(\d{10,})\/locations\/(\d{10,})/g;
    while ((m = rePair.exec(s)) !== null) {
      hits.add('accounts/' + m[1] + '/locations/' + m[2]);
    }
    rePair = /locations\/(\d{10,})/g;
    while ((m = rePair.exec(s)) !== null) {
      hits.add('locations/' + m[1]);
    }
    rePair = /accounts\/(\d{10,})/g;
    while ((m = rePair.exec(s)) !== null) {
      hits.add('accounts/' + m[1]);
    }
    rePair = /\/l\/(\d{10,})/g;
    while ((m = rePair.exec(s)) !== null) {
      hits.add('location:/l/' + m[1]);
    }
  };
  var origFetch = window.fetch;
  window.fetch = function (input) {
    scan(typeof input === 'string' ? input : (input && input.url) || '');
    return origFetch.apply(this, arguments);
  };
  var origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (_m, url) {
    scan(url);
    return origOpen.apply(this, arguments);
  };
  console.log('Hook activ. Click Recenzii / Informatii / Statistici, apoi GBP_HITS()');
  window.GBP_HITS = function () {
    scan(document.documentElement.innerHTML);
    scan(location.href);
    var i, k;
    for (i = 0; i < sessionStorage.length; i++) {
      k = sessionStorage.key(i);
      scan(k);
      scan(sessionStorage.getItem(k));
    }
    for (i = 0; i < localStorage.length; i++) {
      k = localStorage.key(i);
      scan(k);
      scan(localStorage.getItem(k));
    }
    var list = Array.from(hits);
    console.log('GBP IDs gasite:', list);
    return list;
  };
})();
JS;

    $snippet = <<<'JS'
(() => {
  const hits = new Set();
  const scan = (text) => {
    if (!text) return;
    let m;
    const rePair = /accounts\/(\d{10,})\/locations\/(\d{10,})/g;
    while ((m = rePair.exec(text)) !== null) {
      hits.add('accounts/' + m[1] + '/locations/' + m[2]);
    }
    const reLoc = /\/l\/(\d{10,})/g;
    while ((m = reLoc.exec(text)) !== null) {
      hits.add('location_hint:/l/' + m[1]);
    }
  };
  scan(document.documentElement.innerHTML);
  performance.getEntriesByType('resource').forEach(function (e) { scan(e.name); });
  const list = Array.from(hits);
  console.log('GBP IDs gasite:', list);
  return list;
})();
JS;

    echo '<details style="margin-top:20px;border:1px solid #ccc;border-radius:8px;padding:12px 16px;">';
    echo '<summary style="cursor:pointer;font-weight:600;">Google ascunde apelurile în Network — alte metode</summary>';
    echo '<ol style="margin:12px 0 0;padding-left:20px;">';
    echo '<li><strong>URL din bară</strong> — în business.google.com apasă Recenzii, Informații, Statistici. Uneori apare <code>/l/NUMĂR</code> sau <code>locationId=</code> în adresă; acel număr e Location ID.</li>';
    echo '<li><strong>Consolă (recomandat)</strong> — pe business.google.com: F12 → Console → lipește scriptul de mai jos → Enter. Copiază linia <code>accounts/…/locations/…</code> în formular.</li>';
    echo '<li><strong>Căutare în pagină</strong> — F12 → Sources → Ctrl+Shift+F (Cmd+Opt+F pe Mac) → caută <code>locations/</code> sau numărul pe care îl ai deja.</li>';
    echo '<li><strong>Network fără filtru</strong> — bifează <em>Preserve log</em>, șterge filtrul <code>accounts</code>, navighează în meniu; caută în coloana Name: <code>batchexecute</code>, <code>/_/</code> sau textul <code>locations</code>.</li>';
    echo '</ol>';
    echo '<p style="font-size:14px;margin:12px 0 6px;"><strong>Pasul 1</strong> — lipește în Console (pe business.google.com), apoi navighează în meniu:</p>';
    echo '<textarea readonly rows="18" style="width:100%;font:12px/1.4 monospace;box-sizing:border-box;padding:8px;" onclick="this.select()">';
    echo htmlspecialchars($snippetHook, ENT_QUOTES, 'UTF-8');
    echo '</textarea>';
    echo '<p style="font-size:14px;margin:12px 0 6px;">După ce apeși Recenzii / Informații / Statistici, scrie în consolă: <code>GBP_HITS()</code></p>';
    echo '<p style="font-size:14px;margin:12px 0 6px;"><strong>Pasul 2 (opțional)</strong> — scanare rapidă HTML + storage:</p>';
    echo '<textarea readonly rows="12" style="width:100%;font:12px/1.4 monospace;box-sizing:border-box;padding:8px;" onclick="this.select()">';
    echo htmlspecialchars($snippet, ENT_QUOTES, 'UTF-8');
    echo '</textarea>';
    echo '</details>';
}

function gbp_discover_manual_form(string $secret, string $accountId = '', string $locationId = '', string $resource = ''): void
{
    echo '<h2>Setare manuală — fără apel Google API</h2>';
    echo '<p>Ai nevoie de linia <code>accounts/XXXXXXXX/locations/YYYYYYYY</code> (ambele numere).</p>';
    echo '<form method="get" action="/gbp-discover.php" style="display:grid;gap:12px;max-width:480px;">';
    echo '<input type="hidden" name="secret" value="' . htmlspecialchars($secret, ENT_QUOTES, 'UTF-8') . '">';
    echo '<label>Lipește linia completă (recomandat)<br>';
    echo '<input name="resource" value="' . htmlspecialchars($resource, ENT_QUOTES, 'UTF-8') . '" placeholder="accounts/123.../locations/456..." style="width:100%;padding:8px;box-sizing:border-box;"></label>';
    echo '<p style="margin:0;font-size:14px;color:#555;">sau completează separat:</p>';
    echo '<label>Account ID<br><input name="account_id" value="' . htmlspecialchars($accountId, ENT_QUOTES, 'UTF-8') . '" style="width:100%;padding:8px;box-sizing:border-box;"></label>';
    echo '<label>Location ID<br><input name="location_id" value="' . htmlspecialchars($locationId, ENT_QUOTES, 'UTF-8') . '" style="width:100%;padding:8px;box-sizing:border-box;"></label>';
    echo '<button type="submit" style="padding:10px 16px;">Salvează (fără API)</button>';
    echo '</form>';
    gbp_discover_browser_help();
}

if ($accountId !== '' && $locationId !== '') {
    if (!gbp_save_location_ids($accountId, $locationId)) {
        http_response_code(400);
        gbp_discover_page_start('GBP IDs invalide');
        echo '<h1>ID-uri invalide</h1>';
        gbp_discover_manual_form($secret, $accountId, $locationId, $resource);
        echo '</body></html>';
        exit;
    }

    gbp_discover_page_start('Locație GBP salvată');
    echo '<h1>ID-uri salvate</h1>';
    echo '<p>Account ID: <code>' . htmlspecialchars($accountId, ENT_QUOTES, 'UTF-8') . '</code><br>';
    echo 'Location ID: <code>' . htmlspecialchars($locationId, ENT_QUOTES, 'UTF-8') . '</code></p>';
    echo '<p>Verifică: <a href="/bcs-check.php">bcs-check.php</a> · <a href="/google-reviews.php">google-reviews.php</a> (<code>"source":"gbp"</code>)</p>';
    echo '<p><a href="/">Înapoi la site</a></p></body></html>';
    exit;
}

if (!$auto) {
    gbp_discover_page_start('GBP — setare manuală');
    echo '<h1>Lipsesc ambele ID-uri</h1>';
    if ($accountId !== '' && $locationId === '') {
        echo '<p>Ai doar un ID (<code>' . htmlspecialchars($accountId, ENT_QUOTES, 'UTF-8') . '</code>). Mai trebuie și <strong>Location ID</strong> din același URL Network.</p>';
        echo '<p><strong>Nu folosim API automat</strong> (quota Google e limitată). Completează formularul de jos.</p>';
    } else {
        echo '<p>Completează ID-urile manual — fără consum de quota Google.</p>';
    }
    gbp_discover_manual_form($secret, $accountId, $locationId, $resource);
    echo '<p style="margin-top:24px;font-size:14px;">Detectare automată (doar dacă quota s-a resetat): ';
    echo '<a href="?secret=' . rawurlencode($secret) . '&amp;auto=1">încearcă auto</a></p>';
    echo '</body></html>';
    exit;
}

$tokenResult = gbp_get_access_token($config);
if (!$tokenResult['ok']) {
    http_response_code(502);
    gbp_discover_page_start('GBP discover');
    echo '<h1>Nu am putut obține tokenul</h1>';
    echo '<p>' . htmlspecialchars($tokenResult['error'] ?? 'unknown', ENT_QUOTES, 'UTF-8') . '</p>';
    echo '<p><a href="/gbp-auth.php?action=reconnect&amp;secret=' . rawurlencode($secret) . '">Reconectare OAuth</a></p>';
    gbp_discover_manual_form($secret, $accountId, $locationId, $resource);
    echo '</body></html>';
    exit;
}

if ($accountId !== '') {
    $config['gbp_account_id'] = $accountId;
}

$discover = gbp_discover_location($config, $tokenResult['access_token']);

if (!$discover['ok']) {
    http_response_code(502);
    gbp_discover_page_start('GBP discover');
    echo '<h1>Detectare automată eșuată</h1>';
    echo '<p>' . htmlspecialchars($discover['error'] ?? 'unknown', ENT_QUOTES, 'UTF-8') . '</p>';
    echo '<p>Folosește setarea manuală (nu consumă API):</p>';
    gbp_discover_manual_form($secret, $accountId, $locationId, $resource);
    echo '</body></html>';
    exit;
}

gbp_save_location_ids($discover['account_id'], $discover['location_id'], $discover['place_title'] ?? 'BrokerCrediteSibiu');

gbp_discover_page_start('Locație GBP detectată');
echo '<h1>Locație detectată</h1>';
echo '<p><strong>' . htmlspecialchars($discover['place_title'] ?? 'BrokerCrediteSibiu', ENT_QUOTES, 'UTF-8') . '</strong></p>';
echo '<p>Account ID: <code>' . htmlspecialchars($discover['account_id'], ENT_QUOTES, 'UTF-8') . '</code><br>';
echo 'Location ID: <code>' . htmlspecialchars($discover['location_id'], ENT_QUOTES, 'UTF-8') . '</code></p>';
echo '<p><a href="/google-reviews.php">google-reviews.php</a> · <a href="/">Înapoi la site</a></p>';
echo '</body></html>';
