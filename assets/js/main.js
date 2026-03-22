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

  // ==================== ARTICLES SECTION ====================

  // Sort reports by date descending
  const getSortedReports = (config) => {
    if (!config.reports) return [];
    return [...config.reports].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  };

  // Render article card HTML
  const renderArticleCard = (report, isLarge) => {
    const colSpan = isLarge ? 'md:col-span-8' : 'md:col-span-4';
    const titleSize = isLarge ? 'text-4xl' : 'text-2xl';
    const descClass = isLarge ? 'font-body text-lg text-on-surface-variant mb-8 leading-relaxed line-clamp-3' : 'font-body text-on-surface-variant line-clamp-2';
    const categoryColor = report.category === 'PDAO' ? 'text-primary' : report.category === 'Bithumb' ? 'text-secondary' : 'text-tertiary';

    if (isLarge) {
      return `
        <article class="${colSpan} group cursor-pointer" data-report-id="${report.id}" data-report-type="${report.type || 'pdf'}">
          <div class="bg-surface-container-low p-10 rounded-lg transition-all hover:bg-surface-container-highest">
            <div class="flex justify-between items-start mb-12">
              <span class="px-3 py-1 bg-primary-container text-on-primary-container text-[10px] font-bold uppercase tracking-widest rounded-[2rem]">${report.category}</span>
              <span class="font-label text-xs text-on-surface-variant">${report.date} &middot; ${report.contribution}</span>
            </div>
            <h3 class="font-body ${titleSize} mb-6 group-hover:text-primary transition-colors leading-tight">${report.title}</h3>
            <p class="${descClass}">${report.description || ''}</p>
            <div class="flex items-center gap-2 text-primary font-headline font-bold text-sm group-hover:gap-4 transition-all">
              ${report.type === 'url' ? 'VISIT ARTICLE' : 'EXPLORE FINDINGS'}
              <span class="material-symbols-outlined text-sm">${report.type === 'url' ? 'open_in_new' : 'arrow_forward'}</span>
            </div>
          </div>
        </article>
      `;
    }

    return `
      <article class="${colSpan} group cursor-pointer" data-report-id="${report.id}" data-report-type="${report.type || 'pdf'}">
        <div class="h-full flex flex-col pb-8">
          <span class="font-label text-[10px] font-bold uppercase tracking-widest ${categoryColor} mb-3">${report.category}</span>
          <h3 class="font-body ${titleSize} mb-4 leading-snug group-hover:text-primary transition-colors">${report.title}</h3>
          <p class="${descClass}">${report.description || ''}</p>
          <div class="mt-auto pt-4 flex items-center gap-4">
            <span class="material-symbols-outlined text-on-surface-variant text-lg">${report.type === 'url' ? 'link' : 'description'}</span>
            <span class="font-label text-xs text-on-surface-variant">${report.date} &middot; ${report.contribution}</span>
          </div>
        </div>
      </article>
    `;
  };

  // Render Articles section
  const renderArticles = (config) => {
    const sorted = getSortedReports(config);
    if (sorted.length === 0) return;

    // Featured article (latest)
    const featured = sorted[0];
    const titleEl = document.getElementById('featuredArticleTitle');
    const descEl = document.getElementById('featuredArticleDesc');
    const ctaEl = document.getElementById('featuredArticleCta');

    if (titleEl) titleEl.textContent = featured.title;
    if (descEl) descEl.textContent = featured.description || '';
    if (ctaEl) {
      ctaEl.textContent = featured.type === 'url' ? 'VISIT ARTICLE' : 'READ MONOGRAPH';
      ctaEl.addEventListener('click', () => handleReportClick(featured));
    }

    // Render grid (all reports except featured)
    renderArticlesGrid(sorted.slice(1));
  };

  // Render articles grid with given reports
  const renderArticlesGrid = (reports) => {
    const grid = document.getElementById('articlesGrid');
    if (!grid) return;

    if (reports.length === 0) {
      grid.innerHTML = `
        <div class="md:col-span-12 py-16 text-center">
          <span class="material-symbols-outlined text-on-surface-variant/30 text-[64px] mb-4">search_off</span>
          <p class="font-headline font-bold text-on-surface-variant">No articles found</p>
        </div>
      `;
      return;
    }

    let html = '';
    reports.forEach((report, i) => {
      html += renderArticleCard(report, i === 0);
    });
    grid.innerHTML = html;

    // Attach click handlers
    grid.querySelectorAll('[data-report-id]').forEach((el) => {
      el.addEventListener('click', () => {
        const id = el.dataset.reportId;
        const report = reports.find((r) => r.id === id);
        if (report) handleReportClick(report);
      });
    });
  };

  // Handle report click based on type
  const handleReportClick = (report) => {
    if (report.type === 'url' && report.url) {
      window.open(report.url, '_blank', 'noopener');
    } else if (report.type === 'pdf' || !report.type) {
      openPdfModal(report.filename, report.title);
    }
  };

  // Initialize article filter tabs
  const initArticleFilters = (config) => {
    const filtersNav = document.getElementById('articleFilters');
    if (!filtersNav || !config.reports) return;

    const sorted = getSortedReports(config);
    const categories = ['All', ...new Set(config.reports.map((r) => r.category))];
    let activeCategory = 'All';

    const renderFilters = () => {
      filtersNav.innerHTML = categories.map((cat) => `
        <button class="article-filter-tab pb-6 -mb-6 transition-colors ${
          cat === activeCategory
            ? 'text-primary border-b-2 border-primary'
            : 'hover:text-primary'
        }" data-category="${cat}">${cat === 'All' ? 'All Items' : cat}</button>
      `).join('');

      filtersNav.querySelectorAll('.article-filter-tab').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeCategory = btn.dataset.category;
          renderFilters();
          const filtered = activeCategory === 'All'
            ? sorted.slice(1)
            : sorted.filter((r) => r.category === activeCategory);
          renderArticlesGrid(filtered);
        });
      });
    };

    renderFilters();
  };

  // PDF Modal
  let pdfDoc = null;
  let pdfCurrentPage = 1;

  const openPdfModal = (filename, title) => {
    const modal = document.getElementById('pdfModal');
    const canvas = document.getElementById('pdfCanvas');
    const titleEl = document.getElementById('pdfModalTitle');
    const pageInfo = document.getElementById('pdfPageInfo');
    if (!modal || !canvas) return;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (titleEl) titleEl.textContent = title || filename;
    if (pageInfo) pageInfo.textContent = 'Loading...';

    pdfCurrentPage = 1;
    pdfDoc = null;

    const pdfPath = `data/reports/${filename}`;
    const loadingTask = pdfjsLib.getDocument(pdfPath);

    loadingTask.promise.then((pdf) => {
      pdfDoc = pdf;
      renderPdfPage(pdfCurrentPage);
    }).catch((err) => {
      console.error('PDF load error:', err);
      if (pageInfo) pageInfo.textContent = 'Error loading PDF';
    });
  };

  const renderPdfPage = (pageNum) => {
    if (!pdfDoc) return;
    const canvas = document.getElementById('pdfCanvas');
    const pageInfo = document.getElementById('pdfPageInfo');
    if (!canvas) return;

    pdfDoc.getPage(pageNum).then((page) => {
      const viewport = page.getViewport({ scale: 1.5 });
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      page.render({ canvasContext: context, viewport }).promise.then(() => {
        if (pageInfo) pageInfo.textContent = `${pageNum} / ${pdfDoc.numPages}`;
      });
    });
  };

  const closePdfModal = () => {
    const modal = document.getElementById('pdfModal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
    pdfDoc = null;
  };

  const initPdfModal = () => {
    document.getElementById('pdfCloseBtn')?.addEventListener('click', closePdfModal);
    document.getElementById('pdfModalBackdrop')?.addEventListener('click', closePdfModal);

    document.getElementById('pdfPrevPage')?.addEventListener('click', () => {
      if (pdfDoc && pdfCurrentPage > 1) {
        pdfCurrentPage--;
        renderPdfPage(pdfCurrentPage);
      }
    });

    document.getElementById('pdfNextPage')?.addEventListener('click', () => {
      if (pdfDoc && pdfCurrentPage < pdfDoc.numPages) {
        pdfCurrentPage++;
        renderPdfPage(pdfCurrentPage);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePdfModal();
      if (!pdfDoc) return;
      if (e.key === 'ArrowLeft' && pdfCurrentPage > 1) {
        pdfCurrentPage--;
        renderPdfPage(pdfCurrentPage);
      }
      if (e.key === 'ArrowRight' && pdfCurrentPage < pdfDoc.numPages) {
        pdfCurrentPage++;
        renderPdfPage(pdfCurrentPage);
      }
    });
  };

  // ==================== END ARTICLES SECTION ====================

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
      renderArticles(config);
      initArticleFilters(config);
    }
    initPdfModal();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
