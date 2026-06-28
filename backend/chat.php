<?php
/**
 * =================================================================
 * chat.php — Endpoint principal du chatbot
 * -----------------------------------------------------------------
 * Reçoit : { message: string, history: [{role, content}, ...] }
 * Renvoie : { reply: string }  OU  { error: string }
 *
 * Ã‰tapes :
 *   1. Configuration des en-têtes CORS + JSON
 *   2. Chargement de la configuration (clé API, endpoint, modèle)
 *   3. Lecture et validation du payload JSON
 *   4. Construction du tableau `messages` pour l'API IA
 *   5. Appel cURL vers l'API
 *   6. Extraction de la réponse texte
 *   7. Gestion fine des erreurs
 * =================================================================
 */

declare(strict_types=1);

// ---------------------------------------------------------------
// 1) En-têtes HTTP : CORS + JSON + désactivation cache
// ---------------------------------------------------------------
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Répondre immédiatement aux requêtes preflight CORS (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Refuser tout ce qui n'est pas POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée. Utilisez POST.']);
    exit;
}

// ---------------------------------------------------------------
// 2) Chargement de la configuration
// ---------------------------------------------------------------
require_once __DIR__ . '/config.php';

// Appliquer la politique d'affichage des erreurs
if ($DISPLAY_ERRORS) {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}

// Fichier de logs simples (BONUS)
$LOG_FILE = __DIR__ . '/data/chat.log';

/**
 * Journalise un message dans data/chat.log
 */
function chatLog(string $msg): void
{
    global $LOG_FILE;
    $line = '[' . date('Y-m-d H:i:s') . '] ' . $msg . PHP_EOL;
    @file_put_contents($LOG_FILE, $line, FILE_APPEND);
}

/**
 * Renvoie une réponse d'erreur JSON et termine le script
 */
function failWith(string $message, int $code = 400): void
{
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

// S'assurer que le dossier data/ existe
if (!is_dir(__DIR__ . '/data')) {
    @mkdir(__DIR__ . '/data', 0775, true);
}

// ---------------------------------------------------------------
// 3) Rate Limiting (session + IP)
// ---------------------------------------------------------------
$minInterval = 1; // seconde minimum entre deux requêtes

// 3a) Vérification par session PHP
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (isset($_SESSION['last_request']) && time() - $_SESSION['last_request'] < $minInterval) {
    chatLog('Rate limit atteint (session)');
    http_response_code(429);
    header('Retry-After: 1');
    failWith('Trop de requêtes. Veuillez patienter.', 429);
}
$_SESSION['last_request'] = time();

// 3b) Vérification par IP (fichier)
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = __DIR__ . '/data/rate_limits.json';
$rateData = [];

if (is_file($rateFile)) {
    $raw = file_get_contents($rateFile);
    $decoded = json_decode($raw, true);
    if (is_array($decoded)) {
        $rateData = $decoded;
    }
}

// Nettoyer les entrées expirées (> 60 secondes)
$now = time();
$rateData = array_filter($rateData, function ($entry) use ($now) {
    return is_array($entry) && ($now - ($entry['time'] ?? 0)) < 60;
});

// Vérifier l'IP actuelle
if (isset($rateData[$ip]) && ($now - $rateData[$ip]['time']) < $minInterval) {
    chatLog('Rate limit atteint (IP: ' . $ip . ')');
    http_response_code(429);
    header('Retry-After: ' . $minInterval);
    failWith('Trop de requêtes. Veuillez patienter.', 429);
}

// Mettre Ã  jour le timestamp pour cette IP
$rateData[$ip] = ['time' => $now];
$written = @file_put_contents($rateFile, json_encode($rateData));
if ($written === false) {
    chatLog('Impossible d\'écrire le fichier rate_limits.json');
}

// ---------------------------------------------------------------
// 4) Lecture et validation du payload JSON
// ---------------------------------------------------------------
$rawInput = file_get_contents('php://input');
if (empty($rawInput)) {
    chatLog('Requête vide reçue');
    failWith('Requête vide.', 400);
}

$payload = json_decode($rawInput, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    chatLog('JSON invalide : ' . json_last_error_msg());
    failWith('Payload JSON invalide.', 400);
}

// Récupération + nettoyage du message utilisateur
$message = trim((string)($payload['message'] ?? ''));
if ($message === '') {
    chatLog('Message vide reçu');
    failWith('Le message ne peut pas être vide.', 400);
}

// Récupération de la spécialité (bd par défaut)
$specialty = trim((string)($payload["specialty"] ?? "bd"));
if (!in_array($specialty, ["bd", "francais"], true)) {
    $specialty = "bd";
}

// Limite de taille du message (protection contre l'épuisement des tokens)
$MAX_MSG_LENGTH = 5000;
if (mb_strlen($message) > $MAX_MSG_LENGTH) {
    chatLog('Message trop long : ' . mb_strlen($message) . ' caractères (max ' . $MAX_MSG_LENGTH . ')');
    http_response_code(413);
    failWith('Message trop long (maximum ' . $MAX_MSG_LENGTH . ' caractères).', 413);
}

// Récupération de l'historique (tableau ou vide)
$history = is_array($payload['history'] ?? null) ? $payload['history'] : [];

// Filtrer l'historique : ne conserver que role/content valides
$cleanHistory = [];
foreach ($history as $h) {
    if (!isset($h['role'], $h['content']))
        continue;
    $role = $h['role'];
    $content = trim((string) $h['content']);
    if ($content === '')
        continue;
    // N'accepter que les rôles valides pour OpenAI
    if (!in_array($role, ['user', 'assistant', 'system'], true))
        continue;
    $cleanHistory[] = ['role' => $role, 'content' => $content];
}

// Limiter l'historique aux N derniers messages (BONUS)
if (count($cleanHistory) > $MAX_HISTORY) {
    $cleanHistory = array_slice($cleanHistory, -$MAX_HISTORY);
}

// ---------------------------------------------------------------
// 4) Construction du tableau `messages` pour l'API IA
// ---------------------------------------------------------------
$apiMessages = [];

// Chargement du prompt système selon la spécialité sélectionnée
$systemPromptFile = $PROMPTS_DIR . "/" . $specialty . ".txt";
$systemPrompt = "";
if (is_file($systemPromptFile) && is_readable($systemPromptFile)) {
    $systemPrompt = file_get_contents($systemPromptFile);
}
if ($systemPrompt === "") {
    chatLog("Prompt systeme introuvable pour la specialite : " . $specialty);
    failWith("Configuration du prompt systeme manquante.", 500);
}

// Message système en premier (comportement du bot)
$apiMessages[] = [
    'role' => 'system',
    'content' => $systemPrompt
];

// Ajout de l'historique filtré
foreach ($cleanHistory as $h) {
    $apiMessages[] = $h;
}

// Ajout du message utilisateur courant
$apiMessages[] = [
    'role' => 'user',
    'content' => $message
];

// ---------------------------------------------------------------
// 5) Préparation du corps de requête vers l'API IA
// ---------------------------------------------------------------
$body = json_encode([
    'model' => $env_vars['API_MODEL'],
    'messages' => $apiMessages,
    'temperature' => 0.7
], JSON_UNESCAPED_UNICODE);

// ---------------------------------------------------------------
// 6) Appel cURL vers l'API IA avec mécanisme de retry
// ---------------------------------------------------------------
$maxRetries = 2;
$attempt = 0;
$responseRaw = false;
$httpCode = 0;
$curlError = '';

while ($attempt <= $maxRetries) {
    $ch = curl_init($env_vars['API_URL']);

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $env_vars['API_KEY'],
            'Content-Type: application/json',
            'Accept: application/json'
        ],
        CURLOPT_TIMEOUT => 60,   // timeout global (s)
        CURLOPT_CONNECTTIMEOUT => 10,   // timeout de connexion (s)
    ]);

    $responseRaw = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    // Si la requête a réussi (HTTP 2xx), on sort de la boucle
    if ($responseRaw !== false && $curlError === '' && $httpCode >= 200 && $httpCode < 300) {
        break;
    }

    // Erreur réseau (timeout, connexion refusée, etc.) — on retente
    if ($responseRaw === false || $curlError !== '') {
        $attempt++;
        if ($attempt > $maxRetries) {
            chatLog('Erreur réseau cURL après ' . $maxRetries . ' tentatives : ' . $curlError);
            failWith('Erreur réseau : impossible de joindre l\'API IA après plusieurs tentatives. '.json_encode($env_vars), 502);
        }
        // Backoff exponentiel : 1s, 2s
        $delay = pow(2, $attempt - 1);
        chatLog('Tentative ' . $attempt . '/' . $maxRetries . ' échouée, nouvelle tentative dans ' . $delay . 's');
        sleep($delay);
        continue;
    }

    // Erreur HTTP >= 400 (API a répondu mais avec une erreur) — on ne retente pas
    if ($httpCode >= 400) {
        break;
    }
}

// ---------------------------------------------------------------
// 7) Gestion des erreurs API (HTTP >= 400)
// ---------------------------------------------------------------
if ($responseRaw === false || $curlError !== '') {
    chatLog('Erreur réseau cURL : ' . $curlError);
    failWith('Erreur réseau : impossible de joindre l\'API IA.', 502);
}

if ($httpCode >= 400) {
    // L'API a répondu une erreur — on essaie d'extraire le message
    $errPayload = json_decode($responseRaw, true);
    $errMsg = $errPayload['error']['message']
        ?? ($errPayload['message']
            ?? 'Erreur API (HTTP ' . $httpCode . ')');
    chatLog('Erreur API HTTP ' . $httpCode . ' : ' . $errMsg);
    failWith('Erreur API IA : ' . $errMsg, 502);
}

// Décoder la réponse API
$apiData = json_decode($responseRaw, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    chatLog('Réponse API non JSON : ' . substr($responseRaw, 0, 300));
    failWith('Réponse API illisible.', 502);
}

// Extraire le texte de la réponse (format OpenAI : choices[0].message.content)
$reply = trim((string) ($apiData['choices'][0]['message']['content'] ?? ''));
if ($reply === '') {
    chatLog('Réponse API vide');
    failWith('La réponse de l\'API est vide.', 502);
}

// ---------------------------------------------------------------
// 8) Succès : on renvoie { reply: "..." }
// ---------------------------------------------------------------
chatLog('OK — message traité (' . strlen($message) . ' car. en entrée, '
    . strlen($reply) . ' car. en sortie)');

echo json_encode([
    'reply' => $reply,
    'model' => $apiData['model'] ?? $env_vars['API_MODEL'],
    'usage' => $apiData['usage'] ?? null,
], JSON_UNESCAPED_UNICODE);
