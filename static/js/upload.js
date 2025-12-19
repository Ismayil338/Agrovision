let uploadArea;
let fileInput;
let uploadPrompt;
let previewSection;
let imagePreview;
let resultsSection;
let currentImageFile = null;

function displayImage(file) {
  currentImageFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.src = e.target.result;
    uploadPrompt.classList.add('hidden');
    previewSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');
  };
  reader.readAsDataURL(file);
}

function resetUpload() {
  fileInput.value = '';
  currentImageFile = null;
  uploadPrompt.classList.remove('hidden');
  previewSection.classList.add('hidden');
  resultsSection.classList.add('hidden');
}

function initUpload() {
  uploadArea = document.getElementById('upload-area');
  fileInput = document.getElementById('file-input');
  uploadPrompt = document.getElementById('upload-prompt');
  previewSection = document.getElementById('preview-section');
  imagePreview = document.getElementById('image-preview');
  resultsSection = document.getElementById('results-section');
  if (!uploadArea || !fileInput) return;
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-active');
  });
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-active');
  });
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-active');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      displayImage(file);
    }
  });
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      displayImage(file);
    }
  });
}

function getCurrentImageFile() {
  return currentImageFile;
}

export { initUpload, displayImage, resetUpload, getCurrentImageFile };
