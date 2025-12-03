import { getCurrentLanguage, translate } from './i18n.js';
import { getCurrentImageFile } from './upload.js';

async function analyzeImage() {
  const currentImageFile = getCurrentImageFile();
  if (!currentImageFile) {
    alert(getCurrentLanguage() === 'az' ? 'Zəhmət olmasa əvvəlcə şəkil seçin' : 'Please select an image first');
    return;
  }
  const analyzeBtn = document.querySelector('button[onclick="analyzeImage()"]');
  const originalText = analyzeBtn.textContent;
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = getCurrentLanguage() === 'az' ? 'Təhlil edilir...' : 'Analyzing...';
  const formData = new FormData();
  formData.append('image', currentImageFile);
  try {
    const response = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData });
    const result = await response.json();
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = originalText;
    if (result.success) {
      displayResults(result);
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = originalText;
    alert('Error uploading image: ' + error.message);
  }
}

function generateQRCode(data) {
  const qrContainer = document.getElementById('qrcode');
  if (!qrContainer) return;
  qrContainer.innerHTML = '';
  const qrData = JSON.stringify({ prediction: data.prediction || 'Unknown', confidence: data.confidence || 0, timestamp: new Date().toISOString(), url: window.location.href });
  if (typeof QRCode === 'undefined') {
    qrContainer.innerHTML = '<p class="text-red-500 text-sm">QR Code library not loaded</p>';
    return;
  }
  QRCode.toCanvas(qrContainer, qrData, { width: 200, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } }, function (error) {
    if (error) {
      qrContainer.innerHTML = '<p class="text-red-500 text-sm">QR Code generation failed</p>';
    }
  });
}

function displayResults(result) {
  const resultsSection = document.getElementById('results-section');
  if (!resultsSection) return;
  const prediction = result.prediction || 'Unknown';
  const confidence = result.confidence || 0;
  generateQRCode(result);
  const titleElement = resultsSection.querySelector('h3');
  if (titleElement) {
    titleElement.textContent = translate('analyze.analysisComplete');
  }
  const confidenceBadge = document.getElementById('confidence-badge');
  if (confidenceBadge) {
    confidenceBadge.textContent = `${confidence}% ${translate('common.confidence')}`;
  }
  const isHealthy = prediction.toLowerCase().includes('healthy');
  const healthStatus = isHealthy ? 'Excellent' : 'Needs Attention';
  const healthColor = isHealthy ? 'text-green-600' : 'text-orange-600';
  const healthStatusElements = resultsSection.querySelectorAll('.text-3xl.font-bold');
  if (healthStatusElements.length > 0) {
    healthStatusElements[0].textContent = healthStatus;
    healthStatusElements[0].className = `text-3xl font-bold ${healthColor}`;
  }
  const diseaseRiskElements = resultsSection.querySelectorAll('.text-3xl.font-bold');
  if (diseaseRiskElements.length > 1) {
    diseaseRiskElements[1].textContent = isHealthy ? 'Low' : 'High';
    diseaseRiskElements[1].className = `text-3xl font-bold ${isHealthy ? 'text-green-600' : 'text-red-600'}`;
  }
  const recommendations = resultsSection.querySelector('ul');
  if (recommendations) {
    recommendations.innerHTML = `<li class="flex items-start"><span class="text-green-500 mr-2">✓</span> <span>Prediction: ${prediction}</span></li><li class="flex items-start"><span class="text-green-500 mr-2">✓</span> <span>Confidence: ${confidence}%</span></li><li class="flex items-start"><span class="text-green-500 mr-2">✓</span> <span>${isHealthy ? 'Plant appears healthy. Continue monitoring.' : 'Disease detected. Please consult with agricultural expert for treatment recommendations.'}</span></li>`;
  }
  resultsSection.classList.remove('hidden');
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export { analyzeImage, displayResults, generateQRCode };
