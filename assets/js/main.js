(() => {
  const sections = Array.from(document.querySelectorAll('.section'));
  const navLinks = Array.from(document.querySelectorAll('.nav__link'));
  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');
  const currentYearEl = document.getElementById('currentYear');

  const markdownSources = [
    { url: 'summary.md', targetId: 'summaryContent' },
    { url: 'files/readme.md', targetId: 'cvContent' }
  ];

  let journeyData = [];
  let filteredJourneyData = [];
  let sortState = { key: 'startDate', direction: 'desc' };

  const journeyTableBody = document.getElementById('journeyTableBody');
  const journeySearchInput = document.getElementById('journeySearch');
  const journeyHeaders = Array.from(document.querySelectorAll('.journey-table th'));

  const setYear = () => {
    if (currentYearEl) {
      currentYearEl.textContent = String(new Date().getFullYear());
    }
  };

  const tryLoadProfilePhoto = () => {
    const photoEl = document.querySelector('.profile-photo');
    if (!photoEl) return;
    const imageSrc = photoEl.dataset.src;
    if (!imageSrc) return;

    const img = new Image();
    img.onload = () => {
      photoEl.style.backgroundImage = `url(${imageSrc})`;
      photoEl.classList.add('profile-photo--loaded');
    };
    img.onerror = () => {
      photoEl.classList.remove('profile-photo--loaded');
    };
    img.src = imageSrc;
  };

  const toggleNav = (forceState) => {
    if (!navToggle || !siteNav) return;
    const expanded = typeof forceState === 'boolean' ? forceState : navToggle.getAttribute('aria-expanded') !== 'true';
    navToggle.setAttribute('aria-expanded', String(expanded));
    siteNav.classList.toggle('site-nav--open', expanded);
  };

  const setActiveSection = (sectionId, { scrollIntoView = false } = {}) => {
    const targetSection = sections.find((section) => section.id === sectionId) || sections[0];
    if (!targetSection) return;

    sections.forEach((section) => section.classList.toggle('section--active', section === targetSection));
    navLinks.forEach((link) => {
      const isActive = link.dataset.section === targetSection.id;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    if (scrollIntoView) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (siteNav?.classList.contains('site-nav--open')) {
      toggleNav(false);
    }
  };

  const initNavigation = () => {
    navLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = link.dataset.section;
        if (!targetId) return;
        history.replaceState(null, '', `#${targetId}`);
        setActiveSection(targetId, { scrollIntoView: true });
      });
    });

    navToggle?.addEventListener('click', () => toggleNav());

    window.addEventListener('hashchange', () => {
      const sectionId = window.location.hash.replace('#', '') || 'home';
      setActiveSection(sectionId, { scrollIntoView: false });
    });

    const initialSectionId = window.location.hash.replace('#', '') || 'home';
    setActiveSection(initialSectionId, { scrollIntoView: false });
  };

  const renderMarkdown = (markdown, targetEl) => {
    if (!targetEl) return;
    const html = DOMPurify.sanitize(marked.parse(markdown));
    targetEl.innerHTML = html;
  };

  const loadMarkdown = async () => {
    marked.setOptions({ breaks: true, gfm: true });

    await Promise.all(
      markdownSources.map(async ({ url, targetId }) => {
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Response not ok (${response.status})`);
          }
          const markdown = await response.text();
          renderMarkdown(markdown, targetEl);
        } catch (error) {
          targetEl.innerHTML = `<p class="error-message">콘텐츠를 불러오지 못했습니다. 파일 위치를 확인해주세요.</p>`;
          console.error(`Failed to load markdown from ${url}`, error);
        }
      })
    );
  };

  const parseDateValue = (value) => {
    if (!value) return null;
    if (value.toLowerCase() === 'present') return new Date();
    const parsed = new Date(value);
    return Number.isNaN(parsed.valueOf()) ? null : parsed;
  };

  const getComparableValue = (item, key) => {
    switch (key) {
      case 'startDate':
        return parseDateValue(item.startDate) ?? new Date(0);
      case 'endDate':
        return parseDateValue(item.endDate) ?? new Date(0);
      case 'tags':
        return (item.tags || []).join(', ').toLowerCase();
      case 'organizations':
        return (item.organizations || []).join(', ').toLowerCase();
      case 'activity':
        return (item.activity || '').toLowerCase();
      case 'notes':
        return (item.notes || '').toLowerCase();
      default:
        return '';
    }
  };

  const formatDate = (value) => {
    if (!value) return '';
    if (value.toLowerCase() === 'present') return 'Present';
    const date = parseDateValue(value);
    if (!date) return value;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const createBadge = (text) => {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = text;
    return badge;
  };

  const renderJourneyTable = (data) => {
    if (!journeyTableBody) return;
    journeyTableBody.replaceChildren();

    if (!data.length) {
      const emptyRow = document.createElement('tr');
      const emptyCell = document.createElement('td');
      emptyCell.colSpan = 6;
      emptyCell.className = 'journey-table__empty';
      emptyCell.textContent = '검색 결과가 없습니다.';
      emptyRow.appendChild(emptyCell);
      journeyTableBody.append(emptyRow);
      return;
    }

    const fragment = document.createDocumentFragment();
    data.forEach((item) => {
      const row = document.createElement('tr');

      const startDateCell = document.createElement('td');
      startDateCell.textContent = formatDate(item.startDate);

      const endDateCell = document.createElement('td');
      endDateCell.textContent = item.endDate ? formatDate(item.endDate) : '';

      const tagCell = document.createElement('td');
      (item.tags || []).forEach((tag) => tagCell.appendChild(createBadge(tag)));

      const orgCell = document.createElement('td');
      (item.organizations || []).forEach((org) => orgCell.appendChild(createBadge(org)));

      const activityCell = document.createElement('td');
      activityCell.textContent = item.activity || '';

      const notesCell = document.createElement('td');
      notesCell.textContent = item.notes || '';

      row.append(startDateCell, endDateCell, tagCell, orgCell, activityCell, notesCell);
      fragment.appendChild(row);
    });

    journeyTableBody.appendChild(fragment);
  };

  const applySort = (data, key = sortState.key, direction = sortState.direction) => {
    const sorted = data.slice().sort((a, b) => {
      const aValue = getComparableValue(a, key);
      const bValue = getComparableValue(b, key);

      if (aValue instanceof Date && bValue instanceof Date) {
        const result = aValue - bValue;
        return direction === 'asc' ? result : -result;
      }

      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      return 0;
    });

    sortState = { key, direction };
    journeyHeaders.forEach((header) => {
      const headerKey = header.dataset.sortKey;
      if (headerKey === key) {
        header.setAttribute('aria-sort', direction === 'asc' ? 'ascending' : 'descending');
        header.dataset.sortDirection = direction;
      } else {
        header.removeAttribute('aria-sort');
        delete header.dataset.sortDirection;
      }
    });

    return sorted;
  };

  const handleSortClick = (event) => {
    const header = event.currentTarget;
    const key = header.dataset.sortKey;
    if (!key) return;

    const nextDirection = header.dataset.sortDirection === 'asc' ? 'desc' : 'asc';
    const dataToSort = filteredJourneyData.length ? filteredJourneyData : journeyData;
    const sorted = applySort(dataToSort, key, nextDirection);
    if (filteredJourneyData.length) {
      filteredJourneyData = sorted;
    } else {
      journeyData = sorted;
    }
    renderJourneyTable(sorted);
  };

  const applySearchFilter = (keyword) => {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) {
      filteredJourneyData = [];
      const sorted = applySort(journeyData);
      journeyData = sorted;
      renderJourneyTable(journeyData);
      return;
    }

    const filtered = journeyData.filter((item) => {
      const haystack = [
        item.startDate,
        item.endDate,
        item.activity,
        item.notes,
        ...(item.tags || []),
        ...(item.organizations || [])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(trimmed);
    });

    filteredJourneyData = applySort(filtered);
    renderJourneyTable(filteredJourneyData);
  };

  const loadJourneyData = async () => {
    if (!journeyTableBody) return;

    try {
      const response = await fetch('data/journey-data.json');
      if (!response.ok) {
        throw new Error(`Response not ok (${response.status})`);
      }
      const data = await response.json();
      journeyData = Array.isArray(data) ? data : [];
      journeyData = applySort(journeyData);
      renderJourneyTable(journeyData);
    } catch (error) {
      console.error('Failed to load journey data', error);
      journeyTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="journey-table__error">
            데이터를 불러오는 중 문제가 발생했습니다. data/journey-data.json 파일을 확인해주세요.
          </td>
        </tr>
      `;
    }
  };

  const initJourneyInteractions = () => {
    journeyHeaders.forEach((header) => header.addEventListener('click', handleSortClick));
    journeySearchInput?.addEventListener('input', (event) => {
      applySearchFilter(event.target.value);
    });
  };

  const init = () => {
    setYear();
    tryLoadProfilePhoto();
    initNavigation();
    loadMarkdown();
    initJourneyInteractions();
    loadJourneyData();
  };

  document.addEventListener('DOMContentLoaded', init);
})();
