let currentLanguage = localStorage.getItem('language') || 'en';

function translate(key) {
  const keys = key.split('.');
  let value = translations[currentLanguage];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}

function updateTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = translate(key);
    if (text) {
      if (el.tagName === 'INPUT' && el.type === 'submit') {
        el.value = text;
      } else if (el.innerHTML && el.innerHTML.includes('<span')) {
        const parts = text.split(' ');
        if (parts.length > 1) {
          el.innerHTML = parts[0] + ' <span class="gradient-text">' + parts.slice(1).join(' ') + '</span>';
        } else {
          el.textContent = text;
        }
      } else {
        el.textContent = text;
      }
    }
  });
  const heroTagline = document.getElementById('hero-tagline');
  if (heroTagline) {
    const heroText = translate('home.heroTitle');
    const parts = heroText.split(' ');
    if (parts.length > 1) {
      heroTagline.innerHTML = parts[0] + ' <span class="gradient-text">' + parts.slice(1).join(' ') + '</span>';
    } else {
      heroTagline.textContent = heroText;
    }
  }
  const featureTitle = document.querySelector('#features-page h1');
  if (featureTitle) {
    const text = translate('features.title');
    const words = text.split(' ');
    if (words.length > 1) {
      featureTitle.innerHTML = words[0] + ' <span class="gradient-text">' + words.slice(1).join(' ') + '</span>';
    } else {
      featureTitle.innerHTML = '<span class="gradient-text">' + text + '</span>';
    }
  }
  const dashboardTitle = document.querySelector('#dashboard-page h1');
  if (dashboardTitle) {
    const text = translate('dashboard.title');
    const words = text.split(' ');
    if (words.length > 1) {
      dashboardTitle.innerHTML = words[0] + ' <span class="gradient-text">' + words.slice(1).join(' ') + '</span>';
    } else {
      dashboardTitle.innerHTML = '<span class="gradient-text">' + text + '</span>';
    }
  }
  const galleryTitle = document.querySelector('#gallery-page h1');
  if (galleryTitle) {
    const text = translate('gallery.title');
    const words = text.split(' ');
    if (words.length > 1) {
      galleryTitle.innerHTML = words[0] + ' <span class="gradient-text">' + words.slice(1).join(' ') + '</span>';
    } else {
      galleryTitle.innerHTML = '<span class="gradient-text">' + text + '</span>';
    }
  }
  const contactTitle = document.querySelector('#contact-page h1');
  if (contactTitle) {
    const text = translate('contact.title');
    const words = text.split(' ');
    if (words.length >= 3) {
      contactTitle.innerHTML = words.slice(0, 2).join(' ') + ' <span class="gradient-text">' + words.slice(2).join(' ') + '</span>';
    } else if (words.length === 2) {
      contactTitle.innerHTML = words[0] + ' <span class="gradient-text">' + words[1] + '</span>';
    } else {
      contactTitle.innerHTML = '<span class="gradient-text">' + text + '</span>';
    }
  }
  const homeFeaturesTitle = document.querySelector('#home-page .text-4xl.font-bold');
  if (homeFeaturesTitle) {
    const text = translate('homeFeatures.title');
    homeFeaturesTitle.textContent = text;
  }
  const langSwitcher = document.getElementById('current-lang');
  if (langSwitcher) {
    langSwitcher.textContent = currentLanguage.toUpperCase();
  }
  const mobileLangSwitcher = document.getElementById('mobile-current-lang');
  if (mobileLangSwitcher) {
    mobileLangSwitcher.textContent = currentLanguage.toUpperCase();
  }
  const signInBtn = document.getElementById('sign-in-btn');
  if (signInBtn && !signInBtn.textContent.includes('@')) {
    signInBtn.textContent = translate('common.signIn');
  }
  document.querySelectorAll('.sidebar-dot').forEach(dot => {
    const attr = currentLanguage === 'az' ? 'data-title-az' : 'data-title-en';
    const title = dot.getAttribute(attr);
    if (title) {
      dot.setAttribute('title', title);
    }
  });
}

function switchLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  updateTranslations();
  const mobileLangMenu = document.getElementById('mobile-lang-menu');
  if (mobileLangMenu) {
    mobileLangMenu.classList.add('hidden');
  }
}

function toggleLanguageMenu() {
  const menu = document.getElementById('lang-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

function getCurrentLanguage() {
  return currentLanguage;
}

export { translate, updateTranslations, switchLanguage, toggleLanguageMenu, getCurrentLanguage };
