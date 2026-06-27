/* =================================================================
   Chatbot IA — Application Vue 3 (Composition API) v3.0
   -----------------------------------------------------------------
   Fonctionnalités :
     - Messages (user / assistant) avec Markdown → HTML
     - Envoi au backend PHP /backend/chat.php
     - État de chargement
     - Scroll automatique + bouton scroll-to-bottom
     - Sauvegarde / export JSON
     - Effacement avec confirmation
     - Mode sombre / clair (localStorage + animation)
     - Auto-resize textarea
     - Bouton copier (clipboard)
     - Notifications toast
     - Historique persistant (localStorage) avec sidebar
     - Édition du dernier message (double-clic)
     - Regénération de réponse
     - Suppression individuelle
     - Raccourci Enter / Shift+Enter
     - Timestamps relatifs avec mise à jour auto
     - Liens cliquables automatiques
     - Protection XSS via DOMPurify
     - Coloration syntaxique du code via Highlight.js
     - Quick prompts cliquables sur écran d'accueil
     - Sidebar historique multi-conversations
     - Effet ripple sur les boutons
     - Animation thème améliorée
     - Compteur de caractères
   ================================================================= */

const { createApp, ref, reactive, nextTick, onMounted, onUnmounted, watch } = Vue;

createApp({
  setup() {

    /* ---------------------------------------------------------
       État réactif
    --------------------------------------------------------- */
    const messages = reactive([]);
    const userInput = ref('');
    const loading = ref(false);
    const errorMessage = ref('');

    const messagesContainer = ref(null);
    const chatTextarea = ref(null);
    const toastEl = ref(null);

    const API_URL = 'backend/chat.php';
    const isDark = ref(false);
    const themeTransitioning = ref(false);

    /* ---------- Sidebar / Conversations ---------- */
    const sidebarOpen = ref(false);
    const conversations = reactive([]);
    const activeConversationId = ref(null);

    const CONV_STORAGE_KEY = 'chatbot-conversations';
    const ACTIVE_CONV_KEY = 'chatbot-active-conv';

    /* ---------- Quick Prompts ---------- */
    const quickPrompts = [
      { icon: '🗄️', text: 'Créer une table SQL', query: 'Comment créer une table en SQL avec CREATE TABLE ? Explique-moi les types de données, les clés primaires et les contraintes.' },
      { icon: '🔍', text: 'Requête SELECT', query: 'Comment utiliser SELECT pour afficher des données ? Explique-moi les clauses FROM, WHERE, ORDER BY et les opérateurs de filtre.' },
      { icon: '✏️', text: 'INSERT INTO', query: 'Comment insérer des données dans une table avec INSERT INTO ? Donne-moi un exemple avec plusieurs lignes.' },
      { icon: '🔗', text: 'Clés étrangères', query: 'Qu\'est-ce qu\'une clé étrangère en SQL ? Comment créer une relation entre deux tables avec FOREIGN KEY ?' },
      { icon: '📊', text: 'LIKE & filtres', query: 'Comment utiliser l\'opérateur LIKE avec les jokers % et _ en SQL pour filtrer les résultats ?' },
      { icon: '💡', text: 'UPDATE & DELETE', query: 'Comment modifier des données avec UPDATE SET et supprimer des lignes avec DELETE FROM en SQL ?' }
    ];

    /* ---------- Mode pédagogique ---------- */
    const pedagogyMode = ref('debutant'); // debutant | intermediaire | avance
    const PEDAGOGY_KEY = 'chatbot-pedagogy-mode';

    const pedagogyLabels = {
      debutant: '🟢 Débutant',
      intermediaire: '🟡 Intermédiaire',
      avance: '🔴 Avancé'
    };

    const PEDAGOGY_PROMPTS = {
      debutant: 'L\'élève est débutant. Utilise un langage simple, explique chaque concept pas à pas avec des analogies du quotidien. Donne des exemples très concrets. Encourage et félicite progrès.',
      intermediaire: 'L\'élève a des bases solides en SQL. Va droit au but avec des explications claires mais pas trop détaillées. Propose des exercices de niveau moyen.',
      avance: 'L\'élève est avancé. Donne des réponses techniques précises, mentionne les bonnes pratiques et les pièges courants. Propose des défis complexes.'
    };

    const setPedagogyMode = (mode) => {
      pedagogyMode.value = mode;
      localStorage.setItem(PEDAGOGY_KEY, mode);
    };

    const loadPedagogyMode = () => {
      const saved = localStorage.getItem(PEDAGOGY_KEY);
      if (saved && ['debutant', 'intermediaire', 'avance'].includes(saved)) {
        pedagogyMode.value = saved;
      }
    };

    /* ---------- Menu actions header ---------- */
    const menuOpen = ref(false);
    const headerMenuRef = ref(null);
    let menuDropdownEl = null;

    const createMenuDropdown = () => {
      const el = document.createElement('div');
      el.className = 'menu-dropdown';
      el.innerHTML = `
        <button class="menu-item" data-action="export-md">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3v4a1 1 0 001 1h4"/><path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><polyline points="9 14 12 17 15 14"/></svg>
          <span>Exporter en Markdown</span>
        </button>
        <button class="menu-item" data-action="export-json">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          <span>Sauvegarder JSON</span>
        </button>
        <div class="menu-divider"></div>
        <button class="menu-item menu-danger" data-action="clear">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          <span>Effacer la conversation</span>
        </button>
      `;
      return el;
    };

    const toggleMenu = (event) => {
      if (menuOpen.value) {
        closeMenu();
        return;
      }
      const trigger = event.currentTarget;
      const rect = trigger.getBoundingClientRect();
      menuDropdownEl = createMenuDropdown();

      // Bind actions
      menuDropdownEl.querySelector('[data-action="export-md"]').addEventListener('click', () => {
        exportMarkdown();
        closeMenu();
      });
      menuDropdownEl.querySelector('[data-action="export-json"]').addEventListener('click', () => {
        saveConversation();
        closeMenu();
      });
      menuDropdownEl.querySelector('[data-action="clear"]').addEventListener('click', () => {
        clearConversation();
        closeMenu();
      });

      // Position below the trigger
      menuDropdownEl.style.position = 'fixed';
      menuDropdownEl.style.top = (rect.bottom + 8) + 'px';
      menuDropdownEl.style.right = (window.innerWidth - rect.right) + 'px';
      menuDropdownEl.style.left = 'auto';
      menuDropdownEl.style.zIndex = '9999';

      document.body.appendChild(menuDropdownEl);
      menuOpen.value = true;

      // Disable buttons that should be disabled
      const disableBtns = messages.length === 0;
      menuDropdownEl.querySelectorAll('.menu-item').forEach(btn => {
        btn.disabled = disableBtns;
      });
    };

    const closeMenu = () => {
      menuOpen.value = false;
      if (menuDropdownEl && menuDropdownEl.parentNode) {
        menuDropdownEl.parentNode.removeChild(menuDropdownEl);
        menuDropdownEl = null;
      }
    };

    const closeMenuOnOutsideClick = (e) => {
      if (menuOpen.value && menuDropdownEl && !e.target.closest('.header-menu') && !menuDropdownEl.contains(e.target)) {
        closeMenu();
      }
    };

    /* ---------- Barre de recherche ---------- */
    const searchOpen = ref(false);
    const searchQuery = ref('');
    const searchResults = reactive([]);
    const searchIndex = ref(0);

    const toggleSearch = () => {
      searchOpen.value = !searchOpen.value;
      if (!searchOpen.value) {
        searchQuery.value = '';
        searchResults.splice(0, searchResults.length);
        searchIndex.value = 0;
      }
    };

    const performSearch = () => {
      searchResults.splice(0, searchResults.length);
      searchIndex.value = 0;
      const q = searchQuery.value.trim().toLowerCase();
      if (!q) return;
      messages.forEach((m, idx) => {
        if (m.content && m.content.toLowerCase().includes(q)) {
          searchResults.push(idx);
        }
      });
      if (searchResults.length > 0) {
        scrollToMessage(searchResults[0]);
      }
    };

    const nextSearchResult = () => {
      if (searchResults.length === 0) return;
      searchIndex.value = (searchIndex.value + 1) % searchResults.length;
      scrollToMessage(searchResults[searchIndex.value]);
    };

    const prevSearchResult = () => {
      if (searchResults.length === 0) return;
      searchIndex.value = (searchIndex.value - 1 + searchResults.length) % searchResults.length;
      scrollToMessage(searchResults[searchIndex.value]);
    };

    const scrollToMessage = (msgIndex) => {
      nextTick(() => {
        const rows = document.querySelectorAll('.message-row');
        if (rows[msgIndex]) {
          rows[msgIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
          rows[msgIndex].classList.add('search-highlight');
          setTimeout(() => rows[msgIndex].classList.remove('search-highlight'), 1500);
        }
      });
    };

    /* ---------- Export Markdown ---------- */
    const exportMarkdown = () => {
      if (messages.length === 0) {
        showToast('💬 Aucun message à exporter');
        return;
      }
      let md = '# Conversation SQL — Export\n\n';
      md += `_Exportée le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}_\n\n---\n\n`;
      messages.forEach(m => {
        const role = m.role === 'user' ? '👤 **Vous**' : '🤖 **Assistant SQL**';
        md += `### ${role}\n\n${m.content}\n\n---\n\n`;
      });
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-sql-${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('📄 Export Markdown téléchargé !');
    };

    /* ---------- Copie des blocs de code ---------- */
    const addCopyButtonsToCodeBlocks = () => {
      nextTick(() => {
        document.querySelectorAll('.message-content pre').forEach((pre) => {
          if (pre.querySelector('.code-copy-btn')) return;
          const btn = document.createElement('button');
          btn.className = 'code-copy-btn';
          btn.innerHTML = '📋 Copier';
          btn.title = 'Copier le code';
          btn.addEventListener('click', async () => {
            const code = pre.querySelector('code');
            const text = code ? code.textContent : pre.textContent;
            try {
              await navigator.clipboard.writeText(text);
              btn.innerHTML = '✅ Copié !';
              btn.classList.add('copied');
              setTimeout(() => {
                btn.innerHTML = '📋 Copier';
                btn.classList.remove('copied');
              }, 2000);
            } catch (_) {
              const ta = document.createElement('textarea');
              ta.value = text;
              ta.style.position = 'fixed';
              ta.style.opacity = '0';
              document.body.appendChild(ta);
              ta.select();
              document.execCommand('copy');
              document.body.removeChild(ta);
              btn.innerHTML = '✅ Copié !';
              setTimeout(() => { btn.innerHTML = '📋 Copier'; }, 2000);
            }
          });
          pre.style.position = 'relative';
          pre.appendChild(btn);
        });
      });
    };

    /* ---------------------------------------------------------
       Persistance localStorage — Conversations
    --------------------------------------------------------- */
    const saveConversationsToStorage = () => {
      try {
        localStorage.setItem(CONV_STORAGE_KEY, JSON.stringify(conversations));
      } catch (e) { /* ignore */ }
    };

    const loadConversationsFromStorage = () => {
      try {
        const saved = localStorage.getItem(CONV_STORAGE_KEY);
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return;
        parsed.forEach(c => conversations.push(c));
      } catch (e) { /* ignore */ }
    };

    const saveActiveConvId = () => {
      try {
        localStorage.setItem(ACTIVE_CONV_KEY, activeConversationId.value || '');
      } catch (e) { /* ignore */ }
    };

    const loadActiveConvId = () => {
      try {
        return localStorage.getItem(ACTIVE_CONV_KEY) || null;
      } catch (e) { return null; }
    };

    /* ---------- Persistance localStorage — Messages ---------- */
    const STORAGE_KEY = 'chatbot-messages';
    let _restoring = false;

    const saveToStorage = () => {
      if (_restoring) return;
      try {
        const snapshot = [];
        for (let i = 0; i < messages.length; i++) {
          const m = messages[i];
          snapshot.push({
            id: m.id, role: m.role, content: m.content, timestamp: m.timestamp
          });
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      } catch (e) { /* ignore */ }
    };

    const loadFromStorage = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return;
        _restoring = true;
        const lenBefore = messages.length;
        parsed.forEach(m => messages.push(m));
        _restoring = false;
        if (messages.length > lenBefore) {
          saveToStorage();
        }
      } catch (e) {
        _restoring = false;
      }
    };

    /* ---------- Theme ---------- */
    const savedTheme = localStorage.getItem('chatbot-theme');
    if (savedTheme === 'dark') {
      isDark.value = true;
    }

    onMounted(() => {
      if (isDark.value) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
      loadPedagogyMode();
      loadConversationsFromStorage();
      document.addEventListener('click', closeMenuOnOutsideClick);
      const lastActiveId = loadActiveConvId();
      if (lastActiveId && conversations.find(c => c.id === lastActiveId)) {
        activeConversationId.value = lastActiveId;
        loadConversationMessages(lastActiveId);
      } else {
        loadFromStorage();
      }
      scrollToBottom();
      setupRippleEffects();
    });

    const toggleTheme = () => {
      themeTransitioning.value = true;
      isDark.value = !isDark.value;
      if (isDark.value) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('chatbot-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('chatbot-theme', 'light');
      }
      setTimeout(() => { themeTransitioning.value = false; }, 500);
    };

    /* ---------------------------------------------------------
       Conversations — CRUD
    --------------------------------------------------------- */
    const genConvId = () => 'conv-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    const updateCurrentConversation = () => {
      if (!activeConversationId.value) return;
      const conv = conversations.find(c => c.id === activeConversationId.value);
      if (!conv) return;
      conv.messages = messages.map(m => ({
        id: m.id, role: m.role, content: m.content, timestamp: m.timestamp
      }));
      conv.messageCount = messages.length;
      conv.updatedAt = new Date().toISOString();
      conv.preview = messages.length > 0
        ? messages[messages.length - 1].content.substring(0, 60)
        : '';
      saveConversationsToStorage();
    };

    const newConversation = () => {
      if (messages.length > 0) {
        updateCurrentConversation();
      }
      messages.splice(0, messages.length);
      errorMessage.value = '';
      const newId = genConvId();
      conversations.unshift({
        id: newId,
        preview: '',
        messageCount: 0,
        updatedAt: new Date().toISOString(),
        messages: []
      });
      activeConversationId.value = newId;
      saveConversationsToStorage();
      saveActiveConvId();
      sidebarOpen.value = false;
    };

    const loadConversationMessages = (convId) => {
      const conv = conversations.find(c => c.id === convId);
      if (!conv) return;
      messages.splice(0, messages.length);
      if (conv.messages && conv.messages.length > 0) {
        conv.messages.forEach(m => messages.push({ ...m }));
      }
    };

    const loadConversation = (convId) => {
      if (messages.length > 0 && activeConversationId.value) {
        updateCurrentConversation();
      }
      activeConversationId.value = convId;
      loadConversationMessages(convId);
      saveActiveConvId();
      sidebarOpen.value = false;
      scrollToBottom();
    };

    const deleteConversation = (convId) => {
      const idx = conversations.findIndex(c => c.id === convId);
      if (idx === -1) return;
      conversations.splice(idx, 1);
      saveConversationsToStorage();
      if (activeConversationId.value === convId) {
        activeConversationId.value = null;
        messages.splice(0, messages.length);
        if (conversations.length > 0) {
          loadConversation(conversations[0].id);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      showToast('🗑️ Conversation supprimée');
    };

    /* ---------- Scroll-to-bottom ---------- */
    const showScrollBtn = ref(false);
    let _scrollRafId = null;

    const checkScroll = () => {
      const el = messagesContainer.value;
      if (!el) return;
      showScrollBtn.value = el.scrollHeight - el.scrollTop - el.clientHeight > 100;
    };

    const onScroll = () => {
      if (_scrollRafId) return;
      _scrollRafId = requestAnimationFrame(() => {
        checkScroll();
        _scrollRafId = null;
      });
    };

    onMounted(() => {
      const el = messagesContainer.value;
      if (el) el.addEventListener('scroll', onScroll);
    });

    onUnmounted(() => {
      const el = messagesContainer.value;
      if (el) el.removeEventListener('scroll', onScroll);
      if (_scrollRafId) cancelAnimationFrame(_scrollRafId);
      document.removeEventListener('click', closeMenuOnOutsideClick);
    });

    /* ---------- Toast ---------- */
    const toastMessage = ref('');
    let toastTimeout = null;

    const showToast = (msg) => {
      toastMessage.value = msg;
      if (toastEl.value) toastEl.value.classList.add('show');
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        if (toastEl.value) toastEl.value.classList.remove('show');
      }, 2200);
    };

    /* ---------- Utilitaires ---------- */
    // Génération d'UUID fiable (crypto API) avec fallback
    const genId = () => {
      try {
        return crypto.randomUUID();
      } catch (_) {
        // Fallback : UUID v4 compatible
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
      }
    };

    const scrollToBottom = async () => {
      await nextTick();
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
      showScrollBtn.value = false;
    };

    const autoResizeTextarea = () => {
      const el = chatTextarea.value;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 150) + 'px';
    };

    const resetTextareaHeight = () => {
      const el = chatTextarea.value;
      if (!el) return;
      el.style.height = 'auto';
    };

    onMounted(() => {
      autoResizeTextarea();
    });

    /* ---------- Ripple Effect ---------- */
    const setupRippleEffects = () => {
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn, .send-btn, .quick-prompt-btn');
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    };

    /* ---------- Envoi : Enter / Shift+Enter ---------- */
    const handleKeydown = (event) => {
      if (event.key === 'Enter') {
        if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          sendMessage();
        }
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          sendMessage();
        }
      }
    };

    onMounted(() => {
      const el = chatTextarea.value;
      if (el) el.addEventListener('keydown', handleKeydown);
    });

    onUnmounted(() => {
      const el = chatTextarea.value;
      if (el) el.removeEventListener('keydown', handleKeydown);
    });

    /* ---------- Timestamps relatifs ---------- */
    const _now = ref(Date.now());
    let _intervalId = null;

    onMounted(() => {
      _intervalId = setInterval(() => {
        _now.value = Date.now();
      }, 10000);
    });

    onUnmounted(() => {
      if (_intervalId) clearInterval(_intervalId);
    });

    const formatRelativeTime = (iso) => {
      try {
        const now = new Date(_now.value);
        const date = new Date(iso);
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 10) return "À l'instant";
        if (diffSec < 60) return `Il y a ${diffSec}s`;
        if (diffMin === 1) return 'Il y a 1 min';
        if (diffMin < 60) return `Il y a ${diffMin} min`;
        if (diffHour === 1) return 'Il y a 1 h';
        if (diffHour < 24) return `Il y a ${diffHour} h`;
        if (diffDay === 1) return 'Hier';
        if (diffDay < 7) return `Il y a ${diffDay} jours`;

        return date.toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
      } catch (e) {
        return '';
      }
    };

    /* ---------------------------------------------------------
       Envoi d'un message
    --------------------------------------------------------- */
    const sendMessage = async (regenerateId = null) => {
      let text;

      if (regenerateId) {
        const botIndex = messages.findIndex(m => m.id === regenerateId);
        if (botIndex < 1) return;
        const userMsg = messages[botIndex - 1];
        if (userMsg.role !== 'user') return;
        text = userMsg.content;
        messages.splice(botIndex, 1);
      } else {
        text = userInput.value.trim();
        if (!text || loading.value) return;

        messages.push({
          id: genId(),
          role: 'user',
          content: text,
          timestamp: new Date().toISOString()
        });
        userInput.value = '';
        resetTextareaHeight();
      }

      errorMessage.value = '';
      loading.value = true;
      await scrollToBottom();

      try {
        const recentHistory = messages
          .filter(m => m.content && m.role)
          .slice(-10)
          .map(m => ({ role: m.role, content: m.content }));

        // Injecter le contexte pédagogique dans le prompt
        const pedagogyContext = PEDAGOGY_PROMPTS[pedagogyMode.value] || '';
        const messageWithContext = pedagogyContext
          ? `[Contexte pédagogique : ${pedagogyContext}]`
          : text;

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageWithContext, history: recentHistory })
        });

        if (!response.ok) {
          let errorMsg = `Erreur HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData?.error || errorMsg;
          } catch (_) {}
          throw new Error(errorMsg);
        }

        const data = await response.json();

        if (!data || !data.reply) {
          throw new Error('Réponse invalide du serveur');
        }

        messages.push({
          id: genId(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString()
        });

      } catch (err) {
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          errorMessage.value = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
        } else {
          errorMessage.value = err.message || 'Une erreur est survenue. Réessayez.';
        }
        console.error('Erreur chat :', err);
      } finally {
        loading.value = false;
        await scrollToBottom();
        saveToStorage();
        updateCurrentConversation();
        highlightAllCode();
      }
    };

    /* ---------- Quick Prompts ---------- */
    const sendQuickPrompt = (prompt) => {
      userInput.value = prompt.query;
      sendMessage();
    };

    /* ---------------------------------------------------------
       Renvoyer un message utilisateur (utile en cas d'erreur)
    --------------------------------------------------------- */
    const resendMessage = async (msgId) => {
      const idx = messages.findIndex(m => m.id === msgId);
      if (idx === -1) return;
      const userMsg = messages[idx];
      if (userMsg.role !== 'user') return;

      // Supprimer les messages après celui-ci (la réponse associée)
      messages.splice(idx + 1);

      // Remplir l'input et envoyer
      userInput.value = userMsg.content;
      sendMessage();
    };

    /* ---------------------------------------------------------
       Copier
    --------------------------------------------------------- */
    const copyMessage = async (text, event) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast('📋 Copié !');
        const btn = event.currentTarget;
        btn.classList.add('copied');
        setTimeout(() => {
          btn.classList.remove('copied');
        }, 1500);
      } catch (err) {
        try {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          showToast('📋 Copié !');
        } catch (_) {
          showToast('⚠️ Copie non supportée');
        }
      }
    };

    /* ---------------------------------------------------------
       Suppression individuelle
    --------------------------------------------------------- */
    const deleteMessage = (msgId) => {
      const idx = messages.findIndex(m => m.id === msgId);
      if (idx === -1) return;
      const role = messages[idx].role;
      messages.splice(idx, 1);
      saveToStorage();
      updateCurrentConversation();
      showToast(role === 'user' ? '🗑️ Message supprimé' : '🗑️ Réponse supprimée');
    };

    /* ---------------------------------------------------------
       Édition
    --------------------------------------------------------- */
    const editingMessageId = ref(null);
    const editingContent = ref('');

    const startEditMessage = (msg) => {
      if (loading.value) return;
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg || lastMsg.id !== msg.id) return;
      if (lastMsg.role !== 'user') return;
      editingMessageId.value = msg.id;
      editingContent.value = msg.content;
      nextTick(() => {
        const editTa = document.querySelector('.edit-textarea');
        if (editTa) editTa.focus();
      });
    };

    const cancelEdit = () => {
      editingMessageId.value = null;
      editingContent.value = '';
    };

    const saveEdit = () => {
      const text = editingContent.value.trim();
      if (!text) return;
      const idx = messages.findIndex(m => m.id === editingMessageId.value);
      if (idx === -1) return;
      messages[idx].content = text;
      messages[idx].timestamp = new Date().toISOString();
      cancelEdit();
      saveToStorage();
      updateCurrentConversation();
      showToast('✏️ Message modifié');
    };

    const handleEditKeydown = (event) => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        saveEdit();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        cancelEdit();
      }
    };

    /* ---------------------------------------------------------
       Conversion Markdown → HTML avec protection XSS + Highlight.js
    --------------------------------------------------------- */
    const highlightAllCode = () => {
      nextTick(() => {
        if (typeof hljs !== 'undefined') {
          document.querySelectorAll('.message-content pre code').forEach((block) => {
            if (!block.dataset.highlighted) {
              hljs.highlightElement(block);
              block.dataset.highlighted = 'true';
            }
          });
        }
      });
    };

    const convertToHTML = (text) => {
      if (!text) return '';
      // 1. Vérifier que DOMPurify est disponible (obligatoire)
      if (typeof DOMPurify === 'undefined' || typeof DOMPurify.sanitize !== 'function') {
        console.error('DOMPurify n\'est pas chargé — abandon du rendu pour sécurité XSS');
        return '<p><em>Erreur de sécurité : impossible d\'afficher le message.</em></p>';
      }
      // 2. Markdown → HTML
      let html = marked.parse(text);
      // 3. Protection XSS avec configuration stricte
      html = DOMPurify.sanitize(html, {
        ALLOWED_PROTOCOLS: ['http', 'https', 'mailto'],
        FORBID_TAGS: ['style', 'form', 'input', 'button', 'select', 'textarea']
      });
      // 4. Liens cliquables (uniquement si aucun lien HTML n'existe déjà)
      if (!/<a\s/i.test(html)) {
        html = html.replace(
          /(https?:\/\/[^\s<"]+)/gi,
          (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
        );
      }
      // 5. Highlight.js sur les blocs de code après rendu
      nextTick(() => highlightAllCode());
      return html;
    };

    // Observer les changements de messages pour highlight le code
    watch(() => messages.length, () => {
      nextTick(() => highlightAllCode());
    });

    /* ---------------------------------------------------------
       Sauvegarde JSON (export)
    --------------------------------------------------------- */
    const saveConversation = () => {
      if (messages.length === 0) {
        showToast('💬 Aucun message à sauvegarder');
        return;
      }
      const exportData = {
        exported_at: new Date().toISOString(),
        message_count: messages.length,
        messages: messages.map(m => ({
          role: m.role, content: m.content, timestamp: m.timestamp
        }))
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('💾 Conversation sauvegardée !');
    };

    /* ---------------------------------------------------------
       Effacement avec confirmation
    --------------------------------------------------------- */
    const clearConversation = () => {
      if (loading.value) return;
      if (messages.length === 0) {
        showToast('💬 Déjà vide');
        return;
      }
      if (messages.length > 3) {
        if (!confirm('🗑️ Effacer toute la conversation ?')) return;
      }
      messages.splice(0, messages.length);
      errorMessage.value = '';
      saveToStorage();
      if (activeConversationId.value) {
        updateCurrentConversation();
      }
      showToast('🗑️ Conversation effacée');
    };

    /* ---------------------------------------------------------
       Return
    --------------------------------------------------------- */
    return {
      messages, userInput, loading, errorMessage,
      messagesContainer, chatTextarea, toastEl, toastMessage,
      showScrollBtn, isDark, themeTransitioning,
      editingMessageId, editingContent,
      sendMessage, resendMessage, saveConversation, clearConversation,
      formatRelativeTime, convertToHTML, toggleTheme,
      autoResizeTextarea, copyMessage, deleteMessage,
      startEditMessage, cancelEdit, saveEdit, handleEditKeydown, scrollToBottom,
      // New features
      quickPrompts, sendQuickPrompt,
      sidebarOpen, conversations, activeConversationId,
      newConversation, loadConversation, deleteConversation,
      // Pedagogy
      pedagogyMode, pedagogyLabels, setPedagogyMode,
      // Search
      searchOpen, searchQuery, searchResults, searchIndex,
      toggleSearch, performSearch, nextSearchResult, prevSearchResult,
      // Export MD
      exportMarkdown,
      // Copy code
      addCopyButtonsToCodeBlocks,
      // Menu
      menuOpen, toggleMenu, headerMenuRef
    };
  }
}).mount('#app');