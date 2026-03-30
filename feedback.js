/* =========================================================
   MEENAAKSHI CAFE CORNER — feedback.js
   Handles feedback form submission + fetching from Flask API
   =========================================================
   Flask API base URL — change this if deployed elsewhere
   ========================================================= */

(function () {
  'use strict';

  const API_BASE = 'http://localhost:5000';   // ← change to your server IP/domain when deployed

  /* ── DOM refs ── */
  const form          = document.getElementById('feedbackForm');
  const submitBtn     = document.getElementById('feedbackSubmitBtn');
  const btnText       = document.getElementById('feedbackBtnText');
  const btnArrow      = document.getElementById('feedbackBtnArrow');
  const btnSpinner    = document.getElementById('feedbackBtnSpinner');
  const successBox    = document.getElementById('feedback-success');
  const errorBox      = document.getElementById('feedback-error');
  const errorText     = document.getElementById('feedback-error-text');
  const feedbackList  = document.getElementById('feedbackList');
  const feedbackCount = document.getElementById('feedbackCount');
  const loadingEl     = document.getElementById('feedbackLoading');
  const starBtns      = document.querySelectorAll('.star-btn');
  const ratingInput   = document.getElementById('fb-rating');

  /* ── Star rating ── */
  let selectedRating = 0;

  starBtns.forEach(function (btn) {
    btn.addEventListener('mouseenter', function () {
      var val = parseInt(btn.dataset.val);
      highlightStars(val);
    });

    btn.addEventListener('mouseleave', function () {
      highlightStars(selectedRating);
    });

    btn.addEventListener('click', function () {
      selectedRating = parseInt(btn.dataset.val);
      ratingInput.value = selectedRating;
      highlightStars(selectedRating);
      clearErr('err-rating');
    });
  });

  function highlightStars(upTo) {
    starBtns.forEach(function (b) {
      b.classList.toggle('active', parseInt(b.dataset.val) <= upTo);
    });
  }

  /* ── Validation helpers ── */
  function showErr(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  function clearErr(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '';
  }

  function markError(inputId, errId, msg) {
    var inp = document.getElementById(inputId);
    if (inp) inp.classList.add('input-error');
    showErr(errId, msg);
  }

  function clearInputError(input) {
    input.classList.remove('input-error');
    var errId = 'err-' + input.id.replace('fb-', '');
    clearErr(errId);
  }

  document.querySelectorAll('.form-input').forEach(function (inp) {
    inp.addEventListener('input', function () { clearInputError(inp); });
  });

  function validateForm() {
    var valid = true;

    var name = document.getElementById('fb-name').value.trim();
    if (!name) {
      markError('fb-name', 'err-name', 'Please enter your name.');
      valid = false;
    }

    var email = document.getElementById('fb-email').value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      markError('fb-email', 'err-email', 'Please enter a valid email address.');
      valid = false;
    }

    if (!selectedRating) {
      showErr('err-rating', 'Please select a star rating.');
      valid = false;
    }

    var message = document.getElementById('fb-message').value.trim();
    if (!message) {
      markError('fb-message', 'err-message', 'Please write your feedback.');
      valid = false;
    } else if (message.length < 10) {
      markError('fb-message', 'err-message', 'Feedback must be at least 10 characters.');
      valid = false;
    }

    return valid;
  }

  /* ── Submit form ── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    successBox.style.display = 'none';
    errorBox.style.display   = 'none';

    if (!validateForm()) return;

    /* show spinner */
    submitBtn.disabled  = true;
    btnText.textContent = 'Submitting…';
    btnArrow.style.display   = 'none';
    btnSpinner.style.display = 'inline-block';

    var payload = {
      name:       document.getElementById('fb-name').value.trim(),
      email:      document.getElementById('fb-email').value.trim(),
      phone:      document.getElementById('fb-phone').value.trim(),
      visit_type: document.getElementById('fb-visit-type').value,
      rating:     selectedRating,
      message:    document.getElementById('fb-message').value.trim()
    };

    fetch(API_BASE + '/api/feedback', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    })
    .then(function (res) {
      return res.json().then(function (data) {
        return { ok: res.ok, data: data };
      });
    })
    .then(function (result) {
      if (result.ok) {
        successBox.style.display = 'flex';
        form.reset();
        selectedRating = 0;
        ratingInput.value = '';
        highlightStars(0);
        loadFeedbacks();
      } else {
        errorText.textContent = result.data.error || 'Submission failed. Please try again.';
        errorBox.style.display = 'flex';
      }
    })
    .catch(function () {
      errorText.textContent = 'Could not connect to the server. Make sure the backend is running.';
      errorBox.style.display = 'flex';
    })
    .finally(function () {
      submitBtn.disabled       = false;
      btnText.textContent      = 'Submit Feedback';
      btnArrow.style.display   = 'inline-block';
      btnSpinner.style.display = 'none';
    });
  });

  /* ── Load feedbacks from API ── */
  function loadFeedbacks() {
    fetch(API_BASE + '/api/feedbacks')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        renderFeedbacks(data.feedbacks || []);
      })
      .catch(function () {
        feedbackList.innerHTML =
          '<div class="feedback-empty">' +
          '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>' +
          '<p>Could not load feedbacks.<br />Make sure the backend server is running.</p>' +
          '</div>';
        feedbackCount.textContent = '—';
      });
  }

  function renderFeedbacks(items) {
    feedbackCount.textContent = items.length + (items.length === 1 ? ' Review' : ' Reviews');

    if (items.length === 0) {
      feedbackList.innerHTML =
        '<div class="feedback-empty">' +
        '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
        '<p>No feedbacks yet. Be the first to share your experience!</p>' +
        '</div>';
      return;
    }

    feedbackList.innerHTML = items.map(function (fb, idx) {
      var stars = '';
      for (var i = 1; i <= 5; i++) {
        stars += i <= fb.rating ? '★' : '☆';
      }
      var initial = (fb.name || 'A').charAt(0).toUpperCase();
      var date    = fb.created_at ? new Date(fb.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      var badge   = fb.visit_type ? '<span class="fb-badge">' + escapeHtml(fb.visit_type) + '</span>' : '';

      return (
        '<div class="feedback-card" style="animation-delay:' + (idx * 0.06) + 's">' +
          '<div class="feedback-card-header">' +
            '<div class="fb-avatar">' + initial + '</div>' +
            '<div class="fb-meta">' +
              '<span class="fb-name">' + escapeHtml(fb.name) + '</span>' +
              '<span class="fb-date">' + date + '</span>' +
            '</div>' +
            badge +
          '</div>' +
          '<div class="fb-stars">' + stars + '</div>' +
          '<p class="fb-message">' + escapeHtml(fb.message) + '</p>' +
        '</div>'
      );
    }).join('');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ── Auto-load on page load ── */
  loadFeedbacks();

})();
