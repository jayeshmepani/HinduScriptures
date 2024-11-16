const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Set your API key for Google Gemini
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA3bC6VAJ0RoB_hVDamdsV5IF4VMx6isbo'; // Replace with your actual API key
// const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyB47bxpxggdBeVoVeIrXc8K_fZFdoz1VUQ'; // Replace with your actual API key
const genAI = new GoogleGenerativeAI(apiKey);

// Create an instance of the generative model (Gemini-1.5 in this case)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-002' });

// Use CORS middleware
app.use(cors());

// Middleware to serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Array of content files with .html extension
const contentFiles = [
  'AgniPuranaContent.html',
  'AtharvaVedaContent.html',
  'BhagavadGitaContent.html',
  'BhagavataPuranaContent.html',
  'BhavishyaPuranaContent.html',
  'BrahmaandaPuranaContent.html',
  'BrahmaPuranaContent.html',
  'BrahmavaivartaPuranaContent.html',
  'GarudaPuranaContent.html',
  'kandaContent.html',
  'KurmaPuranaContent.html',
  'LingaPuranaContent.html',
  'MarkandeyaPuranaContent.html',
  'MatsyaPuranaContent.html',
  'NaradaPuranaContent.html',
  'PadmaPuranaContent.html',
  'ParvaContent.html',
  'RigvedaContent.html',
  'ShivaPuranaContent.html',
  'SkandaPuranaContent.html',
  'VamanaPuranaContent.html',
  'VarahaPuranaContent.html',
  'VayuPuranaContent.html',
  'VishnuPuranaContent.html',
  'YajurVedaContent.html',
  'YogaVasisthaContent.html'
];

// Dynamically create routes for each content file
contentFiles.forEach(file => {
  const routeName = file.replace('.html', ''); // Create route name by removing .html
  app.get(`/${routeName}`, (req, res) => {
    res.sendFile(path.join(__dirname, file), (err) => {
      if (err) {
        console.error(`Error sending file: ${file}`, err);
        res.status(err.status).end();
      }
    }); // Send the HTML file
  });
});

// Define routes without "" extension
app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/ramayanas', (req, res) => {
  res.sendFile(path.join(__dirname, 'Ramayanas.html'));
});

app.get('/gitas', (req, res) => {
  res.sendFile(path.join(__dirname, 'Gitas.html'));
});

app.get('/BhagvadGita', (req, res) => {
  res.sendFile(path.join(__dirname, 'BhagvadGita.html'));
});

app.get('/vedas', (req, res) => {
  res.sendFile(path.join(__dirname, 'Vedas.html'));
});

app.get('/puranas', (req, res) => {
  res.sendFile(path.join(__dirname, 'Puranas.html'));
});

app.get('/upa-puranas', (req, res) => {
  res.sendFile(path.join(__dirname, 'UpaPuranas.html'));
});

app.get('/mahabharata', (req, res) => {
  res.sendFile(path.join(__dirname, 'ParvaList.html'));
});

app.get('/smritis', (req, res) => {
  res.sendFile(path.join(__dirname, 'Smritis.html'));
});

app.get('/upa-smritis', (req, res) => {
  res.sendFile(path.join(__dirname, 'UpaSmrtis.html'));
});

app.get('/stotras', (req, res) => {
  res.sendFile(path.join(__dirname, 'Stotras.html'));
});

app.get('/namavalis', (req, res) => {
  res.sendFile(path.join(__dirname, 'Namavalis.html'));
});

app.get('/stutis', (req, res) => {
  res.sendFile(path.join(__dirname, 'Stutis.html'));
});

app.get('/ashtakas', (req, res) => {
  res.sendFile(path.join(__dirname, 'Ashtakas.html'));
});

app.get('/kavachas', (req, res) => {
  res.sendFile(path.join(__dirname, 'Kavachas.html'));
});

app.get('/chalisas', (req, res) => {
  res.sendFile(path.join(__dirname, 'Chalisas.html'));
});

app.get('/puranas-overview', (req, res) => {
  res.sendFile(path.join(__dirname, 'Puranas_overview.html'));
});

app.get('/ai', (req, res) => {
  res.sendFile(path.join(__dirname, 'googleAI.html'));
});

app.get('/Ramcharitmanas', (req, res) => {
  res.sendFile(path.join(__dirname, 'Ramcharitmanas.html'));
});

app.get('/YogaVasistha', (req, res) => {
  res.sendFile(path.join(__dirname, 'YogaVasistha.html'));
});

app.get('/DattPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'DattP.html'));
});

app.get('/HarivanshaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'HarivanshaP.html'));
});

app.get('/NaradiyaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'NaradiyaP.html'));
});

app.get('/VishnudharmottarPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'VishnudharmottarP.html'));
});

app.get('/KalikaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'KalikaP.html'));
});

app.get('/MallaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'MallaP.html'));
});

app.get('/MudgalaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'MudgalaP.html'));
});

app.get('/ShivadharmaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'ShivadharmaP.html'));
});

app.get('/SrimadDeviBhagwatPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'SrimadDeviBhagwatP.html'));
});

app.get('/AgniPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'AgniPurana.html'));
});

app.get('/BhagavataPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'BhagavataPurana.html'));
});

app.get('/BhavishyaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'BhavishyaPurana.html'));
});

app.get('/BrahmaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'BrahmaPurana.html'));
});

app.get('/BrahmaandaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'BrahmaandaPurana.html'));
});

app.get('/BrahmavaivartaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'BrahmavaivartaPurana.html'));
});

app.get('/GarudaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'GarudaPurana.html'));
});

app.get('/KurmaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'KurmaPurana.html'));
});

app.get('/LingaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'LingaPurana.html'));
});

app.get('/MarkandeyaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'MarkandeyaPurana.html'));
});

app.get('/MatsyaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'MatsyaPurana.html'));
});

app.get('/NaradaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'NaradaPurana.html'));
});

app.get('/PadmaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'PadmaPurana.html'));
});

app.get('/ShivaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'ShivaPurana.html'));
});

app.get('/SkandaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'SkandaPurana.html'));
});

app.get('/VamanaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'VamanaPurana.html'));
});

app.get('/VarahaPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'VarahaPurana.html'));
});

app.get('/VayuPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'VayuPurana.html'));
});

app.get('/VishnuPurana', (req, res) => {
  res.sendFile(path.join(__dirname, 'VishnuPurana.html'));
});

app.get('/book', (req, res) => {
  res.sendFile(path.join(__dirname, 'pdfrendering.html'));
});

app.get('/Vedanga', (req, res) => {
  res.sendFile(path.join(__dirname, 'Vedanga.html'));
});

app.get('/Upanga', (req, res) => {
  res.sendFile(path.join(__dirname, 'Upanga.html'));
});

app.get('/upnishad', (req, res) => {
  res.sendFile(path.join(__dirname, 'Upnishad.html'));
});

app.get('/aarati', (req, res) => {
  res.sendFile(path.join(__dirname, 'Aaratis.html'));
});

app.get('/Bhajan', (req, res) => {
  res.sendFile(path.join(__dirname, 'Bhajan.html'));
});

app.get('/AaratisSangrah2', (req, res) => {
  res.sendFile(path.join(__dirname, 'Aaratis_Sangrah.html'));
});

app.get('/Swaminarayan-Sect', (req, res) => {
  res.sendFile(path.join(__dirname, 'Swaminarayan_Sect.html'));
});


app.get('/Kirtan', (req, res) => {
  res.sendFile(path.join(__dirname, 'Kirtan.html'));
});

app.get('/content', (req, res) => {
  const filename = req.query.filename; // Get the filename from the query parameter

  if (!filename) {
    return res.status(400).send('Filename is required');
  }

  // Determine the file type based on the filename extension
  const fileType = filename.split('.').pop(); // Get the file extension

  if (fileType === 'json') {
    res.sendFile(path.join(__dirname, 'Content(json).html'));
  } else if (fileType === 'pdf') {
    res.sendFile(path.join(__dirname, 'Content(pdf).html'));
  } else {
    return res.status(406).send('Not Acceptable: Supported formats are JSON or PDF');
  }
});


// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Function to convert file to generative part
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString('base64'),
      mimeType,
    },
  };
}

// Function to interact with the AI model based on user prompt and image
async function getResponseToUserPrompt(userInput, imagePath) {
  try {
    const history = [];

    // If an image is uploaded, convert it and add to history
    if (imagePath) {
      const imagePart = fileToGenerativePart(imagePath, 'image/jpeg');
      history.push({
        role: 'user',
        parts: [
          {
            text: `
- Acts as a scholar with deep-rooted knowledge and insights into Hinduism, Sanatan Dharma, Sanskrit, and other Devanagari languages and dialects, exploring the wisdom of Hindu scriptures and traditions.
- Provides comprehensive and insightful responses to inquiries related to these topics.
- Does not respond to prompts or inputs that are not related to these topics.
- If the user asks a comparison or difference-type question/query, respond with the answer in a table format using HTML. This formatting is applied only for comparison or difference-related questions/queries, not for other general inquiries.
            `
          },
          imagePart
        ],
      });
    }

    // If user input is provided, add it to history
    if (userInput && userInput.trim() !== '') {
      history.push({
        role: 'user',
        parts: [
          {
            text: `
- Acts as a scholar with deep-rooted knowledge and insights into Hinduism, Sanatan Dharma, Sanskrit, and other Devanagari languages and dialects, exploring the wisdom of Hindu scriptures and traditions.
- Provides comprehensive and insightful responses to inquiries related to these topics.
- Does not respond to prompts or inputs that are not related to these topics.
- If the user asks a comparison or difference-type question/query, respond with the answer in a table format using HTML. This formatting is applied only for comparison or difference-related questions/queries, not for other general inquiries.
              `
          },
          { text: userInput }
        ],
      });
    }

    // Start a chat session with the AI model
    const chatSession = model.startChat({ history });
    const result = await chatSession.sendMessage(userInput || '');

    return result.response.text(); // Get AI response
  } catch (error) {
    console.error('Error fetching AI response:', error);
    return 'Error processing your request: ' + error.message;
  }
}

// Endpoint to handle user questions with optional image upload
app.post('/ask', upload.single('image'), async (req, res) => {
  try {
    const userInput = req.body.prompt; // Extract the user input from the request body
    const imagePath = req.file ? req.file.path : null; // Get uploaded image path

    // Fetch AI response
    const response = await getResponseToUserPrompt(userInput, imagePath);

    // If an image was uploaded, delete it after processing
    if (imagePath) {
      fs.unlinkSync(imagePath); // Remove the file after processing
    }

    res.json({ answer: response }); // Send back the response as JSON
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request: ' + error.message });
  }
});

// Route to render the search results
app.get('/search', async (req, res) => {
  const searchQuery = req.query.q ? req.query.q.toLowerCase().trim() : '';
  const results = new Set();

  if (!searchQuery) {
    res.send('<p>Please enter a search term.</p>');
    return;
  }

  const baseDir = path.join(__dirname, 'DharmicData');

  function searchDirectories(dir, currentPath) {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(dir, item.name);
      const fullPath = path.join(currentPath, item.name); // Track full path for directories

      if (item.isDirectory()) {
        // Check if the directory name contains the search query
        if (item.name.toLowerCase().includes(searchQuery)) {
          results.add(`/browse?dir=${encodeURIComponent(fullPath)}&q=${encodeURIComponent(searchQuery)}`);
        }

        // Recursively check contents of the directory
        searchDirectories(itemPath, fullPath);
      } else if (item.isFile() && item.name.endsWith('.json')) {
        // Check if the file name contains the search query
        if (item.name.toLowerCase().includes(searchQuery)) {
          results.add(`/browse?dir=${encodeURIComponent(currentPath)}&q=${encodeURIComponent(searchQuery)}`);
        }
      }
    }
  }

  // Start searching from the DharmicData directory
  searchDirectories(baseDir, 'DharmicData');

  // Render search results as HTML
  res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Search Results</title>
          <link rel="stylesheet" href="/style.css">
          <style>
              h1 {
                  padding: 2rem;
                  text-align: center;
                  color: ghostwhite;
              }
                                        
              html{
                  background-color: hsla(246, 97%, 7%, 0.83);
                  height: 100vh;
              }
          </style>
      </head>
      <body>
          <h1>Search Results for "${searchQuery}"</h1>
          <div class="search-results">
              ${results.size > 0
      ? Array.from(results).map(result => {
        const displayResult = result.split('&')[0]; // For display
        const cleanDisplayName = decodeURIComponent(displayResult.split('=')[1]); // Clean display name
        return `<div class="result-item"><a href="${result}">${cleanDisplayName}</a></div>`;
      }).join('')
      : '<p>No matching directories or files found.</p>'
    }
          </div>
          <a href="/" class="back-link">Go back</a>
      </body>
      </html>
  `);
});


// Route to display directory contents
app.get('/browse', (req, res) => {
  const dirPath = req.query.dir;
  const searchQuery = req.query.q ? req.query.q.toLowerCase() : ''; // Search term for filtering

  if (!dirPath) {
    res.send('<p>Directory not specified.</p>');
    return;
  }

  const fullPath = path.join(__dirname, dirPath);

  try {
    const items = fs.readdirSync(fullPath, { withFileTypes: true });

    // Use a Set to ensure unique entries
    const filteredItems = new Set();

    items.forEach(item => {
      if (item.name.toLowerCase().includes(searchQuery)) {
        filteredItems.add(item);
      }
    });

    // If the directory name matches the search query, include all items in that directory
    const dirName = path.basename(fullPath).toLowerCase();
    if (searchQuery && dirName.includes(searchQuery)) {
      items.forEach(item => {
        filteredItems.add(item); // Add all items if the directory name matches
      });
    }

    // Generate HTML to display contents of the directory without duplicates
    const contentHtml = Array.from(filteredItems).map(item => {
      const itemLink = path.join(dirPath, item.name);
      const itemNameWithoutExtension = item.isFile() ? item.name.replace(/\.[^/.]+$/, "") : item.name; // Remove file extension

      if (item.isDirectory()) {
        // For directories, provide a link to browse into them
        return `<div class="result-item">
                    <a href="/browse?dir=${encodeURIComponent(itemLink)}&q=${encodeURIComponent(searchQuery)}">
                        ${itemNameWithoutExtension}
                    </a>
                </div>`;
      } else {
        // For files, just display the name without a link
        return `<div class="result-item">
                    ${itemNameWithoutExtension} (file)
                </div>`;
      }
    }).join('');

    res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Directory Contents</title>
              <link rel="stylesheet" href="/style.css">
              <style>
                  h1 {
                      padding: 2rem;
                      text-align: center;
                      color: ghostwhite;
                  }

                  html{
                      background-color: hsla(246, 97%, 7%, 0.83);
                      height: 100vh;
                  }
              </style>
          </head>
          <body>
              <h1>Contents of "${dirPath.replace(__dirname, '')}"</h1>
              <div class="directory-contents" style="padding-left: 1rem;">
                  ${contentHtml || '<p>No matching items found in this directory.</p>'}
              </div>
              <a href="/search?q=${encodeURIComponent(searchQuery)}" class="back-link">Go back to search results</a>
          </body>
          </html>
      `);
  } catch (error) {
    res.status(404).send('<p>Directory not found.</p>');
  }
});



// Endpoint to fetch both folders and files dynamically
app.get('/fetchFiles', (req, res) => {
  const section = req.query.section || '';
  const referrer = req.get('Referer');
  let baseDir;

  if (referrer.includes('Namavali')) {
    baseDir = path.join(__dirname, 'DharmicData/Namavalis', section);
  } else if (referrer.includes('Stotra')) {
    baseDir = path.join(__dirname, 'DharmicData/Stotras', section);
  } else if (referrer.includes('Gitas')) {
    baseDir = path.join(__dirname, 'DharmicData/Gitas');
  } else if (referrer.includes('BhagvadGita')) {
    baseDir = path.join(__dirname, 'DharmicData/Gitas/Bhagvad Gita');
  } else if (referrer.includes('Chalisas')) {
    baseDir = path.join(__dirname, 'DharmicData/Chalisa');
  } else if (referrer.includes('Stutis')) {
    baseDir = path.join(__dirname, 'DharmicData/Stuti');
  } else if (referrer.includes('Smritis')) {
    baseDir = path.join(__dirname, 'DharmicData/Smritis');
  } else if (referrer.includes('upa-smritis')) {
    baseDir = path.join(__dirname, 'DharmicData/UpaSmritis');
  } else if (referrer.includes('Ashtakas')) {
    baseDir = path.join(__dirname, 'DharmicData/Ashtaka');
  } else if (referrer.includes('Kavachas')) {
    baseDir = path.join(__dirname, 'DharmicData/Kavacha');
  } else if (referrer.includes('UpaPuranas')) {
    baseDir = path.join(__dirname, 'DharmicData/UpaPuranas');
  } else if (referrer.includes('Ramayanas')) {
    baseDir = path.join(__dirname, 'DharmicData/Ramayanas/');
  }
  else if (referrer.includes('YogaVasistha')) {
    baseDir = path.join(__dirname, 'DharmicData/Ramayanas/Yoga Vasistha/', section);
  }
  else if (referrer.includes('Vedanga')) {
    baseDir = path.join(__dirname, 'DharmicData/Vedanga/', section);
  }
  else if (referrer.includes('Upanga')) {
    baseDir = path.join(__dirname, 'DharmicData/Upanga/');
  }
  else if (referrer.includes('Upnishad')) {
    baseDir = path.join(__dirname, 'DharmicData/Upnishad/');
  }
  else if (referrer.includes('Aarati')) {
    baseDir = path.join(__dirname, 'DharmicData/Aartis/');
  }
  else if (referrer.includes('Bhajan')) {
    baseDir = path.join(__dirname, 'DharmicData/Bhajan/');
  }
  else if (referrer.includes('Swaminarayan-Sect')) {
    baseDir = path.join(__dirname, 'DharmicData/Swaminarayan Sect/', section);
  }
  else {
    return res.json({ error: 'Invalid referrer' });
  }

  if (!fs.existsSync(baseDir)) {
    return res.json({ error: 'Invalid directory or section' });
  }

  // Read directories and files
  fs.readdir(baseDir, (err, items) => {
    if (err) {
      return res.json({ error: 'Error reading directory' });
    }

    const folders = [];
    const files = [];

    items.forEach(item => {
      const itemPath = path.join(baseDir, item);
      if (fs.statSync(itemPath).isDirectory()) {
        folders.push(item);
      } else if (['.pdf', '.json'].includes(path.extname(item))) {
        files.push(item);
      }
    });

    res.json({ folders, files });
  });
});

// Start the Express server on a single port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
