# 🔍 Rapport d'Analyse de Sécurité — Chatbot IA

**Projet :** Chatbot IA (Vue.js + PHP)  
**Date de l'audit :** 26/06/2026  
**Auteur :** Audit automatique  
**Niveau de risque global :** ⚠️ **ÉLEVÉ**

---

## Table des matières

1. [Résumé exécutif](#1-résumé-exécutif)
2. [Vulnérabilités critiques](#2-vulnérabilités-critiques)
3. [Vulnérabilités haute priorité](#3-vulnérabilités-haute-priorité)
4. [Vulnérabilités moyenne priorité](#4-vulnérabilités-moyenne-priorité)
5. [Améliorations recommandées](#5-améliorations-recommandées)
6. [Plan de correction priorisé](#6-plan-de-correction-priorisé)

---

## 1. Résumé exécutif

| Catégorie | Nombre | Niveau |
|-----------|--------|--------|
| 🔴 Critique | 2 | Exposition de clé API + XSS persistante |
| 🟠 Haute | 4 | Injections, rate limiting, data leakage |
| 🟡 Moyenne | 5 | Manque de validation, headers sécurité, logging |
| 🟢 Basse | 3 | UI/UX mineurs, dépendances |

---

## 2. 🔴 Vulnérabilités Critiques

### 2.1 CRIT-01 : Exposition de la clé API via PHP info

**Fichier :** `backend/chat.php` (lignes 51-55)  
**CWE :** CWE-200 (Information Exposure) / CWE-522 (Insufficiently Protected Credentials)

```php
if ($DISPLAY_ERRORS) {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
}
```

**Problème :** `$API_KEY` est chargée via `config.php` et utilisée dans les headers cURL. Si `$DISPLAY_ERRORS` est activé, une erreur PHP (ex: `curl_exec()` échoue) pourrait révéler la variable `$API_KEY` dans la stack trace. De plus, `chatLog()` écrit dans `backend/data/chat.log` qui pourrait contenir l'historique complet des messages.

**Recommandation :** 
- Activer `DISPLAY_ERRORS = false` en production (déjà le cas par défaut)
- Ne JAMAIS logger les payloads bruts contenant les messages utilisateurs
- Utiliser des variables d'environnement systèmes (Apache `SetEnv`, fichier `.env` hors webroot)

### 2.2 CRIT-02 : XSS persistante via `v-html` avec Markdown

**Fichier :** `index.html` (ligne 102) + `frontend/app.js` (lignes 432-453)  
**CWE :** CWE-79 (Cross-Site Scripting)

```javascript
// frontend/app.js, ligne 102 (dans le template)
<div class="message-content" v-html="convertToHTML(msg.content)">

// frontend/app.js, lignes 432-453
const convertToHTML = (text) => {
 let html = marked.parse(text);
 if (typeof DOMPurify !== 'undefined' && DOMPurify.sanitize) {
   html = DOMPurify.sanitize(html);
 } else {
   // Fallback INSATISFAISANT
   html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^>]*)*<\/script>/gi, '');
   html = html.replace(/on\w+="[^"]*"/gi, '');
   html = html.replace(/on\w+='[^']*'/gi, '');
 }
```

**Problème :** 
- **Fallback XSS vulnérable :** Si DOMPurify n'est pas chargé (CDN down, erreur réseau), le fallback regex ne couvre PAS :
  - `onerror=alert(1)` sans guillemets : `<img src=x onerror=alert(1)>`
  - Événements entre backticks : `` onerror=`alert(1)` ``
  - Attributs `javascript:` dans href/src : `<a href="javascript:alert(1)">`
  - SVG avec `<script>` : `<svg><script>alert(1)</script>`
- **Markdown dangereux :** marked.js peut générer du HTML non sécurisé même en mode par défaut
- **Liens automatiques :** La détection des URLs se fait APRÈS sanitization, mais sans validation d'URLs malveillantes

**Recommandation :**
- **Ajouter DOMPurify comme dépendance locale** (vendor/dompurify.min.js existe mais doit être chargé en premier)
- **Verifier le chargement** : raise an error si DOMPurify est undefined
- **Remplacer la regex par un DOMPurify toujours disponible** en utilisant un fallback solide
- **Utiliser DOMPurify avec une configuration** qui interdit les protocoles dangereux :
  ```javascript
  html = DOMPurify.sanitize(html, {
    ALLOWED_PROTOCOLS: ['http', 'https', 'mailto'],
    FORBID_TAGS: ['style', 'form', 'input', 'button']
  });
  ```
- **Ne jamais faire confiance** au fallback regex seul

---

## 3. 🟠 Vulnérabilités Haute Priorité

### 3.1 HIGH-01 : Aucune limitation de débit (Rate Limiting)

**Fichier :** `backend/chat.php` (lignes 160-178)  
**CWE :** CWE-770 (Allocation of Resources Without Limits or Throttling)

```php
curl_setopt_array($ch, [
    CURLOPT_TIMEOUT        => 60,
    CURLOPT_CONNECTTIMEOUT => 10,
]);
```

**Problème :** Aucune limite sur le nombre de requêtes POST. Un attaquant peut :
- Épuiser le quota API (coût financier avec des APIs payantes comme OpenAI)
- Flooder le serveur PHP avec des requêtes volumineuses
- Faire du brute-force du message utilisateur

**Recommandation :**
- Implémenter un rate limiting par IP (tableau + `file_put_contents` ou session)
- Ajouter un délai minimum entre les requêtes
- Utiliser des tokens anti-CSRF
- Solution simple : stocker le timestamp de la dernière requête en session
  ```php
  session_start();
  $minInterval = 1; // seconde
  if (isset($_SESSION['last_request']) && time() - $_SESSION['last_request'] < $minInterval) {
      failWith('Trop de requêtes. Veuillez patienter.', 429);
  }
  $_SESSION['last_request'] = time();
  ```

### 3.2 HIGH-02 : Injection de contenu via historique

**Fichier :** `backend/chat.php` (lignes 107-124)  
**CWE :** CWE-150 (Improper Neutralization of Escape, Meta, or Control Characters)

```php
$history = is_array($payload['history'] ?? null) ? $payload['history'] : [];
// Validation minimale : juste role + content
$cleanHistory = [];
foreach ($history as $h) {
    if (!isset($h['role'], $h['content'])) continue;
    $role = $h['role'];
    $content = trim((string)$h['content']);
    if ($content === '') continue;
    if (!in_array($role, ['user', 'assistant', 'system'], true)) continue;
    $cleanHistory[] = ['role' => $role, 'content' => $content];
}
```

**Problème :** L'historique est envoyé par le client et simplement filtré. Un attaquant peut injecter des messages système ("system" role) pour modifier le comportement du bot (prompt injection), ce qui permettrait :
- Changer la personnalité du bot
- Lui faire divulguer la clé API (si elle est dans `$SYSTEM_PROMPT`)
- Contourner les restrictions pédagogiques

**Recommandation :**
- **Ne JAMAIS accepter** le role "system" depuis le client
- Supprimer ce rôle du filtrage autorisé :
  ```php
  if (!in_array($role, ['user', 'assistant'], true)) continue;
  ```
- Reconstruire l'historique côté serveur uniquement à partir des messages utilisateur validés

### 3.3 HIGH-03 : Requête POST sans vérification CSRF

**Fichier :** `backend/chat.php` (lignes 292-296)  
**CWE :** CWE-352 (Cross-Site Request Forgery)

```javascript
// Frontend
const response = await fetch(API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: text, history: recentHistory })
});
```

**Problème :** Aucune vérification CSRF. Un site externe pourrait envoyer des requêtes POST à l'endpoint via fetch() avec `mode: no-cors`, gaspillant les tokens API.

**Recommandation :**
- Ajouter un header anti-CSRF (ex: `X-CSRF-Token`) généré aléatoirement stocké en session
- Vérifier l'origine avec `Origin` ou `Referer` header

### 3.4 HIGH-04 : CORS trop permissif

**Fichier :** `backend/chat.php` (ligne 25) et `backend/save.php` (ligne 21)  
**CWE :** CWE-942 (Permissive Cross-domain Policy)

```php
header('Access-Control-Allow-Origin: *');
```

**Problème :** Permet à n'importe quel domaine d'accéder à l'API. Bien que cela soit souvent nécessaire pour des apps XAMPP en développement, en production cela expose l'API à des abus.

**Recommandation :**
- En production, restreindre à l'origine spécifique : `header('Access-Control-Allow-Origin: https://mon-domaine.com');`
- Si plusieurs origines, gérer dynamiquement depuis une liste blanche

---

## 4. 🟡 Vulnérabilités Moyenne Priorité

### 4.1 MED-01 : Faille de chemin dans les logs

**Fichier :** `backend/chat.php` (ligne 59)  
**CWE :** CWE-73 (External Control of File Name or Path)

```php
$LOG_FILE = __DIR__ . '/data/chat.log';
```

**Problème :** `$LOG_FILE` est défini avec un chemin fixe mais si `__DIR__` est altéré ou si le serveur est mal configuré, des données sensibles pourraient fuiter. De plus, le log contient les messages utilisateur.

**Recommandation :**
- Ne pas logger le contenu complet des messages utilisateur
- Logger uniquement les métadonnées (timestamps, taille, statut HTTP)
- Ajouter une rotation des logs (ne pas laisser un fichier grossir indéfiniment)

### 4.2 MED-02 : Stockage des conversations en clair

**Fichier :** `backend/save.php` (lignes 97-113)  
**CWE :** CWE-312 (Cleartext Storage of Sensitive Information)

```php
$written = file_put_contents(
    $DATA_FILE,
    json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
);
```

**Problème :** Les conversations sont stockées en clair dans un fichier JSON accessible via le filesystem. Si le serveur est compromis, toutes les conversations sont lisibles sans déchiffrement.

**Recommandation :**
- Supprimer `save.php` si non utilisé (le frontend download déjà le JSON)
- OU chiffrer les conversations avec une clé secrète
- Ajouter une durée de rétention (auto-delete après X jours)

### 4.3 MED-03 : Injection SQL potentielle (future feature)

**Fichier :** `backend/save.php` (lignes 81-88)  
**CWE :** CWE-89 (SQL Injection)

```php
foreach ($messages as $m) {
    if (!isset($m['role'], $m['content'])) continue;
    $clean[] = [
        'role'      => $m['role'],
        'content'   => $m['content'],  // Non échappé
        'timestamp' => $m['timestamp'] ?? date('c')
    ];
}
```

**Problème :** Si une future feature ajoute une requête SQL avec ces données, le contenu n'est pas préparé/échappé. Même si actuellement le stockage est fichier (JSON), la pratique est risquée.

**Recommandation :**
- Toujours traiter le contenu comme potentiellement malveillant
- Si SQL est ajouté, utiliser des prepared statements

### 4.4 MED-04 : Taille de l'historique excessive

**Fichier :** `backend/config.example.php` (ligne 38)

```php
$MAX_HISTORY = 200;
```

**Problème :** 200 messages d'historique est excessif pour la plupart des APIs (OpenAI a une limite de tokens). Cela peut :
- Provoquer des erreurs 413 (payload too large)
- Consommer inutilement des tokens API
- Ralentir le traitement côté API

**Recommandation :**
- Réduire à 20-30 messages maximum
- Calculer le nombre de tokens approximatif avant l'envoi
- Tronquer l'historique par nombre de tokens plutôt que par nombre de messages

### 4.5 MED-05 : Pas de validation de la taille du message

**Fichier :** `backend/chat.php` (ligne 100)

```php
$message = trim((string)($payload['message'] ?? ''));
if ($message === '') {
    failWith('Le message ne peut pas être vide.', 400);
}
```

**Problème :** Un message de 1 Mo (10⁶ caractères) serait accepté et envoyé à l'API, consommant des ressources et potentiellement rejeté avec une erreur 413.

**Recommandation :**
- Ajouter une limite de taille :
  ```php
  $MAX_MSG_LENGTH = 5000;
  if (mb_strlen($message) > $MAX_MSG_LENGTH) {
      failWith('Message trop long (max ' . $MAX_MSG_LENGTH . ' caractères).', 413);
  }
  ```

---

## 5. 🟢 Vulnérabilités / Améliorations Basse Priorité

### 5.1 LOW-01 : Timestamps non fiables (décalage horaire client)

**Fichier :** `frontend/app.js` (lignes 272-277)

```javascript
messages.push({
  id: genId(),
  role: 'user',
  content: text,
  timestamp: new Date().toISOString()  // Heure du client (non fiable)
});
```

**Problème :** Le timestamp est généré côté client. Un utilisateur peut modifier son horloge système pour falsifier les dates.

**Recommandation :** Ajouter un timestamp côté serveur dans `chat.php` et le renvoyer au client.

### 5.2 LOW-02 : Absence de mécanisme de retry

**Fichier :** `backend/chat.php` (lignes 175-178)

```php
$responseRaw = curl_exec($ch);
$httpCode    = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError   = curl_error($ch);
curl_close($ch);
```

**Problème :** Aucun mécanisme de retry en cas d'erreur réseau temporaire.

**Recommandation :**
- Ajouter 1-2 tentatives avec backoff exponentiel
- Limiter à 3 tentatives maximum

### 5.3 LOW-03 : Pas de Content-Security-Policy

**Fichier :** `index.html`

```html
<!-- Aucune CSP présente -->
```

**Problème :** Pas de header CSP ou meta tag, ce qui signifie que l'application est vulnérable aux injections de scripts en l'absence de DOMPurify.

**Recommandation :**
- Ajouter un meta tag CSP :
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline';">
```

---

## 6. Plan de correction priorisé

### 🔴 Urgent (Corriger immédiatement)

| # | Fichier | Modification |
|---|---------|-------------|
| 1 | `frontend/app.js` | Remplacer le fallback regex XSS par un DOMPurify obligatoire (arrêter l'exécution si non chargé) |
| 2 | `backend/config.example.php` | `$DISPLAY_ERRORS = false;` (déjà fait par défaut) |
| 3 | `frontend/app.js` | Remplacer `convertToHTML` pour tout passer par DOMPurify avec configuration stricte |

### 🟠 Important (Corriger cette semaine)

| # | Fichier | Modification |
|---|---------|-------------|
| 4 | `backend/chat.php` | Ajouter rate limiting (session + IP) |
| 5 | `backend/chat.php` | Supprimer "system" des rôles autorisés dans l'historique client |
| 6 | `backend/chat.php` | Ajouter validation `Origin` / `Referer` header |
| 7 | `backend/chat.php` | Ajouter limite de taille du message (5000 caractères) |
| 8 | `backend/chat.php` | Restreindre CORS à l'origine du site |

### 🟡 Recommandé (Corriger ce mois)

| # | Fichier | Modification |
|---|---------|-------------|
| 9 | `frontend/app.js` | Ajouter CSP dans le HTML |
| 10 | `backend/config.example.php` | Réduire `$MAX_HISTORY` à 20-30 |
| 11 | `backend/chat.php` | Logger les métadonnées seulement (pas les messages) |
| 12 | `backend/save.php` | Considérer la suppression ou le chiffrement des conversations |
| 13 | `backend/chat.php` | Ajouter timestamp serveur dans la réponse JSON |

### 🟢 Optionnel

| # | Fichier | Modification |
|---|---------|-------------|
| 14 | `backend/chat.php` | Ajouter mécanisme de retry (1-2 tentatives) |
| 15 | `frontend/app.js` | Remplacer les IDs par des UUIDs fiables (pas Date.now() + random) |

---

## 7. Rappel : Bonnes pratiques déjà en place ✅

Points positifs à souligner :

| Pratique | Fichier |
|----------|---------|
| ✅ Utilisation de `declare(strict_types=1)` | `backend/chat.php`, `backend/save.php` |
| ✅ `.htaccess` backend protège config.php, logs, données | `backend/.htaccess` |
| ✅ `config.php` dans `.gitignore` | `.gitignore` |
| ✅ Gestion des timeout cURL (60s global, 10s connexion) | `backend/chat.php` |
| ✅ Validation du JSON entrant | `backend/chat.php` |
| ✅ Nettoyage minimal des messages | Tous les endpoints |
| ✅ Utilisation de DOMPurify (quand chargé) | `frontend/app.js` |
| ✅ Mode sombre/clair avec persistance localStorage | `frontend/app.js` |
| ✅ Historique limité côté frontend (10 derniers messages) | `frontend/app.js` |
| ✅ `target="_blank" rel="noopener noreferrer"` dans les liens | `frontend/app.js` |

---

*Rapport généré automatiquement. Il est recommandé de refaire un audit après chaque modification majeure.*