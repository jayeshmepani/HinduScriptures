const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use(express.static(path.join(__dirname, '..')));

const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });

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

const SYSTEM_INSTRUCTION = `
You are a deeply insightful and traditionally trained scholar of Hinduism, Sanātana Dharma, and all its associated sacred knowledge systems. Your expertise spans both **Vedic** and **post-Vedic traditions**, embracing the full depth of **śruti**, **smṛti**, **tantra**, **oral traditions**, and **devotional literature**. You possess mastery in a vast range of disciplines, including but not limited to the following:

*   **Vedas and Upavedas**: Ṛgveda, Yajurveda, Sāmaveda, Atharvaveda; Ayurveda, Dhanurveda, Gāndharvaveda, Arthashāstra, and more.
*   **Vedāṅgas and Upāṅgas**: Śikṣā (phonetics), Kalpa (rituals), Vyākaraṇa (grammar), Nirukta (etymology), Chandas (prosody), Jyotiṣa (astronomy); Itihāsa, Purāṇa, Nyāya, Dharmaśāstra, and others.
*   **Smṛti and Upa-Smṛti texts**: Manu Smṛti, Yājñavalkya Smṛti, and other lesser-known dharma texts.
*   **Purāṇas, Upa-Purāṇas, Ati-Purāṇas**: Covers all 18 Mahāpurāṇas, Upa-purāṇas like Nāradīya, Saura, Bhaviṣya, and regional or sectarian Ati-purāṇas.
*   **Itihāsas**: Mahābhārata (incl. Harivaṁśa) and the complete **Rāmāyaṇa corpus**, including:
    *   Vālmīki Rāmāyaṇa, Adbhuta Rāmāyaṇa, Ādhyātma Rāmāyaṇa, Rāmcaritmānas, Bhūṣuṇḍī Rāmāyaṇa, Ānanda Rāmāyaṇa, Yoga Vāsiṣṭha, Brahma Rāmāyaṇa, Mantra Rāmāyaṇa, Satyopākhyāna, and others.
*   **All known Gītās** (70+): Bhagavad Gītā, Anu Gītā, Ashtāvakra Gītā, Ailagītā, Aśvaghoṣa Gītā, Agastya Gītā, Aajgar Gītā, and others from Purāṇas and Itihāsas.
*   **Darśanas (Philosophical Systems)**: Vedānta, Sāṅkhya, Nyāya, Vaiśeṣika, Yoga, Pūrva Mīmāṁsā — both classical and applied.
*   **Sanskrit grammar, linguistics, etymology**, and Devanāgarī-based dialects.
*   **Rituals and Karma-kāṇḍa**: Śrauta and Smārta practices, Saṁskāras (sacraments), Yajñas, Pūjās, Vratas, Utsavas (festivals), and other ceremonial rites.
*   **Devotional Literature**: Stotras, Stutis, Aṣṭakas, Āratis, Nāmāvalīs, Kavacas, Chalisās, Bhajans, Harikathās (narratives), and other forms of devotional texts.
*   **Iconography, Yantras, Maṇḍalas, Cosmology**, and **Vāstuśāstra** (science of architecture and spatial arrangement).
*   **Tantra-āgama traditions**: Śaiva, Śākta, Vaiṣṇava āgamas and their associated ritual and philosophical content.
*   **Lineages of ṛṣis, āchāryas, sants, and sampradāyas**: Including classical, Bhakti, modern, and contemporary thinkers and teachers.
*   **Oral traditions**, regional recensions, ślokas, śākhās (branches of Vedic study), and recitational customs.

### Response Guidelines & Behavior:

1.  **Scholarly Depth**: Your answers must be **detailed**, **structured**, and **deeply insightful**, drawing fully from authoritative scriptural and scholarly sources. Provide layered explanations suitable for both beginners and advanced practitioners.
2.  **Sanskrit Integration**: Seamlessly integrate relevant **Sanskrit terms** using standard transliteration (e.g., IAST or similar). Explain their etymology and meaning where appropriate. Use HTML '<em>' or '<strong>' tags to highlight these terms.
3.  **Comparative Analysis**: When asked to compare concepts (e.g., "difference between X and Y"), present the analysis clearly using an HTML '<table>'. The table must have appropriate headers ('<th>') and rows ('<tr>', '<td>') to distinguish the items being compared.
4.  **Scope Adherence**: You must address only queries related to Hinduism, Sanātana Dharma, and its associated knowledge systems as detailed in your expertise.
5.  **Refusal Protocol**: If a question falls outside this defined scope, you MUST respond with *only* the following single HTML paragraph, exactly as written:
    '<p>This question lies outside the domain of Sanātana Dharma, Hinduism, or its associated knowledge systems. Kindly ask something within this sacred context.</p>'

### Strict HTML Output Formatting Rules:

Adhere meticulously to the following rules to ensure consistent and valid HTML output. **No other formats or syntaxes are permitted.**

1.  **HTML Exclusivity**: Your entire response MUST be rendered in valid HTML.
    *   **ABSOLUTELY NO MARKDOWN**: Do not use Markdown syntax (like \*, \*\*, \_, \_\_, \`\`, \`\`\` \`\`\`, #, -, etc.) or generate any Markdown code blocks.
    *   **NO CODE TAGS**: Do not use '<pre>' or '<code>' tags.
    *   **NO BACKTICKS**: Do not include backticks (\`) anywhere in your output.
2.  **Paragraphs**:
    *   Wrap all standard text content within '<p>…</p>' tags.
    *   Place exactly one '<br/>' tag between consecutive '<p>' blocks.
    *   Do not use '<br/>' inside a '<p>' tag.
3.  **Section Headings**:
    *   Use '<h3>…</h3>' for major section titles.
    *   Precede each '<h3>' tag with exactly two '<br/>' tags for clear visual separation.
4.  **Lists**:
    *   Use '<ol><li>…</li></ol>' for ordered lists.
    *   Use '<ul><li>…</li></ul>' for unordered lists.
    *   Do not use Markdown list markers (\*, -, +).
5.  **Tables**:
    *   Use standard HTML table elements: '<table>', '<tr>', '<th>', '<td>'.
    *   Ensure tables are used for structured data, especially for comparisons as specified in the guidelines.
    *   Do not use ASCII or Markdown-style tables.
6.  **Emphasis**:
    *   Use only '<strong>…</strong>' for strong importance.
    *   Use only '<em>…</em>' for emphasis or highlighting terms (like Sanskrit words).
    *   Do not use Markdown emphasis markers (\* or \_).
7.  **Line Break Summary (Strict Enforcement)**:
    *   **0 '<br/>'**: Inside any element like '<p>', '<li>', '<td>', etc.
    *   **1 '<br/>'**: Between consecutive '<p>' blocks.
    *   **2 '<br/>'**: Before each '<h3>' tag and before each '<table>' tag.

Failure to adhere strictly to these HTML-only formatting rules will result in incorrect output. Ensure every response conforms precisely.
`;

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

async function getResponseToUserPrompt(userInput, imagePath, history = []) {
  if (imagePath) {
    const mimeType = 'image/jpeg';
    const data = fs.readFileSync(imagePath);
    const base64 = data.toString('base64');
    history.push({ role: 'user', parts: [buildImagePromptPart(), { inlineData: { mimeType, data: base64 } }] });
  }

  if (userInput && userInput.trim()) {
    history.push({ role: 'user', parts: [{ text: userInput }] });
  }

  let answer = null;

  for (let i = 0; i < API_KEYS.length; i++) {
    const apiKey = getNextApiKey();
    const ai = new GoogleGenAI({ apiKey });

    try {
      const chat = await ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction: SYSTEM_INSTRUCTION, tools },
        history,
      });

      const lastParts = history[history.length - 1].parts;
      const resp = await chat.sendMessage({ message: { parts: lastParts } });
      answer = resp.text;
      break;
    } catch (err) {
      if (err.code === 429 || err.status === 429 || (err.message || '').includes('429') || (err.message || '').includes('RESOURCE_EXHAUSTED')) {
        console.warn(`Key rate-limited or resource exhausted, trying next key…`);
        continue;
      }
      console.error('Gemini API Error:', err);
      throw err;
    }
  }

  if (answer === null) {
    throw new Error('All Gemini API keys are rate-limited or an unrecoverable error occurred.');
  }

  return answer;
}

app.post('/ask', upload.single('image'), async (req, res) => {
  const userInput = req.body.prompt;
  const imagePath = req.file ? req.file.path : null;

  try {
    const answer = await getResponseToUserPrompt(userInput, imagePath);
    if (imagePath) fs.unlinkSync(imagePath);
    res.json({ answer });
  } catch (err) {
    console.error('Error processing /ask:', err);
    if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    res.status(500).json({ error: err.message });
  }
});

const projectRoot = path.join(__dirname, '..');
const htmlDir = path.join(projectRoot, 'html');

const simpleHtmlRoutes = {
  '/': 'index.html',
  '/index': 'index.html',
  '/ramayanas': 'Ramayanas.html',
  '/gitas': 'Gitas.html',
  '/BhagvadGita': 'BhagvadGita.html',
  '/vedas': 'Vedas.html',
  '/puranas': 'Puranas.html',
  '/upa-puranas': 'UpaPuranas.html',
  '/mahabharata': 'ParvaList.html',
  '/smritis': 'Smritis.html',
  '/upa-smritis': 'UpaSmrtis.html',
  '/stotras': 'Stotras.html',
  '/namavalis': 'Namavalis.html',
  '/stutis': 'Stutis.html',
  '/ashtakas': 'Ashtakas.html',
  '/kavachas': 'Kavachas.html',
  '/chalisas': 'Chalisas.html',
  '/puranas-overview': 'Puranas_overview.html',
  '/ai': 'googleAI.html',
  '/Ramcharitmanas': 'Ramcharitmanas.html',
  '/YogaVasistha': 'YogaVasistha.html',
  '/DattPurana': 'DattP.html',
  '/HarivanshaPurana': 'HarivanshaP.html',
  '/NaradiyaPurana': 'NaradiyaP.html',
  '/VishnudharmottarPurana': 'VishnudharmottarP.html',
  '/KalikaPurana': 'KalikaP.html',
  '/MallaPurana': 'MallaP.html',
  '/MudgalaPurana': 'MudgalaP.html',
  '/ShivadharmaPurana': 'ShivadharmaP.html',
  '/SrimadDeviBhagwatPurana': 'SrimadDeviBhagwatP.html',
  '/AgniPurana': 'AgniPurana.html',
  '/BhagavataPurana': 'BhagavataPurana.html',
  '/BhavishyaPurana': 'BhavishyaPurana.html',
  '/BrahmaPurana': 'BrahmaPurana.html',
  '/BrahmaandaPurana': 'BrahmaandaPurana.html',
  '/BrahmavaivartaPurana': 'BrahmavaivartaPurana.html',
  '/GarudaPurana': 'GarudaPurana.html',
  '/KurmaPurana': 'KurmaPurana.html',
  '/LingaPurana': 'LingaPurana.html',
  '/MarkandeyaPurana': 'MarkandeyaPurana.html',
  '/MatsyaPurana': 'MatsyaPurana.html',
  '/NaradaPurana': 'NaradaPurana.html',
  '/PadmaPurana': 'PadmaPurana.html',
  '/ShivaPurana': 'ShivaPurana.html',
  '/SkandaPurana': 'SkandaPurana.html',
  '/VamanaPurana': 'VamanaPurana.html',
  '/VarahaPurana': 'VarahaPurana.html',
  '/VayuPurana': 'VayuPurana.html',
  '/VishnuPurana': 'VishnuPurana.html',
  '/book': 'pdfrendering.html',
  '/Vedanga': 'Vedanga.html',
  '/Upanga': 'Upanga.html',
  '/upnishad': 'Upnishad.html',
  '/aarati': 'Aaratis.html',
  '/Bhajan': 'Bhajan.html',
  '/AaratisSangrah1': 'Aaratis_Sangrah.html',
  '/Swaminarayan-Sect': 'Swaminarayan_Sect.html',
  '/Kirtan': 'kirtan.html',
  '/AgniPuranaContent': 'AgniPuranaContent.html',
  '/AtharvaVedaContent': 'AtharvaVedaContent.html',
  '/BhagavadGitaContent': 'BhagavadGitaContent.html',
  '/BhagavataPuranaContent': 'BhagavataPuranaContent.html',
  '/BhavishyaPuranaContent': 'BhavishyaPuranaContent.html',
  '/BrahmaandaPuranaContent': 'BrahmaandaPuranaContent.html',
  '/BrahmaPuranaContent': 'BrahmaPuranaContent.html',
  '/BrahmavaivartaPuranaContent': 'BrahmavaivartaPuranaContent.html',
  '/GarudaPuranaContent': 'GarudaPuranaContent.html',
  '/kandaContent': 'kandaContent.html',
  '/KurmaPuranaContent': 'KurmaPuranaContent.html',
  '/LingaPuranaContent': 'LingaPuranaContent.html',
  '/MarkandeyaPuranaContent': 'MarkandeyaPuranaContent.html',
  '/MatsyaPuranaContent': 'MatsyaPuranaContent.html',
  '/NaradaPuranaContent': 'NaradaPuranaContent.html',
  '/PadmaPuranaContent': 'PadmaPuranaContent.html',
  '/ParvaContent': 'ParvaContent.html',
  '/RigvedaContent': 'RigvedaContent.html',
  '/ShivaPuranaContent': 'ShivaPuranaContent.html',
  '/SkandaPuranaContent': 'SkandaPuranaContent.html',
  '/VamanaPuranaContent': 'VamanaPuranaContent.html',
  '/VarahaPuranaContent': 'VarahaPuranaContent.html',
  '/VayuPuranaContent': 'VayuPuranaContent.html',
  '/VishnuPuranaContent': 'VishnuPuranaContent.html',
  '/YajurVedaContent': 'YajurVedaContent.html',
  '/YogaVasisthaContent': 'YogaVasisthaContent.html',
  '/Mahabharata-overview': 'Mahabharata_overview.html',
  '/bhagavadGitaOverview': 'Bhagavad Gita_overview.html',
  '/ramayanaOverview': 'Ramayana_overview.html',
  '/ramayanaKandaList': 'kandaList.html',
  '/adbhutRamayana': 'AdbhutRamayanBook.html',
  '/adhyatmaRamayana': 'AdhyatmaRamayanaBook.html',
  '/vedasOverview': 'Vedas_overview.html',
  '/rigVeda': 'RigVeda.html',
  '/yajurVeda': 'YajurVeda.html',
  '/samaVeda': 'Samaveda.html',
  '/atharvaVeda': 'AtharvaVeda.html'
};

for (const [route, fileName] of Object.entries(simpleHtmlRoutes)) {
  app.get(route, (req, res) => {
    res.sendFile(path.join(htmlDir, fileName), (err) => {
      if (err) {
        console.error(`Error sending file: ${fileName} for route ${route}`, err);
        if (!res.headersSent) {
          res.status(err.status || 500).send(`Could not load page: ${fileName}`);
        }
      }
    });
  });
}

app.get('/content', (req, res) => {
  const filename = req.query.filename; 

  if (!filename) {
    return res.status(400).send('Filename is required');
  }

  const fileType = filename.split('.').pop();

  if (fileType === 'json') {
    res.sendFile(path.join(__dirname, '../html/Content(json).html'));
  } else if (fileType === 'pdf') {
    res.sendFile(path.join(__dirname, '../html/Content(pdf).html'));
  } else {
    return res.status(406).send('Not Acceptable: Supported formats are JSON or PDF');
  }
});


app.get('/search', async (req, res) => {
  const searchQuery = req.query.q ? req.query.q.toLowerCase().trim() : '';
  const results = new Set();

  if (!searchQuery) {
    res.send('<p>Please enter a search term.</p>');
    return;
  }

  const baseDir = path.join(__dirname, '../DharmicData');

  function searchDirectories(dir, currentPath) {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(dir, item.name);
      const fullPath = path.join(currentPath, item.name); 

      if (item.isDirectory()) {
        if (item.name.toLowerCase().includes(searchQuery)) {
          results.add(`/browse?dir=${encodeURIComponent(fullPath)}&q=${encodeURIComponent(searchQuery)}`);
        }

        searchDirectories(itemPath, fullPath);
      } else if (item.isFile() && item.name.endsWith('.json')) {
        if (item.name.toLowerCase().includes(searchQuery)) {
          results.add(`/browse?dir=${encodeURIComponent(currentPath)}&q=${encodeURIComponent(searchQuery)}`);
        }
      }
    }
  }

  searchDirectories(baseDir, '../DharmicData');

  res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Search Results</title>
          <link rel="stylesheet" href="/css/style.css">
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
        const displayResult = result.split('&')[0];
        let cleanDisplayName = decodeURIComponent(displayResult.split('=')[1]);

        cleanDisplayName = cleanDisplayName
          .replace(/\.\.[\/\\]/g, '')
          .replace(/\\/g, '/')
          .replace('DharmicData/', '')
          .replace(/^\/+/, '');

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


app.get('/browse', (req, res) => {
  const dirPath = req.query.dir;
  const searchQuery = req.query.q ? req.query.q.toLowerCase() : '';

  if (!dirPath) {
    res.send('<p>Directory not specified.</p>');
    return;
  }

  const fullPath = path.join(__dirname, dirPath);

  try {
    const items = fs.readdirSync(fullPath, { withFileTypes: true });

    const filteredItems = new Set();

    items.forEach(item => {
      if (item.name.toLowerCase().includes(searchQuery)) {
        filteredItems.add(item);
      }
    });

    const dirName = path.basename(fullPath).toLowerCase();
    if (searchQuery && dirName.includes(searchQuery)) {
      items.forEach(item => {
        filteredItems.add(item); 
      });
    }

    const contentHtml = Array.from(filteredItems).map(item => {
      const itemLink = path.join(dirPath, item.name);
      const itemNameWithoutExtension = item.isFile() ? item.name.replace(/\.[^/.]+$/, "") : item.name; 

      if (item.isDirectory()) {
        return `<div class="result-item">
                    <a href="/browse?dir=${encodeURIComponent(itemLink)}&q=${encodeURIComponent(searchQuery)}">
                        ${itemNameWithoutExtension}
                    </a>
                </div>`;
      } else {
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
              <link rel="stylesheet" href="/css/style.css">
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
              <h1>Contents of "${dirPath.replace(/\.\.\//g, '').replace(/\\/g, '/').replace(/^.*DharmicData\//, '')}"</h1>
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

app.get('/fetchFiles', (req, res) => {
  const section = req.query.section || '';
  const referrer = req.get('Referer') || '';
  let relativeBasePath = '';
  if (referrer.includes('Namavali')) relativeBasePath = path.join('Namavalis', section);
  else if (referrer.includes('Stotra')) relativeBasePath = path.join('Stotras', section);
  else if (referrer.includes('Gitas')) relativeBasePath = 'Gitas';
  else if (referrer.includes('BhagvadGita')) relativeBasePath = path.join('Gitas', 'Bhagvad Gita');
  else if (referrer.includes('Chalisas')) relativeBasePath = 'Chalisa';
  else if (referrer.includes('Stutis')) relativeBasePath = 'Stuti';
  else if (referrer.includes('Smritis')) relativeBasePath = 'Smritis';
  else if (referrer.includes('upa-smritis')) relativeBasePath = 'UpaSmritis';
  else if (referrer.includes('Ashtakas')) relativeBasePath = 'Ashtaka';
  else if (referrer.includes('Kavachas')) relativeBasePath = 'Kavacha';
  else if (referrer.includes('UpaPuranas')) relativeBasePath = 'UpaPuranas';
  else if (referrer.includes('Ramayanas')) relativeBasePath = 'Ramayanas';
  else if (referrer.includes('YogaVasistha')) relativeBasePath = path.join('Ramayanas', 'Yoga Vasistha', section);
  else if (referrer.includes('Vedanga')) relativeBasePath = path.join('Vedanga', section);
  else if (referrer.includes('Upanga')) relativeBasePath = 'Upanga';
  else if (referrer.includes('Upnishad')) relativeBasePath = 'Upnishad';
  else if (referrer.includes('Aarati')) relativeBasePath = 'Aartis';
  else if (referrer.includes('Bhajan')) relativeBasePath = 'Bhajan';
  else if (referrer.includes('Swaminarayan-Sect')) relativeBasePath = path.join('Swaminarayan Sect', section);
  else {
    return res.status(400).json({ error: 'Invalid or missing referrer to determine data section' });
  }
  const fullBaseDir = path.join(projectRoot, 'DharmicData', relativeBasePath);
  if (!fs.existsSync(fullBaseDir)) {
    console.error(`Directory not found for fetchFiles: ${fullBaseDir} (Referrer: ${referrer}, Section: ${section})`);
    return res.status(404).json({ error: 'Invalid directory or section' });
  }
  fs.readdir(fullBaseDir, { withFileTypes: true }, (err, items) => {
    if (err) {
      console.error(`Error reading directory ${fullBaseDir}:`, err);
      return res.status(500).json({ error: 'Error reading directory' });
    }
    const folders = [];
    const files = [];
    items.forEach(item => {
      if (item.isDirectory()) {
        folders.push(item.name);
      } else if (item.isFile() && ['.pdf', '.json'].includes(path.extname(item.name).toLowerCase())) {
        files.push(item.name);
      }
    });
    folders.sort((a, b) => a.localeCompare(b));
    files.sort((a, b) => a.localeCompare(b));
    res.json({ folders, files, currentPath: path.join('DharmicData', relativeBasePath).replace(/\\/g, '/') });
  });
});

function generatePdfMapping(directory) {
  const directoryPath = path.join(__dirname, '../DharmicData', directory);
  const files = fs.readdirSync(directoryPath);
  const pdfMapping = {};

  files.forEach(file => {
    const match = file.match(/(.*?)( \d+)?\.pdf$/);
    if (match) {
      const title = match[1];
      if (!pdfMapping[title]) {
        pdfMapping[title] = [];
      }
      pdfMapping[title].push(file);
    }
  });

  return pdfMapping;
}

const upnishadPdfMapping = generatePdfMapping('Upnishad');
const ramayanasPdfMapping = generatePdfMapping('Ramayanas');

app.get('/fetchMainPdfsUpnishad', (req, res) => {
  const mainPdfs = Object.keys(upnishadPdfMapping);
  res.json(mainPdfs);
});

app.get('/fetchPdfPartsUpnishad', (req, res) => {
  const { pdfName } = req.query;
  const parts = upnishadPdfMapping[pdfName] || [];
  res.json(parts);
});

app.get('/fetchMainPdfsRamayanas', (req, res) => {
  const mainPdfs = Object.keys(ramayanasPdfMapping);
  res.json(mainPdfs);
});

app.get('/fetchPdfPartsRamayanas', (req, res) => {
  const { pdfName } = req.query;
  const parts = ramayanasPdfMapping[pdfName] || [];
  res.json(parts);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Project root resolved to: ${projectRoot}`);
  console.log(`HTML directory resolved to: ${htmlDir}`);
});
