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
      const response = await fetch('files/readme.md');
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

  // Resume/CV Tab Switching
  const initResumeTabs = () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const targetTab = button.dataset.tab;

        // Update button states
        tabButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');

        // Update content visibility
        tabContents.forEach((content) => {
          if (content.id === `${targetTab}-tab`) {
            content.classList.add('active');
          } else {
            content.classList.remove('active');
          }
        });
      });
    });
  };

  // PDF Viewer
  const initPDFViewer = () => {
    const pdfSelector = document.getElementById('pdf-selector');
    const pdfViewer = document.getElementById('pdfViewer');
    if (!pdfSelector || !pdfViewer) return;

    // Scan files directory for PDFs
    const pdfFiles = [
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
    pdfFiles.forEach((filename) => {
      const option = document.createElement('option');
      option.value = `files/${encodeURIComponent(filename)}`;
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

  // Excel Viewer
  const initExcelViewer = async () => {
    const excelViewer = document.getElementById('excelViewer');
    if (!excelViewer) return;

    // Specify the Excel file to load automatically
    // Change this path to your actual Excel file
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

      // Convert to HTML table
      const html = XLSX.utils.sheet_to_html(worksheet, {
        id: 'excel-table',
        editable: false
      });

      excelViewer.innerHTML = html;
    } catch (error) {
      console.error('Error loading Excel file:', error);
      excelViewer.innerHTML = '<p class="placeholder-text">No Excel file available. Please add "proof-of-work.xlsx" to the data directory.</p>';
    }
  };

  // Initialize everything
  const init = () => {
    setYear();
    loadProfilePhoto();
    initNavigation();
    loadCV();
    initResumeTabs();
    initPDFViewer();
    initExcelViewer();
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
