// ============================
// STARLINK SALES PAGE - MAIN JS
// ============================

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Counter animation
function animateCounters() {
  const counters = document.querySelectorAll('.stat-num');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = Math.floor(current);
        }, 25);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}
animateCounters();

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 50) {
    nav.style.background = 'rgba(0,0,0,0.95)';
  } else {
    nav.style.background = 'rgba(0,0,0,0.85)';
  }
});

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const links = document.querySelector('.nav-links');
    links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
  });
}

// Order modal
function openOrder(product, price) {
  document.getElementById('modalProduct').textContent = product;
  document.getElementById('modalPrice').textContent = '$' + price.toLocaleString();
  document.getElementById('orderModal').classList.add('show');
  document.body.style.overflow = 'hidden';

  // Log interaction
  if (window.__tracker) {
    window.__tracker.logEvent('open_order_modal', { product, price });
  }
}

function closeOrder() {
  document.getElementById('orderModal').classList.remove('show');
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.getElementById('orderModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeOrder();
});

// Close modal on ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeOrder();
});

// Submit order
function submitOrder(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  data.product = document.getElementById('modalProduct').textContent;
  data.price = document.getElementById('modalPrice').textContent;

  // Log order data with tracker
  if (window.__tracker) {
    window.__tracker.logEvent('order_submitted', data);
  }

  console.log('%c🛒 NUEVA ORDEN', 'color: #22c55e; font-size: 16px; font-weight: bold;');
  console.table(data);

  alert('¡Gracias por tu orden! Nos comunicaremos contigo pronto.');
  form.reset();
  closeOrder();
}

// Coverage check
function checkCoverage() {
  const cp = document.getElementById('cpInput').value.trim();
  const result = document.getElementById('cpResult');

  if (!cp || cp.length !== 5 || isNaN(cp)) {
    result.className = 'cp-result show error';
    result.textContent = 'Ingresa un código postal válido de 5 dígitos.';
    return;
  }

  result.className = 'cp-result show success';
  result.innerHTML = '✅ <strong>¡Tenemos cobertura!</strong> Tu zona está dentro de nuestra red Starlink. El envío estimado es de 3-5 días hábiles.';

  if (window.__tracker) {
    window.__tracker.logEvent('coverage_check', { postalCode: cp });
  }
}

// Track scroll depth
let maxScroll = 0;
window.addEventListener('scroll', () => {
  const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
  if (scrollPercent > maxScroll) {
    maxScroll = scrollPercent;
  }
});

// Track time on page
let startTime = Date.now();
window.addEventListener('beforeunload', () => {
  const timeSpent = Math.round((Date.now() - startTime) / 1000);
  if (window.__tracker) {
    window.__tracker.logEvent('page_exit', {
      timeSpentSeconds: timeSpent,
      maxScrollPercent: maxScroll
    });
  }
});
