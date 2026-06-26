# 🤖 Chatbot IA — Vue.js 3 + PHP natif (XAMPP)

Application de chatbot complète, fonctionnant en local avec **XAMPP**, intégrant une API IA compatible OpenAI.

- **Frontend** : Vue.js 3 (via CDN, aucune compilation)
- **Backend** : PHP natif (sans framework)
- **Communication** : API IA compatible OpenAI (OpenAI, OpenRouter, Scaleway, etc.)
- **Sauvegarde** : téléchargement JSON côté navigateur + sauvegarde optionnelle côté serveur

---

## 📁 Structure du projet

```
chatbot-app/
├── index.html              # Point d'entrée HTML (charge Vue 3 + app.js)
├── README.md               # Ce fichier
├── frontend/
│   ├── styles.css          # Interface chat moderne (bulles, responsive)
│   └── app.js              # Logique Vue 3 (Composition API)
└── backend/
    ├── .htaccess           # Sécurité (bloque config.php, logs, data/)
    ├── config.php          # ⚠️ Votre clé API (NON exposée côté frontend)
    ├── chat.php            # Endpoint principal : reçoit msg → appelle API → renvoie reply
    ├── save.php            # Endpoint optionnel : sauvegarde la conversation côté serveur
    └── data/               # Logs + conversations sauvegardées (auto-créé)
```

---

## 🚀 Installation avec XAMPP

### 1. Installer XAMPP
Téléchargez et installez XAMPP : <https://www.apachefriends.org/>

### 2. Placer le projet dans `htdocs`
Copiez le dossier `chatbot-app` dans le répertoire `htdocs` de XAMPP :

- **Windows** : `C:\xampp\htdocs\chatbot-app`
- **macOS** : `/Applications/XAMPP/htdocs/chatbot-app`
- **Linux** : `/opt/lampp/htdocs/chatbot-app`

### 3. Configurer la clé API
Éditez le fichier `backend/config.php` et remplacez :

```php
$API_KEY = 'YOUR_API_KEY_HERE';
```

par votre clé API réelle (par exemple une clé OpenAI).

Vous pouvez aussi changer l'endpoint (`$API_URL`) et le modèle (`$MODEL`) si vous utilisez un autre fournisseur compatible OpenAI :

```php
// Exemple OpenAI
$API_URL = 'https://api.openai.com/v1/chat/completions';
$MODEL   = 'gpt-4o-mini';

// Exemple OpenRouter
$API_URL = 'https://openrouter.ai/api/v1/chat/completions';
$MODEL   = 'openai/gpt-4o-mini';
```

### 4. Démarrer Apache
- Ouvrez le **Panneau de contrôle XAMPP**
- Cliquez sur **Start** à côté de **Apache**
- (MySQL/PHP n'est pas requis pour ce projet)

### 5. Accéder à l'application
Ouvrez votre navigateur à l'adresse :

```
http://localhost/chatbot-app/
```

C'est tout ! Vous pouvez commencer à discuter avec le bot.

---

## ⚙️ Fonctionnement détaillé

### Frontend (Vue.js 3)
- L'interface est montée via **Composition API** (`createApp` + `setup`).
- Les messages sont stockés dans un tableau **réactif** (`reactive([])`).
- Chaque message a la forme :
  ```js
  { id, role: 'user' | 'assistant', content: string, timestamp: ISOString }
  ```
- À l'envoi, le frontend POST vers `backend/chat.php` avec :
  ```json
  { "message": "...", "history": [{"role":"...","content":"..."}, ...] }
  ```
- L'historique est **limité aux 10 derniers messages** (BONUS).
- Pendant la réponse, l'input est désactivé et un indicateur animé s'affiche.
- Le **scroll automatique** mène au dernier message.

### Backend (PHP natif)
- `chat.php` :
  1. Reçoit le JSON en POST
  2. Valide (message non vide, historique filtré)
  3. Construit le tableau `messages` (prompt système + historique + message courant)
  4. Appelle l'API IA via **cURL** avec `Authorization: Bearer API_KEY`
  5. Extrait `choices[0].message.content` et renvoie `{ "reply": "..." }`
- Gestion des erreurs : réseau, JSON invalide, API indisponible, réponse vide.
- **Logs simples** dans `backend/data/chat.log` (BONUS).
- `save.php` (optionnel) : enregistre la conversation dans `backend/data/conversations.json`.

### Sécurité
- La clé API est stockée **uniquement** dans `backend/config.php` (jamais exposée au frontend).
- Le fichier `.htaccess` bloque l'accès HTTP direct à `config.php`, `chat.log` et `conversations.json`.
- Les entrées utilisateur sont filtrées et validées.
- En-têtes CORS configurés pour autoriser les appels locaux.
- Désactivation possible de l'affichage des erreurs via `$DISPLAY_ERRORS` (passer à `false` en production).

---

## 🧪 Fonctionnalités (BONUS inclus)

| Fonctionnalité | Statut |
|---|---|
| Interface chat moderne (bulles) | ✅ |
| Alignement user/bot (droite/gauche) | ✅ |
| Envoi avec Enter | ✅ |
| Scroll automatique | ✅ |
| Indicateur de chargement animé | ✅ |
| Désactivation input pendant la réponse | ✅ |
| Bouton **Sauvegarder** (JSON téléchargeable) | ✅ |
| Bouton **Effacer conversation** | ✅ (BONUS) |
| Limitation historique à 10 messages | ✅ (BONUS) |
| Logs simples côté PHP | ✅ (BONUS) |
| Gestion des erreurs visible côté UI | ✅ (BONUS) |
| Sauvegarde serveur optionnelle (`save.php`) | ✅ |

---

## 🛠️ Dépannage

### "Erreur réseau : impossible de joindre l'API IA"
- Vérifiez que votre clé API est valide dans `backend/config.php`.
- Vérifiez l'`$API_URL` (doit pointer vers un endpoint compatible OpenAI).
- Vérifiez la connexion internet.
- Regardez `backend/data/chat.log` pour plus de détails.

### "Le message ne peut pas être vide"
- Le frontend a envoyé un payload sans champ `message` ou vide. Rechargez la page.

### L'interface ne se charge pas
- Vérifiez qu'Apache est démarré dans le panneau XAMPP.
- Accédez bien via `http://localhost/chatbot-app/` (pas en ouvrant le fichier directement).
- Vérifiez que Vue 3 se charge (connexion internet requise pour le CDN).

### Les messages ne s'affichent pas
- Ouvrez la console développeur (F12) pour voir d'éventuelles erreurs JS.
- Vérifiez l'onglet Réseau : la requête vers `backend/chat.php` doit renvoyer un HTTP 200.

### Je veux désactiver les logs PHP visibles
Dans `backend/config.php`, passez :
```php
$DISPLAY_ERRORS = false;
```

---

## 📦 Compatibilité

- ✅ PHP 7.4+ (testé avec PHP 8.x via XAMPP)
- ✅ Apache 2.4+ (XAMPP par défaut)
- ✅ Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- ❌ Aucune base de données requise
- ❌ Aucun outil de build (npm, vite, webpack) requis

---

## 🔒 Bonnes pratiques en production

Ce projet est pensé pour un **usage local / pédagogique**. Pour une mise en production :

1. Passez `$DISPLAY_ERRORS = false` dans `config.php`.
2. Ne laissez pas `Access-Control-Allow-Origin: *` : restreignez à votre domaine.
3. Ajoutez une authentification (login) sur `chat.php` et `save.php`.
4. Utilisez HTTPS.
5. Mettez en place un système de quota / rate-limiting par utilisateur.

---

## 📄 Licence

Projet libre d'utilisation à des fins pédagogiques.
