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

// ---- Clé API de votre fournisseur compatible OpenAI ----
// Remplacez par votre clé réelle (OpenAI, OpenRouter, scaleway, etc.)
// Vous pouvez aussi définir la variable d'environnement API_KEY
//   (Apache : SetEnv API_KEY "sk-...")
//   (Serveur : export API_KEY=sk-...)
$API_KEY = getenv('API_KEY') ?: 'VOTRE_CLE_API_ICI';

// ---- Endpoint de l'API de chat (format OpenAI) ----
// Exemples :
//   OpenAI    : https://api.openai.com/v1/chat/completions
//   OpenRouter: https://openrouter.ai/api/v1/chat/completions
$API_URL = 'https://router.bynara.id/v1/chat/completions';

// ---- Modèle à utiliser ----
// Exemples OpenAI : 'gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'
$MODEL   = 'mimo-v2.5-free';

// ---- Prompt système (comportement par défaut du bot) ----
$SYSTEM_PROMPT = 'Tu es un assistant IA utile, concis et courtois. '
               . 'Réponds en français sauf demande contraire de l\'utilisateur. '
               . "Nous sommes dans un cours d'informatique. L'élève va apprendre le langage SQL. "
               . "Tu dois assister l'élève dans ses apprentissages. Ne lui donne pas directement la réponse, guide-le. "
               . "Le SGBD utilisé est MariaDB/MySQL (ne propose pas d'autres SGBD). Ne fournis pas de code SQL complet, guide l'élève pas à pas.";

// ---- Nombre maximum de messages d'historique à envoyer ----
$MAX_HISTORY = 200;

// ---- Affichage des erreurs PHP ----
// En production : false (sécurité)
// En développement : true (debug)
$DISPLAY_ERRORS = false;