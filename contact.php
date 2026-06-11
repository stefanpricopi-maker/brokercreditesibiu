<?php
declare(strict_types=1);

/**
 * Handler formular de contact (înlocuiește Netlify Forms).
 * Primește POST din index.html#contact, trimite email și
 * redirecționează către /thank-you.html.
 *
 * Deploy cPanel: contact.php în rădăcina site-ului, permisiuni 644.
 */

const DESTINATAR = 'dragos.pricopi@fin.imobiliare.ro';
const EXPEDITOR  = 'no-reply@brokercreditesibiu.ro';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: /', true, 302);
    exit;
}

function camp(string $nume, int $maxLen = 500): string
{
    $val = trim((string)($_POST[$nume] ?? ''));
    // protecție header injection + limitare lungime
    $val = str_replace(["\r", "\n", "\0"], ' ', $val);
    return mb_substr($val, 0, $maxLen);
}

// Honeypot: roboții completează câmpul ascuns → simulăm succes, fără email
if (camp('website_url') !== '') {
    header('Location: /thank-you.html', true, 303);
    exit;
}

$nume    = camp('nume', 100);
$prenume = camp('prenume', 100);
$telefon = camp('telefon', 30);
$email   = camp('email', 200);
$oras    = camp('oras', 100);
$subiect = camp('subiect', 50);
$mesaj   = trim(mb_substr((string)($_POST['mesaj'] ?? ''), 0, 5000));

$valid = $nume !== ''
    && $telefon !== ''
    && filter_var($email, FILTER_VALIDATE_EMAIL) !== false
    && $mesaj !== ''
    && isset($_POST['gdpr']);

if (!$valid) {
    header('Location: /#contact', true, 303);
    exit;
}

$etichete = [
    'credit-ipotecar' => 'Credit ipotecar',
    'refinantare'     => 'Refinanțare credit existent',
    'nevoi-personale' => 'Credit de nevoi personale',
    'consultare'      => 'Consultare generală',
    'altele'          => 'Altele',
];
$subiectLabel = $etichete[$subiect] ?? '—';

$corp = "Cerere ofertă credit (formular site)\n\n"
    . 'Nume:    ' . $nume . ($prenume !== '' ? ' ' . $prenume : '') . "\n"
    . 'Telefon: ' . $telefon . "\n"
    . 'Email:   ' . $email . "\n"
    . 'Oraș:    ' . ($oras !== '' ? $oras : '—') . "\n"
    . 'Subiect: ' . $subiectLabel . "\n\n"
    . "Mesaj:\n" . $mesaj . "\n\n"
    . '— Trimis automat de pe https://www.brokercreditesibiu.ro la '
    . date('d.m.Y H:i') . "\n";

$titlu = '=?UTF-8?B?' . base64_encode('Cerere ofertă credit — ' . $nume) . '?=';

$headers = implode("\r\n", [
    'From: BrokerCrediteSibiu <' . EXPEDITOR . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

mail(DESTINATAR, $titlu, $corp, $headers);

header('Location: /thank-you.html', true, 303);
exit;
