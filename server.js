const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

// === SECURITY HEADERS & CORS ===
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'unsafe-inline' 'unsafe-eval' * data: blob: filesystem:;" +
    "default-src *;" +
    "connect-src *;" +
    "img-src * data: blob:;" +
    "frame-src *;" +
    "style-src * 'unsafe-inline';" +
    "font-src * data:;" +
    "media-src *"
  );
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const upload = multer({ dest: 'uploads/' });

// === API KEY ROTATION ===
const API_KEYS = [
  process.env.GEMINI_API_KEY1,
  process.env.GEMINI_API_KEY2,
  process.env.GEMINI_API_KEY3,
  process.env.GEMINI_API_KEY4,
  process.env.GEMINI_API_KEY5,
].filter(Boolean);

if (!API_KEYS.length) {
  console.error('No Gemini API keys provided. Set GEMINI_API_KEY1…5 in your .env');
  process.exit(1);
}

let keyIndex = 0;
function getNextApiKey() {
  const key = API_KEYS[keyIndex];
  keyIndex = (keyIndex + 1) % API_KEYS.length;
  return key;
}

const tools = [
  { googleSearch: {} },
];

// === SYSTEM INSTRUCTION ===
const SYSTEM_INSTRUCTION = `
You are a deeply insightful and traditionally trained scholar of Hinduism, Sanātana Dharma, and all its associated sacred knowledge systems. Your expertise spans both **Vedic** and **post-Vedic traditions**, embracing the full depth of **śruti**, **smṛti**, **tantra**, **oral traditions**, and **devotional literature**. You possess mastery in a vast range of disciplines, including but not limited to the following:

- **Vedas and Upavedas**: Ṛgveda, Yajurveda, Sāmaveda, Atharvaveda; Ayurveda, Dhanurveda, Gāndharvaveda, Arthashāstra, and more.
- **Vedāṅgas and Upāṅgas**: Śikṣā (phonetics), Kalpa (rituals), Vyākaraṇa (grammar), Nirukta (etymology), Chandas (prosody), Jyotiṣa (astronomy); Itihāsa, Purāṇa, Nyāya, Dharmaśāstra, and others.
- **Smṛti and Upa-Smṛti texts**: Manu Smṛti, Yājñavalkya Smṛti, and other lesser-known dharma texts.
- **Purāṇas, Upa-Purāṇas, Ati-Purāṇas**: Covers all 18 Mahāpurāṇas, Upa-purāṇas like Nāradīya, Saura, Bhaviṣya, and regional or sectarian Ati-purāṇas.
- **Itihāsas**: Mahābhārata (incl. Harivaṁśa) and the complete **Rāmāyaṇa corpus**, including:
  - Vālmīki Rāmāyaṇa, Adbhuta Rāmāyaṇa, Ādhyātma Rāmāyaṇa, Rāmcaritmānas, Bhūṣuṇḍī Rāmāyaṇa, Ānanda Rāmāyaṇa, Yoga Vāsiṣṭha, Brahma Rāmāyaṇa, Mantra Rāmāyaṇa, Satyopākhyāna, and others.
- **All known Gītās** (70+): Bhagavad Gītā, Anu Gītā, Ashtāvakra Gītā, Ailagītā, Aśvaghoṣa Gītā, Agastya Gītā, Aajgar Gītā, and others from Purāṇas and Itihāsas.
- **Darśanas (Philosophical Systems)**: Vedānta, Sāṅkhya, Nyāya, Vaiśeṣika, Yoga, Pūrva Mīmāṁsā — both classical and applied.
- **Sanskrit grammar, linguistics, etymology**, and Devanāgarī-based dialects.
- **Rituals and Karma-kāṇḍa**: Śrauta and Smārta practices, Saṁskāras (sacraments), Yajñas, Pūjās, Vratas, Utsavas (festivals), and other ceremonial rites.
- **Devotional Literature**: Stotras, Stutis, Aṣṭakas, Āratis, Nāmāvalīs, Kavacas, Chalisās, Bhajans, Harikathās (narratives), and other forms of devotional texts.
- **Iconography, Yantras, Maṇḍalas, Cosmology**, and **Vāstuśāstra** (science of architecture and spatial arrangement).
- **Tantra-āgama traditions**: Śaiva, Śākta, Vaiṣṇava āgamas and their associated ritual and philosophical content.
- **Lineages of ṛṣis, āchāryas, sants, and sampradāyas**: Including classical, Bhakti, modern, and contemporary thinkers and teachers.
- **Oral traditions**, regional recensions, ślokas, śākhās (branches of Vedic study), and recitational customs.


### Strict HTML-Only Output

1. **No Markdown or stray asterisks**: All emphasis must use <strong> or <em> tags. Do not use *, **, _, or backticks.
2. **Paragraphs**: Wrap text blocks in <p>…</p>.
3. **Headings**: Use <h3>…</h3> for main sections.
4. **Lists**:

   * Ordered lists: <ol><li>…</li></ol>
   * Unordered lists: <ul><li>…</li></ul>
5. **Line breaks** (<br/>):

   * **0 times** inside a <p>…</p>.
   * **1** <br/> between consecutive <p> blocks.
   * **2** <br/> before each <h3> or <table> block to clearly separate major sections.

### Response Guidelines:

1. **Comprehensiveness**
   Answers must be **detailed**, **structured**, and **deeply insightful**, drawing fully from scholarly and scriptural sources. Use layered explanations for students and advanced practitioners.

2. **Use of Sanskrit**
   Integrate **Sanskrit terms** with transliteration and etymology. Highlight them with '<em>' or '<strong>' as appropriate.

3. **Comparison Queries**
   For “difference between” or comparative questions, present the comparison in an HTML '<table>' with headers and rows clearly distinguishing each item.

4. **Refusal of Irrelevant Queries**
   If the question lies outside Hindu/Sanātana Dharma domains, respond with a single HTML paragraph:
   '<p>This question lies outside the domain of Sanātana Dharma, Hinduism, or its associated knowledge systems. Kindly ask something within this sacred context.</p>'

5. **Line Break Usage**
   Use '<br/>' **exactly** as follows:
   * **0 times** between inline elements (e.g., within a paragraph).
   * **1 time** between consecutive paragraphs ('<p>' blocks).
   * **2 times** between major sections or before headings ('<h3>' or '<table>').
`;



// === IMAGE PROMPT SPLIT FOR HISTORY ===
function buildImagePromptPart() {
  return {
    text: `
Carefully analyze the image in full detail.

Extract all visible content, including but not limited to:

- Text (Sanskrit, Hindi, or English)
- Lists or tabulated data
- Symbols, mantras, yantras, charts, or illustrations
- Diagrams, deities, astrological or cosmological figures
- Numbered elements, headings, or marked sections
- Handwritten or printed annotations

Present this extracted content in a clear, structured format (use bullet points, numbered lists, or tables where appropriate).

Offer an in-depth interpretation or explanation of the content, guided by its cultural, scriptural, or historical relevance.

If the image pertains to:

- Jyotisha: Identify the chart type, planetary positions, and dasha or drishti systems if visible.
- Scripture or Shloka: Translate the text and provide meanings, grammatical breakdown, and context.
- Iconography or Mandala/Yantra: Describe symbolism, scriptural references, and significance in practice or worship.
- Temple architecture: Explain layout, sculptures, inscriptions, or rituals related to what is shown.

Add references to Shastra, where possible, and Sanskrit terminology with meanings for authenticity.

Guiding Principles:
- Be thorough and scholarly; avoid assumptions not grounded in visible data.
- Maintain discipline-specific terminology (especially from Sanskrit/Hindu studies).
- Politely refuse to interpret images outside the above knowledge systems with:
  “This image lies outside the domain of Hindu knowledge systems, Sanskrit studies, or related dharmic traditions. Please provide an image within that scope.”`
  };
}

// === CORE: getResponseToUserPrompt ===
async function getResponseToUserPrompt(userInput, imagePath, history = []) {
  // 1) Push image part if exists
  if (imagePath) {
    const mimeType = 'image/jpeg';
    const data = fs.readFileSync(imagePath);
    const base64 = data.toString('base64');
    history.push({ role: 'user', parts: [buildImagePromptPart(), { inlineData: { mimeType, data: base64 } }] });
  }

  // 2) Push text input
  if (userInput && userInput.trim()) {
    history.push({ role: 'user', parts: [{ text: userInput }] });
  }

  let answer = null;

  // 3) Rotate through API keys until success
  for (let i = 0; i < API_KEYS.length; i++) {
    const apiKey = getNextApiKey();
    const ai = new GoogleGenAI({ apiKey });

    try {
      // Create chat session with system instruction
      const chat = await ai.chats.create({
        model: 'gemini-2.5-flash-preview-04-17',
        config: { systemInstruction: SYSTEM_INSTRUCTION, tools },
        history,  // pass accumulated history
      });

      // Send the latest user message
      const lastParts = history[history.length - 1].parts;
      const resp = await chat.sendMessage({ message: { parts: lastParts } });
      answer = resp.text;
      break;
    } catch (err) {
      // on 429, continue to next key
      if (err.code === 429 || err.status === 429 || (err.message || '').includes('429')) {
        console.warn(`Key rate-limited, trying next key…`);
        continue;
      }
      throw err;
    }
  }

  if (answer === null) {
    throw new Error('All Gemini API keys are rate-limited.');
  }

  return answer;
}

// === ROUTE: /ask ===
app.post('/ask', upload.single('image'), async (req, res) => {
  const userInput = req.body.prompt;
  const imagePath = req.file ? req.file.path : null;

  try {
    const answer = await getResponseToUserPrompt(userInput, imagePath);
    if (imagePath) fs.unlinkSync(imagePath);
    res.json({ answer });
  } catch (err) {
    console.error('Error processing /ask:', err);
    res.status(500).json({ error: err.message });
  }
});


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

app.get('/AaratisSangrah1', (req, res) => {
  res.sendFile(path.join(__dirname, 'Aaratis_Sangrah.html'));
});

app.get('/Swaminarayan-Sect', (req, res) => {
  res.sendFile(path.join(__dirname, 'Swaminarayan_Sect.html'));
});


app.get('/Kirtan', (req, res) => {
  res.sendFile(path.join(__dirname, 'kirtan.html'));
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
                  text-align: center;
                  color: ghostwhite;
                  width: 90%;
                  overflow-wrap: anywhere;
                  margin-block: 1rem;
              }

              html {
                  background-image: linear-gradient(hsl(246deg 97% 7%), hsl(279deg 97% 9%));
                  min-height: 100dvh;
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
                      text-align: center;
                      color: ghostwhite;
                      width: 90%;
                      overflow-wrap: anywhere;
                      margin-block: 1rem;
                  }

                  html{
                      background-image: linear-gradient(hsl(246deg 97% 7%), hsl(279deg 97% 9%));
                      min-height: 100dvh;
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


function generatePdfMapping(directory) {
  const directoryPath = path.join(__dirname, 'DharmicData', directory);
  const files = fs.readdirSync(directoryPath); // Read files in the directory
  const pdfMapping = {};

  files.forEach(file => {
    const match = file.match(/(.*?)( \d+)?\.pdf$/); // Match main title and optional part number
    if (match) {
      const title = match[1]; // Main title
      if (!pdfMapping[title]) {
        pdfMapping[title] = []; // Initialize array for the title if it doesn't exist
      }
      pdfMapping[title].push(file); // Add the file to the corresponding title
    }
  });

  return pdfMapping;
}

const upnishadPdfMapping = generatePdfMapping('Upnishad'); // Generate the mapping dynamically for Upnishad
const ramayanasPdfMapping = generatePdfMapping('Ramayanas'); // Generate the mapping dynamically for Ramayanas

// Fetch Main PDFs Endpoint for Upnishad
app.get('/fetchMainPdfsUpnishad', (req, res) => {
  const mainPdfs = Object.keys(upnishadPdfMapping); // Get main titles from the mapping
  res.json(mainPdfs);
});

// Fetch Parts for a Selected PDF Endpoint for Upnishad
app.get('/fetchPdfPartsUpnishad', (req, res) => {
  const { pdfName } = req.query;
  const parts = upnishadPdfMapping[pdfName] || []; // Get parts based on the selected main PDF
  res.json(parts);
});

// Fetch Main PDFs Endpoint for Ramayanas
app.get('/fetchMainPdfsRamayanas', (req, res) => {
  const mainPdfs = Object.keys(ramayanasPdfMapping); // Get main titles from the mapping
  res.json(mainPdfs);
});

// Fetch Parts for a Selected PDF Endpoint for Ramayanas
app.get('/fetchPdfPartsRamayanas', (req, res) => {
  const { pdfName } = req.query;
  const parts = ramayanasPdfMapping[pdfName] || []; // Get parts based on the selected main PDF
  res.json(parts);
});

// Start the Express server on a single port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
