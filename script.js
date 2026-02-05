/* Updated JS:
 - scrollspy for nav tabs + animated underline
 - reveal on scroll (IntersectionObserver)
 - carousel (mini)
 - whatsapp FAB & form -> whatsapp
 - mobile menu handling
 - lazy-loading (native + fallback)
*/

// small helpers
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from((root || document).querySelectorAll(sel));

// YEAR
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- SCROLLSPY + TAB UNDERLINE ---------- */
(function initScrollSpy() {
  const links = $$('.nav-link');
  const sections = links.map(l => document.querySelector(l.getAttribute('href')));
  const underline = document.querySelector('.tabs-underline');

  function setActiveById(id) {
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
    // move underline width to match active link (desktop only)
    const active = links.find(l => l.classList.contains('active'));
    if(active && window.innerWidth > 760) {
      const rect = active.getBoundingClientRect();
      // place underline below header centered relative to container
      const containerRect = document.querySelector('.container').getBoundingClientRect();
      const left = rect.left - containerRect.left;
      underline.style.width = `${rect.width}px`;
      underline.style.transform = `translateX(${left}px)`;
    } else {
      // fallback: full width
      underline.style.width = `0`;
      underline.style.transform = `translateX(0)`;
    }
  }

  // smooth scroll on click
  links.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if(!el) return;
      const topOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
      const y = el.getBoundingClientRect().top + window.scrollY - topOffset + 8;
      window.scrollTo({top: y, behavior: 'smooth'});
      // close mobile menu if open
      closeMobileMenu();
    });
  });

  // IntersectionObserver to detect section in view
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        const id = entry.target.id;
        setActiveById(id);
      }
    });
  }, {root: null, threshold: 0.45});

  sections.forEach(s => { if(s) observer.observe(s); });
  // initial
  setTimeout(() => setActiveById('home'), 100);
})();

/* ---------- REVEAL ON SCROLL ---------- */
(function initReveal() {
  const items = $$('.reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting) {
        e.target.classList.add('visible');
        // optionally unobserve to keep performance
        io.unobserve(e.target);
      }
    });
  }, {root: null, threshold: 0.12});
  items.forEach(i => io.observe(i));
})();

/* ---------- CAROUSEL (mini) ---------- */
(function initCarousel() {
  const carousel = document.getElementById('carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(track.querySelectorAll('img'));
  const prev = carousel.querySelector('.prev');
  const next = carousel.querySelector('.next');
  let index = 0;
  let autoplayId = null;

  // duplicar slides para efeito infinito
  track.innerHTML += track.innerHTML;
  const allSlides = Array.from(track.querySelectorAll('img'));
  const total = slides.length;

  function getSlideWidth() {
    return allSlides[0]?.getBoundingClientRect().width || 0;
  }

  function update() {
    const width = getSlideWidth();
    track.style.transition = 'transform 0.5s ease';
    track.style.transform = `translateX(-${index * width}px)`;
  }

  function goTo(i) {
    const width = getSlideWidth();
    index = i;

    track.style.transition = 'transform 0.5s ease';
    track.style.transform = `translateX(-${index * width}px)`;

    // loop infinito
    if (index >= total) {
      setTimeout(() => {
        track.style.transition = 'none';
        index = 0;
        track.style.transform = `translateX(-${index * width}px)`;
      }, 520);
    }
    if (index < 0) {
      setTimeout(() => {
        track.style.transition = 'none';
        index = total - 1;
        track.style.transform = `translateX(-${index * width}px)`;
      }, 520);
    }
  }

  prev.addEventListener('click', () => { goTo(index - 1); resetAutoplay(); });
  next.addEventListener('click', () => { goTo(index + 1); resetAutoplay(); });

  function startAutoplay() {
    stopAutoplay();
    autoplayId = setInterval(() => goTo(index + 1), 3500);
  }
  function stopAutoplay() { if (autoplayId) clearInterval(autoplayId); autoplayId = null; }
  function resetAutoplay() { stopAutoplay(); startAutoplay(); }

  window.addEventListener('resize', update);
  update();
  startAutoplay();
})();






/* ---------- WHATSAPP FAB & OPTIONS ---------- */
(function initWhatsApp(){
  const waToggle = document.getElementById('wa-toggle');
  const waMenu = document.getElementById('wa-menu');

  waToggle?.addEventListener('click', () => {
    waMenu.classList.toggle('hidden');
    const hidden = waMenu.classList.contains('hidden');
    waMenu.setAttribute('aria-hidden', hidden ? 'true' : 'false');
  });

  const handleClick = (btn) => {
    const raw = btn.dataset.number || '';
    const number = raw.replace(/\D/g,'');
    const text = encodeURIComponent('Olá! Gostaria de solicitar um orçamento.');
    const url = `https://wa.me/${number}?text=${text}`;
    window.open(url, '_blank');
  };

  // attach to all wa-option buttons (FAB and page)
  document.querySelectorAll('button.wa-option').forEach(b => b.addEventListener('click', () => handleClick(b)));
})();

/* ---------- FORM -> monta mensagem e abre WA ---------- */
(function initForm(){
  const form = document.getElementById('quote-form');
  const clearBtn = document.getElementById('clear-btn');
  if(!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const origem = fd.get('origem') || '-';
    const destino = fd.get('destino') || '-';
    const volume = fd.get('volume') || '-';
    const data = fd.get('data') || '-';
    const telefone = fd.get('telefone') || '-';
    const message = [
      '*Orçamento - Manu Transportes*',
      '',
      `*Origem:* ${origem}`,
      `*Destino:* ${destino}`,
      `*Volume/Descrição:* ${volume}`,
      `*Data prevista:* ${data}`,
      `*Telefone de contato:* ${telefone}`,
      '',
      'Obrigado!'
    ].join('\n');

    const phone = '553199119166'; 
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  });

  clearBtn?.addEventListener('click', () => form.reset());
})();

/* ---------- MOBILE MENU ---------- */
(function initMobileMenu(){
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');

  function openMobileMenu(){
    menu.style.display = 'flex';
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  window.closeMobileMenu = function closeMobileMenu(){
    menu.style.display = 'none';
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  btn?.addEventListener('click', () => {
    if(menu.style.display === 'flex') closeMobileMenu();
    else openMobileMenu();
  });

  // close when clicking a mobile link
  document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => closeMobileMenu()));
})();

/* ---------- LAZY LOAD fallback (progressive) ---------- */
(function lazyImages(){
  const imgs = Array.from(document.querySelectorAll('img'));
  if('loading' in HTMLImageElement.prototype){
    imgs.forEach(img => img.loading = 'lazy');
  } else {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const img = entry.target;
          const src = img.getAttribute('data-src') || img.getAttribute('src');
          if(img.getAttribute('data-src')) img.src = img.dataset.src;
          obs.unobserve(img);
        }
      });
    }, {rootMargin: '200px'});
    imgs.forEach(img => obs.observe(img));
  }
})();

