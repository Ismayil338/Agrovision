import { loadDashboard } from './dashboard.js';

function navigateTo(page, event) {
  if (event && event.preventDefault) {
    event.preventDefault();
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageElement = document.getElementById(`${page}-page`);
  if (pageElement) {
    pageElement.classList.add('active');
  }
  document.querySelectorAll('.sidebar-dot').forEach(dot => dot.classList.remove('active'));
  const dots = document.querySelectorAll('.sidebar-dot');
  const pages = ['home', 'features', 'analyze', 'dashboard', 'gallery', 'contact', 'login'];
  const index = pages.indexOf(page);
  if (index >= 0 && dots[index]) {
    dots[index].classList.add('active');
  }
  window.location.hash = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (page === 'dashboard') {
    loadDashboard();
  }
}

function switchAuthTab(tab) {
  const loginTab = document.getElementById('login-tab');
  const signupTab = document.getElementById('signup-tab');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  if (tab === 'login') {
    loginTab.classList.add('bg-white', 'shadow-sm', 'text-green-600');
    loginTab.classList.remove('text-gray-600');
    signupTab.classList.remove('bg-white', 'shadow-sm', 'text-green-600');
    signupTab.classList.add('text-gray-600');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  } else {
    signupTab.classList.add('bg-white', 'shadow-sm', 'text-green-600');
    signupTab.classList.remove('text-gray-600');
    loginTab.classList.remove('bg-white', 'shadow-sm', 'text-green-600');
    loginTab.classList.add('text-gray-600');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  }
}

export { navigateTo, switchAuthTab };
