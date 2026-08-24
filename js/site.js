(function () {

  /* ── Consent-aware Google Analytics ── */
  var ANALYTICS_ID = 'G-737ST4RNRZ';
  var ANALYTICS_CHOICE_KEY = 'claspio_analytics_consent';
  var analyticsStarted = false;
  var analyticsChoice = readAnalyticsChoice();

  function readAnalyticsChoice() {
    try { return window.localStorage.getItem(ANALYTICS_CHOICE_KEY); }
    catch (error) { return null; }
  }

  function saveAnalyticsChoice(choice) {
    analyticsChoice = choice;
    try { window.localStorage.setItem(ANALYTICS_CHOICE_KEY, choice); }
    catch (error) { /* Continue with a session-only choice. */ }
  }

  function deleteAnalyticsCookies() {
    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.split('=')[0].trim();
      if (name.indexOf('_ga') === 0) {
        document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax';
        document.cookie = name + '=; Max-Age=0; path=/; domain=.claspio.com; SameSite=Lax';
      }
    });
  }

  function enableAnalytics() {
    window['ga-disable-' + ANALYTICS_ID] = false;
    if (analyticsStarted) {
      window.gtag('config', ANALYTICS_ID);
      return;
    }

    analyticsStarted = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ANALYTICS_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ANALYTICS_ID);
    document.head.appendChild(script);
  }

  function disableAnalytics() {
    window['ga-disable-' + ANALYTICS_ID] = true;
    deleteAnalyticsCookies();
  }

  function trackAnalytics(eventName, parameters) {
    if (analyticsChoice !== 'granted' || typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, parameters || {});
  }

  function createConsentControls() {
    var banner = document.createElement('section');
    banner.className = 'analytics-consent';
    banner.id = 'analytics-consent-panel';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-labelledby', 'analytics-consent-title');
    banner.innerHTML =
      '<span class="analytics-consent-code">Analytics / Your choice</span>' +
      '<h2 id="analytics-consent-title">Help us improve Claspio.</h2>' +
      '<p>We use Google Analytics cookies to understand visits and useful interactions. We never send contact-form contents. Read <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google\'s privacy policy</a>.</p>' +
      '<p class="analytics-consent-state" aria-live="polite"></p>' +
      '<div class="analytics-consent-actions"><button type="button" data-analytics-choice="granted">Accept analytics</button><button type="button" data-analytics-choice="denied">Decline</button></div>';

    var settings = document.createElement('button');
    settings.className = 'analytics-settings';
    settings.type = 'button';
    settings.textContent = 'Privacy settings';
    settings.setAttribute('aria-controls', 'analytics-consent-panel');
    settings.hidden = !analyticsChoice;

    function updateConsentState() {
      var state = banner.querySelector('.analytics-consent-state');
      if (!state) return;
      state.textContent = analyticsChoice === 'granted' ? 'Analytics is currently enabled.' : analyticsChoice === 'denied' ? 'Analytics is currently disabled.' : '';
    }

    function openConsent() {
      updateConsentState();
      banner.hidden = false;
      settings.hidden = true;
      var firstButton = banner.querySelector('button');
      if (firstButton) firstButton.focus();
    }

    function closeConsent() {
      banner.hidden = true;
      settings.hidden = false;
      settings.focus();
    }

    banner.querySelectorAll('[data-analytics-choice]').forEach(function (button) {
      button.addEventListener('click', function () {
        var choice = button.getAttribute('data-analytics-choice');
        saveAnalyticsChoice(choice);
        if (choice === 'granted') enableAnalytics();
        else disableAnalytics();
        closeConsent();
      });
    });

    settings.addEventListener('click', openConsent);
    banner.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && analyticsChoice) closeConsent();
    });

    document.body.appendChild(banner);
    document.body.appendChild(settings);
    if (analyticsChoice) banner.hidden = true;
    else openConsent();
  }

  if (analyticsChoice === 'granted') enableAnalytics();
  else disableAnalytics();
  createConsentControls();

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    var label = (link.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100);

    if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) {
      trackAnalytics('contact_click', { contact_method: href.indexOf('mailto:') === 0 ? 'email' : 'phone' });
    } else if (link.classList.contains('marquee-card') || link.closest('.service-nav')) {
      trackAnalytics('service_select', { service_name: label, link_url: link.href });
    } else if (link.classList.contains('case-preview-card') || link.closest('.case-index-grid')) {
      trackAnalytics('case_study_select', { case_study_name: label, link_url: link.href });
    } else if (link.closest('.main-nav')) {
      trackAnalytics('navigation_click', { link_text: label, link_url: link.href });
    } else if (link.classList.contains('btn') || link.classList.contains('text-link')) {
      trackAnalytics('cta_click', { cta_text: label, link_url: link.href });
    } else if (link.hostname && link.hostname !== window.location.hostname) {
      trackAnalytics('outbound_click', { link_text: label, link_url: link.href });
    }
  });

  /* ── Header state ── */
  var header = document.querySelector('.site-header');
  function updateHeader() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ── Homepage signal field ── */
  var heroField = document.querySelector('[data-hero]');
  if (heroField && window.matchMedia('(pointer: fine)').matches) {
    heroField.addEventListener('pointermove', function (event) {
      var rect = heroField.getBoundingClientRect();
      var x = ((event.clientX - rect.left) / rect.width) * 100;
      var y = ((event.clientY - rect.top) / rect.height) * 100;
      heroField.style.setProperty('--hero-x', x.toFixed(2) + '%');
      heroField.style.setProperty('--hero-y', y.toFixed(2) + '%');
    });
    heroField.addEventListener('pointerleave', function () {
      heroField.style.setProperty('--hero-x', '72%');
      heroField.style.setProperty('--hero-y', '36%');
    });
  }

  /* ── Scroll Reveal ── */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ── Animated counters ── */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1800;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      var val = target * ease;
      el.textContent = (Number.isInteger(target) ? Math.floor(val) : val.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counterEls = document.querySelectorAll('[data-count]');
  if (counterEls.length && 'IntersectionObserver' in window) {
    var cObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(function (el) { cObserver.observe(el); });
  }

  /* ── Typing effect ── */
  var typingEl = document.querySelector('[data-typing]');
  if (typingEl) {
    var words = JSON.parse(typingEl.getAttribute('data-typing'));
    var wi = 0, ci = 0, deleting = false;
    function tick() {
      var word = words[wi];
      typingEl.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
      var speed = deleting ? 50 : 90;
      if (!deleting && ci > word.length) { deleting = true; speed = 1400; }
      else if (deleting && ci < 0)       { deleting = false; wi = (wi + 1) % words.length; ci = 0; speed = 300; }
      setTimeout(tick, speed);
    }
    tick();
  }

  /* ── Nav toggle ── */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var form = document.querySelector('.contact-form[data-endpoint]');
  if (form) {
    var status = form.querySelector('.form-status');
    var submitBtn = form.querySelector('button[type="submit"]');
    var submitLabel = submitBtn ? submitBtn.textContent : 'Send enquiry';
    var formStarted = false;

    form.addEventListener('focusin', function () {
      if (formStarted) return;
      formStarted = true;
      trackAnalytics('form_start', { form_name: 'project_enquiry' });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = new URLSearchParams();
      var context = [];
      if (form.company && form.company.value.trim()) context.push('Company: ' + form.company.value.trim());
      if (form.service && form.service.value) context.push('Area of interest: ' + form.service.value);
      var selectedService = form.service && form.service.value ? form.service.value : 'Not specified';
      var message = form.text.value.trim();
      if (context.length) message = context.join('\n') + '\n\nProject context:\n' + message;

      data.append('action', 'contact');
      data.append('name', form.name.value.trim());
      data.append('email', form.email.value.trim());
      data.append('text', message);

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
      if (status) { status.className = 'form-status'; status.textContent = ''; }

      fetch(form.getAttribute('data-endpoint'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: data.toString()
      })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (json && json.status === 'success') {
            if (status) { status.textContent = 'Thanks — your message has been sent. We\'ll reply shortly.'; status.className = 'form-status show ok'; }
            trackAnalytics('generate_lead', { lead_source: 'project_enquiry', service_interest: selectedService });
            form.reset();
            formStarted = false;
          } else {
            if (status) { status.textContent = 'Please check your details and try again.'; status.className = 'form-status show err'; }
          }
        })
        .catch(function () {
          if (status) { status.textContent = 'Something went wrong. Please email us directly at hello@claspio.com.'; status.className = 'form-status show err'; }
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitLabel; }
        });
    });
  }
})();
