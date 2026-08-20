(function () {
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
