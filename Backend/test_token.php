<?php
// Script sementara untuk generate test token
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = \App\Models\User::first();
if (!$user) {
    echo "NO USER FOUND\n";
    exit(1);
}

$token = $user->createToken('test-token')->plainTextToken;
echo "USER: " . $user->name . " (ID: " . $user->id . ")\n";
echo "TOKEN: " . $token . "\n";
