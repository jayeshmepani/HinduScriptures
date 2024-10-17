const fs = require('fs');
const path = require('path');

// Directory to scan (specifically for DharmicData)
const dharmicDataPath = path.join(__dirname, 'pdfjs'); // Adjust to your project's structure
const manifestPath = path.join(__dirname, 'file-manifest3.json');

// Function to recursively traverse the /DharmicData/ directory
let processedFiles = 0; // To count processed files
let results = []; // Initialize results array

function getFilesRecursively(dir) {
    const list = fs.readdirSync(dir);
    
    // Log the directory being processed
    console.log(`Processing directory: ${dir} (${list.length} items)`);

    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            // Recurse into the directory
            getFilesRecursively(filePath);
        } else {
            results.push(filePath.replace(/\\/g, '/')); // Normalize path for URLs
            processedFiles++; // Increment processed file count
            console.log(`Processed file: ${filePath}`); // Log each processed file
        }
    });
}

// Generate the file manifest for /DharmicData/
getFilesRecursively(dharmicDataPath);

// Write the manifest to a JSON file
fs.writeFileSync(manifestPath, JSON.stringify({ files: results }, null, 2), 'utf-8');

// Log total processed files and output location
console.log(`\nFile manifest created at ${manifestPath}`);
console.log(`Total files processed: ${processedFiles}`);
