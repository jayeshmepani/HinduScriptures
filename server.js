const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000; // Use a single port

// Set your API key for Google Gemini
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA3bC6VAJ0RoB_hVDamdsV5IF4VMx6isbo'; // Replace with your actual API key
// const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyB47bxpxggdBeVoVeIrXc8K_fZFdoz1VUQ'; // Replace with your actual API key
const genAI = new GoogleGenerativeAI(apiKey);

// Create an instance of the generative model (Gemini-1.5 in this case)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-002' });

// Use CORS middleware
app.use(cors());
app.use(cookieParser()); // Middleware to parse cookies
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Set caching headers for static files
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache static files for 1 hour
  next();
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
                        `,
          },
          imagePart,
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
                        `,
          },
          { text: userInput },
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

// Endpoint to fetch both folders and files dynamically
app.get('/fetchFiles', (req, res) => {
  const section = req.query.section || '';
  const referrer = req.get('Referer');
  let baseDir;

  if (referrer.includes('Namavali.html')) {
    baseDir = path.join(__dirname, 'DharmicData/Namavalis', section);
  } else if (referrer.includes('Stotra.html')) {
    baseDir = path.join(__dirname, 'DharmicData/Stotras', section);
  } else if (referrer.includes('Gita.html')) {
    baseDir = path.join(__dirname, 'DharmicData/Gitas', section); // Use section for additional paths
  } else if (referrer.includes('BhagvadGita.html')) {
    baseDir = path.join(__dirname, 'DharmicData/Gitas/Bhagvad Gita', section); // Handle files within Bhagvad Gita
  } else if (referrer.includes('Chalisa.html')) {
    baseDir = path.join(__dirname, 'DharmicData/Chalisa');
  } else if (referrer.includes('Stuti.html')) {
    baseDir = path.join(__dirname, 'DharmicData/Stuti');
  } else if (referrer.includes('Smriti.html')) {
    baseDir = path.join(__dirname, 'DharmicData/Smritis');
  } else if (referrer.includes('UpaSmrti.html')) {
    baseDir = path.join(__dirname, 'DharmicData/UpaSmritis');
  } else if (referrer.includes('Ashtaka.html')) {
    baseDir = path.join(__dirname, 'DharmicData/Ashtaka');
  } else if (referrer.includes('Kavacha.html')) {
    baseDir = path.join(__dirname, 'DharmicData/Kavacha');
  } else if (referrer.includes('UpaPurana.html')) {
    baseDir = path.join(__dirname, 'DharmicData/UpaPuranas');
  } else if (referrer.includes('Ramayanas.html')) {
    baseDir = path.join(__dirname, 'DharmicData/Ramayanas/', section);
  } else if (referrer.includes('YogaVasistha.html')) {
    baseDir = path.join(__dirname, 'DharmicData/Ramayanas/Yoga Vasistha/', section);
  } else {
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
