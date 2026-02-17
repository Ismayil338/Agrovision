function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const icon = document.getElementById('dark-mode-icon');
  const isDark = document.body.classList.contains('dark-mode');
  if (icon) {
    icon.textContent = isDark ? '☀️' : '🌙';
  }
  updateDarkModeGradients(isDark);
  localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
}

function updateDarkModeGradients(isDark) {
  const homeCards = document.querySelectorAll('#home-page .card-hover.bg-gradient-to-br');
  homeCards.forEach(card => {
    if (isDark) {
      if (card.classList.contains('from-green-50') && card.classList.contains('to-green-100')) {
        card.style.background = 'linear-gradient(to bottom right, rgba(6, 78, 59, 0.4), rgba(5, 150, 105, 0.3))';
      } else if (card.classList.contains('from-orange-50') && card.classList.contains('to-orange-100')) {
        card.style.background = 'linear-gradient(to bottom right, rgba(124, 45, 18, 0.4), rgba(154, 52, 18, 0.3))';
      } else if (card.classList.contains('from-green-50') && card.classList.contains('to-orange-100')) {
        card.style.background = 'linear-gradient(to bottom right, rgba(6, 78, 59, 0.4), rgba(154, 52, 18, 0.3))';
      }
    } else {
      card.style.background = '';
    }
  });
  const dashboardCards = document.querySelectorAll('#dashboard-page .card-hover.bg-gradient-to-br');
  dashboardCards.forEach(card => {
    if (isDark) {
      if (card.classList.contains('from-red-50') && card.classList.contains('to-orange-50')) {
        card.style.background = 'linear-gradient(to bottom right, rgba(127, 29, 29, 0.4), rgba(124, 45, 18, 0.3))';
      }
    } else {
      card.style.background = '';
    }
  });
}

function loadDarkModePreference() {
  const darkMode = localStorage.getItem('darkMode');
  if (darkMode === 'enabled') {
    document.body.classList.add('dark-mode');
    const icon = document.getElementById('dark-mode-icon');
    if (icon) icon.textContent = '☀️';
    setTimeout(() => updateDarkModeGradients(true), 100);
  }
}

export { toggleDarkMode, updateDarkModeGradients, loadDarkModePreference };
