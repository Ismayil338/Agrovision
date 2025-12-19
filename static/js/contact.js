function handleContactSubmit(event) {
  event.preventDefault();
  const successDiv = document.getElementById('contact-success');
  successDiv.textContent = document.querySelector('[data-i18n="contact.messageSent"]').textContent || '✓ Message sent successfully! We\'ll respond within 24 hours.';
  successDiv.classList.remove('hidden');
  setTimeout(() => {
    successDiv.classList.add('hidden');
    document.getElementById('contact-form').reset();
  }, 4000);
}

export { handleContactSubmit };
