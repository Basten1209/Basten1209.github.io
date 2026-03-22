(() => {
  // State
  const sections = () => Array.from(document.querySelectorAll('.section'));
  const navLinks = () => Array.from(document.querySelectorAll('.nav__link'));
  const currentYearEl = document.getElementById('currentYear');

  let portfolioConfig = null;

  // Set current year
  const setYear = () => {
    if (currentYearEl) {
      currentYearEl.textContent = String(new Date().getFullYear());
    }
  };

  // Navigation
  const setActiveSection = (sectionId) => {
    const allSections = sections();
    const allNavLinks = navLinks();
    const targetSection = allSections.find((s) => s.id === sectionId) || allSections[0];
    if (!targetSection) return;

    allSections.forEach((section) => {
      section.classList.toggle('section--active', section === targetSection);
    });

    allNavLinks.forEach((link) => {
      const isActive = link.dataset.section === targetSection.id;
      link.classList.toggle('text-primary', isActive);
      link.classList.toggle('border-b-2', isActive);
      link.classList.toggle('border-primary', isActive);
      link.classList.toggle('text-on-surface-variant', !isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const initNavigation = () => {
    // Nav links
    navLinks().forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = link.dataset.section;
        if (!targetId) return;
        history.replaceState(null, '', `#${targetId}`);
        setActiveSection(targetId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    // CTA links with data-section (e.g., "View My Research", "All Projects")
    document.querySelectorAll('a[data-section]').forEach((link) => {
      if (link.classList.contains('nav__link')) return; // skip nav links already handled
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = link.dataset.section;
        if (!targetId) return;
        history.replaceState(null, '', `#${targetId}`);
        setActiveSection(targetId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    // Hash change
    window.addEventListener('hashchange', () => {
      const sectionId = window.location.hash.replace('#', '') || 'home';
      setActiveSection(sectionId);
    });

    // Initial section
    const initialSectionId = window.location.hash.replace('#', '') || 'home';
    setActiveSection(initialSectionId);
  };

  // Load portfolio configuration
  const loadPortfolioConfig = async () => {
    try {
      const response = await fetch('data/portfolio-config.json');
      if (!response.ok) throw new Error(`Failed to load config: ${response.status}`);
      portfolioConfig = await response.json();
      return portfolioConfig;
    } catch (error) {
      console.error('Error loading portfolio config:', error);
      return null;
    }
  };

  // Render Focus Areas
  const renderFocusAreas = (config) => {
    const grid = document.getElementById('focusAreasGrid');
    if (!grid || !config.profile?.focusAreas) return;

    grid.innerHTML = config.profile.focusAreas.map((area) => `
      <div class="p-8 bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <span class="material-symbols-outlined text-primary text-4xl mb-4">${area.icon}</span>
        <h3 class="font-headline font-bold text-xl mb-3">${area.title}</h3>
        <p class="font-body text-lg text-on-surface-variant italic">${area.description}</p>
      </div>
    `).join('');
  };

  // Render Case Studies (latest 2 reports)
  const renderCaseStudies = (config) => {
    const grid = document.getElementById('caseStudiesGrid');
    if (!grid || !config.reports) return;

    // Sort by date descending, take top 2
    const sorted = [...config.reports].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const featured = sorted.slice(0, 2);

    if (featured.length === 0) return;

    let html = '';

    // Large card (first report)
    if (featured[0]) {
      const r = featured[0];
      html += `
        <div class="lg:col-span-8 group cursor-pointer">
          <div class="aspect-[16/9] bg-surface-container-low rounded-xl overflow-hidden mb-6 flex items-center justify-center">
            <div class="text-center p-12">
              <span class="font-label text-xs font-semibold text-primary uppercase tracking-widest mb-4 block">${r.category}</span>
              <span class="material-symbols-outlined text-primary/20 text-[80px]">article</span>
            </div>
          </div>
          <div class="max-w-2xl">
            <span class="font-label text-xs font-semibold text-primary uppercase tracking-widest mb-2 block">${r.category} &middot; ${r.date}</span>
            <h3 class="font-body font-semibold text-3xl mb-4 group-hover:text-primary transition-colors">${r.title}</h3>
            <p class="font-body text-xl text-on-surface-variant">${r.contribution}</p>
            <span class="inline-flex items-center gap-1 mt-4 font-headline font-bold text-primary text-sm group-hover:gap-2 transition-all">
              Explore Findings
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          </div>
        </div>
      `;
    }

    // Small card (second report)
    if (featured[1]) {
      const r = featured[1];
      html += `
        <div class="lg:col-span-4 mt-0 lg:mt-24 group cursor-pointer">
          <div class="aspect-square bg-surface-container-low rounded-xl overflow-hidden mb-6 flex items-center justify-center">
            <div class="text-center p-8">
              <span class="font-label text-xs font-semibold text-primary uppercase tracking-widest mb-4 block">${r.category}</span>
              <span class="material-symbols-outlined text-primary/20 text-[64px]">description</span>
            </div>
          </div>
          <div>
            <span class="font-label text-xs font-semibold text-primary uppercase tracking-widest mb-2 block">${r.category} &middot; ${r.date}</span>
            <h3 class="font-body font-semibold text-2xl mb-4 group-hover:text-primary transition-colors">${r.title}</h3>
            <p class="font-body text-lg text-on-surface-variant italic">${r.contribution}</p>
          </div>
        </div>
      `;
    }

    grid.innerHTML = html;
  };

  // Render status badge from config
  const renderStatusBadge = (config) => {
    const statusText = document.getElementById('statusText');
    if (statusText && config.profile?.status) {
      statusText.textContent = config.profile.status;
    }
  };

  // Render tagline from config
  const renderTagline = (config) => {
    const tagline = document.getElementById('heroTagline');
    if (tagline && config.profile?.tagline) {
      tagline.innerHTML = config.profile.tagline;
    }
  };

  // Initialize
  const init = async () => {
    setYear();
    initNavigation();

    const config = await loadPortfolioConfig();
    if (config) {
      renderStatusBadge(config);
      renderTagline(config);
      renderFocusAreas(config);
      renderCaseStudies(config);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
