(function () {
  'use strict';

  let settings = {
    fakeRobux: 999999,
    enabled: true,
    format: 'full',
    color: '#00d68f',
    hidePending: false,
    animation: true,
    profileEnabled: false,
    fakeLevel: null,
    fakeFriends: null,
    fakeJoin: null
  };

  let observer = null;
  let lastAmount = null;

  // Load settings
  function loadSettings(callback) {
    chrome.storage.sync.get([
      'fakeRobux', 'enabled', 'format', 'color',
      'hidePending', 'animation', 'profileEnabled',
      'fakeLevel', 'fakeFriends', 'fakeJoin'
    ], (data) => {
      settings = {
        fakeRobux: data.fakeRobux !== undefined ? data.fakeRobux : 999999,
        enabled: data.enabled !== undefined ? data.enabled : true,
        format: data.format || 'full',
        color: data.color || '#00d68f',
        hidePending: data.hidePending || false,
        animation: data.animation !== undefined ? data.animation : true,
        profileEnabled: data.profileEnabled || false,
        fakeLevel: data.fakeLevel || null,
        fakeFriends: data.fakeFriends || null,
        fakeJoin: data.fakeJoin || null
      };
      if (callback) callback();
    });
  }

  // Format number
  function formatRobux(n) {
    if (n === null || n === undefined) return '';
    const num = Number(n);

    switch (settings.format) {
      case 'short':
        if (num >= 1e9) return (num / 1e9).toFixed(num % 1e9 === 0 ? 0 : 1) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(num % 1e6 === 0 ? 0 : 1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(num % 1e3 === 0 ? 0 : 1) + 'K';
        return num.toString();
      case 'decimal':
        if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toString();
      case 'k':
        if (num >= 1000) return Math.floor(num / 1000) + 'K';
        return num.toString();
      case 'full':
      default:
        return num.toLocaleString('fr-FR');
    }
  }

  // Apply glow animation
  function applyGlow(el) {
    if (!settings.animation) return;
    el.style.transition = 'text-shadow 0.4s ease, color 0.3s ease';
    el.style.textShadow = `0 0 8px ${settings.color}aa, 0 0 16px ${settings.color}66`;
    setTimeout(() => {
      el.style.textShadow = `0 0 4px ${settings.color}55`;
    }, 400);
  }

  // Update Robux display
  function updateRobux() {
    if (!settings.enabled) return;

    const selectors = [
      '#nav-robux-amount',
      '.nav-robux-amount',
      '[id*="robux-amount"]',
      '[class*="robux-amount"]',
      '[class*="RobuxAmount"]',
      '.currency-amount',
      '[data-testid*="robux"]',
      '.header-currency-balance',
      '.robux-text'
    ];

    const formatted = formatRobux(settings.fakeRobux);
    const changed = lastAmount !== settings.fakeRobux;
    lastAmount = settings.fakeRobux;

    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        const text = el.textContent.trim();
        if (/^[\d\s.,KMB+]*$/i.test(text) || text === '' || el.id === 'nav-robux-amount' || el.hasAttribute('data-fake-robux')) {
          if (el.textContent !== formatted) {
            el.textContent = formatted;
            el.setAttribute('data-fake-robux', 'true');
          }
          el.style.color = settings.color;
          if (changed) applyGlow(el);
        }
      });
    });
  }

  // Hide pending Robux
  function hidePending() {
    if (!settings.enabled || !settings.hidePending) return;

    const pendingSelectors = [
      '[class*="pending-robux"]',
      '[class*="robux-pending"]',
      '[class*="pending-amount"]',
      '.pending-robux',
      '.robux-pending',
      '[data-testid*="pending"]'
    ];

    pendingSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.display = 'none';
        el.setAttribute('data-hidden-by-rolar', 'true');
      });
    });

    // Also hide text nodes containing "Pending"
    document.querySelectorAll('span, div, p').forEach(el => {
      if (el.children.length === 0 && /pending/i.test(el.textContent) && el.textContent.length < 40) {
        const parent = el.closest('[class*="robux"], [class*="currency"], [class*="balance"]');
        if (parent) {
          parent.style.display = 'none';
          parent.setAttribute('data-hidden-by-rolar', 'true');
        }
      }
    });
  }

  // Profile LARP
  function updateProfile() {
    if (!settings.enabled || !settings.profileEnabled) return;

    // Friends count
    if (settings.fakeFriends !== null) {
      document.querySelectorAll('[class*="friend"], [class*="Friend"]').forEach(el => {
        const text = el.textContent.trim();
        if (/^\d+$/.test(text) || /^\d{1,3}([.,\s]\d{3})*$/.test(text)) {
          const parentText = (el.parentElement?.textContent || '').toLowerCase();
          if (parentText.includes('friend') || parentText.includes('ami')) {
            el.textContent = settings.fakeFriends.toLocaleString('fr-FR');
            el.style.color = settings.color;
          }
        }
      });

      document.querySelectorAll('span, div, a').forEach(el => {
        if (el.children.length > 0) return;
        const t = el.textContent.trim().toLowerCase();
        if (t === 'friends' || t === 'amis' || t.startsWith('friends') || t.startsWith('amis')) {
          let sibling = el.nextElementSibling || el.previousElementSibling;
          if (sibling && /^\d/.test(sibling.textContent.trim())) {
            sibling.textContent = settings.fakeFriends.toLocaleString('fr-FR');
            sibling.style.color = settings.color;
          }
          const parent = el.parentElement;
          if (parent) {
            parent.querySelectorAll('span, div').forEach(child => {
              if (child !== el && /^\d{1,4}$/.test(child.textContent.trim())) {
                child.textContent = settings.fakeFriends.toLocaleString('fr-FR');
                child.style.color = settings.color;
              }
            });
          }
        }
      });
    }

    // Join date
    if (settings.fakeJoin) {
      document.querySelectorAll('span, div, p, li').forEach(el => {
        if (el.children.length > 2) return;
        const text = el.textContent.trim();
        if (/joined|member since|date d'inscription|inscrit/i.test(text) && text.length < 60) {
          el.textContent = text.replace(
            /(Joined|Member since|Date d'inscription|Inscrit le?)\s*.*/i,
            `$1 ${settings.fakeJoin}`
          );
          el.style.color = settings.color;
        }
      });
    }

    // Level
    if (settings.fakeLevel !== null) {
      document.querySelectorAll('span, div').forEach(el => {
        if (el.children.length > 0) return;
        const t = el.textContent.trim().toLowerCase();
        if (t.includes('level') || t.includes('niveau')) {
          const parent = el.parentElement;
          if (parent) {
            parent.querySelectorAll('span, div').forEach(child => {
              if (child !== el && /^\d{1,3}$/.test(child.textContent.trim())) {
                child.textContent = settings.fakeLevel;
                child.style.color = settings.color;
              }
            });
          }
        }
      });
    }
  }

  // Main update
  function updateAll() {
    updateRobux();
    hidePending();
    updateProfile();
  }

  // Observer
  function startObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver(() => {
      updateAll();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  // Init
  function init() {
    loadSettings(() => {
      updateAll();
      startObserver();
      setInterval(updateAll, 1800);
    });
  }

  // Listen for changes
  chrome.storage.onChanged.addListener((changes) => {
    for (const key in changes) {
      settings[key] = changes[key].newValue;
    }
    lastAmount = null; // force glow
    updateAll();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
