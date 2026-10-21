// Clé d’accès Make : elle n’est jamais écrite dans le code du site.
// Elle est demandée une fois par navigateur puis ajoutée (champ "access_key")
// à chaque requête JSON envoyée aux webhooks Make. Les scénarios Make
// refusent toute requête dont la clé ne correspond pas.
(function () {
  const STORAGE_KEY = 'magic_studio_access_key';

  function readKey() {
    try { return localStorage.getItem(STORAGE_KEY) || ''; } catch (_) { return ''; }
  }

  function askKey() {
    const value = (window.prompt('Clé d’accès Magic Studio :') || '').trim();
    if (value) { try { localStorage.setItem(STORAGE_KEY, value); } catch (_) {} }
    return value;
  }

  window.resetMagicStudioAccessKey = function () {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    return askKey();
  };

  const nativeFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    if (url.includes('hook.eu1.make.com') && init && typeof init.body === 'string') {
      try {
        const data = JSON.parse(init.body);
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          data.access_key = readKey() || askKey();
          init = { ...init, body: JSON.stringify(data) };
        }
      } catch (_) {}
    }
    return nativeFetch(input, init);
  };
})();
