(() => {
  const currentLanguage = () => {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.includes('tr')) return 'tr';
    if (segments.includes('de')) return 'de';
    return 'en';
  };

  function targetLanguagePath(language) {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const currentLeaf = segments.at(-1) || 'index.html';
    const fileName = currentLeaf.endsWith('.html') ? currentLeaf : 'index.html';
    const hash = fileName === 'index.html' ? window.location.hash : '';
    const from = currentLanguage();
    if (language === from) return fileName + hash;
    const fromPrefix = from === 'en' ? '' : '../';
    const toPrefix = language === 'en' ? '' : `${language}/`;
    return `${fromPrefix}${toPrefix}${fileName}${hash}`;
  }

  function initLanguageSwitcher() {
    document.querySelectorAll('[data-lang-switch]').forEach((button) => {
      button.addEventListener('click', () => {
        const language = ['tr', 'de'].includes(button.dataset.langSwitch) ? button.dataset.langSwitch : 'en';
        window.location.href = targetLanguagePath(language);
      });
    });
  }

  function initMenu() {
    const button = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.mobile-menu');
    if (!button || !menu) return;
    button.addEventListener('click', () => {
      const open = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
    }));
  }

  function initHeroMoment() {
    if (!document.querySelector('.signal-figure')) return;
    requestAnimationFrame(() => document.documentElement.classList.add('is-ready'));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLanguageSwitcher();
    initMenu();
    initHeroMoment();
    document.querySelectorAll('.current-year').forEach((node) => { node.textContent = new Date().getFullYear(); });
  });
})();
