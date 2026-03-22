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

  // ==================== CV SECTION ====================

  const renderCV = (config) => {
    const cv = config.cv;
    if (!cv) return;

    // Helper: 12-col grid section wrapper
    const cvSection = (title, contentHtml) => `
      <section class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
        <div class="md:col-span-4">
          <h2 class="font-headline text-3xl font-extrabold tracking-tight text-on-surface uppercase border-b-2 border-primary w-fit pr-4 pb-2">${title}</h2>
        </div>
        <div class="md:col-span-8 space-y-12">
          ${contentHtml}
        </div>
      </section>
    `;

    // Experience type → border color map
    const typeBorderColor = {
      Technical: 'border-primary',
      Military: 'border-outline-variant/30',
      Community: 'border-surface-container-highest',
      Leadership: 'border-secondary-fixed',
    };

    // --- Hero ---
    const hero = document.getElementById('cvHero');
    if (hero) {
      const resumeOptions = (config.resumes || []).map((r) =>
        `<a href="${r.file}" download class="block px-6 py-3 font-label text-sm text-on-surface hover:bg-surface-container-low transition-colors">${r.title}</a>`
      ).join('');

      hero.innerHTML = `
        <div class="max-w-3xl">
          <span class="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-4 block">Curriculum Vitae</span>
          <h1 class="font-headline text-6xl md:text-8xl font-extrabold tracking-tighter text-on-surface leading-none">
            Seungjun <span class="text-primary italic font-body font-normal">Oh</span>
          </h1>
          <p class="mt-8 font-body text-xl md:text-2xl text-on-surface-variant max-w-xl leading-relaxed">
            ${cv.subtitle}
          </p>
        </div>
        <div class="flex-shrink-0 relative">
          <button id="cvDownloadBtn" class="group flex items-center gap-3 bg-primary px-8 py-4 rounded-md text-on-primary font-headline font-bold transition-all hover:bg-primary-dim">
            <span class="material-symbols-outlined">download</span>
            DOWNLOAD PDF
          </button>
          <div id="cvDownloadDropdown" class="hidden absolute right-0 mt-2 bg-surface-container-lowest rounded-xl shadow-lg shadow-on-surface/4 py-2 min-w-[200px] z-10">
            ${resumeOptions}
          </div>
        </div>
      `;

      const btn = document.getElementById('cvDownloadBtn');
      const dropdown = document.getElementById('cvDownloadDropdown');
      btn?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown?.classList.toggle('hidden');
      });
      document.addEventListener('click', (e) => {
        if (dropdown && btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.classList.add('hidden');
        }
      });
    }

    // --- Education ---
    const eduEl = document.getElementById('cvEducation');
    if (eduEl && cv.education?.length) {
      const items = cv.education.map((edu) => {
        const name = edu.url
          ? `<a href="${edu.url}" target="_blank" rel="noopener" class="hover:text-primary transition-colors">${edu.institution}</a>`
          : edu.institution;
        return `
          <div class="group">
            <div class="flex flex-col md:flex-row justify-between items-baseline mb-4">
              <h3 class="font-body text-2xl font-semibold text-on-surface">${name}</h3>
              <span class="font-label text-sm text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">${edu.period}</span>
            </div>
            <p class="font-headline text-lg font-bold text-primary">${edu.degree}</p>
          </div>
        `;
      }).join('');
      eduEl.innerHTML = cvSection('Education', items);
    }

    // --- Research ---
    const researchEl = document.getElementById('cvResearch');
    if (researchEl && cv.research?.length) {
      const items = cv.research.map((r) => {
        const labName = r.url
          ? `<a href="${r.url}" target="_blank" rel="noopener" class="hover:text-primary transition-colors">${r.lab}</a>`
          : r.lab;
        return `
          <div class="relative pl-8 bg-surface-container-low p-8 rounded-xl">
            <div class="absolute left-4 top-10 w-2 h-2 rounded-full bg-primary"></div>
            <div class="flex flex-col md:flex-row justify-between items-baseline mb-4">
              <h3 class="font-body text-2xl font-semibold text-on-surface">${labName}</h3>
              <span class="font-label text-sm text-on-surface-variant">${r.role}</span>
            </div>
            <p class="font-label text-xs uppercase tracking-widest text-primary font-bold mb-2">Advisor: ${r.advisor}</p>
            <p class="font-label text-sm text-on-surface-variant mb-4">${r.period}</p>
            <div class="flex gap-4">
              <span class="text-primary font-bold">/</span>
              <span class="font-body text-lg text-on-surface-variant">${r.focus}</span>
            </div>
          </div>
        `;
      }).join('');
      researchEl.innerHTML = cvSection('Research', items);
    }

    // --- Experience ---
    const expEl = document.getElementById('cvExperience');
    if (expEl && cv.experience?.length) {
      const items = cv.experience.map((exp) => {
        const borderClass = typeBorderColor[exp.type] || 'border-primary';
        const orgName = exp.url
          ? `<a href="${exp.url}" target="_blank" rel="noopener" class="hover:text-primary transition-colors">${exp.organization}</a>`
          : exp.organization;
        const teamLine = exp.team ? `<p class="font-body italic text-primary-dim mb-4">${exp.team}</p>` : '';
        const highlights = (exp.highlights || []).map((h) =>
          `<li class="flex gap-4"><span class="text-primary font-bold shrink-0">/</span><span>${h}</span></li>`
        ).join('');

        return `
          <div class="group">
            <div class="flex flex-col md:flex-row justify-between items-baseline mb-2">
              <h3 class="font-body text-2xl font-semibold text-on-surface">${exp.role}</h3>
              <span class="font-label text-sm text-on-surface-variant">${exp.period}</span>
            </div>
            <p class="font-label text-sm text-on-surface-variant mb-1">${orgName}</p>
            ${teamLine}
            <div class="bg-surface-container-lowest p-8 rounded-lg border-l-4 ${borderClass} mt-4">
              <div class="flex items-center gap-2 mb-4">
                <span class="font-label text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">${exp.type}</span>
              </div>
              <ul class="font-body text-lg text-on-surface-variant space-y-3 list-none">
                ${highlights}
              </ul>
            </div>
          </div>
        `;
      }).join('');
      expEl.innerHTML = cvSection('Experience', items);
    }

    // --- Expertise (Skills) ---
    const expertiseEl = document.getElementById('cvExpertise');
    if (expertiseEl && cv.skills) {
      const interests = (cv.skills.interests || []).join(', ');
      const technical = (cv.skills.technical || []).join(', ');

      const bentoHtml = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-surface-container-low p-8 rounded-xl flex flex-col justify-between h-48">
            <span class="material-symbols-outlined text-primary text-3xl">interests</span>
            <div>
              <h4 class="font-headline font-bold text-on-surface">Research Interests</h4>
              <p class="font-label text-xs text-on-surface-variant uppercase tracking-wider mt-1">${interests}</p>
            </div>
          </div>
          <div class="bg-primary text-on-primary p-8 rounded-xl flex flex-col justify-between h-48">
            <span class="material-symbols-outlined text-on-primary text-3xl" style="font-variation-settings: 'FILL' 1;">code</span>
            <div>
              <h4 class="font-headline font-bold">Technical Skills</h4>
              <p class="font-label text-xs opacity-70 uppercase tracking-wider mt-1">${technical}</p>
            </div>
          </div>
          <div class="bg-surface-container-highest p-8 rounded-xl flex flex-col justify-between h-48 sm:col-span-2">
            <span class="material-symbols-outlined text-primary text-3xl">architecture</span>
            <div>
              <h4 class="font-headline font-bold text-on-surface text-xl">Interdisciplinary Focus</h4>
              <p class="font-body text-on-surface-variant mt-2 max-w-lg">Bridging quantitative analysis, blockchain technology, and socio-technical systems to decode complex digital economies.</p>
            </div>
          </div>
        </div>
      `;
      expertiseEl.innerHTML = cvSection('Expertise', bentoHtml);
    }

    // --- Publication ---
    const pubEl = document.getElementById('cvPublication');
    if (pubEl && cv.publication?.length) {
      const items = cv.publication.map((pub) => {
        const title = pub.url
          ? `<a href="${pub.url}" target="_blank" rel="noopener" class="hover:text-primary transition-colors">${pub.title}</a>`
          : pub.title;
        return `
          <div class="bg-surface-container-low p-8 rounded-xl">
            <h3 class="font-body text-2xl font-semibold text-on-surface mb-2">${title}</h3>
            <div class="flex flex-wrap gap-3 mb-4">
              <span class="font-label text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">${pub.role}</span>
              <span class="font-label text-xs text-on-surface-variant">ISBN: ${pub.isbn}</span>
            </div>
            <p class="font-body text-lg text-on-surface-variant">${pub.description}</p>
          </div>
        `;
      }).join('');
      pubEl.innerHTML = cvSection('Publication', items);
    }

    // --- Projects ---
    const projEl = document.getElementById('cvProjects');
    if (projEl && cv.projects?.length) {
      const items = cv.projects.map((proj) => {
        const highlights = (proj.highlights || []).map((h) =>
          `<li class="flex gap-4"><span class="text-primary font-bold shrink-0">/</span><span>${h}</span></li>`
        ).join('');
        return `
          <div class="group">
            <div class="flex flex-col md:flex-row justify-between items-baseline mb-2">
              <h3 class="font-body text-2xl font-semibold text-on-surface">${proj.title}</h3>
              <span class="font-label text-sm text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">${proj.year}</span>
            </div>
            <p class="font-body text-lg text-on-surface-variant mb-4">${proj.description}</p>
            <ul class="font-body text-on-surface-variant space-y-3 list-none">
              ${highlights}
            </ul>
          </div>
        `;
      }).join('');
      projEl.innerHTML = cvSection('Projects', items);
    }

    // --- Events ---
    const eventsEl = document.getElementById('cvEvents');
    if (eventsEl && cv.events?.length) {
      const items = cv.events.map((evt) => `
        <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 py-3">
          <span class="font-label text-sm text-on-surface-variant shrink-0 w-12">${evt.year}</span>
          <span class="font-label text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant shrink-0">${evt.role}</span>
          <span class="font-body text-lg text-on-surface">${evt.title}</span>
        </div>
      `).join('');
      eventsEl.innerHTML = cvSection('Events', `<div class="space-y-2">${items}</div>`);
    }

    // --- Awards ---
    const awardsEl = document.getElementById('cvAwards');
    if (awardsEl && cv.awards?.length) {
      const items = cv.awards.map((award) => {
        const valueBadge = award.value
          ? `<span class="font-label text-xs font-bold text-primary ml-2">${award.value}</span>`
          : '';
        return `
          <div class="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6 py-3">
            <span class="font-label text-sm text-on-surface-variant shrink-0 w-24">${award.date}</span>
            <div class="flex-1">
              <span class="font-body text-lg text-on-surface font-semibold">${award.title}</span>${valueBadge}
              <p class="font-label text-sm text-on-surface-variant">${award.issuer}</p>
            </div>
          </div>
        `;
      }).join('');
      awardsEl.innerHTML = cvSection('Awards', `<div class="space-y-2">${items}</div>`);
    }

    // --- Certificates ---
    const certEl = document.getElementById('cvCertificates');
    if (certEl && cv.certificates) {
      const categories = [
        { key: 'finance', label: 'Finance', icon: 'account_balance' },
        { key: 'cs', label: 'Computer Science', icon: 'terminal' },
        { key: 'general', label: 'General', icon: 'workspace_premium' },
      ];
      const cards = categories.map((cat) => {
        const certs = cv.certificates[cat.key];
        if (!certs?.length) return '';
        const list = certs.map((c) =>
          `<div class="flex justify-between items-baseline py-2">
            <span class="font-body text-on-surface">${c.name}</span>
            <span class="font-label text-xs text-on-surface-variant">${c.issuer}</span>
          </div>`
        ).join('');
        return `
          <div class="bg-surface-container-low p-6 rounded-xl">
            <div class="flex items-center gap-2 mb-4">
              <span class="material-symbols-outlined text-primary text-xl">${cat.icon}</span>
              <h4 class="font-headline font-bold text-on-surface">${cat.label}</h4>
            </div>
            <div class="divide-y divide-outline-variant/15">
              ${list}
            </div>
          </div>
        `;
      }).join('');
      certEl.innerHTML = cvSection('Certificates', `<div class="space-y-6">${cards}</div>`);
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
      renderCV(config);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
