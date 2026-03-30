/* =========================================================
   MEENAAKSHI CAFE CORNER – INTERACTIVE JAVASCRIPT
   ========================================================= */

(function () {
  'use strict';

  /* NAV: Scroll-aware background */
  const navbar = document.getElementById('navbar');
  function updateNavbar() {
    if (window.scrollY > 48) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  /* HAMBURGER MENU */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  document.querySelectorAll('.mobile-link').forEach(function(link) {
    link.addEventListener('click', function() {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  /* SCROLL REVEAL */
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealElements.forEach(function(el) { revealObserver.observe(el); });

  /* HERO reveal immediately */
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    setTimeout(function() { heroContent.classList.add('visible'); }, 150);
  }

  /* SMOOTH SCROLL */
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var href = anchor.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var navHeight = navbar.offsetHeight;
        var top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ACTIVE NAV LINK on scroll */
  var sections = document.querySelectorAll('section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a');
  function setActiveNav() {
    var current = '';
    sections.forEach(function(section) {
      var sectionTop = section.offsetTop - navbar.offsetHeight - 40;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navAnchors.forEach(function(a) {
      a.classList.remove('active');
      if (a.getAttribute('href') === '#' + current) {
        a.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', setActiveNav, { passive: true });

  /* COUNTER ANIMATION for stats */
  function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(function(counter) {
      var text = counter.textContent;
      var numMatch = text.match(/[\d.]+/);
      if (!numMatch) return;
      var target = parseFloat(numMatch[0]);
      if (isNaN(target)) return;
      var prefix = text.substring(0, numMatch.index);
      var suffix = text.substring(numMatch.index + numMatch[0].length);
      var isDecimal = numMatch[0].includes('.');
      var decimals = isDecimal ? numMatch[0].split('.')[1].length : 0;
      var duration = 1600;
      var startTime = performance.now();
      function updateCounter(currentTime) {
        var elapsed = currentTime - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = target * eased;
        counter.textContent = prefix + current.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(updateCounter);
      }
      requestAnimationFrame(updateCounter);
    });
  }
  var statsBar = document.querySelector('.stats-bar');
  if (statsBar) {
    var statsObserver = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        animateCounters();
        statsObserver.disconnect();
      }
    }, { threshold: 0.5 });
    statsObserver.observe(statsBar);
  }

  /* PARALLAX on hero */
  var hero = document.querySelector('.hero');
  function heroParallax() {
    if (!hero || window.scrollY > window.innerHeight) return;
    var offset = window.scrollY * 0.3;
    hero.style.backgroundPositionY = 'calc(50% + ' + offset + 'px)';
  }
  window.addEventListener('scroll', heroParallax, { passive: true });

  /* MENU CARDS tilt effect */
  document.querySelectorAll('.menu-card').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = (e.clientX - cx) / (rect.width / 2);
      var dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = 'translateY(-6px) rotateX(' + (-dy * 4) + 'deg) rotateY(' + (dx * 4) + 'deg)';
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
    });
  });

  console.log('%c🌿 Meenaakshi Cafe Corner - Authentic Vegetarian Taste', 'color:#1F3D2B;font-size:14px;font-weight:600;');
})();
