import { translate, updateTranslations, switchLanguage, toggleLanguageMenu, getCurrentLanguage } from './i18n.js';
import { toggleMobileMenu, closeMobileMenu, toggleMobileLanguageMenu, initMenuEvents } from './menu.js';
import { navigateTo, switchAuthTab } from './navigation.js';
import { apiCall, checkAuth, updateUIForLoggedIn, updateUIForLoggedOut, handleLogout, handleLogin, handleSignup, toggleAccountMenu } from './auth.js';
import { initUpload, displayImage, resetUpload, getCurrentImageFile } from './upload.js';
import { analyzeImage, displayResults, generateQRCode } from './analysis.js';
import { toggleDarkMode, updateDarkModeGradients, loadDarkModePreference } from './darkmode.js';
import { loadDashboard, updateDashboardWithImages } from './dashboard.js';
import { handleContactSubmit } from './contact.js';
import { initElementSdk } from './configSdk.js';

window.toggleDarkMode = toggleDarkMode;
window.navigateTo = navigateTo;
window.switchLanguage = switchLanguage;
window.toggleLanguageMenu = toggleLanguageMenu;
window.toggleMobileLanguageMenu = toggleMobileLanguageMenu;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.handleLogout = handleLogout;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.analyzeImage = analyzeImage;
window.resetUpload = resetUpload;
window.handleContactSubmit = handleContactSubmit;
window.switchAuthTab = switchAuthTab;

updateTranslations();
checkAuth();
loadDarkModePreference();
initMenuEvents();
initUpload();
if (window.location.hash) {
  const page = window.location.hash.substring(1);
  const pageElement = document.getElementById(`${page}-page`);
  if (pageElement) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    pageElement.classList.add('active');
    const pages = ['home', 'features', 'analyze', 'dashboard', 'gallery', 'contact', 'login'];
    const index = pages.indexOf(page);
    if (index >= 0) {
      document.querySelectorAll('.sidebar-dot').forEach(dot => dot.classList.remove('active'));
      const dots = document.querySelectorAll('.sidebar-dot');
      if (dots[index]) dots[index].classList.add('active');
    }
  }
}
initElementSdk();
