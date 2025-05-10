# Hindu Scriptures: Digital Repository & AI Scholar

**नित्यमेवावतिष्ठते ॥**

**Live Application:** [https://hinduscriptures.onrender.com/](https://hinduscriptures.onrender.com/)  
**GitHub Repository:** [https://github.com/jayeshmepani/HinduScriptures.git](https://github.com/jayeshmepani/HinduScriptures.git)  
**Latest Release (Android APK):** [https://github.com/jayeshmepani/HinduScriptures/releases/tag/HinduScripture](https://github.com/jayeshmepani/HinduScriptures/releases/tag/HinduScripture)

---

## Project Overview

Welcome to the **Hindu Scriptures Digital Repository & AI Scholar**, a comprehensive web platform dedicated to the profound wisdom and rich heritage of Sanātana Dharma. This project serves as an accessible digital library, offering a vast collection of sacred texts alongside an interactive AI scholar designed for deep exploration and learning.

Whether you are a lifelong practitioner, a student of religion, or simply curious, this platform provides tools to navigate, read, search, and understand the diverse scriptures of Hinduism. Engage directly with the texts through our integrated reader or pose your questions to our specialized AI for insightful explanations grounded in traditional scholarship.

## Key Features

*   **Extensive & Organized Scripture Database (`DharmicData/`)**: Access a meticulously organized collection spanning the breadth of Hindu literature:
    *   **Śruti**: Vedas (Rigveda, Yajurveda, Samaveda, Atharvaveda) and Upanishads.
    *   **Smṛti**: Major Smritis (Manu, Yajnavalkya, etc.) and Upa-Smritis.
    *   **Itihāsa**: The complete Ramayana corpus (Valmiki, Adhyatma, Adbhuta, Ramcharitmanas, etc.) and the Mahabharata.
    *   **Purāṇa**: All 18 Mahāpurāṇas, Upa-purāṇas (like Naradiya, Kalika, Shiva Dharma), and Harivamsha Purana, categorized and often chapter-wise. Includes a Puranas Overview.
    *   **Gītās**: A wide collection including the Bhagavad Gita, Anu Gita, Ashtavakra Gita, Devi Gita, Shiva Gita, Guru Gita, and many more.
    *   **Vedāṅga & Upāṅga**: Auxiliary disciplines like Shiksha, Kalpa (Shrauta, Grihya, Dharma Sutras), Vyakarana (Ashtadhyayi), Nirukta, Chandas, Jyotisha, and the Darshanas.
    *   **Devotional Literature**: A vast selection including Aaratis, Ashtakas, Bhajans, Chalisas, Kavachas, Namavalis (108, 1000 names), Stotras, and Stutis, often categorized by deity or type.
    *   **Sect-Specific Texts**: Resources from traditions like the Swaminarayan Sampradaya.
*   **Multiple Navigation & Search Methods**:
    *   **Categorized Browsing**: Navigate scriptures via logical groupings on the main page.
    *   **Sitemap Search & Browse**: Explore the `DharmicData` directory structure directly or search for specific folders/files.
    *   **AI-Powered Scholar**: Ask questions in natural language about any aspect of Sanātana Dharma.
*   **Integrated PDF Viewer**:
    *   Read single PDF documents seamlessly within the browser.
    *   Features intuitive page navigation (page number input, arrows, scrolling, touch swipes).
*   **AI Scholar Interaction**:
    *   Leverages Google's Gemini API for sophisticated understanding and response generation.
    *   Trained via a detailed `SYSTEM_INSTRUCTION` to act as a knowledgeable, traditional scholar.
    *   Provides **structured responses**.
    *   Supports **image-based queries** for analyzing yantras, deities, manuscript pages, etc.
    *   Includes **API key rotation** for enhanced availability.
*   **Dynamic Content Loading**: Scripture lists and sub-sections are loaded dynamically, enhancing performance and user experience.

## Technology Stack

*   **Backend**:
    *   Node.js
    *   Express.js
*   **Frontend**:
    *   HTML5
    *   CSS3
    *   Vanilla JavaScript (for UI interactions, API calls, PDF handling)
*   **AI Integration**:
    *   Google Gemini API (`@google/genai`)
*   **PDF Handling (Client-Side)**:
    *   **PDF.js**: Library for rendering PDF documents within the browser canvas.
    *   **pdf-lib**: Library used for merging multiple PDF files into a single document in the browser.
*   **Core Dependencies**:
    *   `cors`: Enables Cross-Origin Resource Sharing for API endpoints.
    *   `multer`: Middleware for handling `multipart/form-data`, used for image uploads to the AI.
    *   `dotenv`: Loads environment variables from a `.env` file.
*   **Development**:
    *   `nodemon`: Monitors for file changes and automatically restarts the server.


## ⚙️ Prerequisites & Installation

### Prerequisites

*   [Node.js](https://nodejs.org/) (v16+ recommended)
*   [npm](https://www.npmjs.com/) (comes with Node.js)
*   Git client

### Installation Steps

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/jayeshmepani/HinduScriptures.git
    cd HinduScriptures
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables:**
    *   Create a `.env` file in the project root (you can copy `.env.example`):
        ```bash
        cp .env.example .env
        ```
    *   Edit the `.env` file and provide your Google Gemini API keys and optionally change the port:
        ```env
        PORT=3000
        GEMINI_API_KEY1=YOUR_GEMINI_API_KEY_1
        GEMINI_API_KEY2=YOUR_GEMINI_API_KEY_2
        # Add GEMINI_API_KEY3, GEMINI_API_KEY4, GEMINI_API_KEY5 if available
        ```
    *   **Important:** Ensure the `.env` file is listed in your `.gitignore` to avoid accidentally committing your API keys.

4.  **Populate the `DharmicData` Directory:**
    This is the core content library. You must place your scripture files (PDFs, JSONs) into the `DharmicData` directory, following the organizational structure shown above (or adapting the server logic if your structure differs). The application relies heavily on this structure.

## ▶️ Running the Application

*   **Development Mode (Recommended for development):**
    Uses `nodemon` to automatically restart the server when files change.
    ```bash
    npm run dev
    ```

*   **Production Mode:**
    Runs the server directly using Node.
    ```bash
    npm start
    ```

After starting, access the application in your web browser, typically at `http://localhost:3000` (or the `PORT` specified in your `.env` file).

## ☕ Support the Project

Developing and maintaining this extensive digital repository and AI scholar requires significant time and effort.

*   **Reporting Issues & Suggesting Features:** If you encounter any bugs or have ideas for improvement, please open an issue on the [GitHub Issues Page](https://github.com/jayeshmepani/HinduScriptures/issues).

Your support and feedback are greatly appreciated!

## License

This project is currently distributed without a specific open-source license. All rights are reserved by the developer. Please contact the maintainer for any licensing inquiries or permissions.

## Acknowledgments

This project stands on the shoulders of giants. Deep gratitude is extended to:

*   The innumerable Rishis, Acharyas, Saints, and scholars of the Sanātana Dharma tradition who revealed and preserved this timeless wisdom.
*   The creators and maintainers of digital Sanskrit libraries and online scriptural resources.
*   The developers of the open-source tools and libraries (Node.js, Express, PDF.js, pdf-lib, Google Gemini, etc.) that made this project possible.

## Developer & Contact

*   **Jayesh Patel**
*   **Email:** [jayeshmepani09@gmail.com](mailto:jayeshmepani09@gmail.com)
*   **GitHub:** [https://github.com/jayeshmepani](https://github.com/jayeshmepani)
