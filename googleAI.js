// Import necessary modules
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

// Set your API key for Google Gemini
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA3bC6VAJ0RoB_hVDamdsV5IF4VMx6isbo'; // Replace with your actual API key
const genAI = new GoogleGenerativeAI(apiKey);

// Create an instance of the generative model (Gemini-1.5 in this case)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-002' });

// Serve static files from the current directory
app.use(express.json());
app.use(express.static(__dirname));

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Directory to store uploaded files

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

// Endpoint to serve the frontend HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'googleAI.html'));
});

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

// Start the Express server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
