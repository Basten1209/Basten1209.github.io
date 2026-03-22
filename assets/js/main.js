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
  const renderAboutAndSummary = async () => {
    const aboutEl = document.getElementById('aboutContent');
    const summaryEl = document.getElementById('summaryContent');

    // Load and render profile-intro.md
    if (aboutEl) {
      try {
        const res = await fetch('data/profile-intro.md');
        if (res.ok) {
          const md = await res.text();
          const html = typeof marked !== 'undefined' ? marked.parse(md) : md.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>');
          aboutEl.innerHTML = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(html) : html;
        }
      } catch (e) {
        console.warn('Failed to load profile-intro.md', e);
      }
    }

    // Load and render summary.md
    if (summaryEl) {
      try {
        const res = await fetch('summary.md');
        if (res.ok) {
          const md = await res.text();
          const html = typeof marked !== 'undefined' ? marked.parse(md) : md;
          const sanitized = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(html) : html;
          // Style the rendered markdown
          const wrapper = document.createElement('div');
          wrapper.innerHTML = sanitized;
          // Style headings
          wrapper.querySelectorAll('h1').forEach(el => {
            el.className = 'font-headline font-extrabold text-lg text-on-surface mb-4 hidden';
          });
          wrapper.querySelectorAll('h2, h3').forEach(el => {
            el.className = 'font-headline font-bold text-sm uppercase tracking-widest text-primary mb-3 mt-6 first:mt-0';
          });
          // Style lists
          wrapper.querySelectorAll('ul').forEach(el => {
            el.className = 'space-y-2 font-label text-sm text-on-surface-variant';
          });
          wrapper.querySelectorAll('li').forEach(el => {
            el.className = 'flex gap-2 items-start';
            el.innerHTML = '<span class="text-primary font-bold mt-0.5">-</span><span>' + el.innerHTML + '</span>';
          });
          summaryEl.innerHTML = '';
          summaryEl.appendChild(wrapper);
        }
      } catch (e) {
        console.warn('Failed to load summary.md', e);
      }
    }
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

    // Render featured PDF thumbnail
    if (featured.type === 'pdf' && featured.filename) {
      renderFeaturedPdfThumbnail(featured.filename);
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

  // ==================== CV SECTION ====================

  const renderCV = (config) => {
    const cv = config.cv;
    if (!cv) return;

    // Helper: compact section wrapper (full-width title + underline)
    const cvSection = (title, contentHtml) => `
      <section>
        <h2 class="font-headline text-lg font-extrabold tracking-tight text-on-surface uppercase border-b border-on-surface pb-1 mb-5">${title}</h2>
        <div class="space-y-5">
          ${contentHtml}
        </div>
      </section>
    `;

    // --- Hero ---
    const hero = document.getElementById('cvHero');
    if (hero) {
      const resumeOptions = (config.resumes || []).map((r) =>
        `<a href="${r.file}" download class="block px-6 py-3 font-label text-sm text-on-surface hover:bg-surface-container-low transition-colors">${r.title}</a>`
      ).join('');

      hero.innerHTML = `
        <div class="max-w-3xl">
          <h1 class="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface leading-none">
            Seungjun <span class="text-primary italic font-body font-normal">Oh</span>
          </h1>
          <p class="mt-2 font-body text-sm text-on-surface-variant">
            ${cv.subtitle}
          </p>
        </div>
        <div class="flex-shrink-0 relative">
          <button id="cvDownloadBtn" class="group flex items-center gap-2 bg-primary px-6 py-3 rounded-md text-on-primary font-headline font-bold text-sm transition-all hover:bg-primary-dim">
            <span class="material-symbols-outlined text-lg">download</span>
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
          ? `<a href="${edu.url}" target="_blank" rel="noopener" class="text-primary underline underline-offset-2 hover:text-primary-dim transition-colors font-headline font-bold text-sm">${edu.institution}</a>`
          : `<span class="font-headline font-bold text-sm text-on-surface">${edu.institution}</span>`;
        return `
          <div>
            <div class="flex justify-between items-baseline">
              ${name}
              <span class="font-label text-sm text-on-surface-variant">${edu.period}</span>
            </div>
            <p class="font-body text-sm font-semibold text-on-surface italic">${edu.degree}</p>
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
          ? `<a href="${r.url}" target="_blank" rel="noopener" class="text-primary underline underline-offset-2 hover:text-primary-dim transition-colors">${r.lab}</a>`
          : r.lab;
        return `
          <div>
            <div class="flex justify-between items-baseline">
              <span class="font-headline font-bold text-sm">${labName} <span class="font-normal text-on-surface-variant">(Advisor: ${r.advisor})</span></span>
              <span class="font-label text-sm text-on-surface-variant shrink-0 ml-4">${r.period}</span>
            </div>
            <p class="font-body text-sm text-on-surface-variant">${r.role}</p>
            <ul class="mt-1 ml-4 list-disc list-outside text-sm font-body text-on-surface-variant space-y-0.5">
              <li>${r.focus}</li>
            </ul>
          </div>
        `;
      }).join('');
      researchEl.innerHTML = cvSection('Research Experience', items);
    }

    // --- Experience ---
    const expEl = document.getElementById('cvExperience');
    if (expEl && cv.experience?.length) {
      const items = cv.experience.map((exp) => {
        const orgName = exp.url
          ? `<a href="${exp.url}" target="_blank" rel="noopener" class="text-primary underline underline-offset-2 hover:text-primary-dim transition-colors">${exp.organization}</a>`
          : `<span>${exp.organization}</span>`;
        const highlights = (exp.highlights || []).map((h) =>
          `<li>${h}</li>`
        ).join('');

        return `
          <div>
            <div class="flex justify-between items-baseline">
              <span class="font-headline font-bold text-sm">${orgName}</span>
              <span class="font-label text-sm text-on-surface-variant shrink-0 ml-4">${exp.period}</span>
            </div>
            <p class="font-body text-sm text-on-surface">${exp.role}</p>
            <ul class="mt-1 ml-4 list-disc list-outside text-sm font-body text-on-surface-variant space-y-0.5">
              ${highlights}
            </ul>
          </div>
        `;
      }).join('');
      expEl.innerHTML = cvSection('Work Experience', items);
    }

    // --- Expertise (Skills) ---
    const expertiseEl = document.getElementById('cvExpertise');
    if (expertiseEl && cv.skills) {
      const interests = (cv.skills.interests || []).join(', ');
      const technical = (cv.skills.technical || []).join(', ');

      const compactHtml = `
        <div class="space-y-2">
          <div class="flex gap-2">
            <span class="font-headline font-bold text-sm text-on-surface shrink-0">Research Interests:</span>
            <span class="font-body text-sm text-on-surface-variant">${interests}</span>
          </div>
          <div class="flex gap-2">
            <span class="font-headline font-bold text-sm text-on-surface shrink-0">Technical Skills:</span>
            <span class="font-body text-sm text-on-surface-variant">${technical}</span>
          </div>
        </div>
      `;
      expertiseEl.innerHTML = cvSection('Expertise', compactHtml);
    }

    // --- Publication ---
    const pubEl = document.getElementById('cvPublication');
    if (pubEl && cv.publication?.length) {
      const items = cv.publication.map((pub) => {
        const title = pub.url
          ? `<a href="${pub.url}" target="_blank" rel="noopener" class="text-primary underline underline-offset-2 hover:text-primary-dim transition-colors">${pub.title}</a>`
          : pub.title;
        return `
          <div>
            <div class="flex justify-between items-baseline">
              <span class="font-headline font-bold text-sm uppercase">${title}</span>
              <span class="font-label text-sm text-on-surface-variant shrink-0 ml-4">ISBN: ${pub.isbn}</span>
            </div>
            <p class="font-body text-sm text-on-surface">${pub.role}</p>
            <ul class="mt-1 ml-4 list-disc list-outside text-sm font-body text-on-surface-variant space-y-0.5">
              <li>${pub.description}</li>
            </ul>
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
          `<li>${h}</li>`
        ).join('');
        return `
          <div>
            <div class="flex justify-between items-baseline">
              <span class="font-headline font-bold text-sm">${proj.title}</span>
              <span class="font-label text-sm text-on-surface-variant shrink-0 ml-4">${proj.year}</span>
            </div>
            <p class="font-body text-sm text-on-surface-variant">${proj.description}</p>
            <ul class="mt-1 ml-4 list-disc list-outside text-sm font-body text-on-surface-variant space-y-0.5">
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
        <div class="flex items-baseline gap-4 py-0.5">
          <span class="font-label text-sm text-on-surface-variant shrink-0 w-10">${evt.year}</span>
          <span class="font-headline font-bold text-sm shrink-0">${evt.role}</span>
          <span class="font-body text-sm text-on-surface-variant">${evt.title}</span>
        </div>
      `).join('');
      eventsEl.innerHTML = cvSection('Events', `<div class="space-y-0.5">${items}</div>`);
    }

    // --- Awards ---
    const awardsEl = document.getElementById('cvAwards');
    if (awardsEl && cv.awards?.length) {
      const items = cv.awards.map((award) => {
        const valueBadge = award.value
          ? ` <span class="font-label text-xs font-bold text-primary">(${award.value})</span>`
          : '';
        return `
          <div class="flex items-baseline gap-4 py-0.5">
            <span class="font-label text-sm text-on-surface-variant shrink-0 w-28">${award.date}</span>
            <div class="flex-1">
              <span class="font-headline font-bold text-sm">${award.title}</span>${valueBadge}
              <span class="font-label text-sm text-on-surface-variant ml-2">${award.issuer}</span>
            </div>
          </div>
        `;
      }).join('');
      awardsEl.innerHTML = cvSection('Awards', `<div class="space-y-0.5">${items}</div>`);
    }

    // --- Summary ---
    const summaryEl = document.getElementById('cvSummary');
    if (summaryEl && config.profile?.tagline) {
      const summaryHtml = `
        <p class="font-body text-sm text-on-surface-variant leading-relaxed">${config.profile.tagline}</p>
      `;
      summaryEl.innerHTML = cvSection('Summary', summaryHtml);
    }

    // --- Extracurricular Experience ---
    const extraEl = document.getElementById('cvExtracurricular');
    if (extraEl && cv.extracurricular?.length) {
      const items = cv.extracurricular.map((ext) => {
        const orgName = ext.url
          ? `<a href="${ext.url}" target="_blank" rel="noopener" class="text-primary underline underline-offset-2 hover:text-primary-dim transition-colors">${ext.organization}</a>`
          : ext.organization;
        const highlights = (ext.highlights || []).map((h) =>
          `<li>${h}</li>`
        ).join('');

        return `
          <div>
            <div class="flex justify-between items-baseline">
              <span class="font-headline font-bold text-sm">${orgName}</span>
              <span class="font-label text-sm text-on-surface-variant shrink-0 ml-4">${ext.period}</span>
            </div>
            <p class="font-body text-sm text-on-surface">${ext.role}</p>
            <ul class="mt-1 ml-4 list-disc list-outside text-sm font-body text-on-surface-variant space-y-0.5">
              ${highlights}
            </ul>
          </div>
        `;
      }).join('');
      extraEl.innerHTML = cvSection('Extracurricular Experience', items);
    }

    // --- Certificates ---
    const certEl = document.getElementById('cvCertificates');
    if (certEl && cv.certificates) {
      const categories = [
        { key: 'finance', label: 'Finance' },
        { key: 'cs', label: 'Computer Science' },
        { key: 'general', label: 'General' },
      ];
      const cards = categories.map((cat) => {
        const certs = cv.certificates[cat.key];
        if (!certs?.length) return '';
        const list = certs.map((c) =>
          `<div class="flex justify-between items-baseline py-0.5">
            <span class="font-body text-sm text-on-surface">${c.name}</span>
            <span class="font-label text-xs text-on-surface-variant">${c.issuer}</span>
          </div>`
        ).join('');
        return `
          <div>
            <h4 class="font-headline font-bold text-sm text-on-surface mb-1">${cat.label}</h4>
            ${list}
          </div>
        `;
      }).join('');
      certEl.innerHTML = cvSection('Certifications', `<div class="space-y-4">${cards}</div>`);
    }
  };

  // Render Home Expertise section (from cv.skills)
  const renderHomeExpertise = (config) => {
    const container = document.getElementById('homeExpertise');
    if (!container || !config.cv?.skills) return;

    const interests = (config.cv.skills.interests || []).join(', ');
    const technical = (config.cv.skills.technical || []).join(', ');

    container.innerHTML = `
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
      </div>
    `;
  };

  // Render Featured Publication PDF thumbnail
  const renderFeaturedPdfThumbnail = (filename) => {
    const canvas = document.getElementById('featuredPdfCanvas');
    const placeholder = document.getElementById('featuredPlaceholder');
    if (!canvas || typeof pdfjsLib === 'undefined') return;

    const pdfPath = `data/reports/${filename}`;
    pdfjsLib.getDocument(pdfPath).promise.then((pdf) => {
      pdf.getPage(1).then((page) => {
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = Math.max(
          containerWidth / unscaledViewport.width,
          containerHeight / unscaledViewport.height
        );
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');

        page.render({ canvasContext: context, viewport }).promise.then(() => {
          canvas.classList.remove('hidden');
          if (placeholder) placeholder.classList.add('hidden');
        });
      });
    }).catch((err) => {
      console.warn('Featured PDF thumbnail failed:', err);
    });
  };

  // Badge color map for organizations
  const orgBadgeClasses = {
    POSTECH: 'bg-primary-container text-on-primary-container',
    ROKAF: 'bg-secondary-container text-on-secondary-container',
    PDAO: 'bg-secondary-fixed text-on-secondary-fixed',
    Bithumb: 'bg-tertiary-container text-on-tertiary-container',
    Certification: 'bg-surface-container-highest text-on-surface-variant',
    NinjaLabsKR: 'bg-primary-fixed text-on-primary-fixed',
    SuperteamKR: 'bg-tertiary-fixed text-on-tertiary-fixed',
    Crypto: 'bg-primary-fixed-dim text-on-primary-fixed',
  };
  const defaultBadgeClass = 'bg-surface-container-high text-on-surface-variant';

  // Load proof-of-work.xlsx
  let proofOfWorkBook = null;
  const loadProofOfWork = async () => {
    if (typeof XLSX === 'undefined') {
      console.error('XLSX library not loaded');
      return [];
    }
    try {
      const response = await fetch('data/proof-of-work.xlsx');
      if (!response.ok) throw new Error(`Failed to load xlsx: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      proofOfWorkBook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheet = proofOfWorkBook.Sheets[proofOfWorkBook.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Skip header row, map to structured objects
      return raw.slice(1)
        .filter((row) => row[0] || row[3]) // must have start date or contents
        .map((row) => {
          const tagsRaw = String(row[2] || '').trim();
          const tags = tagsRaw.split('\n').map((t) => t.trim()).filter(Boolean);
          return {
            start: String(row[0] || '').replace(/\.$/, ''),
            end: row[1] ? String(row[1]).replace(/\.$/, '') : '',
            tags,
            primaryOrg: tags[0] || 'Other',
            contents: String(row[3] || ''),
            importance: row[4] === 'O',
            crypto: row[5] === 'O',
          };
        })
        .sort((a, b) => b.start.localeCompare(a.start)); // newest first
    } catch (error) {
      console.error('Error loading proof-of-work.xlsx:', error);
      return [];
    }
  };

  // Format period string
  const formatPeriod = (start, end) => {
    if (!start) return '';
    if (!end) return `${start} —`;
    if (start === end) return start;
    return `${start} — ${end}`;
  };

  // Render Experience Section
  const renderExperience = (config, entries) => {
    const tableContainer = document.getElementById('experienceTableContainer');
    const insightsContainer = document.getElementById('experienceInsights');
    if (!tableContainer || !entries?.length) return;

    // Derive filter categories from primary orgs
    const orgCounts = {};
    entries.forEach((e) => { orgCounts[e.primaryOrg] = (orgCounts[e.primaryOrg] || 0) + 1; });
    const sortedOrgs = Object.entries(orgCounts).sort((a, b) => b[1] - a[1]).map(([org]) => org);
    const categories = ['All', ...sortedOrgs];

    // Build filter buttons
    const filterButtons = categories.map((cat) => {
      const isAll = cat === 'All';
      const count = isAll ? entries.length : (orgCounts[cat] || 0);
      const activeClass = isAll
        ? 'bg-primary text-on-primary'
        : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/20 hover:border-primary/50';
      const label = isAll ? 'All Archive' : cat;
      return `<button class="exp-filter-btn px-3 py-1 text-xs font-label rounded-md transition-colors ${activeClass}" data-filter="${cat}">${label} <span class="opacity-60">(${count})</span></button>`;
    }).join('');

    // Build table rows
    const tableRows = entries.map((entry) => {
      const badgeClass = orgBadgeClasses[entry.primaryOrg] || defaultBadgeClass;
      const secondaryTags = entry.tags.slice(1);
      const secondaryChips = secondaryTags.map((tag) =>
        `<span class="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label text-[9px] tracking-wider">${tag}</span>`
      ).join('');
      const flags = [];
      if (entry.importance) flags.push('<span class="material-symbols-outlined text-primary text-sm" title="Key milestone">star</span>');
      if (entry.crypto) flags.push('<span class="material-symbols-outlined text-tertiary text-sm" title="Crypto-related">currency_bitcoin</span>');

      return `
        <tr class="hover:bg-surface-bright transition-colors group" data-org="${entry.primaryOrg}">
          <td class="px-6 py-5 font-label text-sm font-semibold text-primary whitespace-nowrap align-top">${formatPeriod(entry.start, entry.end)}</td>
          <td class="px-6 py-5 font-body text-base leading-relaxed align-top">${entry.contents}</td>
          <td class="px-6 py-5 align-top">
            <span class="px-2 py-1 rounded ${badgeClass} font-label text-[10px] uppercase font-bold tracking-wider">${entry.primaryOrg}</span>
            ${secondaryChips ? `<div class="flex flex-wrap gap-1 mt-1.5">${secondaryChips}</div>` : ''}
          </td>
          <td class="px-6 py-5 align-top">
            <div class="flex items-center gap-1">${flags.join('') || '<span class="text-on-surface-variant/30">—</span>'}</div>
          </td>
        </tr>`;
    }).join('');

    // Export CSV handler id
    const exportId = 'expExportCsv';

    tableContainer.innerHTML = `
      <div class="bg-surface-container-low rounded-xl overflow-hidden">
        <!-- Filter Bar -->
        <div class="px-8 py-6 border-b border-outline-variant/10 bg-surface-container-high/30 flex flex-wrap justify-between items-center gap-4">
          <div class="flex items-center gap-6 flex-wrap">
            <span class="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Filter by Organization:</span>
            <div class="flex gap-2 flex-wrap">${filterButtons}</div>
          </div>
          <div class="flex items-center gap-2 font-label text-xs text-on-surface-variant italic">
            <span class="material-symbols-outlined text-sm">info</span>
            Data source: proof-of-work.xlsx
          </div>
        </div>
        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-surface-container-high/50">
              <tr>
                <th class="px-6 py-5 font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/20 w-36">
                  <div class="flex items-center gap-2">Period <span class="material-symbols-outlined text-xs">unfold_more</span></div>
                </th>
                <th class="px-6 py-5 font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/20">Activity</th>
                <th class="px-6 py-5 font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/20 w-44">
                  <div class="flex items-center gap-2">Organization <span class="material-symbols-outlined text-xs">filter_list</span></div>
                </th>
                <th class="px-6 py-5 font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/20 w-20">Flags</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/10">${tableRows}</tbody>
          </table>
        </div>
        <!-- Table Footer -->
        <div class="px-8 py-4 bg-surface-container-high/20 border-t border-outline-variant/10 flex justify-between items-center">
          <p class="exp-entry-count font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Showing ${entries.length} of ${entries.length} entries</p>
          <div class="flex gap-4">
            <button id="${exportId}" class="text-xs font-headline font-bold text-primary hover:underline underline-offset-4">Export CSV</button>
          </div>
        </div>
      </div>`;

    // CSV export
    const exportBtn = document.getElementById(exportId);
    if (exportBtn && proofOfWorkBook) {
      exportBtn.addEventListener('click', () => {
        const sheet = proofOfWorkBook.Sheets[proofOfWorkBook.SheetNames[0]];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'proof-of-work.csv';
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // Insights section
    if (!insightsContainer) return;

    const uniqueOrgs = new Set(entries.map((e) => e.primaryOrg)).size;
    const importantCount = entries.filter((e) => e.importance).length;
    const cryptoCount = entries.filter((e) => e.crypto).length;
    const years = entries.map((e) => e.start.slice(0, 4)).filter(Boolean);
    const yearSpan = years.length ? `${Math.min(...years.map(Number))}–${Math.max(...years.map(Number))}` : '';

    insightsContainer.innerHTML = `
      <section class="mt-24 grid md:grid-cols-3 gap-12">
        <div class="md:col-span-1 border-l-2 border-primary pl-8 space-y-4">
          <h3 class="font-headline font-extrabold text-xl uppercase tracking-tighter">Evolution of Focus</h3>
          <p class="font-body text-on-surface-variant italic leading-relaxed">
            From POSTECH academics and early crypto research (2021) through ROKAF military service (2023–2024) to Web3 community building at PDAO, SuperteamKR, and technical writing — a trajectory toward systemic complexity and interdisciplinary contribution across ${yearSpan}.
          </p>
        </div>
        <div class="md:col-span-2 bg-surface-container-low p-10 rounded-xl relative overflow-hidden">
          <div class="relative z-10 space-y-6">
            <h4 class="font-headline font-bold text-2xl">Summary of Contributions</h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-8">
              <div>
                <span class="block text-3xl font-headline font-extrabold text-primary">${String(entries.length).padStart(2, '0')}</span>
                <span class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Total Activities</span>
              </div>
              <div>
                <span class="block text-3xl font-headline font-extrabold text-primary">${String(importantCount).padStart(2, '0')}</span>
                <span class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Key Milestones</span>
              </div>
              <div>
                <span class="block text-3xl font-headline font-extrabold text-primary">${String(cryptoCount).padStart(2, '0')}</span>
                <span class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Crypto Related</span>
              </div>
              <div>
                <span class="block text-3xl font-headline font-extrabold text-primary">${String(uniqueOrgs).padStart(2, '0')}</span>
                <span class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Organizations</span>
              </div>
            </div>
          </div>
          <div class="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
            <span class="material-symbols-outlined text-[200px]">architecture</span>
          </div>
        </div>
      </section>`;
  };

  // Experience Filter Logic
  const initExperienceFilters = () => {
    const container = document.getElementById('experienceTableContainer');
    if (!container) return;

    const buttons = container.querySelectorAll('.exp-filter-btn');
    const rows = container.querySelectorAll('tbody tr[data-org]');
    const countEl = container.querySelector('.exp-entry-count');
    const totalCount = rows.length;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        // Update button styles
        buttons.forEach((b) => {
          b.classList.remove('bg-primary', 'text-on-primary');
          b.classList.add('bg-surface-container-lowest', 'text-on-surface-variant', 'border', 'border-outline-variant/20');
        });
        btn.classList.remove('bg-surface-container-lowest', 'text-on-surface-variant', 'border', 'border-outline-variant/20');
        btn.classList.add('bg-primary', 'text-on-primary');

        // Filter rows
        let visibleCount = 0;
        rows.forEach((row) => {
          const show = filter === 'All' || row.dataset.org === filter;
          row.style.display = show ? '' : 'none';
          if (show) visibleCount++;
        });

        // Update count
        if (countEl) {
          countEl.textContent = `Showing ${visibleCount} of ${totalCount} entries`;
        }
      });
    });
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
      renderHomeExpertise(config);
      renderAboutAndSummary();
      renderArticles(config);
      initArticleFilters(config);
      const xlsxEntries = await loadProofOfWork();
      renderExperience(config, xlsxEntries);
      initExperienceFilters();
      renderCV(config);
    }
    initPdfModal();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
