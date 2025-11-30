// Translation system
    let currentLanguage = localStorage.getItem('language') || 'en';
    
    // Translations are now loaded from translations.js

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
            // Handle elements with HTML content (like hero title)
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
      
      // Update hero title separately
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
      
      // Update titles with gradient text
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
      
      // Update language switcher
      const langSwitcher = document.getElementById('current-lang');
      if (langSwitcher) {
        langSwitcher.textContent = currentLanguage.toUpperCase();
      }
      
      // Update mobile language switcher
      const mobileLangSwitcher = document.getElementById('mobile-current-lang');
      if (mobileLangSwitcher) {
        mobileLangSwitcher.textContent = currentLanguage.toUpperCase();
      }
      
      // Update sign in button
      const signInBtn = document.getElementById('sign-in-btn');
      if (signInBtn && !signInBtn.textContent.includes('@')) {
        signInBtn.textContent = translate('common.signIn');
      }
      
      // Update sidebar tooltips
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
      toggleLanguageMenu();
      // Close mobile language menu if open
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
    
    // Mobile menu functions
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
    
    // Close mobile menu when clicking outside
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

    // Close language menu when clicking outside
    document.addEventListener('click', (e) => {
      const langSwitcher = document.getElementById('lang-switcher');
      const langMenu = document.getElementById('lang-menu');
      if (langSwitcher && langMenu && !langSwitcher.contains(e.target) && !langMenu.contains(e.target)) {
        langMenu.classList.add('hidden');
      }
    });

    const defaultConfig = {
      site_title: "Agrovision",
      tagline: "Future of Farming",
      hero_description: "Revolutionize your agricultural practices with cutting-edge AI technology. Monitor, analyze, and optimize your crops like never before.",
      cta_button: "Start Free Trial",
      contact_email: "hello@agrovision.io",
      contact_phone: "+1 (888) 555-FARM",
      background_color: "#f9fafb",
      surface_color: "#ffffff",
      text_color: "#111827",
      primary_action_color: "#22c55e",
      secondary_action_color: "#f97316",
      font_family: "Poppins",
      font_size: 16
    };

    async function onConfigChange(config) {
      const customFont = config.font_family || defaultConfig.font_family;
      const baseSize = config.font_size || defaultConfig.font_size;
      const baseFontStack = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      
      document.body.style.fontFamily = `${customFont}, ${baseFontStack}`;
      document.body.style.backgroundColor = config.background_color || defaultConfig.background_color;
      
      const navTitle = document.getElementById('nav-title');
      if (navTitle) navTitle.textContent = config.site_title || defaultConfig.site_title;
      
      const heroTagline = document.getElementById('hero-tagline');
      if (heroTagline) {
        const taglineText = config.tagline || defaultConfig.tagline;
        heroTagline.innerHTML = `${taglineText.split(' ')[0]} <span class="gradient-text">${taglineText.split(' ').slice(1).join(' ')}</span>`;
        heroTagline.style.fontSize = `${baseSize * 3}px`;
        heroTagline.style.fontFamily = `${customFont}, ${baseFontStack}`;
      }
      
      const heroDescription = document.getElementById('hero-description');
      if (heroDescription) {
        heroDescription.textContent = config.hero_description || defaultConfig.hero_description;
        heroDescription.style.fontSize = `${baseSize * 1.25}px`;
      }
      
      const ctaButton = document.getElementById('cta-button');
      if (ctaButton) {
        ctaButton.textContent = config.cta_button || defaultConfig.cta_button;
        ctaButton.style.fontSize = `${baseSize * 1.125}px`;
      }
      
      const contactEmailDisplay = document.getElementById('contact-email-display');
      if (contactEmailDisplay) contactEmailDisplay.textContent = config.contact_email || defaultConfig.contact_email;
      
      const contactPhoneDisplay = document.getElementById('contact-phone-display');
      if (contactPhoneDisplay) contactPhoneDisplay.textContent = config.contact_phone || defaultConfig.contact_phone;
      
      const textColor = config.text_color || defaultConfig.text_color;
      const primaryColor = config.primary_action_color || defaultConfig.primary_action_color;
      const secondaryColor = config.secondary_action_color || defaultConfig.secondary_action_color;
      const surfaceColor = config.surface_color || defaultConfig.surface_color;
      const bgColor = config.background_color || defaultConfig.background_color;
      
      document.querySelectorAll('.bg-gray-50').forEach(el => {
        el.style.backgroundColor = bgColor;
      });
      
      document.querySelectorAll('.bg-white').forEach(el => {
        el.style.backgroundColor = surfaceColor;
      });
      
      document.querySelectorAll('.text-gray-900, .text-gray-800, .text-gray-700').forEach(el => {
        el.style.color = textColor;
      });
      
      document.querySelectorAll('h1, h2, h3').forEach(el => {
        el.style.fontFamily = `${customFont}, ${baseFontStack}`;
        if (el.tagName === 'H1') el.style.fontSize = `${baseSize * 2.5}px`;
        if (el.tagName === 'H2') el.style.fontSize = `${baseSize * 2}px`;
        if (el.tagName === 'H3') el.style.fontSize = `${baseSize * 1.5}px`;
      });
      
      document.querySelectorAll('p, label, button, a, input, textarea').forEach(el => {
        el.style.fontSize = `${baseSize}px`;
      });
    }

    async function navigateTo(page, event) {
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

      // Load dashboard data if navigating to dashboard
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

    // API helper function
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

    // Check authentication status
    async function checkAuth() {
      const result = await apiCall('/api/check-auth');
      if (result.success && result.data.authenticated) {
        updateUIForLoggedIn(result.data.email);
        return true;
      }
      updateUIForLoggedOut();
      return false;
    }

    function updateUIForLoggedIn(email) {
      const signInBtn = document.querySelector('button[onclick*="login"]');
      if (signInBtn) {
        signInBtn.textContent = email || 'Dashboard';
        signInBtn.onclick = () => navigateTo('dashboard', { preventDefault: () => {} });
      }
    }

    function updateUIForLoggedOut() {
      const signInBtn = document.querySelector('button[onclick*="login"]');
      if (signInBtn) {
        signInBtn.textContent = 'Sign In';
        signInBtn.onclick = () => navigateTo('login', { preventDefault: () => {} });
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

      const result = await apiCall('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

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

      const result = await apiCall('/api/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

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

    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const uploadPrompt = document.getElementById('upload-prompt');
    const previewSection = document.getElementById('preview-section');
    const imagePreview = document.getElementById('image-preview');
    const resultsSection = document.getElementById('results-section');

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

    async function analyzeImage() {
      if (!currentImageFile) {
        alert(currentLanguage === 'az' ? 'Zəhmət olmasa əvvəlcə şəkil seçin' : 'Please select an image first');
        return;
      }

      // Show loading state
      const analyzeBtn = document.querySelector('button[onclick="analyzeImage()"]');
      const originalText = analyzeBtn.textContent;
      analyzeBtn.disabled = true;
      analyzeBtn.textContent = currentLanguage === 'az' ? 'Təhlil edilir...' : 'Analyzing...';

      // Upload and analyze
      const formData = new FormData();
      formData.append('image', currentImageFile);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

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
      
      // Clear previous QR code
      qrContainer.innerHTML = '';
      
      // Generate QR code with analysis data
      const qrData = JSON.stringify({
        prediction: data.prediction || 'Unknown',
        confidence: data.confidence || 0,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
      
      // Check if QRCode library is loaded
      if (typeof QRCode === 'undefined') {
        qrContainer.innerHTML = '<p class="text-red-500 text-sm">QR Code library not loaded</p>';
        return;
      }
      
      QRCode.toCanvas(qrContainer, qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, function (error) {
        if (error) {
          console.error('QR Code generation error:', error);
          qrContainer.innerHTML = '<p class="text-red-500 text-sm">QR Code generation failed</p>';
        }
      });
    }

    function displayResults(result) {
      const resultsSection = document.getElementById('results-section');
      if (!resultsSection) return;
      
      const prediction = result.prediction || 'Unknown';
      const confidence = result.confidence || 0;
      
      // Generate QR code
      generateQRCode(result);
      
      // Update results section with real data
      const titleElement = resultsSection.querySelector('h3');
      if (titleElement) {
        titleElement.textContent = translate('analyze.analysisComplete');
      }

      const confidenceBadge = document.getElementById('confidence-badge');
      if (confidenceBadge) {
        confidenceBadge.textContent = `${confidence}% ${translate('common.confidence')}`;
      }

      // Determine if healthy or diseased
      const isHealthy = prediction.toLowerCase().includes('healthy');
      const healthStatus = isHealthy ? 'Excellent' : 'Needs Attention';
      const healthColor = isHealthy ? 'text-green-600' : 'text-orange-600';
      
      // Update health status - find the first health status element
      const healthStatusElements = resultsSection.querySelectorAll('.text-3xl.font-bold');
      if (healthStatusElements.length > 0) {
        healthStatusElements[0].textContent = healthStatus;
        healthStatusElements[0].className = `text-3xl font-bold ${healthColor}`;
      }

      // Update disease risk
      const diseaseRiskElements = resultsSection.querySelectorAll('.text-3xl.font-bold');
      if (diseaseRiskElements.length > 1) {
        diseaseRiskElements[1].textContent = isHealthy ? 'Low' : 'High';
        diseaseRiskElements[1].className = `text-3xl font-bold ${isHealthy ? 'text-green-600' : 'text-red-600'}`;
      }

      // Update prediction text in recommendations
      const recommendations = resultsSection.querySelector('ul');
      if (recommendations) {
        recommendations.innerHTML = `
          <li class="flex items-start"><span class="text-green-500 mr-2">✓</span> <span>Prediction: ${prediction}</span></li>
          <li class="flex items-start"><span class="text-green-500 mr-2">✓</span> <span>Confidence: ${confidence}%</span></li>
          <li class="flex items-start"><span class="text-green-500 mr-2">✓</span> <span>${isHealthy ? 'Plant appears healthy. Continue monitoring.' : 'Disease detected. Please consult with agricultural expert for treatment recommendations.'}</span></li>
        `;
      }

      resultsSection.classList.remove('hidden');
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Refresh dashboard if on dashboard page
      if (document.getElementById('dashboard-page') && document.getElementById('dashboard-page').classList.contains('active')) {
        loadDashboard();
      }
    }

    function handleContactSubmit(event) {
      event.preventDefault();
      const successDiv = document.getElementById('contact-success');
      successDiv.textContent = translate('contact.messageSent');
      successDiv.classList.remove('hidden');
      setTimeout(() => {
        successDiv.classList.add('hidden');
        document.getElementById('contact-form').reset();
      }, 4000);
    }

    // Dark Mode Functions
    function toggleDarkMode() {
      document.body.classList.toggle('dark-mode');
      const icon = document.getElementById('dark-mode-icon');
      const isDark = document.body.classList.contains('dark-mode');
      icon.textContent = isDark ? '☀️' : '🌙';
      
      // Update gradient backgrounds for dark mode
      updateDarkModeGradients(isDark);
      
      // Save preference
      localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    }
    
    // Update gradient backgrounds for dark/light mode
    function updateDarkModeGradients(isDark) {
      // Home page "Why Farmers Choose Us" tiles
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
          // Reset to original Tailwind classes (remove inline style)
          card.style.background = '';
        }
      });
      
      // Dashboard recent analysis cards
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
    
    // Load dark mode preference
    function loadDarkModePreference() {
      const darkMode = localStorage.getItem('darkMode');
      if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        const icon = document.getElementById('dark-mode-icon');
        if (icon) icon.textContent = '☀️';
        // Update gradients after a short delay to ensure DOM is ready
        setTimeout(() => updateDarkModeGradients(true), 100);
      }
    }
    
    // Load preference on page load
    loadDarkModePreference();

    // Load dashboard data
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

      // Clear existing items (keep the structure, just update content)
      const existingItems = dashboardContainer.querySelectorAll('.card-hover');
      existingItems.forEach(item => item.remove());

      // Add real images
      images.forEach((img, index) => {
        if (index >= 3) return; // Limit to 3 for now
        
        const isHealthy = img.prediction && img.prediction.toLowerCase().includes('healthy');
        const bgColor = isHealthy ? 'from-green-50 to-green-100' : 'from-red-50 to-orange-50';
        const borderColor = isHealthy ? 'border-green-200' : 'border-red-200';
        const statusBadge = isHealthy ? 
          '<span class="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">✅ Healthy</span>' :
          '<span class="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">⚠️ Disease Detected</span>';

        const itemHTML = `
          <div class="card-hover bg-gradient-to-br ${bgColor} rounded-2xl p-6 border-2 ${borderColor}">
            <div class="grid md:grid-cols-12 gap-6">
              <div class="md:col-span-3">
                <img src="${img.image_url}" alt="Uploaded image" class="w-full h-48 object-cover rounded-xl">
              </div>
              <div class="md:col-span-9">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-2">Image Analysis</h3>
                    <p class="text-gray-600">Scanned on ${new Date(img.created_at || Date.now()).toLocaleString()}</p>
                  </div>
                  ${statusBadge}
                </div>
                <div class="bg-white rounded-xl p-4 shadow">
                  <div class="text-sm text-gray-600 mb-1">Prediction</div>
                  <div class="text-xl font-bold text-gray-900">${img.prediction || 'Unknown'}</div>
                </div>
              </div>
            </div>
          </div>
        `;
        dashboardContainer.insertAdjacentHTML('beforeend', itemHTML);
      });

      // Update stats
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
      
      // Apply dark mode styling to newly created cards if dark mode is enabled
      const isDark = document.body.classList.contains('dark-mode');
      if (isDark) {
        updateDarkModeGradients(true);
      }
    }

    // Initialize translations on page load
    updateTranslations();
    
    // Check auth on page load
    checkAuth();

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

    if (window.elementSdk) {
      window.elementSdk.init({
        defaultConfig,
        onConfigChange,
        mapToCapabilities: (config) => ({
          recolorables: [
            {
              get: () => config.background_color || defaultConfig.background_color,
              set: (value) => {
                config.background_color = value;
                window.elementSdk.setConfig({ background_color: value });
              }
            },
            {
              get: () => config.surface_color || defaultConfig.surface_color,
              set: (value) => {
                config.surface_color = value;
                window.elementSdk.setConfig({ surface_color: value });
              }
            },
            {
              get: () => config.text_color || defaultConfig.text_color,
              set: (value) => {
                config.text_color = value;
                window.elementSdk.setConfig({ text_color: value });
              }
            },
            {
              get: () => config.primary_action_color || defaultConfig.primary_action_color,
              set: (value) => {
                config.primary_action_color = value;
                window.elementSdk.setConfig({ primary_action_color: value });
              }
            },
            {
              get: () => config.secondary_action_color || defaultConfig.secondary_action_color,
              set: (value) => {
                config.secondary_action_color = value;
                window.elementSdk.setConfig({ secondary_action_color: value });
              }
            }
          ],
          borderables: [],
          fontEditable: {
            get: () => config.font_family || defaultConfig.font_family,
            set: (value) => {
              config.font_family = value;
              window.elementSdk.setConfig({ font_family: value });
            }
          },
          fontSizeable: {
            get: () => config.font_size || defaultConfig.font_size,
            set: (value) => {
              config.font_size = value;
              window.elementSdk.setConfig({ font_size: value });
            }
          }
        }),
        mapToEditPanelValues: (config) => new Map([
          ["site_title", config.site_title || defaultConfig.site_title],
          ["tagline", config.tagline || defaultConfig.tagline],
          ["hero_description", config.hero_description || defaultConfig.hero_description],
          ["cta_button", config.cta_button || defaultConfig.cta_button],
          ["contact_email", config.contact_email || defaultConfig.contact_email],
          ["contact_phone", config.contact_phone || defaultConfig.contact_phone]
        ])
      });
    }
  
