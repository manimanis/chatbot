<?php
/**
 * =================================================================
 * save.php — Sauvegarde optionnelle de la conversation côté serveur
 * -----------------------------------------------------------------
 * Reçoit en POST : { messages: [{role, content, timestamp}, ...] }
 * Enregistre (mode append) dans : backend/data/conversations.json
 *
 * Renvoie : { success: true, file: "...", count: N }
 *      OU  : { error: "..." }
 *
 * NOTE : Cet endpoint est OPTIONNEL.
 *        Le frontend dispose déjà d'un bouton "Sauvegarder"
 *        qui télécharge directement le JSON côté navigateur.
 * =================================================================
 */

declare(strict_types=1);

// En-têtes CORS + JSON
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée. Utilisez POST.']);
    exit;
}

// Chargement de la config (pour le flag display_errors)
require_once __DIR__ . '/config.php';
if ($DISPLAY_ERRORS) {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}

// Dossier + fichier de stockage
$DATA_DIR  = __DIR__ . '/data';
$DATA_FILE = $DATA_DIR . '/conversations.json';

// Créer le dossier si nécessaire
if (!is_dir($DATA_DIR)) {
    @mkdir($DATA_DIR, 0775, true);
}

// Lecture du payload
$rawInput = file_get_contents('php://input');
if (empty($rawInput)) {
    http_response_code(400);
    echo json_encode(['error' => 'Payload vide.']);
    exit;
}

$payload = json_decode($rawInput, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON invalide.']);
    exit;
}

// Validation : on attend un tableau "messages" non vide
$messages = $payload['messages'] ?? null;
if (!is_array($messages) || count($messages) === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Aucun message à sauvegarder.']);
    exit;
}

// Nettoyage minimal : ne garder que role / content / timestamp
$clean = [];
foreach ($messages as $m) {
    if (!isset($m['role'], $m['content'])) continue;
    $clean[] = [
        'role'      => $m['role'],
        'content'   => $m['content'],
        'timestamp' => $m['timestamp'] ?? date('c')
    ];
}

// Préparer la "session" à ajouter au fichier
$session = [
    'saved_at'  => date('c'),
    'count'     => count($clean),
    'messages'  => $clean
];

// Lecture du fichier existant (s'il y a déjà des sessions)
$existing = [];
if (is_file($DATA_FILE)) {
    $raw = file_get_contents($DATA_FILE);
    $decoded = json_decode($raw, true);
    if (is_array($decoded)) {
        $existing = $decoded;
    }
}

// Ajout de la nouvelle session
$existing[] = $session;

// Écriture (jolie indentation pour relire facilement)
$written = file_put_contents(
    $DATA_FILE,
    json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
);

if ($written === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Impossible d\'écrire le fichier.']);
    exit;
}

// Réponse de succès
echo json_encode([
    'success' => true,
    'file'    => 'backend/data/conversations.json',
    'count'   => count($clean)
], JSON_UNESCAPED_UNICODE);
