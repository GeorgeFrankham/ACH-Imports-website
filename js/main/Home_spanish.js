const heroTrack  = document.getElementById('heroTrack');
const heroSlides = heroTrack.children;
let currentSlide = 0;

function autoHeroScroll() {
  currentSlide = (currentSlide + 1) % heroSlides.length;
  heroTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
}

setInterval(autoHeroScroll, 5000);

// keep it aligned if the window is resized between ticks
window.addEventListener('resize', () => {
  heroCarousel.scrollLeft = currentSlide * heroCarousel.clientWidth;
});

  const header   = document.getElementById('siteHeader');
  const hero     = document.getElementById('home');
  const heroLogo = document.getElementById('heroLogo');
  const navLogo  = document.getElementById('navLogo');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateOnScroll(){
    const heroHeight = hero.offsetHeight;
    const scrollY = window.scrollY;
    const handoffDistance = heroHeight * 0.6;
    const progress = Math.min(Math.max(scrollY / handoffDistance, 0), 1);

    header.classList.toggle('is-stuck', scrollY > 8);

    if (prefersReducedMotion){
      navLogo.style.opacity = scrollY > 8 ? 1 : 0;
      heroLogo.style.opacity = scrollY > 8 ? 0 : 1;
      return;
    }

    navLogo.style.opacity = progress;
    navLogo.style.transform = `translateY(${(1 - progress) * 10}px) scale(${0.85 + 0.15 * progress})`;

    heroLogo.style.opacity = 1 - progress;
    heroLogo.style.transform = `scale(${1 - 0.08 * progress})`;
  }

  window.addEventListener('scroll', updateOnScroll, { passive: true });
  window.addEventListener('resize', updateOnScroll);
  updateOnScroll();

  const navToggle = document.getElementById('navToggle');
  navToggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  // ------------------------------------------------------------
  // Get in Touch form: submits to SplitForms via fetch so the
  // page shows a success/error message in place, without
  // navigating away. If JS fails to run at all, the form's own
  // action/method attributes still submit it as a plain POST.
  // ------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  if (contactForm){
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status       = document.getElementById('contactFormStatus');
      const submitButton = contactForm.querySelector('button[type="submit"]');

      status.textContent = 'Sending…';
      status.classList.add('is-visible');
      submitButton.disabled = true;

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          status.textContent = "Thanks — we'll be in touch shortly.";
          contactForm.reset();
        } else {
          status.textContent = 'Something went wrong — please try again, or email us directly.';
        }
      } catch (err) {
        status.textContent = 'Something went wrong — please try again, or email us directly.';
      } finally {
        submitButton.disabled = false;
      }
    });
  }

  // ------------------------------------------------------------
  // Sourcing map
  // ------------------------------------------------------------
  const SOURCING_POINTS = [
    { country: 'Canadá',         lat: 56.1,  lng: -126.3, fruit: 'Cerezas' },
    { country: 'USA',            lat: 43.8,  lng: -120.6,  fruit: 'Cerezas' },
    { country: 'Argentina',      lat: -42.0, lng: -66.0,  fruit: 'Cerezas' },
    { country: 'Chile',          lat: -35.6, lng: -71.5,  fruit: 'Cerezas, Ciruelas, Melocotones, Melocotones planos, Nectarinas, Nectarinas planas, Kiwi' },
    { country: 'UK',             lat: 54.0,  lng: -2.5,   fruit: 'Cerezas, Ciruelas, Albaricoques' },
    { country: 'España',          lat: 40.9,  lng: 1,   fruit: 'Cerezas, Ciruelas, Melocotones, Nectarinas, Nectarinas Planas, Melocotones Planos, Higos' },
    { country: 'Portugal',       lat: 39.5,  lng: -8.0,   fruit: 'Ciruelas, Nectarinas, Melocotones, Kiwi' },
    { country: 'Italia',          lat: 42.5,  lng: 12.5,   fruit: 'Ciruelas, Kiwi' },
    { country: 'Greecia',         lat: 38.0,  lng: 22.0,   fruit: 'Cerezas, Nectarinas, Melocotones, Kiwi' },
    { country: 'Bulgaria',       lat: 42.7,  lng: 25.3,   fruit: 'Cerezas,Ciruelas' },
    { country: 'Moldovia',        lat: 47.2,  lng: 28.5,   fruit: 'Cerezas, Ciruelas, Albaricoques' },
    { country: 'Sudáfrica',   lat: -29.0, lng: 24.0,   fruit: 'Cerezas, Ciruelas, Nectarinas, Melocotones, Nectarinas Planas, Melocotones Planos, Higos' },
    { country: 'Serbia',         lat: 44.8, lng: 19.5,   fruit: 'Ciruelas' },
    { country: 'Jordán',         lat: 30.0, lng:36.6,    fruit: 'Dátiles' },
    { country: 'Turquía',        lat: 39.0, lng:34.0,    fruit: 'Cerezas,higos'}
  ];

  (async function initMap(){
    const mapWrap = document.getElementById('mapWrap');
    if (!mapWrap) return;

    const WIDTH = 960, HEIGHT = 480;
    const svg = d3.select('#worldMap');
    const projection = d3.geoEquirectangular().fitSize([WIDTH, HEIGHT], { type: 'Sphere' });
    const geoPath = d3.geoPath(projection);

    let world;
    try {
      world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
    } catch (err) {
      document.getElementById('mapLoading').textContent = 'Map could not be loaded.';
      return;
    }

    const countries = topojson.feature(world, world.objects.countries).features;

    svg.selectAll('path.country')
      .data(countries)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', geoPath);

    const dotGroups = svg.selectAll('g.map-dot-group')
      .data(SOURCING_POINTS)
      .enter()
      .append('g')
      .attr('class', 'map-dot-group')
      .attr('transform', d => {
        const [x, y] = projection([d.lng, d.lat]);
        return `translate(${x},${y})`;
      });

    dotGroups.append('circle').attr('class', 'map-dot-pulse').attr('r', 6);
    dotGroups.append('circle').attr('class', 'map-dot-hit').attr('r', 14);
    dotGroups.append('circle').attr('class', 'map-dot').attr('r', 6);

    document.getElementById('mapLoading').remove();

    const popup      = document.getElementById('mapPopup');
    const popupTitle = document.getElementById('mapPopupTitle');
    const popupText  = document.getElementById('mapPopupText');
    const popupClose = document.getElementById('mapPopupClose');
    let activeGroup = null;

    function openPopup(group, d){
      if (activeGroup) activeGroup.select('.map-dot').classed('is-active', false);
      activeGroup = group;
      group.select('.map-dot').classed('is-active', true);

      popupTitle.textContent = d.country;
      popupText.textContent  = d.fruit;
      popup.hidden = false;
      popup.setAttribute('aria-hidden', 'false');

      const wrapRect = mapWrap.getBoundingClientRect();
      const dotRect  = group.node().getBoundingClientRect();
      const dotCenterX = dotRect.left - wrapRect.left + dotRect.width / 2;
      const dotTopY    = dotRect.top - wrapRect.top;

      popup.style.left = dotCenterX + 'px';
      popup.style.top  = dotTopY + 'px';

      requestAnimationFrame(() => {
        const popRect = popup.getBoundingClientRect();
        let left = dotCenterX - popRect.width / 2;
        left = Math.max(8, Math.min(left, wrapRect.width - popRect.width - 8));
        const top = Math.max(8, dotTopY - popRect.height - 14);
        popup.style.left = left + 'px';
        popup.style.top  = top + 'px';
      });
    }

    function closePopup(){
      if (activeGroup) activeGroup.select('.map-dot').classed('is-active', false);
      activeGroup = null;
      popup.hidden = true;
      popup.setAttribute('aria-hidden', 'true');
    }

    dotGroups.on('click', function(event, d){
      event.stopPropagation();
      const group = d3.select(this);
      if (activeGroup && activeGroup.node() === group.node()) { closePopup(); return; }
      openPopup(group, d);
    });

    popupClose.addEventListener('click', closePopup);
    document.addEventListener('click', (e) => {
      if (!popup.hidden && !popup.contains(e.target) && !e.target.closest('.map-dot-group')) closePopup();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePopup(); });
  })();

  function loadClarity(){
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "xxjc0mc9ol");
}

const cookieBanner  = document.getElementById('cookieBanner');
const cookieConsent = localStorage.getItem('cookieConsent');

if (cookieConsent === 'accepted') {
  loadClarity();
} else if (cookieConsent !== 'declined') {
  cookieBanner.hidden = false;
}

document.getElementById('cookieAccept').addEventListener('click', () => {
  localStorage.setItem('cookieConsent', 'accepted');
  loadClarity();
  cookieBanner.hidden = true;
});

document.getElementById('cookieDecline').addEventListener('click', () => {
  localStorage.setItem('cookieConsent', 'declined');
  cookieBanner.hidden = true;
});

// ------------------------------------------------------------
// Our Values wheel — SVG donut, 4 equal quarters, bold two-line
// curved labels, hover/click updates the detail panel.
// ------------------------------------------------------------
(function initValuesWheel(){
  const svg = document.getElementById('valuesWheel');
  if (!svg) return;

  const VALUES = [
    {
      num: '01', title: 'Energía y compromiso', label: ['Compromiso', 'Energía y'], color: 'var(--fruit-cherry)',
      points: [
        'Apasionados por nuestro negocio y productos',
        'Esfuérzate por acertar a la primera',
        'Sé ingenioso y flexible – encontrando una forma nueva'
      ]
    },
    {
      num: '02', title: 'Honestidad y respeto', label: ['Respeto', 'Honestidad y'], color: 'var(--fruit-kiwi)',
      points: [
        'Consigue éxito subiendo nuestros estándares',
        'Nuestro crecimiento viene de ser mejores juntos',
        'Trata a la gente como esperas que te traten a ti'
      ]
    },
    {
      num: '03', title: 'Conectados mediante la colaboración', label: ['Colaboración', 'Conectados por'], color: 'var(--fruit-nectarine)',
      points: [
        'Construye relaciones fructíferas con nuestro equipo, con nuestros cultivadores y con nuestros clientes',
        'Mantenlo simple para ofrecer una cadena de suministro eficiente y centrada en el cliente desde el campo hasta el estante',
        'Ponemos las relaciones en el centro de nuestro trabajo; escuchamos y trabajamos juntos para lograr que las cosas pasen'
      ]
    },
    {
      num: '04', title: 'Nutriendo nuestro futuro', label: ['Future', 'Cuidando nuestro'], color: 'var(--fruit-apricot)',
      points: [
        'Crea un equipo feliz para desarrollar nuestro talento',
        'Haz crecer un negocio saludable; siempre añadiendo valor',
        'Trabaja con compañeros que piensen igual para proteger nuestros recursos naturales y el medio ambiente'
      ]
    }
  ];

  // Equal 90deg quarters, equal reach from center — client wants
  // all four sectors the same size.
  const START_ANGLE = 45;   // 45deg = top-right quarter starts here
  const SECTOR_SPAN  = 90;  // all four are true quarters
  const GAP_DEG      = 6;   // whitespace between sectors
  const OUTER_R = 320;      // same for every sector
  const CX = 360, CY = 360;
  const HUB_R    = 108;
  const RING_GAP = 22;      // whitespace between hub and sectors
  const INNER_R  = HUB_R + RING_GAP;
  const LINE_GAP = 20;      // radial spacing between line 1 and line 2 of a label

  function polar(r, angleDeg){
    const rad = angleDeg * Math.PI / 180;
    return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) };
  }

  function sectorPath(startA, endA, outerR){
    const large = (endA - startA) > 180 ? 1 : 0;
    const o1 = polar(outerR, startA), o2 = polar(outerR, endA);
    const i2 = polar(INNER_R, endA),  i1 = polar(INNER_R, startA);
    return `M ${o1.x} ${o1.y} A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y} `
         + `L ${i2.x} ${i2.y} A ${INNER_R} ${INNER_R} 0 ${large} 0 ${i1.x} ${i1.y} Z`;
  }

  function labelArcPath(startA, endA, labelR, reverse){
    const a = reverse ? endA : startA;
    const b = reverse ? startA : endA;
    const large = Math.abs(b - a) > 180 ? 1 : 0;
    const sweep = reverse ? 0 : 1;
    const p1 = polar(labelR, a), p2 = polar(labelR, b);
    return `M ${p1.x} ${p1.y} A ${labelR} ${labelR} 0 ${large} ${sweep} ${p2.x} ${p2.y}`;
  }

  const svgNS = 'http://www.w3.org/2000/svg';
  const wedges = [];

  VALUES.forEach((v, i) => {
    const start  = START_ANGLE + i * SECTOR_SPAN + GAP_DEG / 2;
    const end    = START_ANGLE + (i + 1) * SECTOR_SPAN - GAP_DEG / 2;
    const mid    = START_ANGLE + i * SECTOR_SPAN + SECTOR_SPAN / 2;
    const labelR = (INNER_R + OUTER_R) / 2;

    const wedge = document.createElementNS(svgNS, 'path');
    wedge.setAttribute('class', 'wheel-wedge');
    wedge.setAttribute('d', sectorPath(start, end, OUTER_R));
    wedge.setAttribute('fill', v.color);
    wedge.setAttribute('tabindex', '0');
    wedge.setAttribute('role', 'button');
    wedge.setAttribute('aria-label', v.title);
    if (i === 0) wedge.classList.add('is-active');
    svg.appendChild(wedge);
    wedges.push(wedge);

    const reverse = mid > 90 && mid < 270;
    const lines = v.label;
    const radii = lines.length === 2
      ? [labelR - LINE_GAP / 2, labelR + LINE_GAP / 2]
      : [labelR];

    lines.forEach((line, li) => {
      const r = reverse ? radii[lines.length - 1 - li] : radii[li];
      const pathId = `wheelLabelPath${i}_${li}`;
      const labelPath = document.createElementNS(svgNS, 'path');
      labelPath.setAttribute('id', pathId);
      labelPath.setAttribute('d', labelArcPath(start, end, r, reverse));
      labelPath.setAttribute('fill', 'none');
      svg.appendChild(labelPath);

      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('class', 'wheel-label');
      const textPath = document.createElementNS(svgNS, 'textPath');
      textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${pathId}`);
      textPath.setAttribute('href', `#${pathId}`);
      textPath.setAttribute('startOffset', '50%');
      textPath.setAttribute('text-anchor', 'middle');
      textPath.textContent = line;
      text.appendChild(textPath);
      svg.appendChild(text);
    });
  });

  const numEl   = document.getElementById('wheelDetailNum');
  const titleEl = document.getElementById('wheelDetailTitle');
  const listEl  = document.getElementById('wheelDetailList');

  function setActive(i){
    wedges.forEach(w => w.classList.remove('is-active'));
    wedges[i].classList.add('is-active');
    const v = VALUES[i];
    numEl.textContent = v.num;
    titleEl.textContent = v.title;
    listEl.innerHTML = v.points.map(p => `<li>${p}</li>`).join('');
    titleEl.style.color = v.color.startsWith('var(')
      ? getComputedStyle(document.documentElement).getPropertyValue(v.color.slice(4, -1)).trim()
      : v.color;
  }

  wedges.forEach((w, i) => {
    w.addEventListener('mouseenter', () => setActive(i));
    w.addEventListener('focus', () => setActive(i));
    w.addEventListener('click', () => setActive(i));
  });

  setActive(0);
})();