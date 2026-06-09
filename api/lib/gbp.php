<?php
declare(strict_types=1);

function gbp_cache_path(string $filename): string
{
    return dirname(__DIR__) . '/cache/' . $filename;
}

function gbp_read_json(string $path): ?array
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

function gbp_write_json(string $path, array $data): bool
{
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false) {
        return false;
    }
    return file_put_contents($path, $json, LOCK_EX) !== false;
}

function gbp_is_configured(array $config): bool
{
    $creds = gbp_read_json(gbp_cache_path('gbp-credentials.json'));
    $hasToken = !empty($config['gbp_refresh_token']) || !empty($creds['refresh_token']);

    return trim((string) ($config['gbp_client_id'] ?? '')) !== ''
        && trim((string) ($config['gbp_client_secret'] ?? '')) !== ''
        && $hasToken
        && gbp_location_ids($config) !== null;
}

function gbp_location_ids(array $config): ?array
{
    $creds = gbp_read_json(gbp_cache_path('gbp-credentials.json')) ?? [];
    $accountId = trim((string) ($config['gbp_account_id'] ?? $creds['account_id'] ?? ''));
    $locationId = trim((string) ($config['gbp_location_id'] ?? $creds['location_id'] ?? ''));

    if ($accountId === '' || $locationId === '') {
        return null;
    }

    return ['account_id' => $accountId, 'location_id' => $locationId];
}

function gbp_refresh_token(array $config): ?string
{
    $creds = gbp_read_json(gbp_cache_path('gbp-credentials.json')) ?? [];
    $token = trim((string) ($config['gbp_refresh_token'] ?? $creds['refresh_token'] ?? ''));
    return $token !== '' ? $token : null;
}

function gbp_http_request(string $method, string $url, array $headers = [], ?string $body = null): array
{
    $ch = curl_init($url);
    if ($ch === false) {
        return ['ok' => false, 'error' => 'curl_init_failed'];
    }

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 20,
        CURLOPT_CUSTOMREQUEST  => strtoupper($method),
        CURLOPT_HTTPHEADER     => $headers,
    ]);

    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }

    $responseBody = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($responseBody === false) {
        return ['ok' => false, 'error' => $curlError ?: 'curl_failed', 'status' => $status];
    }

    $decoded = json_decode($responseBody, true);

    if ($status < 200 || $status >= 300) {
        $message = is_array($decoded)
            ? ($decoded['error']['message'] ?? $decoded['error_description'] ?? ('http_' . $status))
            : ('http_' . $status);
        return ['ok' => false, 'error' => (string) $message, 'status' => $status];
    }

    return ['ok' => true, 'data' => is_array($decoded) ? $decoded : [], 'status' => $status];
}

function gbp_get_access_token(array $config): array
{
    $cacheFile = gbp_cache_path('gbp-access.json');
    $cached = gbp_read_json($cacheFile);
    if ($cached && !empty($cached['access_token']) && !empty($cached['expires_at'])) {
        if (time() < ((int) $cached['expires_at'] - 60)) {
            return ['ok' => true, 'access_token' => $cached['access_token']];
        }
    }

    $refreshToken = gbp_refresh_token($config);
    if (!$refreshToken) {
        return ['ok' => false, 'error' => 'missing_refresh_token'];
    }

    $clientId = trim((string) ($config['gbp_client_id'] ?? ''));
    $clientSecret = trim((string) ($config['gbp_client_secret'] ?? ''));
    if ($clientId === '' || $clientSecret === '') {
        return ['ok' => false, 'error' => 'missing_oauth_client'];
    }

    $body = http_build_query([
        'client_id'     => $clientId,
        'client_secret' => $clientSecret,
        'refresh_token' => $refreshToken,
        'grant_type'    => 'refresh_token',
    ]);

    $result = gbp_http_request('POST', 'https://oauth2.googleapis.com/token', [
        'Content-Type: application/x-www-form-urlencoded',
    ], $body);

    if (!$result['ok']) {
        return $result;
    }

    $data = $result['data'];
    $accessToken = $data['access_token'] ?? '';
    if ($accessToken === '') {
        return ['ok' => false, 'error' => 'missing_access_token'];
    }

    $expiresIn = (int) ($data['expires_in'] ?? 3600);
    gbp_write_json($cacheFile, [
        'access_token' => $accessToken,
        'expires_at'   => time() + $expiresIn,
    ]);

    return ['ok' => true, 'access_token' => $accessToken];
}

function gbp_star_to_number(?string $star): ?float
{
    $map = ['ONE' => 1, 'TWO' => 2, 'THREE' => 3, 'FOUR' => 4, 'FIVE' => 5];
    if ($star === null) {
        return null;
    }
    return $map[strtoupper($star)] ?? null;
}

function gbp_relative_time(?string $isoDate): ?string
{
    if (!$isoDate) {
        return null;
    }
    $ts = strtotime($isoDate);
    if ($ts === false) {
        return null;
    }
    $diff = time() - $ts;
    if ($diff < 3600) {
        return 'recent';
    }
    if ($diff < 86400) {
        $h = (int) floor($diff / 3600);
        return 'acum ' . $h . ' ' . ($h === 1 ? 'oră' : 'ore');
    }
    if ($diff < 2592000) {
        $d = (int) floor($diff / 86400);
        return 'acum ' . $d . ' ' . ($d === 1 ? 'zi' : 'zile');
    }
    if ($diff < 31536000) {
        $m = (int) floor($diff / 2592000);
        return 'acum ' . $m . ' ' . ($m === 1 ? 'lună' : 'luni');
    }
    $y = (int) floor($diff / 31536000);
    return 'acum ' . $y . ' ' . ($y === 1 ? 'an' : 'ani');
}

function gbp_normalize_review(array $review): ?array
{
    $rating = gbp_star_to_number($review['starRating'] ?? null);
    $text = trim((string) ($review['comment'] ?? ''));
    if ($rating === null || $text === '') {
        return null;
    }

    $date = $review['updateTime'] ?? $review['createTime'] ?? null;

    return [
        'author'   => $review['reviewer']['displayName'] ?? 'Client Google',
        'photo'    => $review['reviewer']['profilePhotoUrl'] ?? null,
        'rating'   => $rating,
        'text'     => $text,
        'date'     => $date,
        'relative' => gbp_relative_time(is_string($date) ? $date : null),
    ];
}

function gbp_fetch_reviews(array $config, int $limit = 10): array
{
    $tokenResult = gbp_get_access_token($config);
    if (!$tokenResult['ok']) {
        return $tokenResult;
    }

    $ids = gbp_location_ids($config);
    if ($ids === null) {
        return ['ok' => false, 'error' => 'missing_account_or_location_id'];
    }

    $url = sprintf(
        'https://mybusiness.googleapis.com/v4/accounts/%s/locations/%s/reviews?pageSize=%d&orderBy=updateTime%%20desc',
        rawurlencode($ids['account_id']),
        rawurlencode($ids['location_id']),
        min(50, max(1, $limit))
    );

    $result = gbp_http_request('GET', $url, [
        'Authorization: Bearer ' . $tokenResult['access_token'],
        'Content-Type: application/json',
    ]);

    if (!$result['ok']) {
        return $result;
    }

    $data = $result['data'];
    $reviews = [];
    foreach (($data['reviews'] ?? []) as $item) {
        if (!is_array($item)) {
            continue;
        }
        $normalized = gbp_normalize_review($item);
        if ($normalized !== null) {
            $reviews[] = $normalized;
        }
    }

    return [
        'ok'          => true,
        'placeName'   => 'BrokerCrediteSibiu',
        'rating'      => isset($data['averageRating']) ? (float) $data['averageRating'] : null,
        'reviewCount' => isset($data['totalReviewCount']) ? (int) $data['totalReviewCount'] : count($reviews),
        'mapsUrl'     => $GLOBALS['baseMapsUrl'] ?? 'https://maps.google.com/?q=Str.+Zaharia+Boiu+nr.+2+Sibiu',
        'reviews'     => array_slice($reviews, 0, $limit),
        'reviewsLimit'=> $limit,
        'reviewsApiMax' => $limit,
        'source'      => 'gbp',
    ];
}

function gbp_discover_location(array $config, string $accessToken): array
{
    $accountsResult = gbp_http_request('GET', 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts', [
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json',
    ]);

    if (!$accountsResult['ok']) {
        return $accountsResult;
    }

    $accounts = $accountsResult['data']['accounts'] ?? [];
    if (!$accounts) {
        return ['ok' => false, 'error' => 'no_gbp_accounts_found'];
    }

    $account = $accounts[0];
    $accountName = $account['name'] ?? '';
    if ($accountName === '') {
        return ['ok' => false, 'error' => 'invalid_account_name'];
    }

    $locationsUrl = 'https://mybusinessbusinessinformation.googleapis.com/v1/' . $accountName . '/locations?readMask=name,title,storefrontAddress&pageSize=20';
    $locationsResult = gbp_http_request('GET', $locationsUrl, [
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json',
    ]);

    if (!$locationsResult['ok']) {
        return $locationsResult;
    }

    $locations = $locationsResult['data']['locations'] ?? [];
    if (!$locations) {
        return ['ok' => false, 'error' => 'no_gbp_locations_found'];
    }

    $location = $locations[0];
    $locationName = $location['name'] ?? '';
    if (!preg_match('#accounts/([^/]+)/locations/([^/]+)$#', $locationName, $m)) {
        return ['ok' => false, 'error' => 'invalid_location_name'];
    }

    return [
        'ok'          => true,
        'account_id'  => $m[1],
        'location_id' => $m[2],
        'place_title' => $location['title'] ?? 'BrokerCrediteSibiu',
    ];
}

function gbp_site_url(array $config): string
{
    $url = trim((string) ($config['site_url'] ?? 'https://www.brokercreditesibiu.ro'));
    return rtrim($url, '/');
}

function gbp_oauth_redirect_uri(array $config): string
{
    return gbp_site_url($config) . '/api/gbp-auth.php?action=callback';
}

function gbp_verify_setup_secret(array $config, ?string $provided): bool
{
    $secret = trim((string) ($config['gbp_setup_secret'] ?? ''));
    if ($secret === '') {
        return false;
    }
    return hash_equals($secret, (string) $provided);
}
