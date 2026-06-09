<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/gbp.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=3600');
header('X-Robots-Tag: noindex');

$baseMapsUrl = 'https://maps.google.com/?q=Str.+Zaharia+Boiu+nr.+2+Sibiu';
$maxReviews = 10;

function reviews_payload(array $overrides = []): array
{
    global $baseMapsUrl, $maxReviews;

    return array_merge([
        'ok'             => true,
        'configured'     => false,
        'rating'         => null,
        'reviewCount'    => 0,
        'placeName'      => 'BrokerCrediteSibiu',
        'mapsUrl'        => $baseMapsUrl,
        'writeReviewUrl' => null,
        'reviews'        => [],
        'reviewsLimit'   => $maxReviews,
        'reviewsApiMax'  => 5,
        'fetchedAt'      => null,
        'source'         => 'empty',
    ], $overrides);
}

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function read_json_file(string $path): ?array
{
    if (!is_readable($path)) {
        return null;
    }

    $raw = file_get_contents($path);
    if ($raw === false) {
        return null;
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : null;
}

function write_json_file(string $path, array $data): bool
{
    $dir = dirname($path);
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        return false;
    }

    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false) {
        return false;
    }

    return file_put_contents($path, $json, LOCK_EX) !== false;
}

function sort_reviews_by_date(array $reviews): array
{
    usort($reviews, static function (array $a, array $b): int {
        $ta = !empty($a['date']) ? strtotime((string) $a['date']) : 0;
        $tb = !empty($b['date']) ? strtotime((string) $b['date']) : 0;
        return $tb <=> $ta;
    });

    return $reviews;
}

function normalize_places_review(array $review): array
{
    $author = $review['authorAttribution']['displayName'] ?? 'Client Google';
    $photo  = $review['authorAttribution']['photoUri'] ?? null;
    $text   = $review['text']['text'] ?? '';
    $rating = isset($review['rating']) ? (float) $review['rating'] : null;
    $date   = $review['publishTime'] ?? null;
    $relative = $review['relativePublishTimeDescription'] ?? null;

    return [
        'author'   => $author,
        'photo'    => $photo,
        'rating'   => $rating,
        'text'     => $text,
        'date'     => $date,
        'relative' => $relative,
    ];
}

function fetch_places_reviews(string $apiKey, string $placeId, int $limit): array
{
    global $baseMapsUrl, $maxReviews;

    $url = 'https://places.googleapis.com/v1/places/' . rawurlencode($placeId);
    $fields = 'id,displayName,rating,userRatingCount,googleMapsUri,reviews';

    $ch = curl_init($url);
    if ($ch === false) {
        return ['ok' => false, 'error' => 'curl_init_failed'];
    }

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 12,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'X-Goog-Api-Key: ' . $apiKey,
            'X-Goog-FieldMask: ' . $fields,
        ],
    ]);

    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($body === false) {
        return ['ok' => false, 'error' => $curlError ?: 'curl_failed'];
    }

    $decoded = json_decode($body, true);
    if (!is_array($decoded)) {
        return ['ok' => false, 'error' => 'invalid_json', 'status' => $status];
    }

    if ($status < 200 || $status >= 300) {
        return [
            'ok'     => false,
            'error'  => $decoded['error']['message'] ?? ('http_' . $status),
            'status' => $status,
        ];
    }

    $reviews = [];
    foreach (($decoded['reviews'] ?? []) as $item) {
        if (!is_array($item)) {
            continue;
        }
        $normalized = normalize_places_review($item);
        if ($normalized['text'] !== '' && $normalized['rating'] !== null) {
            $reviews[] = $normalized;
        }
    }

    $reviews = array_slice(sort_reviews_by_date($reviews), 0, $limit);

    $placeName = $decoded['displayName']['text'] ?? 'BrokerCrediteSibiu';
    $mapsUrl = $decoded['googleMapsUri'] ?? $baseMapsUrl;

    return [
        'ok'            => true,
        'placeName'     => $placeName,
        'rating'        => isset($decoded['rating']) ? (float) $decoded['rating'] : null,
        'reviewCount'   => isset($decoded['userRatingCount']) ? (int) $decoded['userRatingCount'] : count($reviews),
        'mapsUrl'       => $mapsUrl,
        'reviews'       => $reviews,
        'reviewsLimit'  => $limit,
        'reviewsApiMax' => 5,
        'source'        => 'places',
    ];
}

function build_write_review_url(?string $placeId): ?string
{
    $placeId = trim((string) $placeId);
    if ($placeId === '') {
        return null;
    }
    return 'https://search.google.com/local/writereview?placeid=' . rawurlencode($placeId);
}

$cacheFile = __DIR__ . '/cache/reviews.json';
$configFile = __DIR__ . '/config.php';
$fallbackFile = dirname(__DIR__) . '/data/google-reviews.json';

$config = is_readable($configFile) ? require $configFile : [];
$apiKey = trim((string) ($config['api_key'] ?? ''));
$placeId = trim((string) ($config['place_id'] ?? ''));
$cacheTtl = (int) ($config['cache_ttl'] ?? 86400);
$gbpReady = gbp_is_configured($config);
$placesReady = $apiKey !== '' && $placeId !== '';
$configured = $gbpReady || $placesReady;
$writeReviewUrl = build_write_review_url($placeId);

$cached = read_json_file($cacheFile);
if ($cached && isset($cached['fetchedAt']) && $cacheTtl > 0) {
    $age = time() - (int) strtotime((string) $cached['fetchedAt']);
    if ($age >= 0 && $age < $cacheTtl) {
        $cached['source'] = 'cache';
        respond($cached);
    }
}

if (!$configured) {
    $fallback = read_json_file($fallbackFile);
    if ($fallback) {
        $fallback['source'] = 'fallback';
        respond($fallback);
    }

    respond(reviews_payload([
        'mapsUrl'        => $baseMapsUrl,
        'writeReviewUrl' => null,
        'source'         => 'unconfigured',
    ]));
}

$result = null;
$warning = null;

if ($gbpReady) {
    $GLOBALS['baseMapsUrl'] = $baseMapsUrl;
    $gbpResult = gbp_fetch_reviews($config, $maxReviews);
    if ($gbpResult['ok']) {
        $result = $gbpResult;
    } else {
        $warning = $gbpResult['error'] ?? 'gbp_fetch_failed';
    }
}

if ($result === null && $placesReady) {
    $placesResult = fetch_places_reviews($apiKey, $placeId, $maxReviews);
    if ($placesResult['ok']) {
        $result = $placesResult;
        if ($warning !== null) {
            $result['warning'] = $warning;
        }
    } elseif ($warning === null) {
        $warning = $placesResult['error'] ?? 'places_fetch_failed';
    }
}

if ($result === null) {
    if ($cached) {
        $cached['source'] = 'cache_stale';
        $cached['configured'] = true;
        $cached['writeReviewUrl'] = $cached['writeReviewUrl'] ?? $writeReviewUrl;
        $cached['warning'] = $warning;
        respond($cached);
    }

    $fallback = read_json_file($fallbackFile);
    if ($fallback) {
        $fallback['source'] = 'fallback';
        $fallback['configured'] = true;
        $fallback['writeReviewUrl'] = $writeReviewUrl;
        $fallback['warning'] = $warning;
        respond($fallback);
    }

    respond(reviews_payload([
        'ok'             => false,
        'configured'     => true,
        'writeReviewUrl' => $writeReviewUrl,
        'error'          => $warning,
        'source'         => 'error',
    ]), 502);
}

$reviewsApiMax = ($result['source'] ?? '') === 'gbp' ? $maxReviews : 5;

$payload = reviews_payload([
    'configured'     => true,
    'rating'         => $result['rating'],
    'reviewCount'    => $result['reviewCount'],
    'placeName'      => $result['placeName'] ?? 'BrokerCrediteSibiu',
    'mapsUrl'        => $result['mapsUrl'] ?? $baseMapsUrl,
    'writeReviewUrl' => $writeReviewUrl,
    'reviews'        => $result['reviews'] ?? [],
    'reviewsLimit'   => $maxReviews,
    'reviewsApiMax'  => $reviewsApiMax,
    'fetchedAt'      => gmdate('c'),
    'source'         => $result['source'] ?? 'google',
]);

if (!empty($result['warning'])) {
    $payload['warning'] = $result['warning'];
}

write_json_file($cacheFile, $payload);
respond($payload);
