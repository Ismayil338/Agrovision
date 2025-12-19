function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');
  if (mobileMenu) {
    mobileMenu.classList.toggle('hidden');
    if (menuIcon && closeIcon) {
      menuIcon.classList.toggle('hidden');
      closeIcon.classList.toggle('hidden');
    }
  }
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');
  if (mobileMenu) {
    mobileMenu.classList.add('hidden');
    if (menuIcon && closeIcon) {
      menuIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
    }
  }
}

function toggleMobileLanguageMenu() {
  const menu = document.getElementById('mobile-lang-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

function initMenuEvents() {
  document.addEventListener('click', (event) => {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileLangMenu = document.getElementById('mobile-lang-menu');
    const mobileLangBtn = document.getElementById('mobile-lang-switcher');
    if (mobileMenu && !mobileMenu.contains(event.target) && !mobileMenuBtn?.contains(event.target)) {
      if (!mobileMenu.classList.contains('hidden')) {
        closeMobileMenu();
      }
    }
    if (mobileLangMenu && !mobileLangMenu.contains(event.target) && !mobileLangBtn?.contains(event.target)) {
      if (!mobileLangMenu.classList.contains('hidden')) {
        mobileLangMenu.classList.add('hidden');
      }
    }
  });
  document.addEventListener('click', (e) => {
    const langSwitcher = document.getElementById('lang-switcher');
    const langMenu = document.getElementById('lang-menu');
    if (langSwitcher && langMenu && !langSwitcher.contains(e.target) && !langMenu.contains(e.target)) {
      langMenu.classList.add('hidden');
    }
    const accountBtn = document.getElementById('sign-in-btn');
    const accountMenu = document.getElementById('account-menu');
    if (accountBtn && accountMenu && !accountBtn.contains(e.target) && !accountMenu.contains(e.target)) {
      accountMenu.classList.add('hidden');
    }
  });
}

export { toggleMobileMenu, closeMobileMenu, toggleMobileLanguageMenu, initMenuEvents };
