(() => {
  // State
  const sections = () => Array.from(document.querySelectorAll('.section'));
  const navLinks = () => Array.from(document.querySelectorAll('.nav__link'));
  const mobileNavLinks = () => Array.from(document.querySelectorAll('.mobile-nav__link'));
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

    // Update mobile nav links
    mobileNavLinks().forEach((link) => {
      const isActive = link.dataset.section === targetSection.id;
      link.classList.toggle('text-primary', isActive);
      link.classList.toggle('text-on-surface', !isActive);
    });

    // Once Articles becomes visible, make sure Selected covers render even if
    // the IntersectionObserver was set up while the section was display:none.
    if (targetSection.id === 'articles') {
      requestAnimationFrame(() => renderPendingCovers());
    }
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

    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');

    const setMobileMenuState = (open) => {
      if (mobileMenu) mobileMenu.classList.toggle('hidden', !open);
      if (mobileMenuBtn) {
        mobileMenuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        mobileMenuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      }
    };
    const closeMobileMenu = () => setMobileMenuState(false);

    mobileMenuBtn?.addEventListener('click', () => {
      const isOpen = !!mobileMenu && !mobileMenu.classList.contains('hidden');
      setMobileMenuState(!isOpen);
    });

    mobileMenuBackdrop?.addEventListener('click', closeMobileMenu);

    mobileNavLinks().forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = link.dataset.section;
        if (!targetId) return;
        history.replaceState(null, '', `#${targetId}`);
        setActiveSection(targetId);
        closeMobileMenu();
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
      <div class="p-6 md:p-8 bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(45,55,72,0.04)] hover:shadow-[0_8px_32px_rgba(45,55,72,0.08)] transition-shadow flex flex-col items-center text-center gap-3">
        <span class="material-symbols-outlined text-primary text-4xl">${area.icon}</span>
        <h3 class="font-headline font-bold text-lg">${area.title}</h3>
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

  // --- Article display helpers ---------------------------------------------

  // Normalize the (mostly Korean) contribution string to a clean English label
  const ROLE_MAP = {
    '주 저자': 'Lead Author',
    '프로젝트 리더': 'Project Lead',
    'Research Assistant로 참여': 'Research Assistant',
    '데이터 수집 및 전처리': 'Data & Preprocessing',
    '데이터 처리 및 모델 구현, 일부 문서 작성': 'Data & Implementation',
    '리포트 코디네이팅, 일부 범위 리포트 작성/교열 및 편집': 'Coordinator',
    '리포트 코디네이팅, 전 범위 리포트 교열 및 편집': 'Coordinator',
  };
  const normalizeRole = (c) => {
    if (!c) return '';
    if (ROLE_MAP[c]) return ROLE_MAP[c];
    if (c.includes('주 저자')) return 'Lead Author';
    if (c.includes('코디네이팅')) return 'Coordinator';
    if (c.includes('리더')) return 'Project Lead';
    if (c.includes('Research Assistant')) return 'Research Assistant';
    if (c.includes('데이터')) return 'Contributor';
    return c;
  };
  // Collapse to three seniority tiers (for the role filter facet)
  const roleTier = (c) => {
    if (!c) return 'Contributor';
    if (c.includes('주 저자')) return 'Lead Author';
    if (c.includes('코디네이팅')) return 'Coordinator';
    return 'Contributor';
  };
  const roleColorClass = (c) => {
    const t = roleTier(c);
    return t === 'Lead Author' ? 'text-primary' : t === 'Coordinator' ? 'text-on-surface' : 'text-on-surface-variant';
  };
  // Category -> 3px spine accent color (the only per-category color; honors No-Line)
  const spineColorClass = (cat) =>
    cat === 'PDAO' ? 'bg-primary' : cat === 'Bithumb' ? 'bg-secondary' : cat === 'POSTECH' ? 'bg-tertiary' : 'bg-on-surface-variant/40';
  const fmtDate = (d) => (d ? d.replace('-', '.') : '');
  const reportHref = (report) =>
    report.type === 'url' ? (report.url || '#') : (report.filename ? 'data/reports/' + encodeURIComponent(report.filename) : '#');

  // --- Cover thumbnails (Selected cards only; lazy + cached) ----------------

  const coverCache = new Map(); // report.id -> dataURL

  const showTypographicCover = (report) => {
    const fb = document.querySelector(`[data-fallback-id="${report.id}"]`);
    if (!fb) return;
    const glyph = report.category === 'POSTECH' ? 'school' : report.category === 'Bithumb' ? 'monitoring' : 'hub';
    fb.classList.remove('animate-pulse');
    fb.innerHTML = `
      <div class="absolute inset-0 bg-surface-container-low overflow-hidden flex items-end p-5">
        <span class="material-symbols-outlined absolute -right-6 -bottom-8 text-[160px] text-on-surface-variant/[0.06] select-none">${glyph}</span>
        <h4 class="relative font-headline font-extrabold text-xl text-on-surface leading-tight line-clamp-4">${report.title}</h4>
      </div>`;
  };

  const paintCover = (canvasEl, report, dataUrl) => {
    const img = new Image();
    img.onload = () => {
      canvasEl.width = img.width;
      canvasEl.height = img.height;
      canvasEl.getContext('2d').drawImage(img, 0, 0);
      canvasEl.classList.remove('opacity-0');
      const fb = document.querySelector(`[data-fallback-id="${report.id}"]`);
      if (fb) fb.style.display = 'none';
    };
    img.src = dataUrl;
  };

  const renderCoverThumbnail = (canvasEl, report) => {
    if (!canvasEl) return;
    if (report.type === 'url' || !report.filename || typeof pdfjsLib === 'undefined') {
      showTypographicCover(report);
      return;
    }
    if (coverCache.has(report.id)) {
      paintCover(canvasEl, report, coverCache.get(report.id));
      return;
    }
    pdfjsLib.getDocument('data/reports/' + report.filename).promise
      .then((pdf) => pdf.getPage(1).then((page) => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const base = page.getViewport({ scale: 1 });
        const scale = (480 * dpr) / base.width;
        const viewport = page.getViewport({ scale });
        const off = document.createElement('canvas');
        off.width = viewport.width;
        off.height = viewport.height;
        return page.render({ canvasContext: off.getContext('2d'), viewport }).promise.then(() => {
          const dataUrl = off.toDataURL('image/jpeg', 0.85);
          coverCache.set(report.id, dataUrl);
          paintCover(canvasEl, report, dataUrl);
          pdf.destroy();
        });
      }))
      .catch((err) => {
        console.warn('Cover render failed for', report.id, err);
        showTypographicCover(report);
      });
  };

  // Holds the rendered Selected grid so we can force-render covers on demand
  let pendingCovers = null; // { grid, selected }

  const startCover = (c, selected) => {
    if (c.dataset.coverStarted) return; // render each canvas at most once
    c.dataset.coverStarted = '1';
    const r = selected.find((x) => x.id === c.dataset.coverId);
    if (r) renderCoverThumbnail(c, r);
  };

  const observeSelectedCovers = (grid, selected) => {
    pendingCovers = { grid, selected };
    const canvases = grid.querySelectorAll('canvas[data-cover-id]');
    if (!('IntersectionObserver' in window)) {
      canvases.forEach((c) => startCover(c, selected));
      return;
    }
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startCover(entry.target, selected);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '300px' });
    canvases.forEach((c) => obs.observe(c));
  };

  // Fallback: if the IntersectionObserver did not fire (e.g. section was
  // display:none when observed), force any not-yet-started covers to render.
  const renderPendingCovers = () => {
    if (!pendingCovers) return;
    pendingCovers.grid.querySelectorAll('canvas[data-cover-id]').forEach((c) => {
      startCover(c, pendingCovers.selected);
    });
  };

  // --- Selected Works (zone 1) ---------------------------------------------

  const renderSelectedCard = (report) => {
    const role = normalizeRole(report.contribution);
    const isUrl = report.type === 'url';
    return `
      <article class="group cursor-pointer bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(45,55,72,0.04)] hover:shadow-[0_8px_32px_rgba(45,55,72,0.08)] transition-shadow duration-300" data-report-id="${report.id}" data-report-type="${report.type || 'pdf'}">
        <div class="relative aspect-[3/4] bg-surface-container-low overflow-hidden">
          <canvas data-cover-id="${report.id}" class="w-full h-full object-cover object-top opacity-0 transition-all duration-500 group-hover:scale-[1.03]" aria-hidden="true"></canvas>
          <div class="cover-fallback absolute inset-0 flex items-center justify-center animate-pulse" data-fallback-id="${report.id}">
            <span class="material-symbols-outlined text-on-surface-variant/30 text-4xl">description</span>
          </div>
          <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-widest bg-white/70 backdrop-blur-md text-primary">${report.category}</span>
          <span class="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/70 backdrop-blur-md text-on-surface-variant text-[10px] font-label uppercase tracking-widest">
            <span class="material-symbols-outlined text-sm">${isUrl ? 'arrow_outward' : 'picture_as_pdf'}</span>${isUrl ? 'External' : 'PDF'}
          </span>
        </div>
        <div class="p-5">
          <p class="font-label text-xs text-on-surface-variant mb-2">${role}${report.date ? ' · ' + fmtDate(report.date) : ''}</p>
          <h3 class="font-headline font-bold text-lg text-on-surface leading-snug tracking-tight line-clamp-2 group-hover:text-primary transition-colors">${report.title}</h3>
          <p class="font-body text-sm text-on-surface-variant leading-relaxed line-clamp-2 mt-2">${report.description || ''}</p>
        </div>
      </article>`;
  };

  const renderSelected = (config) => {
    const wrap = document.getElementById('archiveSelectedWrap');
    const grid = document.getElementById('articlesSelected');
    if (!grid) return;
    const order = ['pdao-zkp-sp1', 'postech-coinone-pair-analysis', 'crypto-notes-1'];
    const selected = (config.reports || []).filter((r) => r.selected)
      .sort((a, b) => {
        const ia = order.indexOf(a.id); const ib = order.indexOf(b.id);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      });
    if (!selected.length) { if (wrap) wrap.style.display = 'none'; return; }
    grid.innerHTML = selected.map(renderSelectedCard).join('');
    grid.querySelectorAll('[data-report-id]').forEach((el) => {
      el.addEventListener('click', () => {
        const r = selected.find((x) => x.id === el.dataset.reportId);
        if (r) handleReportClick(r);
      });
    });
    observeSelectedCovers(grid, selected);
  };

  // --- The Ledger (zone 2) -------------------------------------------------

  const ledgerEmptyState = `
    <div class="py-16 text-center">
      <span class="material-symbols-outlined text-on-surface-variant/30 text-[64px] mb-4">search_off</span>
      <p class="font-headline font-bold text-on-surface-variant">No works match this filter.</p>
    </div>`;

  const renderLedgerRow = (report) => {
    const role = normalizeRole(report.contribution);
    const isUrl = report.type === 'url';
    const searchStr = [report.title, report.description, role, report.category]
      .filter(Boolean).join(' ').toLowerCase().replace(/"/g, '&quot;');
    return `
      <a class="ledger-row group grid grid-cols-[3px_1fr_auto] md:grid-cols-[3px_64px_1fr_auto] gap-x-3 md:gap-x-5 items-center py-5 rounded-lg px-3 -mx-3 hover:bg-surface-container-low transition-colors cursor-pointer"
         href="${reportHref(report)}"${isUrl ? ' target="_blank" rel="noopener noreferrer"' : ''}
         data-report-id="${report.id}" data-report-type="${report.type || 'pdf'}"
         data-category="${report.category}" data-type="${isUrl ? 'External' : 'PDF'}" data-role="${roleTier(report.contribution)}"
         data-search="${searchStr}">
        <span class="self-stretch w-[3px] rounded-full ${spineColorClass(report.category)}"></span>
        <span class="hidden md:block font-label text-xs text-on-surface-variant tabular-nums whitespace-nowrap">${fmtDate(report.date)}</span>
        <div class="min-w-0">
          <h4 class="font-headline font-semibold text-base md:text-lg text-on-surface leading-snug group-hover:text-primary transition-colors">${report.title}</h4>
          <p class="font-body text-sm text-on-surface-variant line-clamp-1 mt-0.5">
            <span class="font-semibold ${roleColorClass(report.contribution)}">${role}</span><span class="text-on-surface-variant/40"> · </span>${report.category}<span class="text-on-surface-variant/40"> · </span>${report.description || ''}
          </p>
        </div>
        <span class="shrink-0 inline-flex items-center gap-1 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70 group-hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-base">${isUrl ? 'arrow_outward' : 'picture_as_pdf'}</span><span class="hidden sm:inline">${isUrl ? 'External' : 'PDF'}</span>
        </span>
      </a>`;
  };

  // Render ALL reports once, grouped by year (filtering toggles visibility later)
  const renderLedger = (reports) => {
    const container = document.getElementById('articlesLedger');
    if (!container) return;
    if (!reports.length) { container.innerHTML = ledgerEmptyState; return; }

    const yearGroups = {};
    reports.forEach((r) => {
      const y = (r.date || '').slice(0, 4) || 'Undated';
      (yearGroups[y] = yearGroups[y] || []).push(r);
    });
    const years = Object.keys(yearGroups).sort((a, b) => b.localeCompare(a));

    container.innerHTML = years.map((y) => {
      const items = yearGroups[y];
      return `
        <div class="ledger-year-group" data-year="${y}">
          <div class="flex items-baseline gap-4 mb-4 mt-12 first:mt-0">
            <span class="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight tabular-nums">${y}</span>
            <span class="font-label text-on-surface-variant text-sm" data-year-count>${items.length} ${items.length === 1 ? 'work' : 'works'}</span>
            <div class="flex-1 h-px bg-outline-variant/20"></div>
          </div>
          <div>${items.map(renderLedgerRow).join('')}</div>
        </div>`;
    }).join('');

    // Click handling: PDFs open in the in-site modal; external links navigate.
    container.querySelectorAll('.ledger-row').forEach((el) => {
      el.addEventListener('click', (e) => {
        const report = reports.find((r) => r.id === el.dataset.reportId);
        if (!report) return;
        if (report.type === 'url') return; // let the anchor open the external link
        e.preventDefault();
        handleReportClick(report);
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

  // Initialize the Ledger faceted filters + search (cross-facet live counts)
  const initLedgerFacets = (config) => {
    const facetsEl = document.getElementById('articleFacets');
    const searchEl = document.getElementById('ledgerSearch');
    const countEl = document.getElementById('ledgerCount');
    const ledgerEl = document.getElementById('articlesLedger');
    const subtitleEl = document.getElementById('archiveSubtitle');
    if (!facetsEl || !ledgerEl || !config.reports) return;

    const reports = config.reports;
    const total = reports.length;
    const byId = new Map(reports.map((r) => [r.id, r]));
    const typeOf = (r) => (r.type === 'url' ? 'External' : 'PDF');

    // Precompute lowercase search haystack (title + desc + role + category)
    reports.forEach((r) => {
      r._search = [r.title, r.description, normalizeRole(r.contribution), r.category]
        .filter(Boolean).join(' ').toLowerCase();
    });

    // Live masthead subtitle
    if (subtitleEl) {
      const venues = new Set(reports.map((r) => r.category)).size;
      const years = reports.map((r) => (r.date || '').slice(0, 4)).filter(Boolean).sort();
      const span = years.length ? `${years[0]}–${years[years.length - 1]}` : '';
      subtitleEl.textContent = `${total} works across ${venues} venues${span ? ', ' + span : ''}.`;
    }

    const catValues = ['All', ...new Set(reports.map((r) => r.category))];
    const typeValues = ['PDF', 'External'];
    const roleValues = ['Lead Author', 'Coordinator', 'Contributor'];
    const stateF = { category: 'All', type: null, role: null, q: '' };

    // Does a report pass every active axis EXCEPT `except` (null = all axes)?
    const passes = (r, except) => {
      if (except !== 'category' && stateF.category !== 'All' && r.category !== stateF.category) return false;
      if (except !== 'type' && stateF.type && typeOf(r) !== stateF.type) return false;
      if (except !== 'role' && stateF.role && roleTier(r.contribution) !== stateF.role) return false;
      if (stateF.q && !(r._search || '').includes(stateF.q)) return false;
      return true;
    };

    const countFor = (axis, value) => reports.filter((r) => {
      if (!passes(r, axis)) return false;
      if (axis === 'category') return value === 'All' ? true : r.category === value;
      if (axis === 'type') return typeOf(r) === value;
      if (axis === 'role') return roleTier(r.contribution) === value;
      return true;
    }).length;

    const isActive = (axis, value) =>
      axis === 'category' ? stateF.category === value
        : axis === 'type' ? stateF.type === value
          : stateF.role === value;

    const pillHtml = (axis, value, withDot) => {
      const count = countFor(axis, value);
      const active = isActive(axis, value);
      const dead = count === 0 && !active;
      const dot = withDot ? `<span class="inline-block w-1.5 h-1.5 rounded-full ${spineColorClass(value)} mr-1.5 align-middle"></span>` : '';
      const cls = active ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high';
      const deadCls = dead ? ' opacity-40 pointer-events-none' : '';
      return `<button type="button" class="ledger-filter px-3.5 py-2 text-xs font-label font-semibold rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${cls}${deadCls}" data-axis="${axis}" data-value="${value}" aria-pressed="${active}"${dead ? ' aria-disabled="true" tabindex="-1"' : ''}>${dot}${value} <span class="opacity-60 tabular-nums">(${count})</span></button>`;
    };

    const group = (labelText, axis, values, dotForNonAll) =>
      `<div class="flex flex-wrap items-center gap-1.5 md:gap-2">
         <span class="font-label text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 mr-0.5">${labelText}</span>
         ${values.map((v) => pillHtml(axis, v, dotForNonAll && v !== 'All')).join('')}
       </div>`;

    const renderFacets = () => {
      facetsEl.innerHTML = [
        group('Venue', 'category', catValues, true),
        group('Type', 'type', typeValues, false),
        group('Role', 'role', roleValues, false),
      ].join('');
      facetsEl.querySelectorAll('.ledger-filter').forEach((btn) => {
        btn.addEventListener('click', () => {
          const axis = btn.dataset.axis;
          const value = btn.dataset.value;
          if (axis === 'category') stateF.category = value;
          else if (axis === 'type') stateF.type = stateF.type === value ? null : value;
          else if (axis === 'role') stateF.role = stateF.role === value ? null : value;
          renderFacets();
          applyFilters();
        });
      });
    };

    const applyFilters = () => {
      let visible = 0;
      ledgerEl.querySelectorAll('.ledger-row').forEach((row) => {
        const r = byId.get(row.dataset.reportId);
        const show = r ? passes(r, null) : false;
        row.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      ledgerEl.querySelectorAll('.ledger-year-group').forEach((g) => {
        const vis = g.querySelectorAll('.ledger-row:not([style*="display: none"])').length;
        g.style.display = vis ? '' : 'none';
        const sub = g.querySelector('[data-year-count]');
        if (sub) sub.textContent = `${vis} ${vis === 1 ? 'work' : 'works'}`;
      });
      if (countEl) countEl.textContent = `Showing ${visible} of ${total}`;

      let empty = ledgerEl.querySelector('[data-ledger-empty]');
      if (visible === 0) {
        if (!empty) {
          empty = document.createElement('div');
          empty.setAttribute('data-ledger-empty', '');
          empty.innerHTML = ledgerEmptyState;
          ledgerEl.appendChild(empty);
        }
        empty.style.display = '';
      } else if (empty) {
        empty.style.display = 'none';
      }
    };

    renderFacets();
    if (countEl) countEl.textContent = `Showing ${total} of ${total}`;

    if (searchEl) {
      let t = null;
      searchEl.placeholder = `Search ${total} works…`;
      searchEl.addEventListener('input', (e) => {
        clearTimeout(t);
        const v = e.target.value.trim().toLowerCase();
        t = setTimeout(() => { stateF.q = v; renderFacets(); applyFilters(); }, 150);
      });
    }
  };

  // --- Learning / Study Notes (simple link collection of my own materials) -

  const levelGlyph = (level) =>
    level === 'foundational' ? 'school'
      : level === 'repo' ? 'code'
        : level === 'course' ? 'cast_for_education'
          : level === 'book' ? 'menu_book'
            : level === 'note' ? 'edit_note'
              : 'article';
  const levelTag = (item) =>
    item.level === 'repo' ? 'Repo' : (item.type === 'url' ? 'Link' : 'PDF');

  const renderLearningRow = (item) => {
    const isUrl = item.type === 'url';
    const href = isUrl ? (item.url || '#') : (item.filename ? 'data/reports/' + encodeURIComponent(item.filename) : '#');
    const meta = [item.source, item.note].filter(Boolean).join(' · ');
    return `
      <a class="learning-row group grid grid-cols-[3px_2rem_1fr_auto] md:grid-cols-[3px_2.5rem_1fr_auto] gap-x-3 md:gap-x-5 items-center py-5 rounded-lg px-3 -mx-3 hover:bg-surface-container-low transition-colors cursor-pointer"
         href="${href}"${isUrl ? ' target="_blank" rel="noopener noreferrer"' : ''}>
        <span class="self-stretch w-[3px] rounded-full bg-primary/40"></span>
        <span class="flex justify-center text-on-surface-variant/60 group-hover:text-primary transition-colors"><span class="material-symbols-outlined text-xl">${levelGlyph(item.level)}</span></span>
        <div class="min-w-0">
          <h4 class="font-headline font-semibold text-base md:text-lg text-on-surface leading-snug group-hover:text-primary transition-colors">${item.title}</h4>
          ${meta ? `<p class="font-body text-sm text-on-surface-variant line-clamp-1 mt-0.5">${meta}</p>` : ''}
        </div>
        <span class="shrink-0 inline-flex items-center gap-1 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70 group-hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-base">${isUrl ? 'arrow_outward' : 'picture_as_pdf'}</span><span class="hidden sm:inline">${levelTag(item)}</span>
        </span>
      </a>`;
  };

  // Simple flat list; shows a TBD state until materials are added.
  const renderLearning = (config) => {
    const list = document.getElementById('learningList');
    if (!list) return;
    const items = config.learning || [];
    if (!items.length) {
      list.innerHTML = `
        <div class="py-20 md:py-28 text-center bg-surface-container-low rounded-2xl">
          <span class="material-symbols-outlined text-on-surface-variant/30 text-[56px] mb-4">edit_note</span>
          <p class="font-headline font-bold text-on-surface text-lg mb-1">준비 중입니다 (TBD)</p>
          <p class="font-body text-sm text-on-surface-variant max-w-md mx-auto">제가 직접 작성한 학습 노트와 가이드를 이곳에 차근차근 채워 나갈 예정입니다.</p>
        </div>`;
      return;
    }
    list.innerHTML = `<div class="-my-1">${items.map(renderLearningRow).join('')}</div>`;
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
      const pdfScale = window.innerWidth < 768 ? 1.0 : 1.5;
      const viewport = page.getViewport({ scale: pdfScale });
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
    const heroIdentity = document.getElementById('heroIdentity');
    if (heroIdentity && config.profile?.heroIdentity) {
      heroIdentity.textContent = config.profile.heroIdentity;
    }
    // Hero CTA: surface the volume of work (live count)
    const researchCta = document.getElementById('heroResearchCta');
    const reportCount = (config.reports || []).length;
    if (researchCta && reportCount) {
      researchCta.textContent = `Explore ${reportCount} Works`;
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
            Seungjun <span class="text-primary">Oh</span>
          </h1>
          ${cv.subtitle ? `<p class="mt-2 font-body text-sm text-on-surface-variant">${cv.subtitle}</p>` : ''}
        </div>
        <div class="flex-shrink-0 relative">
          <button id="cvDownloadBtn" class="group flex items-center gap-2 bg-primary px-6 py-3 rounded-md text-on-primary font-headline font-bold text-sm transition-all hover:bg-primary-dim">
            <span class="material-symbols-outlined text-lg">download</span>
            DOWNLOAD PDF
          </button>
          <div id="cvDownloadDropdown" class="hidden absolute right-0 mt-2 bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(45,55,72,0.08)] py-2 min-w-[200px] z-10">
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
          ? `<a href="${edu.url}" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2 hover:text-primary-dim transition-colors font-headline font-bold text-sm">${edu.institution}</a>`
          : `<span class="font-headline font-bold text-sm text-on-surface">${edu.institution}</span>`;
        return `
          <div>
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-0">
              ${name}
              <span class="font-label text-sm text-on-surface-variant">${edu.period}</span>
            </div>
            <p class="font-body text-sm font-semibold text-on-surface">${edu.degree}</p>
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
          ? `<a href="${r.url}" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2 hover:text-primary-dim transition-colors">${r.lab}</a>`
          : r.lab;
        return `
          <div>
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-0">
              <span class="font-headline font-bold text-sm">${labName} <span class="font-normal text-on-surface-variant">(Advisor: ${r.advisor})</span></span>
              <span class="font-label text-sm text-on-surface-variant sm:shrink-0 sm:ml-4">${r.period}</span>
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
          ? `<a href="${exp.url}" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2 hover:text-primary-dim transition-colors">${exp.organization}</a>`
          : `<span>${exp.organization}</span>`;
        const highlights = (exp.highlights || []).map((h) =>
          `<li>${h}</li>`
        ).join('');

        return `
          <div>
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-0">
              <span class="font-headline font-bold text-sm">${orgName}</span>
              <span class="font-label text-sm text-on-surface-variant sm:shrink-0 sm:ml-4">${exp.period}</span>
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
          ? `<a href="${pub.url}" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2 hover:text-primary-dim transition-colors">${pub.title}</a>`
          : pub.title;
        return `
          <div>
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-0">
              <span class="font-headline font-bold text-sm uppercase">${title}</span>
              <span class="font-label text-sm text-on-surface-variant sm:shrink-0 sm:ml-4">ISBN: ${pub.isbn}</span>
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
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-0">
              <span class="font-headline font-bold text-sm">${proj.title}</span>
              <span class="font-label text-sm text-on-surface-variant sm:shrink-0 sm:ml-4">${proj.year}</span>
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
      const items = cv.events.map((evt) => {
        const linkBadge = evt.link
          ? ` <a href="${evt.link}" target="_blank" rel="noopener noreferrer" class="font-label text-xs text-primary hover:underline inline-flex items-center gap-0.5 align-middle" aria-label="Event link"><span class="material-symbols-outlined" style="font-size:14px;line-height:1;">link</span></a>`
          : '';
        return `
          <div class="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-1 sm:py-0.5">
            <span class="font-label text-sm text-on-surface-variant shrink-0 w-10">${evt.year}</span>
            <span class="font-headline font-bold text-sm shrink-0">${evt.role}</span>
            <span class="font-body text-sm text-on-surface-variant">${evt.title}${linkBadge}</span>
          </div>
        `;
      }).join('');
      eventsEl.innerHTML = cvSection('Events', `<div class="space-y-0.5">${items}</div>`);
    }

    // --- Awards ---
    const awardsEl = document.getElementById('cvAwards');
    if (awardsEl && cv.awards?.length) {
      const items = cv.awards.map((award) => {
        const valueBadge = award.value
          ? ` <span class="font-label text-xs font-bold text-primary">(${award.value})</span>`
          : '';
        const linkBadge = award.link
          ? ` <a href="${award.link}" target="_blank" rel="noopener noreferrer" class="font-label text-xs text-primary hover:underline inline-flex items-center gap-0.5" aria-label="Related article"><span class="material-symbols-outlined" style="font-size:14px;line-height:1;">link</span></a>`
          : '';
        return `
          <div class="flex items-baseline gap-4 py-0.5">
            <span class="font-label text-sm text-on-surface-variant shrink-0 w-28">${award.date}</span>
            <div class="flex-1">
              <span class="font-headline font-bold text-sm">${award.title}</span>${valueBadge}${linkBadge}
              <span class="font-label text-sm text-on-surface-variant ml-2">${award.issuer}</span>
            </div>
          </div>
        `;
      }).join('');
      awardsEl.innerHTML = cvSection('Awards & Scholarships', `<div class="space-y-0.5">${items}</div>`);
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
          ? `<a href="${ext.url}" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2 hover:text-primary-dim transition-colors">${ext.organization}</a>`
          : ext.organization;
        const highlights = (ext.highlights || []).map((h) =>
          `<li>${h}</li>`
        ).join('');

        return `
          <div>
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-0">
              <span class="font-headline font-bold text-sm">${orgName}</span>
              <span class="font-label text-sm text-on-surface-variant sm:shrink-0 sm:ml-4">${ext.period}</span>
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
        <div class="bg-surface-container-low p-6 md:p-8 rounded-xl flex flex-col justify-between h-40 md:h-48">
          <span class="material-symbols-outlined text-primary text-3xl">interests</span>
          <div>
            <h4 class="font-headline font-bold text-on-surface">Research Interests</h4>
            <p class="font-label text-xs text-on-surface-variant uppercase tracking-wider mt-1">${interests}</p>
          </div>
        </div>
        <div class="bg-primary text-on-primary p-6 md:p-8 rounded-xl flex flex-col justify-between h-40 md:h-48">
          <span class="material-symbols-outlined text-on-primary text-3xl" style="font-variation-settings: 'FILL' 1;">code</span>
          <div>
            <h4 class="font-headline font-bold">Technical Skills</h4>
            <p class="font-label text-xs opacity-70 uppercase tracking-wider mt-1">${technical}</p>
          </div>
        </div>
      </div>
    `;
  };

  // Badge color map for organizations (pill style)
  const orgBadgeClasses = {
    POSTECH: 'bg-primary/10 text-primary',
    ROKAF: 'bg-secondary-container text-on-secondary-container',
    PDAO: 'bg-secondary-fixed text-on-secondary-fixed',
    Bithumb: 'bg-tertiary-container text-on-tertiary-container',
    Certification: 'bg-surface-container-highest text-on-surface-variant',
    NinjaLabsKR: 'bg-primary-fixed text-on-primary-fixed',
    SuperteamKR: 'bg-tertiary-fixed text-on-tertiary-fixed',
    Crypto: 'bg-primary-fixed-dim text-on-primary-fixed',
    'B-Harvest': 'bg-tertiary-fixed-dim text-on-tertiary-fixed',
    'Base Chain': 'bg-secondary-fixed-dim text-on-secondary-fixed',
    'BNB Chain': 'bg-primary-container text-on-primary-container',
  };
  const defaultBadgeClass = 'bg-surface-container-high text-on-surface-variant';

  // Proof-of-work entries (loaded from JSON)
  let proofOfWorkEntries = null;
  const loadProofOfWork = async () => {
    try {
      const response = await fetch('data/proof-of-work.json');
      if (!response.ok) throw new Error(`Failed to load proof-of-work.json: ${response.status}`);
      const entries = await response.json();
      return entries.map((e) => ({
        ...e,
        primaryOrg: e.tags[0] || 'Other',
      })).sort((a, b) => b.start.localeCompare(a.start));
    } catch (error) {
      console.error('Error loading proof-of-work.json:', error);
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

  // Derive categories for an experience entry
  const deriveCategories = (entry) => {
    const cats = [];
    if (entry.crypto) cats.push('Cryptocurrency');
    if (entry.tags.includes('Blockchain')) cats.push('Blockchain');
    if (entry.tags.includes('Finance')) cats.push('Finance');
    if (entry.tags.includes('Engineering')) cats.push('Engineering');
    if (cats.length === 0) cats.push('Other');
    return cats;
  };

  // Render Experience Section as Timeline
  const renderExperience = (config, entries) => {
    const tableContainer = document.getElementById('experienceTableContainer');
    const insightsContainer = document.getElementById('experienceInsights');
    if (!tableContainer || !entries?.length) return;

    // Add derived categories to each entry
    entries.forEach((e) => { e.categories = deriveCategories(e); });

    // Derive category filter counts
    const catCounts = {};
    entries.forEach((e) => {
      e.categories.forEach((c) => { catCounts[c] = (catCounts[c] || 0) + 1; });
    });

    // Count important entries
    const importanceCount = entries.filter((e) => e.importance).length;

    // Fixed keyword filter buttons: Key Milestones, Cryptocurrency, Blockchain, Finance, Engineering
    const keywordOrder = ['Cryptocurrency', 'Blockchain', 'Finance', 'Engineering'];
    const keywordButtons = [
      `<button class="exp-kw-btn px-4 py-2 text-xs font-label font-semibold rounded-full transition-colors bg-primary text-on-primary" data-filter="All">전체 보기 <span class="opacity-60">(${entries.length})</span></button>`,
      `<button class="exp-kw-btn px-4 py-2 text-xs font-label font-semibold rounded-full transition-colors bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high" data-filter="Importance">⭐ Key Milestones <span class="opacity-60">(${importanceCount})</span></button>`,
      ...keywordOrder.filter((k) => catCounts[k]).map((kw) =>
        `<button class="exp-kw-btn px-4 py-2 text-xs font-label font-semibold rounded-full transition-colors bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high" data-filter="${kw}">${kw} <span class="opacity-60">(${catCounts[kw]})</span></button>`
      ),
    ].join('');

    // Group entries by start year
    const yearGroups = {};
    entries.forEach((e) => {
      const year = e.start.slice(0, 4) || 'Unknown';
      if (!yearGroups[year]) yearGroups[year] = [];
      yearGroups[year].push(e);
    });
    const sortedYears = Object.keys(yearGroups).sort((a, b) => b.localeCompare(a));

    // Build timeline
    const timelineHTML = sortedYears.map((year) => {
      const yearEntries = yearGroups[year];
      const entriesHTML = yearEntries.map((entry) => {
        // Node size based on importance
        const nodeClass = entry.importance
          ? 'w-4 h-4 rounded-full bg-primary ring-2 ring-primary/10 shadow-sm shadow-primary/30'
          : 'w-2.5 h-2.5 rounded-full bg-on-surface-variant/30';

        const titleSize = entry.importance ? 'text-base font-bold' : 'text-sm font-normal';

        // All tags inline (unified style)
        const tagStyle = 'px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label text-[10px] tracking-wide';
        const allTags = [
          ...entry.tags.map((tag) => `<span class="${tagStyle}">${tag}</span>`),
          ...(entry.crypto ? [`<span class="${tagStyle}">Cryptocurrency</span>`] : []),
        ].join('');

        const searchText = [entry.contents, ...entry.tags, formatPeriod(entry.start, entry.end)].join(' ').toLowerCase();
        return `
          <div class="timeline-entry flex gap-4 group" data-org="${entry.primaryOrg}" data-categories="${entry.categories.join(',')}" data-importance="${entry.importance ? '1' : '0'}" data-search="${searchText.replace(/"/g, '&quot;')}">
            <!-- Dot + Line column (fixed width for consistent alignment) -->
            <div class="flex flex-col items-center shrink-0 w-4">
              <div class="mt-[6px] ${nodeClass} shrink-0 transition-transform group-hover:scale-125"></div>
              <div class="w-0.5 flex-1 bg-outline-variant/20 rounded-full"></div>
            </div>
            <!-- Content -->
            <div class="flex-1 min-w-0 pb-3">
              <p class="font-headline ${titleSize} text-on-surface leading-snug mb-1">${entry.contents}</p>
              <div class="flex flex-wrap items-center gap-1">
                <span class="font-label text-[10px] text-on-surface-variant/70 font-medium mr-1">${formatPeriod(entry.start, entry.end)}</span>
                ${allTags}
              </div>
            </div>
          </div>`;
      }).join('');

      return `
        <div class="timeline-year-group" data-year="${year}">
          <!-- Year Header -->
          <div class="flex items-center gap-4 mb-5 mt-3">
            <span class="text-2xl md:text-3xl font-headline font-extrabold text-on-surface tracking-tight">${year}</span>
            <div class="flex-1 h-px bg-outline-variant/20"></div>
          </div>
          <!-- Timeline Entries -->
          <div class="ml-2 md:ml-4">
            ${entriesHTML}
          </div>
        </div>`;
    }).join('');

    // Export CSV handler id
    const exportId = 'expExportCsv';

    tableContainer.innerHTML = `
      <!-- Filter Bar: Keywords + Search -->
      <div class="mb-6 space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <span class="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mr-1">Keyword:</span>
          ${keywordButtons}
        </div>
        <div class="relative">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xl">search</span>
          <input id="expSearchInput" type="text" placeholder="Search experiences..." class="w-full pl-12 pr-4 py-3 bg-surface-container-low rounded-lg font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
        </div>
      </div>

      <!-- Timeline -->
      <div class="timeline-container">
        ${timelineHTML}
      </div>

      <!-- Footer -->
      <div class="mt-8 flex justify-between items-center">
        <p class="exp-entry-count font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Showing ${entries.length} of ${entries.length} entries</p>
        <button id="${exportId}" class="text-xs font-headline font-bold text-primary hover:underline underline-offset-4">Export CSV</button>
      </div>`;

    // CSV export
    const exportBtn = document.getElementById(exportId);
    if (exportBtn && proofOfWorkEntries) {
      exportBtn.addEventListener('click', () => {
        const header = 'Start,End,Tags,Contents,Importance,Crypto';
        const rows = proofOfWorkEntries.map((e) => {
          const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
          return [escape(e.start), escape(e.end), escape(e.tags.join('; ')), escape(e.contents), e.importance ? 'O' : '', e.crypto ? 'O' : ''].join(',');
        });
        const csv = [header, ...rows].join('\n');
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
      <section class="mt-16 md:mt-24 grid md:grid-cols-3 gap-8 md:gap-12">
        <div class="md:col-span-1 border-l-2 border-primary pl-6 md:pl-8 space-y-4">
          <h3 class="font-headline font-extrabold text-xl uppercase tracking-tighter">Evolution of Focus</h3>
          <p class="font-body text-on-surface-variant leading-relaxed">
            From POSTECH academics and early crypto research (2021) through ROKAF military service (2023–2024) to Web3 community building at PDAO, SuperteamKR, and technical writing — a trajectory toward systemic complexity and interdisciplinary contribution across ${yearSpan}.
          </p>
        </div>
        <div class="md:col-span-2 bg-surface-container-low p-6 md:p-10 rounded-xl relative overflow-hidden">
          <div class="relative z-10 space-y-6">
            <h4 class="font-headline font-bold text-xl md:text-2xl">Summary of Contributions</h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8">
              <div>
                <span class="block text-2xl md:text-3xl font-headline font-extrabold text-primary">${String(entries.length).padStart(2, '0')}</span>
                <span class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Total Activities</span>
              </div>
              <div>
                <span class="block text-2xl md:text-3xl font-headline font-extrabold text-primary">${String(importantCount).padStart(2, '0')}</span>
                <span class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Key Milestones</span>
              </div>
              <div>
                <span class="block text-2xl md:text-3xl font-headline font-extrabold text-primary">${String(cryptoCount).padStart(2, '0')}</span>
                <span class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Crypto Related</span>
              </div>
              <div>
                <span class="block text-2xl md:text-3xl font-headline font-extrabold text-primary">${String(uniqueOrgs).padStart(2, '0')}</span>
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

  // Experience Filter Logic (Timeline version with keyword filters + search)
  const initExperienceFilters = () => {
    const container = document.getElementById('experienceTableContainer');
    if (!container) return;

    const kwButtons = container.querySelectorAll('.exp-kw-btn');
    const searchInput = container.querySelector('#expSearchInput');
    const timelineEntries = container.querySelectorAll('.timeline-entry');
    const yearGroups = container.querySelectorAll('.timeline-year-group');
    const countEl = container.querySelector('.exp-entry-count');
    const totalCount = timelineEntries.length;

    let activeKw = 'All';
    let searchQuery = '';

    const applyFilters = () => {
      let visibleCount = 0;

      timelineEntries.forEach((entry) => {
        const entryCats = entry.dataset.categories.split(',');
        const matchKw = activeKw === 'All'
          ? true
          : activeKw === 'Importance'
            ? entry.dataset.importance === '1'
            : entryCats.includes(activeKw);
        const matchSearch = !searchQuery || entry.dataset.search.includes(searchQuery);
        const show = matchKw && matchSearch;
        entry.style.display = show ? '' : 'none';
        if (show) visibleCount++;
      });

      // Hide year groups with no visible entries
      yearGroups.forEach((group) => {
        const visibleEntries = group.querySelectorAll('.timeline-entry:not([style*="display: none"])');
        group.style.display = visibleEntries.length > 0 ? '' : 'none';
      });

      if (countEl) {
        countEl.textContent = `Showing ${visibleCount} of ${totalCount} entries`;
      }
    };

    const updateButtonStyles = (buttons, activeValue) => {
      buttons.forEach((btn) => {
        if (btn.dataset.filter === activeValue) {
          btn.classList.remove('bg-surface-container-low', 'text-on-surface-variant');
          btn.classList.add('bg-primary', 'text-on-primary');
        } else {
          btn.classList.remove('bg-primary', 'text-on-primary');
          btn.classList.add('bg-surface-container-low', 'text-on-surface-variant');
        }
      });
    };

    kwButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        activeKw = btn.dataset.filter;
        updateButtonStyles(kwButtons, activeKw);
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        applyFilters();
      });
    }
  };

  // Initialize
  const init = async () => {
    // Set PDF.js worker source
    if (typeof pdfjsLib !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    setYear();
    initNavigation();

    const config = await loadPortfolioConfig();
    if (config) {
      renderTagline(config);
      renderFocusAreas(config);
      renderAboutAndSummary();
      renderSelected(config);
      renderLedger(getSortedReports(config));
      initLedgerFacets(config);
      renderLearning(config);
      proofOfWorkEntries = await loadProofOfWork();
      renderExperience(config, proofOfWorkEntries);
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
