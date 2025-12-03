import { apiCall } from './auth.js';
import { updateDarkModeGradients } from './darkmode.js';

async function loadDashboard() {
  const authResult = await apiCall('/api/check-auth');
  if (!authResult.success || !authResult.data.authenticated) {
    return;
  }
  const imagesResult = await apiCall('/api/my-images');
  if (imagesResult.success && imagesResult.data.images) {
    updateDashboardWithImages(imagesResult.data.images);
  }
}

function updateDashboardWithImages(images) {
  const dashboardContainer = document.querySelector('#dashboard-page .space-y-6');
  if (!dashboardContainer) return;
  const existingItems = dashboardContainer.querySelectorAll('.card-hover');
  existingItems.forEach(item => item.remove());
  images.forEach((img, index) => {
    if (index >= 3) return;
    const isHealthy = img.prediction && img.prediction.toLowerCase().includes('healthy');
    const bgColor = isHealthy ? 'from-green-50 to-green-100' : 'from-red-50 to-orange-50';
    const borderColor = isHealthy ? 'border-green-200' : 'border-red-200';
    const statusBadge = isHealthy ? '<span class="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">✅ Healthy</span>' : '<span class="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">⚠️ Disease Detected</span>';
    const itemHTML = `<div class="card-hover bg-gradient-to-br ${bgColor} rounded-2xl p-6 border-2 ${borderColor}"><div class="grid md:grid-cols-12 gap-6"><div class="md:col-span-3"><img src="${img.image_url}" alt="Uploaded image" class="w-full h-48 object-cover rounded-xl"></div><div class="md:col-span-9"><div class="flex items-start justify-between mb-4"><div><h3 class="text-2xl font-bold text-gray-900 mb-2">Image Analysis</h3><p class="text-gray-600">Scanned on ${new Date(img.created_at || Date.now()).toLocaleString()}</p></div>${statusBadge}</div><div class="bg-white rounded-xl p-4 shadow"><div class="text-sm text-gray-600 mb-1">Prediction</div><div class="text-xl font-bold text-gray-900">${img.prediction || 'Unknown'}</div></div></div></div></div>`;
    dashboardContainer.insertAdjacentHTML('beforeend', itemHTML);
  });
  const totalScans = images.length;
  const healthyCount = images.filter(img => img.prediction && img.prediction.toLowerCase().includes('healthy')).length;
  const issuesCount = totalScans - healthyCount;
  const avgHealth = totalScans > 0 ? Math.round((healthyCount / totalScans) * 100) : 0;
  const statsElements = document.querySelectorAll('#dashboard-page .text-4xl.font-bold.gradient-text, #dashboard-page .text-4xl.font-bold.text-green-600, #dashboard-page .text-4xl.font-bold.text-orange-600');
  if (statsElements.length >= 4) {
    statsElements[0].textContent = totalScans;
    statsElements[1].textContent = healthyCount;
    statsElements[2].textContent = issuesCount;
    statsElements[3].textContent = avgHealth + '%';
  }
  const isDark = document.body.classList.contains('dark-mode');
  if (isDark) {
    updateDarkModeGradients(true);
  }
}

export { loadDashboard, updateDashboardWithImages };
