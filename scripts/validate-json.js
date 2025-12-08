/**
 * JSON Validation Script
 *
 * Validates all JSON configuration files to ensure they are properly formatted
 * and contain required fields.
 *
 * Usage:
 *   node scripts/validate-json.js
 */

const fs = require('fs');
const path = require('path');

// Configuration files to validate
const jsonFiles = [
  {
    path: 'data/portfolio-config.json',
    required: ['profile', 'resumes', 'reports'],
    schema: {
      profile: ['name', 'email', 'image', 'social'],
      resumes: ['id', 'title', 'file'],
      reports: ['filename', 'title', 'contribution']
    }
  }
];

/**
 * Validate a single JSON file
 */
function validateJSONFile(fileConfig) {
  const filePath = path.join(__dirname, '..', fileConfig.path);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`✗ File not found: ${fileConfig.path}`);
    return false;
  }

  try {
    // Parse JSON
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    console.log(`\nValidating: ${fileConfig.path}`);

    // Check if it's an array when expected
    if (fileConfig.isArray) {
      if (!Array.isArray(data)) {
        console.error(`  ✗ Expected array, got ${typeof data}`);
        return false;
      }

      // Validate each item in array
      data.forEach((item, index) => {
        fileConfig.required.forEach(field => {
          if (!(field in item)) {
            console.warn(`  ⚠️  Item ${index}: Missing required field "${field}"`);
          }
        });
      });

      console.log(`  ✓ Valid array with ${data.length} items`);
    } else {
      // Validate top-level required fields
      fileConfig.required.forEach(field => {
        if (!(field in data)) {
          console.error(`  ✗ Missing required field: "${field}"`);
          return false;
        }
      });

      // Validate nested schemas if defined
      if (fileConfig.schema) {
        Object.keys(fileConfig.schema).forEach(key => {
          if (Array.isArray(data[key])) {
            data[key].forEach((item, index) => {
              fileConfig.schema[key].forEach(field => {
                if (!(field in item)) {
                  console.warn(`  ⚠️  ${key}[${index}]: Missing recommended field "${field}"`);
                }
              });
            });
          }
        });
      }

      console.log(`  ✓ Valid JSON structure`);
    }

    return true;
  } catch (error) {
    console.error(`✗ Error parsing ${fileConfig.path}:`);
    console.error(`  ${error.message}`);
    return false;
  }
}

/**
 * Main validation function
 */
function validateAll() {
  console.log('Starting JSON validation...');

  let allValid = true;

  jsonFiles.forEach(fileConfig => {
    const isValid = validateJSONFile(fileConfig);
    if (!isValid) {
      allValid = false;
    }
  });

  console.log('\n' + '='.repeat(50));
  if (allValid) {
    console.log('✓ All JSON files are valid');
    process.exit(0);
  } else {
    console.error('✗ Some JSON files have errors');
    process.exit(1);
  }
}

// Run validation
if (require.main === module) {
  validateAll();
}

module.exports = { validateAll, validateJSONFile };
