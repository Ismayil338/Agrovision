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
  // Use navigateTo to ensure authentication checks are performed
  navigateTo(page, { preventDefault: () => {} });
} else {
  // If no hash, ensure home page is shown
  navigateTo('home', { preventDefault: () => {} });
}
initElementSdk();
