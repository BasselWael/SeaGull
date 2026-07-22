
  // ─── SCROLL ANIMATIONS ENGINE ───────────────────────────────
  (function() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scroll progress bar
    const progressBar = document.getElementById('scroll-progress');
    const nav = document.querySelector('nav');
    let lastScrollY = 0;
    let navHidden = false;

    // Detect if this is a touch/mobile device — disable expensive effects there
    const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches
                       || window.innerWidth < 900;

    // Cache DOM queries (don't re-query on every scroll)
    const heroVisual = document.querySelector('.hero-visual');
    const heroH1 = document.querySelector('.hero h1');

    let ticking = false;
    let cachedScrollTop = 0;
    let cachedDocHeight = document.documentElement.scrollHeight - window.innerHeight;

    function updateScroll() {
      const scrollTop = cachedScrollTop;
      const pct = cachedDocHeight > 0 ? (scrollTop / cachedDocHeight) * 100 : 0;
      if (progressBar) progressBar.style.width = pct + '%';

      // Nav scrolled state
      if (nav) {
        if (scrollTop > 60) nav.classList.add('nav-scrolled');
        else nav.classList.remove('nav-scrolled');

        // Hide nav when scrolling down past threshold, show when scrolling up
        if (scrollTop > 300 && scrollTop > lastScrollY + 8) {
          if (!navHidden) { nav.classList.add('nav-hidden'); navHidden = true; }
        } else if (scrollTop < lastScrollY - 8 || scrollTop < 200) {
          if (navHidden) { nav.classList.remove('nav-hidden'); navHidden = false; }
        }
        lastScrollY = scrollTop;
      }

      // Hero parallax: ONLY on non-touch, non-reduced-motion devices
      // (parallax on mobile is the #1 cause of scroll jank)
      if (!isTouchDevice && !prefersReducedMotion && scrollTop < window.innerHeight) {
        if (heroVisual) heroVisual.style.transform = `translate3d(0, ${scrollTop * 0.15}px, 0)`;
        if (heroH1) heroH1.style.transform = `translate3d(0, ${scrollTop * 0.08}px, 0)`;
      }

      ticking = false;
    }

    function onScroll() {
      cachedScrollTop = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    }

    // Recalc doc height on resize (not on every scroll)
    window.addEventListener('resize', () => {
      cachedDocHeight = document.documentElement.scrollHeight - window.innerHeight;
    }, { passive: true });

    window.addEventListener('scroll', onScroll, { passive: true });
    updateScroll();

    // Intersection Observer for reveal animations
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Unobserve once revealed (one-way animation)
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

      document.querySelectorAll('.reveal, .stagger, .stats, .title-mask').forEach(el => {
        revealObserver.observe(el);
      });

      // Dish items inside menu — observe when they render
      function observeDishes() {
        document.querySelectorAll('.dishes-grid').forEach(grid => {
          if (!grid.dataset.observed) {
            grid.dataset.observed = '1';
            // Assign --i custom property for stagger
            Array.from(grid.children).forEach((child, i) => {
              child.style.setProperty('--i', Math.min(i, 12));
            });
            revealObserver.observe(grid);
          }
        });
      }
      observeDishes();
      // Re-run after menu tab switch (menu content is dynamically rendered)
      const menuContent = document.getElementById('menu-content');
      if (menuContent) {
        const menuMutationObserver = new MutationObserver(() => {
          setTimeout(observeDishes, 50);
        });
        menuMutationObserver.observe(menuContent, { childList: true, subtree: true });
      }
    } else {
      // Fallback: reveal everything immediately
      document.querySelectorAll('.reveal, .stagger, .stats, .title-mask').forEach(el => {
        el.classList.add('is-visible');
      });
    }

    // Cursor-following sparkle on menu featured (desktop only, subtle)
    if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
      const featured = document.querySelector('.menu-featured');
      if (featured) {
        featured.addEventListener('mousemove', (e) => {
          const rect = featured.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          featured.style.setProperty('--mx', x + '%');
          featured.style.setProperty('--my', y + '%');
        });
      }
    }

    // Pause map animations when offscreen — frees CPU for smoother scrolling
    if ('IntersectionObserver' in window) {
      const mapCanvas = document.querySelector('.map-canvas, .egypt-map-wrap');
      if (mapCanvas) {
        const mapObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            mapCanvas.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
            // Pause child animations too
            mapCanvas.querySelectorAll('.pin-pulse, .map-pin-halo').forEach(el => {
              el.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
            });
          });
        }, { threshold: 0 });
        mapObserver.observe(mapCanvas);
      }
    }
  })();

  // ─── INTERACTIVE MAP ────────────────────────────────────────
  const BRANCHES_MAP = {
    'el-max': {
      name: { en: 'El Max', ar: 'المكس' },
      tag: { en: 'The Original · Est. 1985', ar: 'الفرع الأول · تأسس ١٩٨٥' },
      city: { en: 'Alexandria · On the shore', ar: 'الإسكندرية · على الشاطئ' },
      address: { en: 'El Max, Alexandria — on the western harbour fishermen\'s corniche.', ar: 'المكس، الإسكندرية — على كورنيش الصيادين في الميناء الغربي.' },
      hours: { en: 'Daily · 1:00 PM – 1:00 AM', ar: 'يوميًا · من الواحدة ظهرًا حتى الواحدة صباحًا' },
      phone: '+20 3 440 1111',
      phoneHref: 'tel:+2034401111',
      mapsUrl: 'https://maps.google.com/?cid=10859717955587162108'
    },
    'gleem': {
      name: { en: 'Gleem', ar: 'جليم' },
      tag: { en: 'Alexandria · Coastal', ar: 'الإسكندرية · على الساحل' },
      city: { en: 'Alexandria', ar: 'الإسكندرية' },
      address: { en: 'Gleem, Alexandria — near the Corniche, in the heart of the eastern district.', ar: 'جليم، الإسكندرية — قرب الكورنيش في قلب الحي الشرقي.' },
      hours: { en: 'Daily · 1:00 PM – 1:00 AM', ar: 'يوميًا · من الواحدة ظهرًا حتى الواحدة صباحًا' },
      phone: '+20 121 233 3311',
      phoneHref: 'tel:+201212333311',
      mapsUrl: 'https://maps.google.com/?cid=15891234496768728366'
    },
    'marina': {
      name: { en: 'Marina', ar: 'مارينا' },
      tag: { en: 'Seasonal · Summer Only', ar: 'موسمي · صيفًا فقط' },
      city: { en: 'North Coast · Summer House', ar: 'الساحل الشمالي · البيت الصيفي' },
      address: { en: 'Marina El Alamein, North Coast — inside the Marina resort complex.', ar: 'مارينا العلمين، الساحل الشمالي — داخل قرية مارينا السياحية.' },
      hours: { en: 'Summer season only · 2:00 PM – 2:00 AM', ar: 'الموسم الصيفي فقط · من الثانية ظهرًا حتى الثانية صباحًا' },
      phone: '+20 121 233 3311',
      phoneHref: 'tel:+201212333311',
      mapsUrl: 'https://maps.google.com/?cid=5656268468266890366',
      seasonal: true
    },
    'dokki': {
      name: { en: 'Dokki', ar: 'الدقي' },
      tag: { en: 'On the Nile · Cairo', ar: 'على النيل · القاهرة' },
      city: { en: 'Dokki · On the Nile', ar: 'الدقي · على النيل' },
      address: { en: '26 El Nil St., Dokki, Giza — on a boat moored on the Nile, across from Cairo Tower.', ar: '٢٦ شارع النيل، الدقي، الجيزة — على مركب راسٍ على النيل، مقابل برج القاهرة.' },
      hours: { en: 'Daily · 1:00 PM – 2:00 AM', ar: 'يوميًا · من الواحدة ظهرًا حتى الثانية صباحًا' },
      phone: '+20 121 233 3311',
      phoneHref: 'tel:+201212333311',
      mapsUrl: 'https://maps.google.com/?cid=2683235454129525732'
    },
    'new-cairo': {
      name: { en: 'New Cairo', ar: 'القاهرة الجديدة' },
      tag: { en: 'Tagamoa · East Cairo', ar: 'التجمع · شرق القاهرة' },
      city: { en: 'Fifth Settlement · Tagamoa', ar: 'التجمع الخامس' },
      address: { en: 'North 90 Street, Fifth Settlement, New Cairo.', ar: 'شارع التسعين الشمالي، التجمع الخامس، القاهرة الجديدة.' },
      hours: { en: 'Daily · 1:00 PM – 2:00 AM', ar: 'يوميًا · من الواحدة ظهرًا حتى الثانية صباحًا' },
      phone: '+20 121 233 3311',
      phoneHref: 'tel:+201212333311',
      mapsUrl: 'https://maps.google.com/?cid=16605083563928774855'
    },
    'madinaty': {
      name: { en: 'Madinaty', ar: 'مدينتي' },
      tag: { en: 'All Seasons Mall', ar: 'مول أول سيزونز' },
      city: { en: 'Madinaty · East Cairo', ar: 'مدينتي · شرق القاهرة' },
      address: { en: 'All Seasons Mall, Madinaty — ground floor, food quarter.', ar: 'مول أول سيزونز، مدينتي — الطابق الأرضي، منطقة المطاعم.' },
      hours: { en: 'Daily · 1:00 PM – 1:00 AM', ar: 'يوميًا · من الواحدة ظهرًا حتى الواحدة صباحًا' },
      phone: '+20 121 233 3311',
      phoneHref: 'tel:+201212333311',
      mapsUrl: 'https://maps.google.com/?cid=12683640231697060707'
    },
    'sheikh-zayed': {
      name: { en: 'Sheikh Zayed', ar: 'الشيخ زايد' },
      tag: { en: 'Centrada Mall · Newest House', ar: 'سنترادا مول · أحدث البيوت' },
      city: { en: 'Sheikh Zayed · West Cairo', ar: 'الشيخ زايد · غرب القاهرة' },
      address: { en: 'Centrada Mall, Sheikh Zayed City — also home to our Italian Corner.', ar: 'سنترادا مول، الشيخ زايد — حيث يوجد أيضًا الركن الإيطالي.' },
      hours: { en: 'Daily · 1:00 PM – 2:00 AM', ar: 'يوميًا · من الواحدة ظهرًا حتى الثانية صباحًا' },
      phone: '+20 121 233 3311',
      phoneHref: 'tel:+201212333311',
      mapsUrl: 'https://maps.google.com/?cid=5423331948897423321'
    }
  };

  function selectBranch(id, event) {
    if (event) event.stopPropagation();
    const branch = BRANCHES_MAP[id];
    if (!branch) return;

    // Mark pin as active
    document.querySelectorAll('.map-pin').forEach(p => p.classList.remove('active'));
    const pin = document.querySelector(`.map-pin[data-branch="${id}"]`);
    if (pin) pin.classList.add('active');

    // Hide intro, show branch
    const intro = document.getElementById('map-panel-intro');
    const detail = document.getElementById('map-branch');
    if (intro) intro.classList.add('is-hidden');

    // Build branch HTML
    const waUrl = `https://wa.me/201212333311?text=${encodeURIComponent('Hello Seagull — I\'d like to make a reservation at ' + branch.name.en + '.')}`;

    detail.innerHTML = `
      <button class="close-btn" onclick="deselectBranch()" aria-label="Close">✕</button>
      <div class="map-branch-tag">
        <span class="en">${branch.tag.en}</span>
        <span class="ar">${branch.tag.ar}</span>
      </div>
      <h3>
        <span class="en"><em>${branch.name.en}</em></span>
        <span class="ar"><em>${branch.name.ar}</em></span>
      </h3>
      <div class="city">
        <span class="en">${branch.city.en}</span>
        <span class="ar">${branch.city.ar}</span>
      </div>

      <dl class="map-branch-meta">
        <div>
          <dt><span class="en">Address</span><span class="ar">العنوان</span></dt>
          <dd>
            <span class="en">${branch.address.en}</span>
            <span class="ar">${branch.address.ar}</span>
          </dd>
        </div>
        <div>
          <dt><span class="en">Hours</span><span class="ar">المواعيد</span></dt>
          <dd>
            <span class="en">${branch.hours.en}</span>
            <span class="ar">${branch.hours.ar}</span>
          </dd>
        </div>
        <div>
          <dt><span class="en">Phone</span><span class="ar">الهاتف</span></dt>
          <dd><a href="${branch.phoneHref}" dir="ltr">${branch.phone}</a></dd>
        </div>
      </dl>

      <div class="map-branch-actions">
        <a href="${branch.mapsUrl}" target="_blank" rel="noopener" class="act-primary">
          <span class="en">Get Directions</span>
          <span class="ar">الاتجاهات</span>
        </a>
        <button class="act-secondary" onclick="openModal('reserve-modal')">
          <span class="en">Reserve</span>
          <span class="ar">احجز</span>
        </button>
        <a href="${waUrl}" target="_blank" rel="noopener" class="act-secondary">
          <span class="en">WhatsApp</span>
          <span class="ar">واتساب</span>
        </a>
      </div>
    `;
    detail.classList.add('is-visible');

    // Update language visibility for the freshly-rendered content
    const currentLang = document.documentElement.lang;
    detail.querySelectorAll('.en').forEach(el => el.style.display = currentLang === 'ar' ? 'none' : '');
    detail.querySelectorAll('.ar').forEach(el => el.style.display = currentLang === 'ar' ? '' : 'none');
  }

  function deselectBranch() {
    document.querySelectorAll('.map-pin').forEach(p => p.classList.remove('active'));
    const intro = document.getElementById('map-panel-intro');
    const detail = document.getElementById('map-branch');
    if (intro) intro.classList.remove('is-hidden');
    if (detail) detail.classList.remove('is-visible');
  }

  // ─── MODAL SYSTEM ───────────────────────────────────────────
  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    // Focus the first input for accessibility
    setTimeout(() => {
      const firstInput = modal.querySelector('input, select, textarea');
      if (firstInput) firstInput.focus();
    }, 300);
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // Close modal on overlay click (but not on modal content click)
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.is-open').forEach(m => closeModal(m.id));
    }
  });

  // ─── FORM SUBMISSION → WHATSAPP ──────────────────────────────
  const WA_NUMBER = '201212333311'; // +20 121 233 3311 (Seagull corporate)

  function submitReservation(e) {
    e.preventDefault();
    const f = e.target;
    const data = Object.fromEntries(new FormData(f));
    const msg =
`🐟 *New Reservation — Seagull*

*Branch:* ${data.branch}
*Date:* ${data.date}
*Time:* ${data.time}
*Guests:* ${data.guests}${data.occasion ? `
*Occasion:* ${data.occasion}` : ''}

*Name:* ${data.name}
*Phone:* ${data.phone}${data.requests ? `

*Special requests:*
${data.requests}` : ''}

— Sent via seagull.eg`;
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    document.getElementById('reservationDialog').close();
    f.reset();
    return false;
  }

  function submitEvent(e) {
    e.preventDefault();
    const f = e.target;
    const data = Object.fromEntries(new FormData(f));
    const msg =
`🎉 *Private Event Inquiry — Seagull*

*Event type:* ${data.eventType}
*Name:* ${data.name}
*Phone:* ${data.phone}

— Sent via seagull.eg`;
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    document.getElementById('eventsDialog').close();
    f.reset();
    return false;
  }

  function submitCareer(e) {
    e.preventDefault();
    const f = e.target;
    const data = Object.fromEntries(new FormData(f));
    const msg =
`💼 *Career Application — Seagull*

*Position:* ${data.position}
*Name:* ${data.name}
*Phone:* ${data.phone}

I will send my CV to careers@seagull.eg.

— Sent via seagull.eg`;
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    document.getElementById('careersDialog').close();
    f.reset();
    return false;
  }

  // ─── TESTIMONIALS CAROUSEL ───────────────────────────────────
  const TESTIMONIALS = [
    { text: { en: 'The best seafood I\'ve had in Cairo — fresh, flavourful, and the Nile view at sunset is unmatched.', ar: 'أفضل مأكولات بحرية في القاهرة — طازجة، نكهتها رائعة، ومنظر النيل عند الغروب لا يُضاهى.' }, name: 'Moe M.', branch: { en: 'Dokki · Google', ar: 'الدقي · جوجل' } },
    { text: { en: 'Butterfly shrimp was absolutely delicious. The staff, especially Seif, went above and beyond.', ar: 'جمبري البترفلاي لذيذ جدًا. الطاقم، خاصة سيف، تجاوز كل التوقعات.' }, name: 'Sarah H.', branch: { en: 'New Cairo · Google', ar: 'القاهرة الجديدة · جوجل' } },
    { text: { en: 'A true classic. The view at sunset, the butterfly shrimp, the service — a place that never disappoints.', ar: 'كلاسيكية حقيقية. المنظر عند الغروب، جمبري البترفلاي، الخدمة — مكان لا يخيب ظنك أبدًا.' }, name: 'Ahmed K.', branch: { en: 'Marina · Google', ar: 'مارينا · جوجل' } },
    { text: { en: 'You pick your own fish. Excellent selection, fresh flavours, and service that\'s been refined over decades.', ar: 'تختار سمكتك بنفسك. تشكيلة ممتازة، نكهات طازجة، وخدمة صقلتها عقود من الخبرة.' }, name: 'Nadia F.', branch: { en: 'Dokki · TripAdvisor', ar: 'الدقي · تريب أدفايزر' } },
    { text: { en: 'From starters to mains — everything fresh. Decor is gorgeous, staff calm and accommodating.', ar: 'من المقبلات إلى الأطباق الرئيسية — كل شيء طازج. الديكور رائع والطاقم هادئ ومتعاون.' }, name: 'Omar R.', branch: { en: 'Madinaty · Google', ar: 'مدينتي · جوجل' } },
    { text: { en: 'Grilled shaour, sengari-style. Juicy, tender, perfectly cooked. Five stars, highly recommended.', ar: 'شعور مشوي سنجاري. طري، كامل النضج. خمس نجوم، يستحق بشدة.' }, name: 'Hassan M.', branch: { en: 'Madinaty · Google', ar: 'مدينتي · جوجل' } },
    { text: { en: 'Fresh catches, professional service, and a setting right on the water. A must-visit in Egypt.', ar: 'صيد طازج، خدمة احترافية، وإطلالة مباشرة على الماء. وجهة لا بد من زيارتها في مصر.' }, name: 'Laila A.', branch: { en: 'El Max · Google', ar: 'المكس · جوجل' } },
    { text: { en: 'Beautiful Nile view, excellent service, delicious fresh fish. Recommended for every seafood lover.', ar: 'منظر نيل خلاب، خدمة ممتازة، سمك طازج ولذيذ. ينصح به كل عاشق للمأكولات البحرية.' }, name: 'Yasmine T.', branch: { en: 'Dokki · TripAdvisor', ar: 'الدقي · تريب أدفايزر' } },
    { text: { en: 'Forty years and still getting it right. Seagull rice is a must, the butterfly shrimp a signature.', ar: 'أربعون عامًا وما زال يبدع. أرز سي جل يجب تجربته، وجمبري البترفلاي هو الطبق المميز.' }, name: 'Karim S.', branch: { en: 'Gleem · Google', ar: 'جليم · جوجل' } },
    { text: { en: 'Family-friendly, clean, unique atmosphere. Kids area is great. Fresh seafood every visit.', ar: 'مناسب للعائلات، نظيف، وجوه مميز. منطقة الأطفال رائعة. مأكولات بحرية طازجة في كل زيارة.' }, name: 'Mona E.', branch: { en: 'El Max · Google', ar: 'المكس · جوجل' } },
    { text: { en: 'Came twice during my Cairo trip. Worth every pound. The seafood casserole is unreal.', ar: 'جئت مرتين خلال زيارتي للقاهرة. يستحق كل قرش. طاجن السي فود لا يُصدَّق.' }, name: 'Daniel P.', branch: { en: 'Dokki · TripAdvisor', ar: 'الدقي · تريب أدفايزر' } },
    { text: { en: 'The mezzas are beyond excellent. Baba ghanoush, tomeya, tahini — all perfect. A Cairo institution.', ar: 'المقبلات فوق الممتازة. بابا غنوج، ثومية، طحينة — كل شيء مثالي. مؤسسة قاهرية.' }, name: 'Heba M.', branch: { en: 'Dokki · Google', ar: 'الدقي · جوجل' } },
    { text: { en: 'Boat-based restaurant right on the Nile, across from Cairo Tower. The view alone is worth it.', ar: 'مطعم على متن سفينة على النيل، مقابل برج القاهرة. المنظر وحده يستحق الزيارة.' }, name: 'Tarek H.', branch: { en: 'Dokki · Google', ar: 'الدقي · جوجل' } },
    { text: { en: 'The Sheikh Zayed branch is more upscale — perfect for a special occasion. The truffle pasta is exceptional.', ar: 'فرع الشيخ زايد أكثر أناقة — مثالي للمناسبات الخاصة. باستا الترافل استثنائية.' }, name: 'Rania B.', branch: { en: 'Sheikh Zayed · Google', ar: 'الشيخ زايد · جوجل' } },
    { text: { en: 'Marina branch in summer is magical. Sitting by the sea, fresh catch, perfect breeze. Booked again already.', ar: 'فرع مارينا في الصيف ساحر. الجلوس بجانب البحر، صيد طازج، نسيم مثالي. حجزنا مرة أخرى بالفعل.' }, name: 'Sherif A.', branch: { en: 'Marina · Google', ar: 'مارينا · جوجل' } },
    { text: { en: 'Best shrimp soup in town. Creamy, generous, rich. Came for the shrimp, stayed for the soup.', ar: 'أفضل شوربة جمبري في المدينة. كريمية، سخية، غنية. جئت من أجل الجمبري، بقيت من أجل الشوربة.' }, name: 'Mariam K.', branch: { en: 'New Cairo · Google', ar: 'القاهرة الجديدة · جوجل' } },
    { text: { en: 'Excellent service even on a busy Friday night. Mohammed was attentive and the food was outstanding.', ar: 'خدمة ممتازة حتى في ليلة جمعة مزدحمة. محمد كان منتبهًا والطعام رائعًا.' }, name: 'Khaled W.', branch: { en: 'Dokki · TripAdvisor', ar: 'الدقي · تريب أدفايزر' } },
    { text: { en: 'A regular for years. The standard never slips. Grilled mullet, sayadeya rice — always on point.', ar: 'زبون منتظم منذ سنوات. المستوى لا يتراجع أبدًا. بوري مشوي، أرز صيادية — دائمًا على أعلى مستوى.' }, name: 'Mostafa I.', branch: { en: 'El Max · Google', ar: 'المكس · جوجل' } },
    { text: { en: 'Spectacular shrimp pasta. Generous portions, gorgeous plating, attentive waiters. Worth every visit.', ar: 'مكرونة الجمبري رائعة. حصص سخية، تقديم جميل، نُدُل منتبهون. تستحق كل زيارة.' }, name: 'Dina E.', branch: { en: 'Madinaty · Google', ar: 'مدينتي · جوجل' } },
    { text: { en: 'Took my parents for their anniversary. Staff prepared a special table by the window — beautiful gesture.', ar: 'أخذت والديّ بمناسبة عيد زواجهما. أعدّ الطاقم طاولة خاصة بجانب النافذة — لفتة جميلة.' }, name: 'Hossam M.', branch: { en: 'Dokki · Google', ar: 'الدقي · جوجل' } },
    { text: { en: 'The fresh roe is unmatched anywhere I\'ve eaten in Cairo. Worth the trip from anywhere in the city.', ar: 'البطارخ الفريش لا مثيل لها في أي مكان أكلت فيه في القاهرة. تستحق الرحلة من أي مكان.' }, name: 'Adel R.', branch: { en: 'Gleem · Google', ar: 'جليم · جوجل' } },
    { text: { en: 'Family lunch every other Friday. The kids love the calamari, we love everything. A tradition.', ar: 'غداء عائلي كل جمعة. الأطفال يعشقون الكاليماري، ونحن نعشق كل شيء. أصبحت تقليدًا.' }, name: 'Nour H.', branch: { en: 'New Cairo · Google', ar: 'القاهرة الجديدة · جوجل' } },
    { text: { en: 'Took business clients here — they were impressed. Quiet enough to talk, food beautiful enough to remember.', ar: 'اصطحبت عملاء عمل إلى هنا — انبهروا. هادئ بما يكفي للحديث، والطعام جميل بما يكفي للذكرى.' }, name: 'Farah Z.', branch: { en: 'Sheikh Zayed · Google', ar: 'الشيخ زايد · جوجل' } },
    { text: { en: 'Visited from Dubai. The grilled fish was better than anywhere I\'ve had in the Gulf. Genuine Egyptian flavour.', ar: 'زرتهم من دبي. السمك المشوي أفضل من أي مكان أكلت فيه في الخليج. نكهة مصرية أصيلة.' }, name: 'Saif Q.', branch: { en: 'Dokki · TripAdvisor', ar: 'الدقي · تريب أدفايزر' } },
    { text: { en: 'The Madinaty branch is calm, elegant, and the food is consistent with the rest of the brand. Reliable favourite.', ar: 'فرع مدينتي هادئ وأنيق، والطعام متسق مع باقي فروع العلامة. مفضّل موثوق.' }, name: 'Salma A.', branch: { en: 'Madinaty · Google', ar: 'مدينتي · جوجل' } },
    { text: { en: 'Ramadan iftar here was incredible. They had a special menu, plus the regular dishes. Booked us in despite full house.', ar: 'إفطار رمضان هنا كان رائعًا. كانت لديهم قائمة خاصة بالإضافة للأطباق العادية. استقبلونا رغم الازدحام.' }, name: 'Bassem K.', branch: { en: 'New Cairo · Google', ar: 'القاهرة الجديدة · جوجل' } },
    { text: { en: 'Lobster baladi was a revelation. Cooked simply, dressed lightly, let the flavour speak. That\'s the Seagull way.', ar: 'الاستاكوزا البلدي كانت اكتشافًا. طُهيت ببساطة، تُبِّلت بخفة، تركوا النكهة تتحدث. هذه طريقة سي جل.' }, name: 'Marwan O.', branch: { en: 'El Max · Google', ar: 'المكس · جوجل' } },
    { text: { en: 'My wife and I came for date night. Got the seafood platter to share. Left full, happy, and already planning a return.', ar: 'جئت أنا وزوجتي لقضاء أمسية. طلبنا طبق السي فود المشكّل. غادرنا ممتلئين سعداء، ونخطط للعودة بالفعل.' }, name: 'Youssef L.', branch: { en: 'Sheikh Zayed · Google', ar: 'الشيخ زايد · جوجل' } }
  ];

  function renderTestimonials() {
    const wrap = document.getElementById('testimonials-scroll');
    if (!wrap) return;
    const starsHTML = '★★★★★';
    wrap.innerHTML = TESTIMONIALS.map(t => `
      <div class="testimonial-card">
        <div class="testimonial-stars">${starsHTML}</div>
        <div class="testimonial-text">
          <span class="en">"${t.text.en}"</span>
          <span class="ar">"${t.text.ar}"</span>
        </div>
        <div class="testimonial-meta">
          <span class="testimonial-name">${t.name}</span>
          <span class="testimonial-source">
            <span class="en">${t.branch.en}</span>
            <span class="ar">${t.branch.ar}</span>
          </span>
        </div>
      </div>
    `).join('');

    // Drag-to-scroll on desktop
    let isDown = false, startX, scrollLeft;
    wrap.addEventListener('mousedown', (e) => {
      isDown = true;
      wrap.style.scrollSnapType = 'none';
      startX = e.pageX - wrap.offsetLeft;
      scrollLeft = wrap.scrollLeft;
    });
    wrap.addEventListener('mouseleave', () => { isDown = false; wrap.style.scrollSnapType = ''; });
    wrap.addEventListener('mouseup',    () => { isDown = false; wrap.style.scrollSnapType = ''; });
    wrap.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - wrap.offsetLeft;
      const walk = (x - startX) * 1.5;
      wrap.scrollLeft = scrollLeft - walk;
    });
  }

  function scrollTestimonials(direction) {
    const wrap = document.getElementById('testimonials-scroll');
    if (!wrap) return;
    const card = wrap.querySelector('.testimonial-card');
    const cardWidth = card ? card.offsetWidth + 22 : 380;
    // RTL flips the scroll direction visually but the API stays the same
    const isRTL = document.documentElement.dir === 'rtl';
    const scrollAmount = cardWidth * 2 * (isRTL ? -direction : direction);
    wrap.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderTestimonials);
  } else {
    renderTestimonials();
  }

  // ─── INTERACTIVE EGYPT MAP ──────────────────────────────────
  const BRANCH_MAP_DATA = {
    'el-max': {
      name: { en: 'El Max', ar: 'المكس' },
      tag: { en: 'The Original · Est. 1985', ar: 'الفرع الأول · تأسس ١٩٨٥' },
      region: { en: 'Alexandria · On the Mediterranean', ar: 'الإسكندرية · على البحر المتوسط' },
      address: { en: 'El Max, Alexandria', ar: 'المكس، الإسكندرية' },
      phone: '+20 121 233 3311',
      hours: { en: 'Daily · 12 PM – 1 AM', ar: 'يوميًا · من ١٢ ظهرًا إلى ١ صباحًا' },
      mapsUrl: 'https://maps.google.com/?q=Seagull+El+Max+Alexandria'
    },
    'marina': {
      name: { en: 'Marina', ar: 'مارينا' },
      tag: { en: 'Seasonal · Summer only', ar: 'موسمي · صيفًا فقط' },
      region: { en: 'North Coast · Marina El Alamein', ar: 'الساحل الشمالي · مارينا العلمين' },
      address: { en: 'Marina El Alamein, North Coast', ar: 'مارينا العلمين، الساحل الشمالي' },
      phone: '+20 121 233 3311',
      hours: { en: 'Summer Season · 1 PM – 1 AM', ar: 'موسم الصيف · من ١ ظهرًا إلى ١ صباحًا' },
      mapsUrl: 'https://maps.google.com/?q=Seagull+Marina+El+Alamein'
    },
    'dokki': {
      name: { en: 'Dokki', ar: 'الدقي' },
      tag: { en: 'On the Nile · The Cairo classic', ar: 'على النيل · كلاسيكية القاهرة' },
      region: { en: 'Cairo · Nile-side', ar: 'القاهرة · على ضفاف النيل' },
      address: { en: '26 July Corridor, Agouza, Giza', ar: 'محور ٢٦ يوليو، العجوزة، الجيزة' },
      phone: '+20 121 233 3311',
      hours: { en: 'Daily · 1 PM – 2 AM', ar: 'يوميًا · من ١ ظهرًا إلى ٢ صباحًا' },
      mapsUrl: 'https://maps.google.com/?q=Seagull+Dokki+Cairo'
    },
    'new-cairo': {
      name: { en: 'New Cairo', ar: 'القاهرة الجديدة' },
      tag: { en: 'Tagamoa · East Cairo', ar: 'التجمع · شرق القاهرة' },
      region: { en: 'Cairo · Fifth Settlement', ar: 'القاهرة · التجمع الخامس' },
      address: { en: '90th Street, Fifth Settlement, New Cairo', ar: 'التسعين، التجمع الخامس، القاهرة الجديدة' },
      phone: '+20 121 233 3311',
      hours: { en: 'Daily · 1 PM – 1 AM', ar: 'يوميًا · من ١ ظهرًا إلى ١ صباحًا' },
      mapsUrl: 'https://maps.google.com/?q=Seagull+New+Cairo+Tagamoa'
    },
    'gleem': {
      name: { en: 'Gleem', ar: 'جليم' },
      tag: { en: 'Alexandria · Seaside', ar: 'الإسكندرية · على البحر' },
      region: { en: 'Alexandria · Gleem Bay', ar: 'الإسكندرية · خليج جليم' },
      address: { en: 'Gleem, Alexandria', ar: 'جليم، الإسكندرية' },
      phone: '+20 121 233 3311',
      hours: { en: 'Daily · 12 PM – 1 AM', ar: 'يوميًا · من ١٢ ظهرًا إلى ١ صباحًا' },
      mapsUrl: 'https://maps.google.com/?q=Seagull+Gleem+Alexandria'
    },
    'madinaty': {
      name: { en: 'Madinaty', ar: 'مدينتي' },
      tag: { en: 'All Seasons Mall', ar: 'مول أول سيزونز' },
      region: { en: 'Cairo · Madinaty', ar: 'القاهرة · مدينتي' },
      address: { en: 'All Seasons Mall, Madinaty', ar: 'مول أول سيزونز، مدينتي' },
      phone: '+20 121 233 3311',
      hours: { en: 'Daily · 1 PM – 1 AM', ar: 'يوميًا · من ١ ظهرًا إلى ١ صباحًا' },
      mapsUrl: 'https://maps.google.com/?q=Seagull+Madinaty+Cairo'
    },
    'sheikh-zayed': {
      name: { en: 'Sheikh Zayed', ar: 'الشيخ زايد' },
      tag: { en: 'Centrada Mall · Newest House', ar: 'سنترادا مول · أحدث البيوت' },
      region: { en: 'Giza · West Cairo', ar: 'الجيزة · غرب القاهرة' },
      address: { en: 'Centrada Mall, Sheikh Zayed', ar: 'سنترادا مول، الشيخ زايد' },
      phone: '+20 121 233 3311',
      hours: { en: 'Daily · 1 PM – 1 AM', ar: 'يوميًا · من ١ ظهرًا إلى ١ صباحًا' },
      mapsUrl: 'https://maps.google.com/?q=Seagull+Sheikh+Zayed+Centrada'
    }
  };

  function renderBranchDetail(branchId) {
    const panel = document.getElementById('map-detail');
    if (!panel) return;
    const data = BRANCH_MAP_DATA[branchId];
    if (!data) return;

    panel.setAttribute('data-state', 'filled');
    panel.innerHTML = `
      <div class="detail-tag">
        <span class="en">${data.tag.en}</span>
        <span class="ar">${data.tag.ar}</span>
      </div>
      <h3>
        <span class="en"><em>${data.name.en}</em></span>
        <span class="ar"><em>${data.name.ar}</em></span>
      </h3>
      <div class="detail-region">
        <span class="en">${data.region.en}</span>
        <span class="ar">${data.region.ar}</span>
      </div>
      <dl class="detail-meta">
        <div class="detail-meta-row">
          <dt><span class="en">Address</span><span class="ar">العنوان</span></dt>
          <dd>
            <span class="en">${data.address.en}</span>
            <span class="ar">${data.address.ar}</span>
          </dd>
        </div>
        <div class="detail-meta-row">
          <dt><span class="en">Phone</span><span class="ar">الهاتف</span></dt>
          <dd><a href="tel:${data.phone.replace(/\s/g, '')}" dir="ltr">${data.phone}</a></dd>
        </div>
        <div class="detail-meta-row">
          <dt><span class="en">Hours</span><span class="ar">المواعيد</span></dt>
          <dd>
            <span class="en">${data.hours.en}</span>
            <span class="ar">${data.hours.ar}</span>
          </dd>
        </div>
      </dl>
      <div class="detail-actions">
        <a href="${data.mapsUrl}" target="_blank" rel="noopener" class="detail-btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span class="en">Directions</span>
          <span class="ar">الاتجاهات</span>
        </a>
        <button onclick="openModal('reserve-modal')" class="detail-btn-ghost">
          <span class="en">Reserve Here</span>
          <span class="ar">احجز هنا</span>
        </button>
      </div>
    `;

    // Re-apply language visibility to the new HTML
    const currentLang = document.documentElement.lang || 'en';
    panel.querySelectorAll('.en').forEach(el => {
      el.style.display = currentLang === 'en' ? '' : 'none';
    });
    panel.querySelectorAll('.ar').forEach(el => {
      el.style.display = currentLang === 'ar' ? '' : 'none';
    });
  }

  function initEgyptMap() {
    const pins = document.querySelectorAll('.egypt-map-svg .pin');
    if (!pins.length) return;

    pins.forEach(pin => {
      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        // Remove active class from all pins
        pins.forEach(p => p.classList.remove('active'));
        // Add active to this one
        pin.classList.add('active');
        // Update detail panel
        const branchId = pin.getAttribute('data-branch');
        renderBranchDetail(branchId);

        // Smooth scroll to bring the detail panel into view on mobile
        if (window.innerWidth < 760) {
          setTimeout(() => {
            const panel = document.querySelector('.map-detail-panel');
            if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }
      });

      // Keyboard accessibility
      pin.setAttribute('role', 'button');
      pin.setAttribute('tabindex', '0');
      pin.setAttribute('aria-label', pin.querySelector('.pin-label')?.textContent || 'Branch pin');
      pin.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          pin.click();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEgyptMap);
  } else {
    initEgyptMap();
  }

  function toggleLang() {
    const html = document.documentElement;
    const newLang = html.lang === "ar" ? "en" : "ar";
    
    html.lang = newLang;
    html.dir = newLang === "ar" ? "rtl" : "ltr";
    
    // Update all select options with data-en/data-ar attributes
    document.querySelectorAll("option[data-en], option[data-ar]").forEach(opt => {
        const text = opt.getAttribute("data-" + newLang);
        if (text) opt.textContent = text;
    });

    // Save preference
    try {
      // Note: memory only, does not persist across sessions in this demo
      window.__seagullLang = html.lang;
    } catch(e) {}
  }
  // ─── MENU DATA ──────────────────────────────────────────────
  // Five unique menus; Marina shares Dokki's menu; Madinaty shares Tagamoa's.
  const MENU_DATA = {

    // ══════════ EL MAX (The Original, 1985) ══════════
    elMax: [
      { name: { en: 'Soups', ar: 'الشوربة' }, items: [
        { en: 'Seafood Soup', ar: 'شوربة سي فود', desc: { en: 'Shrimp and calamari in a creamy seafood broth.', ar: 'جمبري وسبيط في شوربة بحرية بالكريمة.' } },
        { en: 'Shrimp Soup', ar: 'شوربة جمبري', desc: { en: 'Peeled shrimp simmered in a red seafood broth.', ar: 'جمبري مقشر مع شوربة جمبري حمراء.' } }
      ]},
      { name: { en: 'Salads & Couvert', ar: 'السلطات والمقبلات' }, items: [
        { en: 'Couvert (per person)', ar: 'كوفير للفرد', desc: { en: 'Our house selection of mezze-style salads.', ar: 'تشكيلة البيت من السلطات المتنوعة.' } },
        { en: 'Seagull Salads', ar: 'سلطات متنوعة' },
        { en: 'French Fries', ar: 'بطاطس مقلية' }
      ]},
      { name: { en: 'Side Dishes', ar: 'أطباق جانبية' }, items: [
        { en: 'Herring', ar: 'رنجة', desc: { en: 'Smoked herring tossed with tahini, onions, and colourful peppers.', ar: 'رنجة مدخنة مع طحينة وبصل وفلفل ألوان.' } },
        { en: 'Salt Fish (Feseekh)', ar: 'فسيخ' },
        { en: 'Sardines', ar: 'سردين' },
        { en: 'Fried Baby Fish', ar: 'بسارية مقلية' },
        { en: 'Shrimp Molokhia', ar: 'ملوخية بالجمبري' },
        { en: 'Seafood Kofta', ar: 'كفتة سي فود', desc: { en: 'Calamari and shrimp minced with onions, fresh herbs, and ground rice — fried, grilled, or in red sauce.', ar: 'خليط من السبيط والجمبري مع البصل والخضرة والأرز المطحون — مقلي، مشوي، أو بصوص أحمر.' } },
        { en: 'Stuffed Calamari', ar: 'كالماري محشي' },
        { en: 'Calamari (per kilo)', ar: 'كاليماري بالكيلو' },
        { en: 'Squid, Fried or Grilled', ar: 'سبيط مقلي أو مشوي' },
        { en: 'Squid Casserole', ar: 'طاجن سبيط', desc: { en: 'Calamari cooked in your choice of white or red sauce.', ar: 'سبيط مطهو مع اختيارك من الصوص الأبيض أو الأحمر.' } },
        { en: 'Squid Fajita', ar: 'سبيط فاهيتا', desc: { en: 'Tender calamari sautéed with onions, colourful peppers, and our signature spice blend.', ar: 'سبيط فريش متشوح مع البصل والفلفل الألوان وتوابل سي جل المميزة.' } },
        { en: 'Squid by the Kilo', ar: 'سبيط بالكيلو' },
        { en: 'Shrimp Casserole', ar: 'طاجن جمبري', desc: { en: 'Fresh shrimp with onions, peppers, and creamy white sauce, served in a clay tagen.', ar: 'جمبري طازج مع البصل والفلفل الألوان في صوص أبيض كريمي، يُقدَّم في طاجن.' } },
        { en: 'Seafood Casserole', ar: 'طاجن سي فود', signature: true, desc: { en: 'A generous mix of calamari, shrimp, roe, and squid eggs with onions and peppers — your choice of white sauce, red sauce, or fajita-style. (Small or Large)', ar: 'خليط غني من السبيط والجمبري والبطارخ وبيض السبيط مع البصل والفلفل الألوان — باختيارك: صوص أبيض، أحمر، أو فاهيتا. (صغير أو كبير)' } }
      ]},
      { name: { en: 'Main Dishes', ar: 'أطباق رئيسية' }, items: [
        { en: 'Grilled Octopus', ar: 'اخطبوط مشوي' },
        { en: 'Squid Eggs', ar: 'بيض سبيط', desc: { en: 'Prepared in tagen, grilled, or fried.', ar: 'يُقدَّم بالطاجن، مشوي، أو مقلي.' } },
        { en: 'Grilled Chicken Meal', ar: 'وجبة فراخ مشوية', desc: { en: 'Half-chicken grilled, served with white rice and french fries.', ar: 'نصف دجاجة مشوية مع الأرز الأبيض والبطاطس المقلية.' } }
      ]},
      { name: { en: 'Fresh Fish (Market Selection)', ar: 'أسماك (صيد اليوم)' }, items: [
        { en: 'Grey Mullet', ar: 'بوري' },
        { en: 'Keeled Mullet', ar: 'سهليه' },
        { en: 'Sea Bream', ar: 'دنيس' },
        { en: 'Sea Bass', ar: 'قاروص' },
        { en: 'Red Snapper', ar: 'مرجان' },
        { en: 'Blue Fish', ar: 'مياس' },
        { en: 'Red Mullet', ar: 'بربون' },
        { en: 'Sole Fish', ar: 'موسى' },
        { en: 'Grouper', ar: 'وقار' },
        { en: '111 Grouper', ar: 'وقار ١١١' },
        { en: 'Grouper Steak', ar: 'وقار ترنشات' },
        { en: 'Salmon', ar: 'سالمون' },
        { en: 'Lout Fish Steak', ar: 'لوط ترنشات' },
        { en: 'Fillet', ar: 'فيليه' },
        { en: 'Eel Fish', ar: 'سمك ثعبان' },
        { en: 'Fresh Roe (Botarga)', ar: 'بطارخ فريش' },
        { en: 'Crab', ar: 'كابوريا' },
        { en: 'Boneless Crab', ar: 'كابوريا مخليه' },
        { en: 'Mussels', ar: 'بلح بحر' },
        { en: 'Clams (Gondofli)', ar: 'جندوفلي' },
        { en: 'Lobster Baladi', ar: 'استاكوزا بلدي' }
      ]},
      { name: { en: 'Shrimp', ar: 'جمبري' }, note: { en: 'Market price — prepared your way. Ask about butterfly preparation.', ar: 'السعر حسب اليوم — تُحضَّر بالطريقة التي تختارها. اسأل عن تسوية البترفلاي.' }, items: [
        { en: 'Medium Shrimps', ar: 'جمبري وسط' },
        { en: 'Large Shrimps', ar: 'جمبري كبير' },
        { en: 'Super Shrimps', ar: 'جمبري سوبر' },
        { en: 'Jumbo Shrimps', ar: 'جمبري جامبو' },
        { en: 'Kazaz Medium Shrimps', ar: 'جمبري وسط قزاز' },
        { en: 'Kazaz Large Shrimps', ar: 'جمبري كبير قزاز' },
        { en: 'Kazaz Super Shrimps', ar: 'جمبري سوبر قزاز' },
        { en: 'Kazaz Jumbo Shrimps', ar: 'جمبري جامبو قزاز' }
      ]},
      { name: { en: 'Rice', ar: 'أرز' }, items: [
        { en: 'Seagull Rice', ar: 'أرز سي جل', signature: true, desc: { en: 'Sayadeya rice topped with a mix of the day\'s seafood — serves 4–5.', ar: 'أرز صيادية يُقدَّم مع ميكس سي فود — يكفي من ٤ إلى ٥ أشخاص.' } },
        { en: 'Shrimp Rice', ar: 'أرز بالجمبري', desc: { en: 'Sayadeya rice with fresh shrimp.', ar: 'أرز صيادية مع جمبري فريش.' } },
        { en: 'Seafood Rice', ar: 'أرز سي فود', desc: { en: 'Sayadeya rice with shrimp and calamari.', ar: 'أرز صيادية مع جمبري وسبيط.' } },
        { en: 'Sayadeya Rice', ar: 'أرز صيادية' }
      ]},
      { name: { en: 'Pasta', ar: 'مكرونة' }, items: [
        { en: 'Plain Pasta', ar: 'مكرونة سادة' },
        { en: 'Shrimp Pasta', ar: 'مكرونة بالجمبري', desc: { en: 'With fresh shrimp, in white or red sauce.', ar: 'مع جمبري فريش بصوص أبيض أو أحمر.' } },
        { en: 'Seafood Pasta', ar: 'مكرونة سي فود', desc: { en: 'Al dente pasta with shrimp and calamari, in spicy red or white sauce.', ar: 'مكرونة مسلوقة بصوص أحمر أو أبيض مع جمبري وسبيط.' } }
      ]},
      { name: { en: 'Shisha — Fakher', ar: 'شيشة فاخر' }, items: [
        { en: 'Apple', ar: 'تفاح' },
        { en: 'Peach', ar: 'خوخ' },
        { en: 'Grape', ar: 'عنب' },
        { en: 'Watermelon', ar: 'بطيخ' },
        { en: 'Gum', ar: 'علكة' },
        { en: 'Mint', ar: 'نعناع' },
        { en: 'Blueberry', ar: 'بلوبيري' },
        { en: 'Orange', ar: 'برتقال' },
        { en: 'Guava', ar: 'جوافة' },
        { en: 'Cola', ar: 'كولا' }
      ]},
      { name: { en: 'Shisha — Mix Fakher', ar: 'شيشة ميكس فاخر' }, items: [
        { en: 'Grape & Berry', ar: 'عنب توت' },
        { en: 'Lemon Mint', ar: 'ليمون نعناع' },
        { en: 'Gum Watermelon', ar: 'علكة بطيخ' },
        { en: 'Love 66', ar: 'لاف ٦٦' },
        
        { en: 'Candy Drops', ar: 'كاندي دروبس' },
        { en: 'Strawberry Cream', ar: 'فراولة قشطة' },
        { en: 'Gum Mint', ar: 'علكة نعناع' },
        { en: 'Cola Lemon', ar: 'كولا ليمون' },
        { en: 'Mango Kiwi', ar: 'مانجو كيوي' },
        { en: 'Mesquite Gum', ar: 'علكة مستكة' },
        { en: 'Cinnamon Gum', ar: 'علكة قرفة' }
      ]},
      { name: { en: 'Maassel', ar: 'المعسل' }, items: [
        { en: 'Saloum', ar: 'معسل سلوم' },
        { en: 'Qas', ar: 'معسل قص' },
        { en: 'Disposable Hose', ar: 'لي طبي' }
      ]}
    ],

    // ══════════ DOKKI (also used by MARINA) ══════════
    dokki: [
      { name: { en: 'Soups', ar: 'الشوربة' }, items: [
        { en: 'Seafood Soup', ar: 'شوربة سي فود', desc: { en: 'Shrimp and calamari in a creamy seafood broth. (Small or Large)', ar: 'جمبري وسبيط في شوربة بحرية بالكريمة. (صغير أو كبير)' } },
        { en: 'Shrimp Soup', ar: 'شوربة جمبري', desc: { en: 'Peeled shrimp simmered in a red seafood broth.', ar: 'جمبري مقشر مع شوربة جمبري حمراء.' } },
        { en: 'Plain Broth', ar: 'شوربة مياه فقط' }
      ]},
      { name: { en: 'Salads & Bread', ar: 'السلطات والخبز' }, items: [
        { en: 'Couvert (per person)', ar: 'كوفير للفرد' },
        { en: 'Bread Basket', ar: 'باسكيت عيش' },
        { en: 'Salad Box', ar: 'علبة سلطة' },
        { en: 'Green Salad', ar: 'سلطة خضراء' },
        { en: 'Salad Plate', ar: 'طبق سلطة' },
        { en: 'Salad Plate for Two', ar: 'طبق سلطات للفرد (٢)' }
      ]},
      { name: { en: 'Side Dishes', ar: 'أطباق جانبية' }, items: [
        { en: 'Herring', ar: 'رنجة', desc: { en: 'Smoked herring tossed with tahini, onions, and colourful peppers.', ar: 'رنجة مدخنة مع طحينة وبصل وفلفل ألوان.' } },
        { en: 'Calamari (5 pieces)', ar: '٥ قطع سبيط' },
        { en: 'Squid Eggs', ar: 'بيض سبيط' },
        { en: 'Estredia (Oysters)', ar: 'استرديا' },
        { en: 'Seafood Kofta', ar: 'كفتة سي فود', desc: { en: 'Minced calamari and shrimp with onions, fresh herbs, and ground rice.', ar: 'خليط من السبيط والجمبري مع البصل والخضرة والأرز المطحون.' } },
        { en: 'Molokhia', ar: 'ملوخية سادة' },
        { en: 'Shrimp Molokhia', ar: 'ملوخية بالجمبري' },
        { en: 'French Fries', ar: 'بطاطس مقلية' }
      ]},
      { name: { en: 'Fresh Fish (Market Selection)', ar: 'أسماك (صيد اليوم)' }, items: [
        { en: 'Grey Mullet', ar: 'بوري' },
        { en: 'Keeled Mullet', ar: 'سهليه' },
        { en: 'Sea Bream', ar: 'دنيس' },
        { en: 'Sea Bass', ar: 'قاروص' },
        { en: 'Red Snapper', ar: 'مرجان' },
        { en: 'Blue Fish', ar: 'مياس' },
        { en: 'Red Mullet', ar: 'بربون' },
        { en: 'Sole Fish', ar: 'موسى' },
        { en: 'Grouper', ar: 'وقار' },
        { en: '111 Grouper', ar: 'وقار ١١١' },
        { en: 'Grouper Steak', ar: 'وقار ترنشات' },
        { en: 'Greasy Grouper (Hammour)', ar: 'هامور كش' },
        { en: 'Lout Fish', ar: 'سمك لوط' },
        { en: 'Lout Steak', ar: 'لوط ترنشات' },
        { en: 'Emperor', ar: 'شعور' },
        { en: 'Nagel', ar: 'ناجل' },
        { en: 'King Fish', ar: 'دراك' },
        { en: 'Salmon', ar: 'سالمون' },
        { en: 'Sardines', ar: 'سردين' },
        { en: 'Eel Fish', ar: 'سمك ثعبان' },
        { en: 'Fresh Roe (Botarga)', ar: 'بطارخ فريش' },
        { en: 'Fillet', ar: 'فيليه' },
        { en: 'Fried Baby Fish', ar: 'بسارية' },
        { en: 'Crab', ar: 'كابوريا' },
        { en: 'Boneless Crab', ar: 'كابوريا مخليه' },
        { en: 'Mussels', ar: 'بلح بحر' },
        { en: 'Local Mussels', ar: 'بلح بحر بلدي' },
        { en: 'Clams (Gondofli)', ar: 'جندوفلي' },
        { en: 'Calamari', ar: 'كاليماري' },
        { en: 'Fried Squid', ar: 'سبيط مقلي' },
        { en: 'Squid Casserole', ar: 'سبيط طاجن' },
        { en: 'Seafood Mix', ar: 'مكس سي فود' },
        { en: 'Lobster', ar: 'استاكوزا' }
      ]},
      { name: { en: 'Shrimp', ar: 'جمبري' }, note: { en: 'Market price — prepared your way. Ask about butterfly preparation.', ar: 'السعر حسب اليوم — تُحضَّر بالطريقة التي تختارها. اسأل عن تسوية البترفلاي.' }, items: [
        { en: 'Medium Shrimps', ar: 'جمبري وسط' },
        { en: 'Large Shrimps', ar: 'جمبري كبير' },
        { en: 'Meat Shrimps', ar: 'جمبري لحم' },
        { en: 'Super Shrimps', ar: 'جمبري سوبر' },
        { en: 'Kazaz Medium Shrimps', ar: 'جمبري وسط قزاز' },
        { en: 'Kazaz Large Shrimps', ar: 'جمبري كبير قزاز' },
        { en: 'Kazaz Super Shrimps', ar: 'جمبري سوبر قزاز' },
        { en: 'Kazaz Jumbo Shrimps', ar: 'جمبري جامبو قزاز' }
      ]},
      { name: { en: 'Rice', ar: 'أرز' }, items: [
        { en: 'Seagull Rice', ar: 'أرز سي جل', signature: true, desc: { en: 'Sayadeya rice topped with a mix of the day\'s seafood — serves 4–5.', ar: 'أرز صيادية يُقدَّم مع ميكس سي فود — يكفي من ٤ إلى ٥ أشخاص.' } },
        { en: 'Pineapple Rice', ar: 'أرز أناناس', desc: { en: 'Basmati rice with shrimp, calamari, bell peppers, and fresh pineapple.', ar: 'أرز بسمتي مع جمبري وسبيط وفلفل ألوان وأناناس فريش.' } },
        { en: 'Shrimp Rice', ar: 'أرز بالجمبري', desc: { en: 'Sayadeya rice with fresh shrimp.', ar: 'أرز صيادية مع جمبري فريش.' } },
        { en: 'Seafood Rice', ar: 'أرز سي فود', desc: { en: 'Sayadeya rice with shrimp and calamari.', ar: 'أرز صيادية مع جمبري وسبيط.' } },
        { en: 'Sayadeya Rice', ar: 'أرز صيادية' },
        { en: 'Plain Rice', ar: 'أرز سادة' }
      ]},
      { name: { en: 'Pasta', ar: 'مكرونة' }, items: [
        { en: 'Plain Pasta', ar: 'مكرونة سادة' },
        { en: 'Seafood Pasta', ar: 'مكرونة فواكه البحر', desc: { en: 'Al dente pasta with shrimp and calamari, in spicy red or white sauce.', ar: 'مكرونة مع جمبري وسبيط بصوص أحمر أو أبيض.' } }
      ]},
      { name: { en: 'Drinks', ar: 'المشروبات' }, items: [
        { en: 'Mineral Water (Small / Large)', ar: 'مياه معدنية (صغير / كبير)' },
        { en: 'Tea', ar: 'شاي' },
        { en: 'Coffee', ar: 'قهوة' },
        { en: 'Fresh Mango Juice', ar: 'عصير مانجو' },
        { en: 'Coca-Cola', ar: 'كانز كولا' },
        { en: 'Fayrouz / Birell', ar: 'فيروز / بيريل' },
        { en: 'Heineken', ar: 'هينيكين' },
        { en: 'Stella', ar: 'ستيلا' },
        { en: 'Wine (Small)', ar: 'واين صغير' },
        { en: 'Wine (Large)', ar: 'واين كبير' }
      ]},
      { name: { en: 'Shisha — Fakher', ar: 'شيشة فاخر' }, items: [
        { en: 'Apple', ar: 'تفاح' },
        { en: 'Peach', ar: 'خوخ' },
        { en: 'Grape', ar: 'عنب' },
        { en: 'Watermelon', ar: 'بطيخ' },
        { en: 'Gum', ar: 'علكة' },
        { en: 'Mint', ar: 'نعناع' },
        { en: 'Blueberry', ar: 'بلوبيري' },
        { en: 'Orange', ar: 'برتقال' },
        { en: 'Guava', ar: 'جوافة' },
        { en: 'Cola', ar: 'كولا' }
      ]},
      { name: { en: 'Shisha — Mix Fakher', ar: 'شيشة ميكس فاخر' }, items: [
        { en: 'Grape & Berry', ar: 'عنب توت' },
        { en: 'Lemon Mint', ar: 'ليمون نعناع' },
        { en: 'Gum Watermelon', ar: 'علكة بطيخ' },
        { en: 'Love 66', ar: 'لاف ٦٦' },
        
        { en: 'Candy Drops', ar: 'كاندي دروبس' },
        { en: 'Strawberry Cream', ar: 'فراولة قشطة' },
        { en: 'Gum Mint', ar: 'علكة نعناع' },
        { en: 'Cola Lemon', ar: 'كولا ليمون' },
        { en: 'Mango Kiwi', ar: 'مانجو كيوي' },
        { en: 'Mesquite Gum', ar: 'علكة مستكة' },
        { en: 'Cinnamon Gum', ar: 'علكة قرفة' }
      ]},
      { name: { en: 'Maassel', ar: 'المعسل' }, items: [
        { en: 'Saloum', ar: 'معسل سلوم' },
        { en: 'Qas', ar: 'معسل قص' },
        { en: 'Disposable Hose', ar: 'لي طبي' }
      ]}
    ],

    // ══════════ TAGAMOA (used by NEW CAIRO & MADINATY) ══════════
    tagamoa: [
      { name: { en: 'Soups', ar: 'الشوربة' }, items: [
        { en: 'Seafood Soup', ar: 'شوربة سي فود', desc: { en: 'Shrimp and calamari in a creamy seafood broth. (Small or Large)', ar: 'جمبري وسبيط في شوربة بحرية بالكريمة. (صغير أو كبير)' } },
        { en: 'Shrimp Soup', ar: 'شوربة جمبري', desc: { en: 'Peeled shrimp simmered in a red seafood broth.', ar: 'جمبري مقشر مع شوربة جمبري حمراء.' } },
        { en: 'Shrimp & Roe Soup', ar: 'شوربة جمبري بطارخ', desc: { en: 'Peeled shrimp and fresh roe in a red seafood broth.', ar: 'جمبري مقشر مع بطارخ فريش في شوربة حمراء.' } },
        { en: 'Seagull Soup', ar: 'شوربة سي جل', signature: true, desc: { en: 'Shrimp, calamari, roe, and cuttlefish eggs in a creamy broth.', ar: 'جمبري، سبيط، بطارخ، وبيض سبيط في شوربة كريمية.' } }
      ]},
      { name: { en: 'Salads', ar: 'السلطات' }, items: [
        { en: 'Green Salad', ar: 'سلطة خضراء' },
        { en: 'Greek Salad', ar: 'سلطة يوناني' },
        { en: 'California Salad', ar: 'كاليفورنيا سالاد', desc: { en: 'French lettuce with avocado cubes, sweet corn, cherry tomatoes, and fresh shrimp.', ar: 'قطع الخس الفرنساوي مع الأفوكادو، السويت كورن، الشيري توماتو، والجمبري الطازج.' } },
        { en: 'Seafood Salad', ar: 'سلطة سي فود', desc: { en: 'Shrimp and calamari with bell peppers, orange, shredded carrots, and crispy lettuce.', ar: 'جمبري وسبيط مع فلفل ألوان، برتقال، جزر مبشور، وخس كابوتشا.' } },
        { en: 'Herring Salad', ar: 'سلطة رنجة' },
        { en: 'Grilled Herring', ar: 'رنجة مشوية' },
        { en: 'Caviar (House)', ar: 'كافيار', desc: { en: 'Fresh fish roe blended with creamy mayonnaise and a hint of beetroot water.', ar: 'بطارخ فريش ممزوجة مع مايونيز وماء البنجر.' } },
        { en: 'Tahini', ar: 'طحينة' },
        { en: 'Garlic Sauce', ar: 'ثومية' },
        { en: 'Spicy Sauce', ar: 'سبايسي صوص' },
        { en: 'Baba Ghanoush', ar: 'بابا غنوج' },
        { en: 'Grilled Eggplant', ar: 'باذنجان مشوي' },
        { en: 'Pickled Eggplant', ar: 'باذنجان مخلل' },
        { en: 'Pickled Tomatoes', ar: 'طماطم متبلة' },
        { en: 'Pickled Potatoes', ar: 'بطاطس مخلل' },
        { en: 'Old Cheese', ar: 'جبنة قديمة' },
        { en: 'Beetroot', ar: 'بنجر' }
      ]},
      { name: { en: 'Shrimp Specialties', ar: 'تخصصات الجمبري' }, items: [
        { en: 'Garlic Shrimp Bowl', ar: 'طاسة جمبري بالثوم', desc: { en: 'Pan-seared shrimp with fresh garlic and coriander.', ar: 'جمبري متشوح في طاسة مع ثوم فريش وكزبرة خضراء.' } },
        { en: 'Avocado Shrimp', ar: 'أفوكادو بالجمبري', desc: { en: 'Shrimp with avocado, lettuce, orange, bell peppers, cucumber, and vinaigrette.', ar: 'جمبري مع أفوكادو، خس، برتقال، فلفل ألوان، وخيار، مع صوص الخل.' } },
        { en: 'Shrimp Dynamite', ar: 'ديناميت جمبري', desc: { en: 'Crispy fried shrimp served over arugula with dynamite sauce.', ar: 'جمبري مقلي مع جرجير وصوص دايناميت.' } },
        { en: 'Shrimp Cocktail', ar: 'كوكتيل جمبري', desc: { en: 'Chilled boiled shrimp with house cocktail sauce.', ar: 'جمبري مسلوق بارد مع صوص كوكتيل مخصوص.' } },
        { en: 'Shrimp Kofta', ar: 'كفتة جمبري', desc: { en: 'Minced shrimp with onions, mixed vegetables, Japanese breadcrumbs, and ground rice.', ar: 'جمبري مفروم مع بصل وخضار مشكل، بقسماط ياباني، وأرز مطحون.' } },
        { en: 'Shrimp Casserole, White Sauce', ar: 'طاجن جمبري أبيض', desc: { en: 'Shrimp baked in creamy white sauce with bell peppers, dill, and mozzarella.', ar: 'جمبري لحم في طاجن كريمي مع صوص أبيض، فلفل ألوان، شبت، وجبنة موتزاريلا.' } }
      ]},
      { name: { en: 'Side Dishes & Platters', ar: 'أطباق جانبية وأطباق مشكّلة' }, items: [
        { en: 'Mixed Platter', ar: 'طبق مشكل', signature: true, desc: { en: 'Shrimp, calamari, shrimp kofta, and fillet, all on one plate.', ar: 'جمبري، سبيط، كفتة جمبري، وفيليه — على طبق واحد.' } },
        { en: 'Seafood Casserole', ar: 'طاجن سي فود', desc: { en: 'Calamari, shrimp, roe, and squid eggs in a tagen — white sauce, red sauce, or fajita-style. (Small or Large)', ar: 'سبيط، جمبري، بطارخ، وبيض سبيط في طاجن — صوص أبيض، أحمر، أو فاهيتا. (صغير أو كبير)' } },
        { en: 'Molokhia', ar: 'ملوخية سادة' },
        { en: 'Shrimp Molokhia', ar: 'ملوخية بالجمبري' },
        { en: 'Salted Fish (Feseekh)', ar: 'فسيخ' },
        { en: 'French Fries', ar: 'بطاطس مقلية' }
      ]},
      { name: { en: 'From the Sea (à la Carte)', ar: 'من البحر (قطع مستقلة)' }, items: [
        { en: 'Calamari', ar: 'كاليماري', desc: { en: 'Cooked in your choice of white or red sauce.', ar: 'مطهو باختيارك من الصوص الأبيض أو الأحمر.' } },
        { en: 'Fried Squid', ar: 'برسيون سبيط مقلي' },
        { en: 'Squid Casserole', ar: 'سبيط طاجن' },
        { en: 'Squid Eggs', ar: 'بيض سبيط' },
        { en: 'Sepia (by the kilo)', ar: 'سيبيا بالكيلو' },
        { en: 'Grilled Octopus', ar: 'اخطبوط مشوي' },
        { en: 'Crab', ar: 'كابوريا' },
        { en: 'Boneless Crab', ar: 'كابوريا مخلية' },
        { en: 'Mussels', ar: 'بلح البحر' },
        { en: 'Clams (Local)', ar: 'جندوفلي بلدي' },
        { en: 'Oysters', ar: 'محار' },
        { en: 'Estredia', ar: 'ايستريديا' },
        { en: 'Fresh Roe (Botarga)', ar: 'بطارخ فريش' },
        { en: 'Fried Baby Fish', ar: 'بسارية' },
        { en: 'Lobster', ar: 'استاكوزا' }
      ]},
      { name: { en: 'Fresh Fish (Market Selection)', ar: 'أسماك (صيد اليوم)' }, items: [
        { en: 'Grey Mullet', ar: 'بوري' },
        { en: 'Grey Mullet Super', ar: 'بوري سوبر' },
        { en: 'Keeled Mullet', ar: 'سهليه' },
        { en: 'Sea Bream', ar: 'دنيس' },
        { en: 'Sea Bass', ar: 'قاروص' },
        { en: 'Red Snapper', ar: 'مرجان' },
        { en: 'Blue Fish', ar: 'مياس' },
        { en: 'Red Mullet', ar: 'بربون' },
        { en: 'Sole Fish', ar: 'موسى' },
        { en: 'Grouper', ar: 'وقار' },
        { en: 'Grouper 111', ar: 'وقار ١١١' },
        { en: 'Lout Fish', ar: 'سمك لوط' },
        { en: 'Lout Steak', ar: 'لوط ترنشات' },
        { en: 'King Fish', ar: 'دراك' },
        { en: 'King Fish Steak', ar: 'ترنشات دراك' },
        { en: 'Emperor', ar: 'شعور' },
        { en: 'Nagel', ar: 'ناجل' },
        { en: 'Eel', ar: 'ثعبان' },
        { en: 'Sardines', ar: 'سردين' },
        { en: 'Salmon', ar: 'سالمون' },
        { en: 'Fillet', ar: 'فيليه' },
        { en: 'Fresh Roe (Botarga)', ar: 'بطارخ فريش' }
      ]},
      { name: { en: 'Shrimp', ar: 'جمبري' }, note: { en: 'Market price — prepared your way. Ask about butterfly preparation.', ar: 'السعر حسب اليوم — تُحضَّر بالطريقة التي تختارها. اسأل عن تسوية البترفلاي.' }, items: [
        { en: 'Peeled Shrimps', ar: 'جمبري مقشر' },
        { en: 'Medium Shrimps', ar: 'جمبري وسط' },
        { en: 'Large Shrimps', ar: 'جمبري كبير' },
        { en: 'Super Shrimps', ar: 'جمبري سوبر' },
        { en: 'Jumbo Shrimps', ar: 'جمبري جامبو' },
        { en: 'Super Jumbo Shrimps', ar: 'جمبري سوبر جامبو' }
      ]},
      { name: { en: 'Rice', ar: 'أرز' }, items: [
        { en: 'Seagull Rice', ar: 'أرز سي جل', signature: true, desc: { en: 'Sayadeya rice with a mix of the day\'s seafood — serves 4–5.', ar: 'أرز صيادية مع ميكس سي فود — يكفي من ٤ إلى ٥ أشخاص.' } },
        { en: 'Pineapple Rice', ar: 'أرز أناناس', desc: { en: 'Basmati rice with shrimp, calamari, bell peppers, and fresh pineapple.', ar: 'أرز بسمتي مع جمبري وسبيط وفلفل ألوان وأناناس فريش.' } },
        { en: 'Shrimp Rice', ar: 'أرز بالجمبري', desc: { en: 'Sayadeya rice with fresh shrimp.', ar: 'أرز صيادية مع جمبري فريش.' } },
        { en: 'Seafood Rice', ar: 'أرز سي فود', desc: { en: 'Sayadeya rice with shrimp and calamari.', ar: 'أرز صيادية مع جمبري وسبيط.' } },
        { en: 'Sayadeya Rice', ar: 'أرز صيادية' }
      ]},
      { name: { en: 'Pasta', ar: 'مكرونة' }, items: [
        { en: 'Seagull Pasta', ar: 'مكرونة سي جل', signature: true, desc: { en: 'Creamy pasta loaded with shrimp, calamari, roe, crab meat, bell peppers, and dill.', ar: 'مكرونة بكريمة خفيفة، جمبري، سبيط، بطارخ، كابوريا، فلفل ألوان، وشبت.' } },
        { en: 'Salmon Pasta', ar: 'مكرونة بالسالمون', desc: { en: 'Creamy pasta with fresh salmon and a touch of rosemary.', ar: 'مكرونة بالكريمة وسالمون فريش متبّل بالروزماري.' } },
        { en: 'Seafood Pasta', ar: 'مكرونة سي فود', desc: { en: 'Al dente pasta with shrimp and calamari, in spicy red or white sauce.', ar: 'مكرونة مسلوقة بصوص أحمر أو أبيض مع جمبري وسبيط.' } },
        { en: 'Seafood Pesto Pasta', ar: 'مكرونة سي فود بيستو', desc: { en: 'Fresh basil pesto — basil, parmesan, pine nuts — with a rich seafood mix.', ar: 'صوص البيستو الفريش (ريحان، جبنة بارميزان، صنوبر) مع ميكس سي فود.' } },
        { en: 'Shrimp Pasta', ar: 'مكرونة بالجمبري', desc: { en: 'With fresh shrimp, in white or red sauce.', ar: 'مع جمبري فريش بصوص أبيض أو أحمر.' } },
        { en: 'Plain Pasta', ar: 'مكرونة سادة' }
      ]},
      { name: { en: 'Shisha — Fakher', ar: 'شيشة فاخر' }, items: [
        { en: 'Apple', ar: 'تفاح' },
        { en: 'Peach', ar: 'خوخ' },
        { en: 'Grape', ar: 'عنب' },
        { en: 'Watermelon', ar: 'بطيخ' },
        { en: 'Gum', ar: 'علكة' },
        { en: 'Mint', ar: 'نعناع' },
        { en: 'Blueberry', ar: 'بلوبيري' },
        { en: 'Orange', ar: 'برتقال' },
        { en: 'Guava', ar: 'جوافة' },
        { en: 'Cola', ar: 'كولا' }
      ]},
      { name: { en: 'Shisha — Mix Fakher', ar: 'شيشة ميكس فاخر' }, items: [
        { en: 'Grape & Berry', ar: 'عنب توت' },
        { en: 'Lemon Mint', ar: 'ليمون نعناع' },
        { en: 'Gum Watermelon', ar: 'علكة بطيخ' },
        { en: 'Love 66', ar: 'لاف ٦٦' },
        
        { en: 'Candy Drops', ar: 'كاندي دروبس' },
        { en: 'Strawberry Cream', ar: 'فراولة قشطة' },
        { en: 'Gum Mint', ar: 'علكة نعناع' },
        { en: 'Cola Lemon', ar: 'كولا ليمون' },
        { en: 'Mango Kiwi', ar: 'مانجو كيوي' },
        { en: 'Mesquite Gum', ar: 'علكة مستكة' },
        { en: 'Cinnamon Gum', ar: 'علكة قرفة' }
      ]},
      { name: { en: 'Maassel', ar: 'المعسل' }, items: [
        { en: 'Saloum', ar: 'معسل سلوم' },
        { en: 'Qas', ar: 'معسل قص' },
        { en: 'Disposable Hose', ar: 'لي طبي' }
      ]}
    ],

    // ══════════ GLEEM ══════════
    gleem: [
      { name: { en: 'Soups', ar: 'الشوربة' }, items: [
        { en: 'Seafood Soup', ar: 'شوربة سي فود', desc: { en: 'Shrimp and calamari in a creamy seafood broth.', ar: 'جمبري وسبيط في شوربة بحرية بالكريمة.' } },
        { en: 'Shrimp Soup', ar: 'شوربة جمبري', desc: { en: 'Peeled shrimp simmered in a red seafood broth.', ar: 'جمبري مقشر مع شوربة جمبري حمراء.' } }
      ]},
      { name: { en: 'Salads', ar: 'السلطات' }, items: [
        { en: 'Couvert (per person)', ar: 'كوفير للفرد' },
        { en: 'Green Salad', ar: 'سلطة خضراء' },
        { en: 'Caviar (House)', ar: 'كافيار', desc: { en: 'Fresh fish roe blended with creamy mayonnaise and a hint of beetroot water.', ar: 'بطارخ فريش ممزوجة مع مايونيز وماء البنجر.' } },
        { en: 'Tahini', ar: 'طحينة' },
        { en: 'Garlic Sauce', ar: 'ثومية' },
        { en: 'Spicy Sauce', ar: 'سبايسي صوص' },
        { en: 'Baba Ghanoush', ar: 'بابا غنوج' },
        { en: 'Grilled Eggplant', ar: 'باذنجان مشوي' },
        { en: 'Grilled Eggplant Salad (Raheb)', ar: 'راهب' },
        { en: 'Parsley Salad', ar: 'بقدونسية' },
        { en: 'Potato Salad', ar: 'سلطة بطاطس' },
        { en: 'Pickled Tomatoes', ar: 'طماطم متبلة' },
        { en: 'Old Cheese', ar: 'جبنة قديمة' },
        { en: 'Bissara', ar: 'بصارة' },
        { en: 'Beetroot', ar: 'بنجر' }
      ]},
      { name: { en: 'Side Dishes', ar: 'أطباق جانبية' }, items: [
        { en: 'Herring', ar: 'رنجة', desc: { en: 'Smoked herring tossed with tahini, onions, and colourful peppers.', ar: 'رنجة مدخنة مع طحينة وبصل وفلفل ألوان.' } },
        { en: 'Salt Fish (Feseekh)', ar: 'فسيخ' },
        { en: 'Seafood Kofta', ar: 'كفتة سي فود', desc: { en: 'Calamari and shrimp with onions, fresh herbs, and ground rice.', ar: 'خليط من السبيط والجمبري مع البصل والخضرة والأرز المطحون.' } },
        { en: 'Molokhia', ar: 'ملوخية سادة' },
        { en: 'Shrimp Molokhia', ar: 'ملوخية بالجمبري' },
        { en: 'Baby Fish (Bassareya)', ar: 'بساريا' },
        { en: 'French Fries', ar: 'بطاطس مقلية' },
        { en: 'Grilled Octopus', ar: 'اخطبوط مشوي' }
      ]},
      { name: { en: 'Squid & Casseroles', ar: 'السبيط والطواجن' }, items: [
        { en: 'Squid, Fried or Grilled', ar: 'سبيط مقلي أو مشوي' },
        { en: 'Squid Casserole', ar: 'سبيط طاجن', desc: { en: 'Cooked in your choice of white or red sauce.', ar: 'مطهو باختيارك من الصوص الأبيض أو الأحمر.' } },
        { en: 'Squid by the Kilo', ar: 'سبيط بالكيلو' },
        { en: 'Calamari by the Kilo', ar: 'كاليماري بالكيلو' },
        { en: 'Squid Eggs', ar: 'بيض سبيط' },
        { en: 'Seafood Casserole', ar: 'طاجن سي فود', signature: true, desc: { en: 'Calamari, shrimp, roe, and squid eggs in a tagen — white sauce, red sauce, or fajita.', ar: 'سبيط، جمبري، بطارخ، وبيض سبيط في طاجن — صوص أبيض، أحمر، أو فاهيتا.' } }
      ]},
      { name: { en: 'Fresh Fish (Market Selection)', ar: 'أسماك (صيد اليوم)' }, items: [
        { en: 'Grey Mullet', ar: 'بوري' },
        { en: 'Keeled Mullet', ar: 'سهليه' },
        { en: 'Sea Bream', ar: 'دنيس' },
        { en: 'Sea Bass', ar: 'قاروص' },
        { en: 'Red Snapper', ar: 'مرجان' },
        { en: 'Blue Fish', ar: 'مياس' },
        { en: 'Red Mullet', ar: 'بربون' },
        { en: 'Sole Fish', ar: 'موسى' },
        { en: 'Grouper', ar: 'وقار' },
        { en: '111 Grouper', ar: 'وقار ١١١' },
        { en: 'Emperor', ar: 'شعور' },
        { en: 'Nagel', ar: 'ناجل' },
        { en: 'Salmon', ar: 'سالمون' },
        { en: 'Eel Fish', ar: 'سمك ثعبان' },
        { en: 'Fresh Roe (Botarga)', ar: 'بطارخ فريش' },
        { en: 'Fillet', ar: 'فيليه' },
        { en: 'Crab', ar: 'كابوريا' },
        { en: 'Boneless Crab', ar: 'كابوريا مخليه' },
        { en: 'Mussels', ar: 'بلح بحر' },
        { en: 'Clams (Gondofli)', ar: 'جندوفلي' },
        { en: 'Estredia (per piece)', ar: 'استرديا (القطعة)' },
        { en: 'Lobster Baladi', ar: 'استاكوزا بلدي' }
      ]},
      { name: { en: 'Shrimp', ar: 'جمبري' }, note: { en: 'Market price — prepared your way. Ask about butterfly preparation.', ar: 'السعر حسب اليوم — تُحضَّر بالطريقة التي تختارها. اسأل عن تسوية البترفلاي.' }, items: [
        { en: 'Large Shrimps', ar: 'جمبري كبير' },
        { en: 'Super Shrimps', ar: 'جمبري سوبر' },
        { en: 'Kazaz Medium Shrimps', ar: 'جمبري وسط قزاز' },
        { en: 'Kazaz Large Shrimps', ar: 'جمبري كبير قزاز' },
        { en: 'Kazaz Super Shrimps', ar: 'جمبري سوبر قزاز' },
        { en: 'Kazaz Jumbo Shrimps', ar: 'جمبري جامبو قزاز' },
        { en: 'Kazaz Super Jumbo Shrimps', ar: 'جمبري سوبر جامبو قزاز' }
      ]},
      { name: { en: 'Rice', ar: 'أرز' }, items: [
        { en: 'Seagull Rice', ar: 'أرز سي جل', signature: true, desc: { en: 'Sayadeya rice with a mix of the day\'s seafood — serves 4–5.', ar: 'أرز صيادية مع ميكس سي فود — يكفي من ٤ إلى ٥ أشخاص.' } },
        { en: 'Pineapple Rice', ar: 'أرز أناناس', desc: { en: 'Basmati rice with shrimp, calamari, bell peppers, and fresh pineapple.', ar: 'أرز بسمتي مع جمبري وسبيط وفلفل ألوان وأناناس فريش.' } },
        { en: 'Shrimp Rice', ar: 'أرز بالجمبري', desc: { en: 'Sayadeya rice with fresh shrimp.', ar: 'أرز صيادية مع جمبري فريش.' } },
        { en: 'Seafood Rice', ar: 'أرز سي فود', desc: { en: 'Sayadeya rice with shrimp and calamari.', ar: 'أرز صيادية مع جمبري وسبيط.' } },
        { en: 'Plain Rice', ar: 'أرز سادة' }
      ]},
      { name: { en: 'Pasta', ar: 'مكرونة' }, items: [
        { en: 'Seagull Pasta', ar: 'مكرونة سي جل', signature: true, desc: { en: 'Creamy pasta loaded with shrimp, calamari, roe, crab meat, bell peppers, and dill.', ar: 'مكرونة بكريمة خفيفة، جمبري، سبيط، بطارخ، كابوريا، فلفل ألوان، وشبت.' } },
        { en: 'Seafood Pasta', ar: 'مكرونة سي فود', desc: { en: 'Al dente pasta with shrimp and calamari, in spicy red or white sauce.', ar: 'مكرونة مسلوقة بصوص أحمر أو أبيض مع جمبري وسبيط.' } },
        { en: 'Shrimp Pasta', ar: 'مكرونة بالجمبري', desc: { en: 'With fresh shrimp, in white or red sauce.', ar: 'مع جمبري فريش بصوص أبيض أو أحمر.' } },
        { en: 'Plain Pasta', ar: 'مكرونة سادة' }
      ]},
      { name: { en: 'Shisha — Fakher', ar: 'شيشة فاخر' }, items: [
        { en: 'Apple', ar: 'تفاح' },
        { en: 'Peach', ar: 'خوخ' },
        { en: 'Grape', ar: 'عنب' },
        { en: 'Watermelon', ar: 'بطيخ' },
        { en: 'Gum', ar: 'علكة' },
        { en: 'Mint', ar: 'نعناع' },
        { en: 'Blueberry', ar: 'بلوبيري' },
        { en: 'Orange', ar: 'برتقال' },
        { en: 'Guava', ar: 'جوافة' },
        { en: 'Cola', ar: 'كولا' }
      ]},
      { name: { en: 'Shisha — Mix Fakher', ar: 'شيشة ميكس فاخر' }, items: [
        { en: 'Grape & Berry', ar: 'عنب توت' },
        { en: 'Lemon Mint', ar: 'ليمون نعناع' },
        { en: 'Gum Watermelon', ar: 'علكة بطيخ' },
        { en: 'Love 66', ar: 'لاف ٦٦' },
        
        { en: 'Candy Drops', ar: 'كاندي دروبس' },
        { en: 'Strawberry Cream', ar: 'فراولة قشطة' },
        { en: 'Gum Mint', ar: 'علكة نعناع' },
        { en: 'Cola Lemon', ar: 'كولا ليمون' },
        { en: 'Mango Kiwi', ar: 'مانجو كيوي' },
        { en: 'Mesquite Gum', ar: 'علكة مستكة' },
        { en: 'Cinnamon Gum', ar: 'علكة قرفة' }
      ]},
      { name: { en: 'Maassel', ar: 'المعسل' }, items: [
        { en: 'Saloum', ar: 'معسل سلوم' },
        { en: 'Qas', ar: 'معسل قص' },
        { en: 'Disposable Hose', ar: 'لي طبي' }
      ]}
    ],

    // ══════════ SHEIKH ZAYED (Tagamoa base + Italian Corner + Shisha) ══════════
    sheikhZayed: [
      { name: { en: 'Soups', ar: 'الشوربة' }, items: [
        { en: 'Seafood Soup', ar: 'شوربة سي فود', desc: { en: 'Shrimp and calamari in a creamy seafood broth. (Small or Large)', ar: 'جمبري وسبيط في شوربة بحرية بالكريمة. (صغير أو كبير)' } },
        { en: 'Shrimp Soup', ar: 'شوربة جمبري', desc: { en: 'Peeled shrimp simmered in a red seafood broth.', ar: 'جمبري مقشر مع شوربة جمبري حمراء.' } },
        { en: 'Shrimp & Roe Soup', ar: 'شوربة جمبري بطارخ', desc: { en: 'Peeled shrimp and fresh roe in a red seafood broth.', ar: 'جمبري مقشر مع بطارخ فريش في شوربة حمراء.' } },
        { en: 'Seagull Soup', ar: 'شوربة سي جل', signature: true, desc: { en: 'Shrimp, calamari, roe, and cuttlefish eggs in a creamy broth.', ar: 'جمبري، سبيط، بطارخ، وبيض سبيط في شوربة كريمية.' } }
      ]},
      { name: { en: 'Salads', ar: 'السلطات' }, items: [
        { en: 'Green Salad', ar: 'سلطة خضراء' },
        { en: 'Greek Salad', ar: 'سلطة يوناني' },
        { en: 'California Salad', ar: 'كاليفورنيا سالاد', desc: { en: 'French lettuce with avocado, sweet corn, cherry tomatoes, and fresh shrimp.', ar: 'خس فرنساوي مع أفوكادو، سويت كورن، شيري توماتو، وجمبري فريش.' } },
        { en: 'Seafood Salad', ar: 'سلطة سي فود', desc: { en: 'Shrimp and calamari with bell peppers, orange, carrots, and crispy lettuce.', ar: 'جمبري وسبيط مع فلفل ألوان، برتقال، جزر، وخس مقرمش.' } },
        { en: 'Herring Salad', ar: 'سلطة رنجة' },
        { en: 'Grilled Herring', ar: 'رنجة مشوية' },
        { en: 'Caviar (House)', ar: 'كافيار', desc: { en: 'Fresh fish roe blended with creamy mayonnaise and beetroot water.', ar: 'بطارخ فريش ممزوجة مع مايونيز وماء البنجر.' } },
        { en: 'Tahini', ar: 'طحينة' },
        { en: 'Garlic Sauce', ar: 'ثومية' },
        { en: 'Spicy Sauce', ar: 'سبايسي صوص' },
        { en: 'Baba Ghanoush', ar: 'بابا غنوج' },
        { en: 'Grilled Eggplant', ar: 'باذنجان مشوي' },
        { en: 'Pickled Eggplant', ar: 'باذنجان مخلل' },
        { en: 'Pickled Tomatoes', ar: 'طماطم متبلة' },
        { en: 'Pickled Potatoes', ar: 'بطاطس مخلل' },
        { en: 'Old Cheese', ar: 'جبنة قديمة' },
        { en: 'Beetroot', ar: 'بنجر' }
      ]},
      { name: { en: 'Shrimp Specialties', ar: 'تخصصات الجمبري' }, items: [
        { en: 'Garlic Shrimp Bowl', ar: 'طاسة جمبري بالثوم', desc: { en: 'Pan-seared shrimp with fresh garlic and coriander.', ar: 'جمبري متشوح في طاسة مع ثوم فريش وكزبرة خضراء.' } },
        { en: 'Avocado Shrimp', ar: 'أفوكادو بالجمبري', desc: { en: 'Shrimp with avocado, lettuce, orange, bell peppers, cucumber, and vinaigrette.', ar: 'جمبري مع أفوكادو، خس، برتقال، فلفل ألوان، وخيار، مع صوص الخل.' } },
        { en: 'Shrimp Dynamite', ar: 'ديناميت جمبري', desc: { en: 'Crispy fried shrimp over arugula with dynamite sauce.', ar: 'جمبري مقلي مع جرجير وصوص دايناميت.' } },
        { en: 'Shrimp Cocktail', ar: 'كوكتيل جمبري', desc: { en: 'Chilled boiled shrimp with house cocktail sauce.', ar: 'جمبري مسلوق بارد مع صوص كوكتيل مخصوص.' } },
        { en: 'Shrimp Kofta', ar: 'كفتة جمبري', desc: { en: 'Minced shrimp with onions, mixed vegetables, Japanese breadcrumbs, and ground rice.', ar: 'جمبري مفروم مع بصل وخضار مشكل، بقسماط ياباني، وأرز مطحون.' } },
        { en: 'Shrimp Casserole, White Sauce', ar: 'طاجن جمبري أبيض', desc: { en: 'Shrimp baked in creamy white sauce with bell peppers, dill, and mozzarella.', ar: 'جمبري لحم في طاجن كريمي مع صوص أبيض، فلفل ألوان، شبت، وموتزاريلا.' } }
      ]},
      { name: { en: 'Side Dishes & Platters', ar: 'أطباق جانبية وأطباق مشكّلة' }, items: [
        { en: 'Mixed Platter', ar: 'طبق مشكل', signature: true, desc: { en: 'Shrimp, calamari, shrimp kofta, and fillet — one plate.', ar: 'جمبري، سبيط، كفتة جمبري، وفيليه — طبق واحد.' } },
        { en: 'Seafood Casserole', ar: 'طاجن سي فود', desc: { en: 'Calamari, shrimp, roe, and squid eggs in a tagen — white sauce, red, or fajita. (Small or Large)', ar: 'سبيط، جمبري، بطارخ، وبيض سبيط في طاجن — صوص أبيض، أحمر، أو فاهيتا. (صغير أو كبير)' } },
        { en: 'Molokhia', ar: 'ملوخية سادة' },
        { en: 'Shrimp Molokhia', ar: 'ملوخية بالجمبري' },
        { en: 'Salted Fish (Feseekh)', ar: 'فسيخ' },
        { en: 'French Fries', ar: 'بطاطس مقلية' }
      ]},
      { name: { en: 'From the Sea', ar: 'من البحر' }, items: [
        { en: 'Calamari', ar: 'كاليماري', desc: { en: 'In white or red sauce.', ar: 'بصوص أبيض أو أحمر.' } },
        { en: 'Fried Squid', ar: 'برسيون سبيط مقلي' },
        { en: 'Squid Casserole', ar: 'سبيط طاجن' },
        { en: 'Squid Eggs', ar: 'بيض سبيط' },
        { en: 'Sepia (by the kilo)', ar: 'سيبيا بالكيلو' },
        { en: 'Grilled Octopus', ar: 'اخطبوط مشوي' },
        { en: 'Crab', ar: 'كابوريا' },
        { en: 'Boneless Crab', ar: 'كابوريا مخلية' },
        { en: 'Mussels', ar: 'بلح البحر' },
        { en: 'Clams (Local)', ar: 'جندوفلي بلدي' },
        { en: 'Oysters', ar: 'محار' },
        { en: 'Estredia', ar: 'ايستريديا' },
        { en: 'Fresh Roe (Botarga)', ar: 'بطارخ فريش' },
        { en: 'Fried Baby Fish', ar: 'بسارية' },
        { en: 'Lobster', ar: 'استاكوزا' }
      ]},
      { name: { en: 'Fresh Fish (Market Selection)', ar: 'أسماك (صيد اليوم)' }, items: [
        { en: 'Grey Mullet', ar: 'بوري' },
        { en: 'Grey Mullet Super', ar: 'بوري سوبر' },
        { en: 'Keeled Mullet', ar: 'سهليه' },
        { en: 'Sea Bream', ar: 'دنيس' },
        { en: 'Sea Bass', ar: 'قاروص' },
        { en: 'Red Snapper', ar: 'مرجان' },
        { en: 'Blue Fish', ar: 'مياس' },
        { en: 'Red Mullet', ar: 'بربون' },
        { en: 'Sole Fish', ar: 'موسى' },
        { en: 'Grouper', ar: 'وقار' },
        { en: 'Grouper 111', ar: 'وقار ١١١' },
        { en: 'Lout Fish', ar: 'سمك لوط' },
        { en: 'Lout Steak', ar: 'لوط ترنشات' },
        { en: 'King Fish', ar: 'دراك' },
        { en: 'King Fish Steak', ar: 'ترنشات دراك' },
        { en: 'Emperor', ar: 'شعور' },
        { en: 'Nagel', ar: 'ناجل' },
        { en: 'Eel', ar: 'ثعبان' },
        { en: 'Sardines', ar: 'سردين' },
        { en: 'Salmon', ar: 'سالمون' },
        { en: 'Fillet', ar: 'فيليه' },
        { en: 'Fresh Roe (Botarga)', ar: 'بطارخ فريش' }
      ]},
      { name: { en: 'Shrimp', ar: 'جمبري' }, note: { en: 'Market price — prepared your way. Ask about butterfly preparation.', ar: 'السعر حسب اليوم — تُحضَّر بالطريقة التي تختارها. اسأل عن تسوية البترفلاي.' }, items: [
        { en: 'Peeled Shrimps', ar: 'جمبري مقشر' },
        { en: 'Medium Shrimps', ar: 'جمبري وسط' },
        { en: 'Large Shrimps', ar: 'جمبري كبير' },
        { en: 'Super Shrimps', ar: 'جمبري سوبر' },
        { en: 'Jumbo Shrimps', ar: 'جمبري جامبو' },
        { en: 'Super Jumbo Shrimps', ar: 'جمبري سوبر جامبو' }
      ]},
      { name: { en: 'Italian Corner — Mains', ar: 'الركن الإيطالي — أطباق رئيسية' }, items: [
        { en: 'Alexander Fish', ar: 'سمك الكسندر', desc: { en: 'Marinated fish fillet and shrimp with house seasoning, topped with parmesan, served on white rice.', ar: 'فيليه سمك وجمبري متبّل بتوابل سي جل مع صوص البارميزان والجبنة، يُقدَّم مع أرز أبيض.' } },
        { en: 'Salmon Lemon', ar: 'سالمون ليمون', desc: { en: 'Grilled salmon in lemon sauce with crispy shrimp and sautéed vegetables.', ar: 'سالمون فيليه متبّل بصوص الليمون مع جمبري مقرمش وخضار سوتيه.' } },
        { en: 'Salmon Teriyaki', ar: 'سالمون ترياكي', desc: { en: 'Grilled salmon in teriyaki sauce, served with teriyaki-style sautéed vegetables.', ar: 'سالمون فيليه بصوص الترياكي مع خضار بصوص الترياكي.' } },
        { en: 'Beef Stroganoff', ar: 'بيف استرجانوف', desc: { en: 'Tender veal strips with mushrooms, vegetables, and demi-glace sauce, on white rice.', ar: 'شرائح لحم بتلو مع مشروم وخضار وصوص الدمي-جلاس، تُقدَّم مع أرز أبيض.' } },
        { en: 'Chicken Crispy', ar: 'تشكن كرسبي', desc: { en: 'Golden-fried crispy chicken fingers with french fries.', ar: 'أصابع دجاج مقرمشة مع بطاطس مقلية.' } }
      ]},
      { name: { en: 'Italian Corner — Rice & Pasta', ar: 'الركن الإيطالي — أرز ومكرونة' }, items: [
        { en: 'Creamy Seafood', ar: 'كريمي سي فود', desc: { en: 'Seafood mix in creamy parmesan sauce, over white rice.', ar: 'ميكس سي فود بصوص البارميزان مع الأرز الأبيض.' } },
        { en: 'Truffle Risotto', ar: 'روزيتو ترافل', desc: { en: 'Creamy risotto with truffle and parmesan.', ar: 'أرز روزيتو ممزوج بالكريمة وزهرة الترافل والبارميزان.' } },
        { en: 'Truffle Pasta', ar: 'باستا ترافل', desc: { en: 'Penne in rich cream sauce with truffle and parmesan.', ar: 'مكرونة بنا مع الكريمة والترافل والبارميزان.' } },
        { en: 'Crab Pasta', ar: 'كراب باستا', desc: { en: 'Penne with crab claws, cherry tomatoes, parmesan, and fresh basil.', ar: 'مكرونة بنا مع فصوص الكابوريا، شيري توماتو، بارميزان، وريحان.' } },
        { en: 'Pasta White Dill', ar: 'باستا وايت ديل', desc: { en: 'Shell pasta in creamy dill sauce with shrimp and mussels.', ar: 'مكرونة قواقع بصوص الكريمة والشبت مع جمبري وبلح بحر.' } }
      ]},
      { name: { en: 'Italian Corner — Small Plates', ar: 'الركن الإيطالي — أطباق صغيرة' }, items: [
        { en: 'Pomme Shrimp', ar: 'بوميه شرمب', desc: { en: 'Creamy mashed-potato fingers filled with fresh Seagull shrimp.', ar: 'أصابع بطاطس بوريه محشوة بجمبري سي جل الطازج.' } },
        { en: 'Arancini Seafood', ar: 'أرانشيني سي فود', desc: { en: 'Crispy risotto balls filled with cheese mix, served with crunchy chilli sauce.', ar: 'كور أرز روزيتو مقلية محشوة بميكس الجبن، تُقدَّم مع كرانشي وصوص شيلي.' } },
        { en: 'Fondo Dip', ar: 'فوندو ديب سي فود', desc: { en: 'Creamy seafood baked with mozzarella and parmesan, served with tortilla crisps.', ar: 'ميكس سي فود بصوص البارميزان والموتزاريلا، مع شرائح خبز التورتيلا.' } },
        { en: 'Fritto Misto', ar: 'فريتو ميستو', desc: { en: 'Fried salmon, fillet, calamari, and shrimp — panko-crusted with Seagull\'s signature blend.', ar: 'قطع سالمون، فيليه، سبيط، وجمبري فريش ببقسماط ياباني وتوابل سي جل.' } },
        { en: 'Seagull Sandwich', ar: 'ساندوتش سي جل', desc: { en: 'Seafood mix and cheese in a panko-crusted tortilla, fried golden, with potato wedges.', ar: 'ميكس سي فود مع التورتيلا والجبن بالبقسماط الياباني، مع بطاطس ويدج مقرمشة.' } }
      ]},
      { name: { en: 'Rice', ar: 'أرز' }, items: [
        { en: 'Seagull Rice', ar: 'أرز سي جل', signature: true, desc: { en: 'Sayadeya rice with a mix of the day\'s seafood — serves 4–5.', ar: 'أرز صيادية مع ميكس سي فود — يكفي من ٤ إلى ٥ أشخاص.' } },
        { en: 'Pineapple Rice', ar: 'أرز أناناس' },
        { en: 'Shrimp Rice', ar: 'أرز بالجمبري' },
        { en: 'Seafood Rice', ar: 'أرز سي فود' },
        { en: 'Sayadeya Rice', ar: 'أرز صيادية' }
      ]},
      { name: { en: 'Pasta', ar: 'مكرونة' }, items: [
        { en: 'Seagull Pasta', ar: 'مكرونة سي جل', signature: true, desc: { en: 'Creamy pasta loaded with shrimp, calamari, roe, crab, bell peppers, and dill.', ar: 'مكرونة بكريمة خفيفة، جمبري، سبيط، بطارخ، كابوريا، فلفل ألوان، وشبت.' } },
        { en: 'Salmon Pasta', ar: 'مكرونة بالسالمون' },
        { en: 'Seafood Pasta', ar: 'مكرونة سي فود' },
        { en: 'Seafood Pesto Pasta', ar: 'مكرونة سي فود بيستو' },
        { en: 'Shrimp Pasta', ar: 'مكرونة بالجمبري' },
        { en: 'Plain Pasta', ar: 'مكرونة سادة' }
      ]},
      { name: { en: 'Shisha — Fakher', ar: 'شيشة فاخر' }, items: [
        { en: 'Apple', ar: 'تفاح' },
        { en: 'Peach', ar: 'خوخ' },
        { en: 'Grape', ar: 'عنب' },
        { en: 'Watermelon', ar: 'بطيخ' },
        { en: 'Gum', ar: 'علكة' },
        { en: 'Mint', ar: 'نعناع' },
        { en: 'Blueberry', ar: 'بلوبيري' },
        { en: 'Orange', ar: 'برتقال' },
        { en: 'Guava', ar: 'جوافة' },
        { en: 'Cola', ar: 'كولا' }
      ]},
      { name: { en: 'Shisha — Mix Fakher', ar: 'شيشة ميكس فاخر' }, items: [
        { en: 'Grape & Berry', ar: 'عنب توت' },
        { en: 'Lemon Mint', ar: 'ليمون نعناع' },
        { en: 'Gum Watermelon', ar: 'علكة بطيخ' },
        { en: 'Love 66', ar: 'لاف ٦٦' },
        
        { en: 'Candy Drops', ar: 'كاندي دروبس' },
        { en: 'Strawberry Cream', ar: 'فراولة قشطة' },
        { en: 'Gum Mint', ar: 'علكة نعناع' },
        { en: 'Cola Lemon', ar: 'كولا ليمون' },
        { en: 'Mango Kiwi', ar: 'مانجو كيوي' },
        { en: 'Mesquite Gum', ar: 'علكة مستكة' },
        { en: 'Cinnamon Gum', ar: 'علكة قرفة' }
      ]},
      { name: { en: 'Maassel', ar: 'المعسل' }, items: [
        { en: 'Saloum', ar: 'معسل سلوم' },
        { en: 'Qas', ar: 'معسل قص' },
        { en: 'Disposable Hose', ar: 'لي طبي' }
      ]}
    ]
  };

  // Branch-to-menu mapping
  const BRANCHES = [
    { id: 'el-max',       menu: 'elMax',       name: { en: 'El Max',       ar: 'المكس' },            sub: { en: 'The Original · Since 1985',   ar: 'الفرع الأول · منذ ١٩٨٥' } },
    { id: 'marina',       menu: 'dokki',       name: { en: 'Marina',       ar: 'مارينا' },           sub: { en: 'Seasonal · Summer Only',      ar: 'موسمي · صيفًا فقط' }, seasonal: true, note: { en: 'Marina shares the Dokki menu.', ar: 'قائمة مارينا هي نفس قائمة الدقي.' } },
    { id: 'dokki',        menu: 'dokki',       name: { en: 'Dokki',        ar: 'الدقي' },             sub: { en: 'On the Nile',                ar: 'على النيل' } },
    { id: 'new-cairo',    menu: 'tagamoa',     name: { en: 'New Cairo',    ar: 'القاهرة الجديدة' },    sub: { en: 'Tagamoa · East Cairo',        ar: 'التجمع · شرق القاهرة' } },
    { id: 'gleem',        menu: 'gleem',       name: { en: 'Gleem',        ar: 'جليم' },              sub: { en: 'Alexandria',                 ar: 'الإسكندرية' } },
    { id: 'madinaty',     menu: 'tagamoa',     name: { en: 'Madinaty',     ar: 'مدينتي' },            sub: { en: 'All Seasons Mall',           ar: 'مول أول سيزونز' } },
    { id: 'sheikh-zayed', menu: 'sheikhZayed', name: { en: 'Sheikh Zayed', ar: 'الشيخ زايد' },        sub: { en: 'Centrada Mall · Newest House', ar: 'سنترادا مول · أحدث البيوت' } }
  ];

  // ─── RENDERING ──────────────────────────────────────────────
  function renderMenuTabs() {
    const wrap = document.getElementById('menu-tabs');
    if (!wrap) return;
    wrap.innerHTML = BRANCHES.map((b, i) => `
      <button class="menu-tab ${i === 0 ? 'active' : ''}" data-branch="${b.id}" role="tab">
        <span class="en">${b.name.en}${b.seasonal ? '<span class="seasonal-dot" title="Seasonal"></span>' : ''}</span>
        <span class="ar">${b.name.ar}${b.seasonal ? '<span class="seasonal-dot"></span>' : ''}</span>
      </button>
    `).join('');
    wrap.querySelectorAll('.menu-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        wrap.querySelectorAll('.menu-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderMenuFor(btn.dataset.branch);
      });
    });
  }

  function renderMenuFor(branchId) {
    const branch = BRANCHES.find(b => b.id === branchId) || BRANCHES[0];
    const menu = MENU_DATA[branch.menu];
    const container = document.getElementById('menu-content');
    if (!container || !menu) return;

    const intro = `
      <div class="branch-intro">
        <div class="branch-sub">
          <span class="en">${branch.sub.en}</span>
          <span class="ar">${branch.sub.ar}</span>
        </div>
        <h3>
          <span class="en">Menu · <em>${branch.name.en}</em></span>
          <span class="ar">قائمة · <em>${branch.name.ar}</em></span>
        </h3>
        ${branch.note ? `
          <div class="branch-note">
            <span class="en">${branch.note.en}</span>
            <span class="ar">${branch.note.ar}</span>
          </div>
        ` : ''}
      </div>
    `;

    const categories = menu.map(cat => {
      const items = cat.items.map(item => {
        const sigBadge = item.signature ? `<span class="signature-mark"><span class="en">Signature</span><span class="ar">مميز</span></span>` : '';
        return `
          <div class="dish-item">
            <div class="dish-name">
              <span class="en">${item.en}${sigBadge}</span>
              <span class="ar">${item.ar}${sigBadge}</span>
            </div>
            <div class="dish-sub">
              <span class="en">${item.ar}</span>
              <span class="ar">${item.en}</span>
            </div>
            ${item.desc ? `
              <div class="dish-desc">
                <span class="en">${item.desc.en}</span>
                <span class="ar">${item.desc.ar}</span>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
      const noteBlock = cat.note ? `
        <div class="branch-note" style="margin-bottom: 28px; margin-top: -12px;">
          <span class="en">${cat.note.en}</span>
          <span class="ar">${cat.note.ar}</span>
        </div>
      ` : '';
      return `
        <div class="menu-category">
          <div class="category-head">
            <h4><span class="en">${cat.name.en}</span><span class="ar">${cat.name.ar}</span></h4>
            <span class="ar-cat"><span class="en">${cat.name.ar}</span><span class="ar">${cat.name.en}</span></span>
            <span class="ornament"></span>
          </div>
          ${noteBlock}
          <div class="dishes-grid">${items}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = intro + categories;
  }

  // Initialise on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderMenuTabs();
      renderMenuFor(BRANCHES[0].id);
    });
  } else {
    renderMenuTabs();
    renderMenuFor(BRANCHES[0].id);
  }

// Location Map Logic
document.addEventListener('DOMContentLoaded', () => {
    const locationDots = document.querySelectorAll('.loc-pin');
    const locationDetails = document.querySelectorAll('.loc-detail-card');
    
    if (locationDots.length > 0 && locationDetails.length > 0) {
        // Find initially active pin or default to the first one
        let initialLocId = null;
        const activePin = document.querySelector('.loc-pin.active');
        if (activePin) {
            initialLocId = activePin.getAttribute('data-loc');
        } else {
            initialLocId = locationDots[0].getAttribute('data-loc');
            locationDots[0].classList.add('active');
        }

        // Hide all except the initial one
        locationDetails.forEach(detail => {
            if (detail.id !== 'detail-' + initialLocId) {
                detail.style.display = 'none';
            } else {
                detail.style.display = 'block';
            }
        });

        // Add click event listeners
        locationDots.forEach(dot => {
            dot.addEventListener('click', function() {
                // Remove active from all dots
                locationDots.forEach(d => d.classList.remove('active'));
                // Add active to clicked
                this.classList.add('active');
                
                const locId = this.getAttribute('data-loc');
                
                // Hide all details
                locationDetails.forEach(detail => {
                    detail.style.display = 'none';
                });
                
                // Show corresponding detail
                const activeDetail = document.getElementById('detail-' + locId);
                if (activeDetail) {
                    activeDetail.style.display = 'block';
                }
            });
        });
    }
});



// ─── ACCORDION LOGIC ──────────────────────────────────────────
function initAccordion() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  if (accordionHeaders.length === 0) return;
  
  accordionHeaders.forEach(header => {
    if (header.dataset.bound) return;
    header.dataset.bound = 'true';
    
    header.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent other listeners
      const item = header.parentElement;
      const isActive = item.classList.contains('active');

      // Close all items first
      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        otherItem.classList.remove('active');
        const icon = otherItem.querySelector('.icon');
        if (icon) icon.textContent = '+';
      });

      // If it wasn't active, open it
      if (!isActive) {
        item.classList.add('active');
        const icon = item.querySelector('.icon');
        if (icon) icon.textContent = '-';
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAccordion);
} else {
  initAccordion();
}
