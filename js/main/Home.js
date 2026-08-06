const heroTrack  = document.getElementById('heroTrack');
const heroSlides = heroTrack.children;
let currentSlide = 0;

function autoHeroScroll() {
  currentSlide = (currentSlide + 1) % heroSlides.length;
  heroTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
}

setInterval(autoHeroScroll, 5000);

setInterval(autoHeroScroll, 5000);

setInterval(autoHeroScroll, 5000);

// keep it aligned if the window is resized between ticks
window.addEventListener('resize', () => {
  heroCarousel.scrollLeft = currentSlide * heroCarousel.clientWidth;
});

setInterval(autoHeroScroll, 5000); // every 5 seconds

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
    { country: 'Canada',         lat: 56.1,  lng: -106.3, fruit: 'Cherries' },
    { country: 'USA',            lat: 39.8,  lng: -98.6,  fruit: 'Cherries' },
    { country: 'Argentina',      lat: -34.0, lng: -64.0,  fruit: 'Cherries' },
    { country: 'Chile',          lat: -35.6, lng: -71.5,  fruit: 'Cherries, Plums, Peaches,  Flat peaches, Nectarines, Flat nectarines' },
    { country: 'United Kingdom', lat: 54.0,  lng: -2.5,   fruit: 'Cherries, Plums, Apricots' },
    { country: 'Spain',          lat: 40.9,  lng: 1,   fruit: 'Cherries, Plums' },
    { country: 'Portugal',       lat: 39.5,  lng: -8.0,   fruit: 'Plums, Nectarines, Peaches, Flat peaches, Flat Nectarines' },
    { country: 'Italy',          lat: 42.5,  lng: 12.5,   fruit: 'Plums' },
    { country: 'Greece',         lat: 38.0,  lng: 22.0,   fruit: 'Cherries, Nectarines, Peaches' },
    { country: 'Bulgaria',       lat: 42.7,  lng: 25.3,   fruit: 'Cherries, Plums, Peaches, Nectarines, Apricots' },
    { country: 'Moldova',        lat: 47.2,  lng: 28.5,   fruit: 'Cherries, Plums' },
    { country: 'South Africa',   lat: -29.0, lng: 24.0,   fruit: 'Cherries, Plums, Nectarines, Peaches' },
    { country: 'Serbia',         lat: 44.8, lng: 19.5,   fruit: 'Plums' }
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
