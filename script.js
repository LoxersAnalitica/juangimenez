/* ========================================
   SCRIPT — Dr. Juan Giménez Landing Page
   Interactions, form, animations
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ===== HEADER: Scroll effect & burger =====
  const header = document.getElementById('header');
  const burgerBtn = document.getElementById('burgerBtn');
  const mainNav = document.getElementById('mainNav');
  const mobileCta = document.getElementById('mobileCta');
  const heroSection = document.getElementById('hero');

  // Sticky header shadow on scroll
  const handleHeaderScroll = () => {
    const scrolled = window.scrollY > 50;
    header.classList.toggle('header--scrolled', scrolled);

    // Show mobile CTA after hero
    if (mobileCta) {
      const heroBottom = heroSection.getBoundingClientRect().bottom;
      mobileCta.classList.toggle('visible', heroBottom < 0);
    }
  };

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // Burger menu toggle
  burgerBtn.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('active');
    burgerBtn.classList.toggle('active', isOpen);
    burgerBtn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on link click
  mainNav.querySelectorAll('.header__nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('active');
      burgerBtn.classList.remove('active');
      burgerBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ===== REVEAL ON SCROLL =====
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ===== STATS COUNTER ANIMATION =====
  const statsNumbers = document.querySelectorAll('.stats__number[data-target]');

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString('es-ES');

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statsNumbers.forEach(el => statsObserver.observe(el));

  // ===== FORM HANDLING =====
  const form = document.getElementById('leadForm');
  const formSuccess = document.getElementById('formSuccess');
  const formSubmitBtn = document.getElementById('formSubmit');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Basic validation
      const name = form.querySelector('#form-name');
      const phone = form.querySelector('#form-phone');
      const service = form.querySelector('#form-service');
      const consent = form.querySelector('#form-consent');

      let isValid = true;

      [name, phone, service].forEach(field => {
        if (!field.value.trim()) {
          field.classList.add('error');
          isValid = false;
        } else {
          field.classList.remove('error');
        }
      });

      if (!consent.checked) {
        consent.parentElement.classList.add('error');
        isValid = false;
      } else {
        consent.parentElement.classList.remove('error');
      }

      if (!isValid) return;

      // Disable button and show loading state
      formSubmitBtn.disabled = true;
      formSubmitBtn.querySelector('span').textContent = 'Enviando...';

      // Collect form data
      const formData = {
        nombre: name.value.trim(),
        telefono: phone.value.trim(),
        email: form.querySelector('#form-email').value.trim(),
        tratamiento: service.value,
        mensaje: form.querySelector('#form-message').value.trim(),
        fecha: new Date().toLocaleString('es-ES'),
      };

      // ===== GOOGLE SHEETS INTEGRATION =====
      // Replace this URL with your Google Apps Script Web App URL
      const GOOGLE_SCRIPT_URL = 'https://script.google.com/a/macros/hitornalitica.com/s/AKfycbzI0r5ydPfb15gxnvkj8Zeea-mtroOKz4ukKJ8M5dFvysm3JbmnlYWWjEwJsszygdqq/exec';

      if (GOOGLE_SCRIPT_URL) {
        try {
          // Hidden iframe + form approach (avoids all CORS issues)
          let iframe = document.getElementById('gsheet-iframe');
          if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'gsheet-iframe';
            iframe.name = 'gsheet-iframe';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
          }

          const hiddenForm = document.createElement('form');
          hiddenForm.method = 'POST';
          hiddenForm.action = GOOGLE_SCRIPT_URL;
          hiddenForm.target = 'gsheet-iframe';
          hiddenForm.style.display = 'none';

          Object.entries(formData).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            hiddenForm.appendChild(input);
          });

          document.body.appendChild(hiddenForm);
          hiddenForm.submit();
          document.body.removeChild(hiddenForm);
        } catch (error) {
          console.warn('Error sending to Google Sheets:', error);
        }
      } else {
        // Demo mode: log to console
        console.log('📋 Lead capturado:', formData);
        console.log('ℹ️ Para enviar a Google Sheets, configura GOOGLE_SCRIPT_URL en script.js');
      }

      // Show success message
      form.querySelectorAll('.form__group, .form__submit').forEach(el => {
        el.style.display = 'none';
      });
      formSuccess.hidden = false;
      formSuccess.style.display = 'block';

      // Scroll to success
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // ===== SMOOTH SCROLL FOR SERVICE CARD CTAs =====
  document.querySelectorAll('.service-card__cta').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Pre-select the treatment in the form
      const card = btn.closest('.service-card');
      const title = card.querySelector('.service-card__title').textContent;
      const select = document.getElementById('form-service');

      if (select) {
        const options = Array.from(select.options);
        const match = options.find(opt =>
          title.toLowerCase().includes(opt.value.toLowerCase().split(' ')[0])
        );
        if (match) {
          select.value = match.value;
        }
      }
    });
  });
});
