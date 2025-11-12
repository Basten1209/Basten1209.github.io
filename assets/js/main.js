(() => {
  // State
  const sections = Array.from(document.querySelectorAll('.section'));
  const navLinks = Array.from(document.querySelectorAll('.nav__link'));
  const currentYearEl = document.getElementById('currentYear');

  // Set current year
  const setYear = () => {
    if (currentYearEl) {
      currentYearEl.textContent = String(new Date().getFullYear());
    }
  };

  // Load profile photo
  const loadProfilePhoto = () => {
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

  // Navigation
  const setActiveSection = (sectionId) => {
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
  };

  const initNavigation = () => {
    navLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = link.dataset.section;
        if (!targetId) return;
        history.replaceState(null, '', `#${targetId}`);
        setActiveSection(targetId);
      });
    });

    window.addEventListener('hashchange', () => {
      const sectionId = window.location.hash.replace('#', '') || 'home';
      setActiveSection(sectionId);
    });

    const initialSectionId = window.location.hash.replace('#', '') || 'home';
    setActiveSection(initialSectionId);
  };

  // Load CV markdown
  const loadCV = async () => {
    const cvContent = document.getElementById('cvContent');
    if (!cvContent) return;

    try {
      marked.setOptions({ breaks: true, gfm: true });
      const response = await fetch('data/cv.md');
      if (!response.ok) {
        throw new Error(`Failed to load CV: ${response.status}`);
      }
      const markdown = await response.text();
      const html = DOMPurify.sanitize(marked.parse(markdown));
      cvContent.innerHTML = html;
    } catch (error) {
      console.error('Error loading CV:', error);
      cvContent.innerHTML = '<p class="error-message">Failed to load CV. Please check the file path.</p>';
    }
  };

  // Tab Switching (for Resume/CV and Proof of Work)
  const initTabs = () => {
    // Handle Resume/CV tabs
    const resumeTabButtons = document.querySelectorAll('.resume-tabs .tab-button');
    resumeTabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const targetTab = button.dataset.tab;

        // Update button states within resume tabs
        resumeTabButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');

        // Update content visibility for resume tabs
        document.getElementById('pdf-tab').classList.toggle('active', targetTab === 'pdf');
        document.getElementById('cv-tab').classList.toggle('active', targetTab === 'cv');
      });
    });

    // Handle Proof of Work tabs
    const powTabButtons = document.querySelectorAll('.pow-tabs .tab-button');
    powTabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const targetTab = button.dataset.tab;

        // Update button states within pow tabs
        powTabButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');

        // Update content visibility for pow tabs
        document.getElementById('report-tab').classList.toggle('active', targetTab === 'report');
        document.getElementById('history-tab').classList.toggle('active', targetTab === 'history');
      });
    });
  };

  // PDF Viewer for Resume
  const initPDFViewer = () => {
    const pdfSelector = document.getElementById('pdf-selector');
    const pdfViewer = document.getElementById('pdfViewer');
    if (!pdfSelector || !pdfViewer) return;

    // Resume PDF files
    const pdfFiles = [
      'resume_eng.pdf',
      'resume_kor.pdf',
    ];

    // Populate selector
    pdfFiles.forEach((filename) => {
      const option = document.createElement('option');
      option.value = `data/resume/${encodeURIComponent(filename)}`;
      option.textContent = filename;
      pdfSelector.appendChild(option);
    });

    // Handle selection
    pdfSelector.addEventListener('change', (event) => {
      const selectedPDF = event.target.value;
      if (!selectedPDF) {
        pdfViewer.innerHTML = '<p class="placeholder-text">Select a PDF file to view</p>';
        return;
      }

      pdfViewer.innerHTML = `<iframe src="${selectedPDF}" title="PDF Viewer"></iframe>`;
    });
  };

  // Report PDF Viewer for Proof of Work
  const initReportViewer = () => {
    const reportSelector = document.getElementById('report-selector');
    const reportViewer = document.getElementById('reportViewer');
    if (!reportSelector || !reportViewer) return;

    // Report PDF files - Add your report PDFs to data/reports/ folder
    const reportFiles = [
      'Crypto Insights 7호.pdf',
      'Crypto Insights 8호.pdf',
      'Crypto Insights 9호.pdf',
      'Crypto Insights 10호.pdf',
      'Crypto Insights 11호.pdf',
      'Crypto Insights 12호.pdf',
      'Crypto Insights 13호.pdf',
      'Crypto Insights 14호.pdf',
      'CRYPTO NOTES 1호.pdf',
      'CRYPTO NOTES 2호.pdf'
    ];

    // Populate selector
    reportFiles.forEach((filename) => {
      const option = document.createElement('option');
      option.value = `data/reports/${encodeURIComponent(filename)}`;
      option.textContent = filename;
      reportSelector.appendChild(option);
    });

    // Handle selection
    reportSelector.addEventListener('change', (event) => {
      const selectedPDF = event.target.value;
      if (!selectedPDF) {
        reportViewer.innerHTML = '<p class="placeholder-text">Select a PDF file to view</p>';
        return;
      }

      reportViewer.innerHTML = `<iframe src="${selectedPDF}" title="Report Viewer"></iframe>`;
    });
  };

  // Excel Viewer with sorting and filtering
  let excelTableData = [];
  let currentSortColumn = -1;
  let currentSortDirection = 'asc';

  const initExcelViewer = async () => {
    const excelViewer = document.getElementById('excelViewer');
    if (!excelViewer) return;

    // Specify the Excel file to load automatically
    const excelFilePath = 'data/proof-of-work.xlsx';

    try {
      excelViewer.innerHTML = '<p class="placeholder-text">Loading...</p>';

      const response = await fetch(excelFilePath);
      if (!response.ok) {
        throw new Error(`Failed to load Excel file: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Get first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON for data manipulation
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      excelTableData = jsonData;

      // Render table
      renderExcelTable(excelTableData);

      // Add sorting functionality
      initExcelSorting();

      // Add search functionality
      initExcelSearch();
    } catch (error) {
      console.error('Error loading Excel file:', error);
      excelViewer.innerHTML = '<p class="placeholder-text">No Excel file available. Please add "proof-of-work.xlsx" to the data directory.</p>';
    }
  };

  const renderExcelTable = (data) => {
    const excelViewer = document.getElementById('excelViewer');
    if (!data || data.length === 0) {
      excelViewer.innerHTML = '<p class="placeholder-text">No data available</p>';
      return;
    }

    let html = '<table id="excel-table"><thead><tr>';

    // Headers
    const headers = data[0];
    headers.forEach((header, index) => {
      const sortClass = currentSortColumn === index
        ? currentSortDirection
        : 'sortable';
      html += `<th class="${sortClass}" data-column="${index}">${header || ''}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Data rows
    for (let i = 1; i < data.length; i++) {
      html += '<tr>';
      const row = data[i];
      headers.forEach((_, colIndex) => {
        html += `<td>${row[colIndex] || ''}</td>`;
      });
      html += '</tr>';
    }

    html += '</tbody></table>';
    excelViewer.innerHTML = html;
  };

  const initExcelSorting = () => {
    const table = document.getElementById('excel-table');
    if (!table) return;

    const headers = table.querySelectorAll('th');
    headers.forEach((header) => {
      header.addEventListener('click', () => {
        const column = parseInt(header.dataset.column);
        sortExcelTable(column);
      });
    });
  };

  const sortExcelTable = (columnIndex) => {
    if (excelTableData.length <= 1) return;

    // Toggle sort direction
    if (currentSortColumn === columnIndex) {
      currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      currentSortColumn = columnIndex;
      currentSortDirection = 'asc';
    }

    // Extract headers and data
    const headers = excelTableData[0];
    const dataRows = excelTableData.slice(1);

    // Sort data
    dataRows.sort((a, b) => {
      const aVal = a[columnIndex] || '';
      const bVal = b[columnIndex] || '';

      // Try to parse as numbers
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);

      let comparison = 0;
      if (!isNaN(aNum) && !isNaN(bNum)) {
        comparison = aNum - bNum;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return currentSortDirection === 'asc' ? comparison : -comparison;
    });

    // Reconstruct data with sorted rows
    const sortedData = [headers, ...dataRows];
    renderExcelTable(sortedData);

    // Re-initialize sorting listeners
    initExcelSorting();

    // Re-apply search filter if active
    const searchInput = document.getElementById('excelSearch');
    if (searchInput && searchInput.value) {
      filterExcelTable(searchInput.value);
    }
  };

  const initExcelSearch = () => {
    const searchInput = document.getElementById('excelSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      filterExcelTable(e.target.value);
    });
  };

  const filterExcelTable = (searchTerm) => {
    const table = document.getElementById('excel-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');

    const term = searchTerm.toLowerCase().trim();

    rows.forEach((row) => {
      if (!term) {
        row.classList.remove('hidden');
        return;
      }

      const text = row.textContent.toLowerCase();
      if (text.includes(term)) {
        row.classList.remove('hidden');
      } else {
        row.classList.add('hidden');
      }
    });
  };

  // Initialize everything
  const init = () => {
    setYear();
    loadProfilePhoto();
    initNavigation();
    loadCV();
    initTabs();
    initPDFViewer();
    initReportViewer();
    initExcelViewer();
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
