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

  // PDF Viewer for Resume using PDF.js
  let currentPdf = null;
  let currentPage = 1;
  let totalPages = 0;

  const renderPdfPage = async (pdf, pageNum, canvas) => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });

    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
  };

  const initPDFViewer = () => {
    const pdfSelector = document.getElementById('pdf-selector');
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfNav = document.getElementById('pdfNav');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageNumSpan = document.getElementById('pageNum');
    const pageCountSpan = document.getElementById('pageCount');

    if (!pdfSelector || !pdfViewer) return;

    // Configure PDF.js worker
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

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

    // Load and render PDF
    const loadPdf = async (url) => {
      try {
        pdfViewer.innerHTML = '<p class="placeholder-text">Loading PDF...</p>';
        pdfNav.style.display = 'none';

        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;

        currentPdf = pdf;
        totalPages = pdf.numPages;
        currentPage = 1;

        // Create canvas
        const canvas = document.createElement('canvas');
        pdfViewer.innerHTML = '';
        pdfViewer.appendChild(canvas);

        // Render first page
        await renderPdfPage(pdf, currentPage, canvas);

        // Update UI
        pageNumSpan.textContent = currentPage;
        pageCountSpan.textContent = totalPages;
        pdfNav.style.display = 'flex';

        updateNavButtons();
      } catch (error) {
        console.error('Error loading PDF:', error);
        pdfViewer.innerHTML = '<p class="error-message">Failed to load PDF file.</p>';
        pdfNav.style.display = 'none';
      }
    };

    const updateNavButtons = () => {
      prevBtn.disabled = currentPage <= 1;
      nextBtn.disabled = currentPage >= totalPages;
    };

    const changePage = async (delta) => {
      const newPage = currentPage + delta;
      if (newPage < 1 || newPage > totalPages) return;

      currentPage = newPage;
      const canvas = pdfViewer.querySelector('canvas');
      if (canvas && currentPdf) {
        await renderPdfPage(currentPdf, currentPage, canvas);
        pageNumSpan.textContent = currentPage;
        updateNavButtons();
      }
    };

    // Event listeners
    pdfSelector.addEventListener('change', (event) => {
      const selectedPDF = event.target.value;
      if (!selectedPDF) {
        pdfViewer.innerHTML = '<p class="placeholder-text">Select a PDF file to view</p>';
        pdfNav.style.display = 'none';
        return;
      }
      loadPdf(selectedPDF);
    });

    prevBtn.addEventListener('click', () => changePage(-1));
    nextBtn.addEventListener('click', () => changePage(1));
  };

  // Report PDF Viewer for Proof of Work
  let reportContributions = [];

  const loadReportContributions = async () => {
    try {
      const response = await fetch('data/report-contributions.json');
      if (!response.ok) {
        throw new Error(`Failed to load contributions: ${response.status}`);
      }
      reportContributions = await response.json();
    } catch (error) {
      console.error('Error loading report contributions:', error);
      reportContributions = [];
    }
  };

  const showContribution = (filename) => {
    const contributionInfo = document.getElementById('contributionInfo');
    const contributionText = document.getElementById('contributionText');

    if (!contributionInfo || !contributionText) return;

    const report = reportContributions.find(r => r.filename === filename);

    if (report && report.contribution) {
      contributionText.textContent = report.contribution;
      contributionInfo.style.display = 'block';
    } else {
      contributionInfo.style.display = 'none';
    }
  };

  // Report PDF Viewer
  let currentReportPdf = null;
  let currentReportPage = 1;
  let totalReportPages = 0;

  const initReportViewer = async () => {
    const reportSelector = document.getElementById('report-selector');
    const reportViewer = document.getElementById('reportViewer');
    const reportNav = document.getElementById('reportNav');
    const prevBtn = document.getElementById('reportPrevPage');
    const nextBtn = document.getElementById('reportNextPage');
    const pageNumSpan = document.getElementById('reportPageNum');
    const pageCountSpan = document.getElementById('reportPageCount');

    if (!reportSelector || !reportViewer) return;

    // Configure PDF.js worker
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    // Load contributions data
    await loadReportContributions();

    // Report PDF files
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
      'CRYPTO NOTES 2호.pdf',
      '[PDAO] ZK in SOL (KOR).pdf',
      '[PDAO] ZK in SOL (ENG).pdf',
      '[PDAO] KRWstablecoin (KOR).pdf'
    ];

    // Populate selector
    reportFiles.forEach((filename) => {
      const option = document.createElement('option');
      option.value = `data/reports/${encodeURIComponent(filename)}`;
      option.textContent = filename;
      option.dataset.filename = filename;
      reportSelector.appendChild(option);
    });

    // Load and render report PDF
    const loadReportPdf = async (url) => {
      try {
        reportViewer.innerHTML = '<p class="placeholder-text">Loading PDF...</p>';
        reportNav.style.display = 'none';

        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;

        currentReportPdf = pdf;
        totalReportPages = pdf.numPages;
        currentReportPage = 1;

        // Create canvas
        const canvas = document.createElement('canvas');
        reportViewer.innerHTML = '';
        reportViewer.appendChild(canvas);

        // Render first page
        await renderPdfPage(pdf, currentReportPage, canvas);

        // Update UI
        pageNumSpan.textContent = currentReportPage;
        pageCountSpan.textContent = totalReportPages;
        reportNav.style.display = 'flex';

        updateReportNavButtons();
      } catch (error) {
        console.error('Error loading report PDF:', error);
        reportViewer.innerHTML = '<p class="error-message">Failed to load PDF file.</p>';
        reportNav.style.display = 'none';
      }
    };

    const updateReportNavButtons = () => {
      prevBtn.disabled = currentReportPage <= 1;
      nextBtn.disabled = currentReportPage >= totalReportPages;
    };

    const changeReportPage = async (delta) => {
      const newPage = currentReportPage + delta;
      if (newPage < 1 || newPage > totalReportPages) return;

      currentReportPage = newPage;
      const canvas = reportViewer.querySelector('canvas');
      if (canvas && currentReportPdf) {
        await renderPdfPage(currentReportPdf, currentReportPage, canvas);
        pageNumSpan.textContent = currentReportPage;
        updateReportNavButtons();
      }
    };

    // Handle selection
    reportSelector.addEventListener('change', (event) => {
      const selectedPDF = event.target.value;
      const selectedOption = event.target.options[event.target.selectedIndex];
      const filename = selectedOption.dataset.filename;

      if (!selectedPDF) {
        reportViewer.innerHTML = '<p class="placeholder-text">Select a PDF file to view</p>';
        document.getElementById('contributionInfo').style.display = 'none';
        reportNav.style.display = 'none';
        return;
      }

      // Show contribution
      showContribution(filename);

      // Load PDF
      loadReportPdf(selectedPDF);
    });

    prevBtn.addEventListener('click', () => changeReportPage(-1));
    nextBtn.addEventListener('click', () => changeReportPage(1));
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
