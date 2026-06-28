<?php
/**
 * =================================================================
 * Configuration du backend — chatbot-app
 * -----------------------------------------------------------------
 * EXEMPLE — À copier vers config.php et à remplir avec vos valeurs.
 * 
 * NE JAMAIS modifier ni commiteter config.example.php avec une clé réelle.
 * Le fichier config.php est ignoré par Git (.gitignore).
 * =================================================================
 */

$env_vars = [
  // ---- Clé API de votre fournisseur compatible OpenAI ----
// La clé est chargée UNIQUEMENT depuis une variable d'environnement.
// Configuration recommandée :
//   - Apache : SetEnv API_KEY "sk-..." dans httpd.conf ou .htaccess
//   - Serveur : export API_KEY=sk-... dans le profil shell
//   - XAMPP (local) : définir dans httpd.conf ou via un fichier .env
// NE JAMAIS mettre de clé en dur dans ce fichier.
  'API_KEY' => getenv('API_KEY'),

  // ---- Endpoint de l'API de chat (format OpenAI) ----
// Exemples :
//   OpenAI    : https://api.openai.com/v1/chat/completions
//   OpenRouter: https://openrouter.ai/api/v1/chat/completions
  'API_URL' => getenv('API_URL'),

  // ---- Modèle à utiliser ----
// Exemples OpenAI : 'gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'
  'API_MODEL' => getenv('API_MODEL'),
];

if (empty($env_vars['API_KEY']) || empty($env_vars['API_URL']) || empty($env_vars['API_MODEL'])) {
  // En développement, on peut utiliser un fichier .env (hors webroot)
  $envFile = __DIR__ . '/.env';
  $env_vars = [];
  if (is_file($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
      $line = ($line);
      $pcmt = strpos($line, '#');
      $line = $pcmt !== false ? substr($line, 0, $pcmt) : $line;
      $peq = strpos($line, '=');
      if ($peq !== false) {
        $key = strtoupper(trim(substr($line, 0, $peq)));
        $val = trim(substr($line, $peq + 1));
        $env_vars[$key] = $val;
      }
    }
  }
}
foreach ($env_vars as $key => $val) {
  if (empty($val)) {
    error_log("CRITICAL: $key non configurée. Définir la variable d\'environnement $key.");
    $env_vars[$key] = '';
  }
}

// Chemin du dossier systeme pour les prompts par specialite
$PROMPTS_DIR = __DIR__ . '/prompts';


// ---- Nombre maximum de messages d'historique à envoyer ----
$MAX_HISTORY = 200;

// ---- Affichage des erreurs PHP ----
// En production : false (sécurité)
// En développement : true (debug)
$DISPLAY_ERRORS = false;
