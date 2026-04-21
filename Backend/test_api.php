<?php
// Script untuk test endpoint AI
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$token = '1|UDS2qFQBIeLW1Ll1qStat0tn8nXZamMaNgu5RieLcf794065';

// Test 1: /api/me (cek autentikasi)
echo "=== TEST 1: GET /api/me ===\n";
$ch = curl_init('http://127.0.0.1:8000/api/me');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $token,
        'Accept: application/json',
    ],
]);
$result = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "HTTP $code: $result\n\n";

// Test 2: /api/financial-insight
echo "=== TEST 2: POST /api/financial-insight ===\n";
$ch = curl_init('http://127.0.0.1:8000/api/financial-insight');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode(['month' => 3, 'year' => 2026]),
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $token,
        'Accept: application/json',
        'Content-Type: application/json',
    ],
    CURLOPT_TIMEOUT => 20,
]);
$result = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);
if ($error) echo "CURL ERROR: $error\n";
echo "HTTP $code: $result\n";
