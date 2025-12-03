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
  const surfaceColor = config.surface_color || defaultConfig.surface_color;
  const bgColor = config.background_color || defaultConfig.background_color;
  document.querySelectorAll('.bg-gray-50').forEach(el => { el.style.backgroundColor = bgColor; });
  document.querySelectorAll('.bg-white').forEach(el => { el.style.backgroundColor = surfaceColor; });
  document.querySelectorAll('.text-gray-900, .text-gray-800, .text-gray-700').forEach(el => { el.style.color = textColor; });
  document.querySelectorAll('h1, h2, h3').forEach(el => {
    el.style.fontFamily = `${customFont}, ${baseFontStack}`;
    if (el.tagName === 'H1') el.style.fontSize = `${baseSize * 2.5}px`;
    if (el.tagName === 'H2') el.style.fontSize = `${baseSize * 2}px`;
    if (el.tagName === 'H3') el.style.fontSize = `${baseSize * 1.5}px`;
  });
  document.querySelectorAll('p, label, button, a, input, textarea').forEach(el => { el.style.fontSize = `${baseSize}px`; });
}

function initElementSdk() {
  if (window.elementSdk) {
    window.elementSdk.init({
      defaultConfig,
      onConfigChange,
      mapToCapabilities: (config) => ({
        recolorables: [
          { get: () => config.background_color || defaultConfig.background_color, set: (value) => { config.background_color = value; window.elementSdk.setConfig({ background_color: value }); } },
          { get: () => config.surface_color || defaultConfig.surface_color, set: (value) => { config.surface_color = value; window.elementSdk.setConfig({ surface_color: value }); } },
          { get: () => config.text_color || defaultConfig.text_color, set: (value) => { config.text_color = value; window.elementSdk.setConfig({ text_color: value }); } },
          { get: () => config.primary_action_color || defaultConfig.primary_action_color, set: (value) => { config.primary_action_color = value; window.elementSdk.setConfig({ primary_action_color: value }); } },
          { get: () => config.secondary_action_color || defaultConfig.secondary_action_color, set: (value) => { config.secondary_action_color = value; window.elementSdk.setConfig({ secondary_action_color: value }); } }
        ],
        borderables: [],
        fontEditable: { get: () => config.font_family || defaultConfig.font_family, set: (value) => { config.font_family = value; window.elementSdk.setConfig({ font_family: value }); } },
        fontSizeable: { get: () => config.font_size || defaultConfig.font_size, set: (value) => { config.font_size = value; window.elementSdk.setConfig({ font_size: value }); } }
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
}

export { defaultConfig, onConfigChange, initElementSdk };
