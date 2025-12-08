/**
 * Automatic File List Generator
 *
 * This script automatically scans directories and generates JSON files
 * with file listings, eliminating the need to manually update JavaScript code.
 *
 * Usage:
 *   node scripts/generate-file-list.js
 *
 * Or add to package.json:
 *   "scripts": {
 *     "generate-lists": "node scripts/generate-file-list.js"
 *   }
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  reportsDir: path.join(__dirname, '../data/reports'),
  resumeDir: path.join(__dirname, '../data/resume'),
  configFile: path.join(__dirname, '../data/portfolio-config.json'),
  outputFile: path.join(__dirname, '../data/generated-file-lists.json')
};

/**
 * Get all PDF files from a directory
 */
function getPDFFiles(directory) {
  try {
    if (!fs.existsSync(directory)) {
      console.warn(`Directory not found: ${directory}`);
      return [];
    }

    return fs.readdirSync(directory)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .sort();
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error.message);
    return [];
  }
}

/**
 * Load existing portfolio config
 */
function loadPortfolioConfig() {
  try {
    if (!fs.existsSync(config.configFile)) {
      console.warn('portfolio-config.json not found');
      return null;
    }

    const content = fs.readFileSync(config.configFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading portfolio-config.json:', error.message);
    return null;
  }
}

/**
 * Check for new files not in config
 */
function findNewFiles(actualFiles, configFiles) {
  const configFilenames = new Set(configFiles.map(item => item.filename || item.file?.split('/').pop()));
  return actualFiles.filter(file => !configFilenames.has(file));
}

/**
 * Generate file lists
 */
function generateFileLists() {
  console.log('Starting file list generation...\n');

  // Get actual files from directories
  const reportFiles = getPDFFiles(config.reportsDir);
  const resumeFiles = getPDFFiles(config.resumeDir);

  console.log(`Found ${reportFiles.length} report PDF(s)`);
  console.log(`Found ${resumeFiles.length} resume PDF(s)\n`);

  // Load existing config
  const portfolioConfig = loadPortfolioConfig();

  // Check for discrepancies
  if (portfolioConfig) {
    const newReports = findNewFiles(reportFiles, portfolioConfig.reports || []);
    const newResumes = findNewFiles(resumeFiles, portfolioConfig.resumes || []);

    if (newReports.length > 0) {
      console.warn('⚠️  New report files found (not in portfolio-config.json):');
      newReports.forEach(file => console.warn(`   - ${file}`));
      console.warn('   Please add these to data/portfolio-config.json\n');
    }

    if (newResumes.length > 0) {
      console.warn('⚠️  New resume files found (not in portfolio-config.json):');
      newResumes.forEach(file => console.warn(`   - ${file}`));
      console.warn('   Please add these to data/portfolio-config.json\n');
    }

    // Check for missing files
    const missingReports = (portfolioConfig.reports || [])
      .filter(item => !reportFiles.includes(item.filename))
      .map(item => item.filename);

    const missingResumes = (portfolioConfig.resumes || [])
      .filter(item => {
        const filename = item.file?.split('/').pop();
        return filename && !resumeFiles.includes(filename);
      })
      .map(item => item.file?.split('/').pop());

    if (missingReports.length > 0) {
      console.warn('⚠️  Report files in config but not found in directory:');
      missingReports.forEach(file => console.warn(`   - ${file}`));
      console.warn('\n');
    }

    if (missingResumes.length > 0) {
      console.warn('⚠️  Resume files in config but not found in directory:');
      missingResumes.forEach(file => console.warn(`   - ${file}`));
      console.warn('\n');
    }
  }

  // Generate output
  const output = {
    generated: new Date().toISOString(),
    reports: reportFiles.map(filename => ({
      filename,
      path: `data/reports/${filename}`
    })),
    resumes: resumeFiles.map(filename => ({
      filename,
      path: `data/resume/${filename}`
    })),
    stats: {
      totalReports: reportFiles.length,
      totalResumes: resumeFiles.length
    }
  };

  // Write output file
  try {
    fs.writeFileSync(
      config.outputFile,
      JSON.stringify(output, null, 2),
      'utf8'
    );
    console.log(`✓ Generated file list: ${config.outputFile}`);
    console.log(`  - ${output.stats.totalReports} reports`);
    console.log(`  - ${output.stats.totalResumes} resumes`);
  } catch (error) {
    console.error('Error writing output file:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateFileLists();
}

module.exports = { generateFileLists };
