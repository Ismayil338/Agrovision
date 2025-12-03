import { updateTranslations } from './i18n.js';

async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, data: { message: error.message }, status: 500 };
  }
}

async function checkAuth() {
  const result = await apiCall('/api/check-auth');
  if (result.success && result.data.authenticated) {
    updateUIForLoggedIn(result.data.email);
    return true;
  }
  updateUIForLoggedOut();
  return false;
}

function toggleAccountMenu() {
  const menu = document.getElementById('account-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

function updateUIForLoggedIn(email) {
  const signInBtn = document.getElementById('sign-in-btn');
  const accountMenu = document.getElementById('account-menu');
  if (signInBtn) {
    signInBtn.textContent = email || 'Dashboard';
    signInBtn.onclick = (event) => {
      event.preventDefault && event.preventDefault();
      toggleAccountMenu();
    };
  }
  if (accountMenu) {
    accountMenu.classList.remove('hidden');
    accountMenu.classList.add('hidden');
  }
  updateTranslations();
}

function updateUIForLoggedOut() {
  const signInBtn = document.getElementById('sign-in-btn');
  const accountMenu = document.getElementById('account-menu');
  if (signInBtn) {
    signInBtn.textContent = 'Sign In';
    signInBtn.onclick = (event) => navigateTo('login', event);
  }
  if (accountMenu) {
    accountMenu.classList.add('hidden');
  }
  updateTranslations();
}

async function handleLogout() {
  const result = await apiCall('/api/logout', { method: 'POST' });
  if (result.success) {
    updateUIForLoggedOut();
    navigateTo('home', { preventDefault: () => {} });
  } else {
    alert(result.data?.message || 'Error logging out.');
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const successDiv = document.getElementById('auth-success');
  successDiv.classList.remove('hidden');
  successDiv.textContent = 'Loading...';
  successDiv.classList.remove('bg-red-100', 'text-red-700');
  successDiv.classList.add('bg-blue-100', 'text-blue-700');
  const result = await apiCall('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  if (result.success) {
    successDiv.textContent = '✓ ' + result.data.message;
    successDiv.classList.remove('bg-blue-100', 'text-blue-700', 'bg-red-100', 'text-red-700');
    successDiv.classList.add('bg-green-100', 'text-green-700');
    updateUIForLoggedIn(email);
    setTimeout(() => {
      navigateTo('dashboard', event);
      successDiv.classList.add('hidden');
      document.getElementById('login-form').reset();
    }, 1500);
  } else {
    successDiv.textContent = '✗ ' + result.data.message;
    successDiv.classList.remove('bg-blue-100', 'text-blue-700', 'bg-green-100', 'text-green-700');
    successDiv.classList.add('bg-red-100', 'text-red-700');
    setTimeout(() => {
      successDiv.classList.add('hidden');
    }, 3000);
  }
}

async function handleSignup(event) {
  event.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;
  const successDiv = document.getElementById('auth-success');
  if (password !== confirm) {
    successDiv.textContent = '✗ Passwords do not match!';
    successDiv.classList.remove('bg-green-100', 'text-green-700');
    successDiv.classList.add('bg-red-100', 'text-red-700');
    successDiv.classList.remove('hidden');
    setTimeout(() => {
      successDiv.classList.add('hidden');
    }, 2500);
    return;
  }
  successDiv.classList.remove('hidden');
  successDiv.textContent = 'Loading...';
  successDiv.classList.remove('bg-red-100', 'text-red-700');
  successDiv.classList.add('bg-blue-100', 'text-blue-700');
  const result = await apiCall('/api/signup', { method: 'POST', body: JSON.stringify({ email, password }) });
  if (result.success) {
    successDiv.textContent = '✓ ' + result.data.message + ' Please log in.';
    successDiv.classList.remove('bg-blue-100', 'text-blue-700', 'bg-red-100', 'text-red-700');
    successDiv.classList.add('bg-green-100', 'text-green-700');
    setTimeout(() => {
      switchAuthTab('login');
      successDiv.classList.add('hidden');
      document.getElementById('signup-form').reset();
    }, 2000);
  } else {
    successDiv.textContent = '✗ ' + result.data.message;
    successDiv.classList.remove('bg-blue-100', 'text-blue-700', 'bg-green-100', 'text-green-700');
    successDiv.classList.add('bg-red-100', 'text-red-700');
    setTimeout(() => {
      successDiv.classList.add('hidden');
    }, 3000);
  }
}

export { apiCall, checkAuth, updateUIForLoggedIn, updateUIForLoggedOut, handleLogout, handleLogin, handleSignup, toggleAccountMenu };
