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
      renderCaseStudies(config);
      const xlsxEntries = await loadProofOfWork();
      renderExperience(config, xlsxEntries);
      initExperienceFilters();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
