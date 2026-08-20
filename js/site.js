(function () {

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

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = new URLSearchParams();
      data.append('action', 'contact');
      data.append('name', form.name.value);
      data.append('email', form.email.value);
      data.append('text', form.text.value);

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
            form.reset();
          } else {
            if (status) { status.textContent = 'Please check your details and try again.'; status.className = 'form-status show err'; }
          }
        })
        .catch(function () {
          if (status) { status.textContent = 'Something went wrong. Please email us directly at hello@claspio.com.'; status.className = 'form-status show err'; }
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send message'; }
        });
    });
  }
})();
