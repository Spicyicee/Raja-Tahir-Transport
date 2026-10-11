/* Progressive enhancements; page content and links work without JavaScript. */
'use strict';
document.documentElement.classList.add('js-enabled');

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-navigation');
function closeMenu() {
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open navigation');
  navigation?.classList.remove('is-open');
}
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('is-open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (menuButton && !event.target.closest('.nav-wrap')) closeMenu();
});
navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
window.matchMedia('(min-width: 961px)').addEventListener('change', closeMenu);
document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

const routes = {
  uae: ['Across the United Arab Emirates', 'Road transport connecting Dubai, Abu Dhabi, Sharjah, Ajman, and destinations across the UAE.'],
  oman: ['Connecting the UAE and Oman', 'Transport routes to Muscat, Sohar, and other destinations in Oman. Share your pickup and delivery points for a route-specific quote.'],
  gulf: ['Transport enquiries across the Gulf', 'Planning a shipment to Saudi Arabia, Kuwait, or Bahrain? Our team can discuss your cargo, route requirements, and transport availability.']
};
document.querySelectorAll('[data-route]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-route]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const route = routes[button.dataset.route];
    document.querySelector('[data-route-title]').textContent = route[0];
    document.querySelector('[data-route-description]').textContent = route[1];
  });
});

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    let count = 0;
    document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelectorAll('.fleet-card').forEach(card => {
      card.hidden = category !== 'all' && card.dataset.category !== category;
      if (!card.hidden) count++;
    });
    document.querySelector('.fleet-count').textContent = `${count} transport option${count === 1 ? '' : 's'}`;
  });
});

const form = document.querySelector('#quote-form');
if (form) {
  const params = new URLSearchParams(window.location.search);
  const service = params.get('service');
  const vehicle = params.get('vehicle');
  if (service && Array.from(form.elements.service.options).some(option => option.value === service)) form.elements.service.value = service;
  if (vehicle) form.elements.message.value = `Interested in: ${vehicle.slice(0, 160)}.\n\nCargo details: `;
  // Use the visitor's local date; no timezone conversion is needed for this field.
  const today = new Date();
  form.elements.delivery_date.min = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const submit = form.querySelector('[type="submit"]');
    const status = form.querySelector('.form-status');
    submit.disabled = true;
    status.removeAttribute('data-state');
    status.textContent = 'Sending your request…';
    form.setAttribute('aria-busy', 'true');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(form.action, {
        method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, signal: controller.signal
      });
      if (!response.ok) throw new Error('Unable to send enquiry');
      status.dataset.state = 'success';
      status.textContent = 'Thank you. Your quote request has been sent. Our team will contact you about your shipment.';
      form.reset();
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = 'Your request could not be sent. Your details are still here. Please try again, call +971 50 769 5245, or contact us on WhatsApp.';
    } finally {
      clearTimeout(timeout);
      form.removeAttribute('aria-busy');
      submit.disabled = false;
    }
  });
}
