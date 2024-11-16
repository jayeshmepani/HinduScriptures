// Function to fetch JSON file
function fetchJSONFile(filePath) {
    return fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch JSON file: ${filePath}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error(`Error fetching JSON file: ${filePath}`, error);
            throw error;
        });
}

// Function to display the content of a selected Kanda on kandaContent
function displayKandaContent() {
    // Get query parameters from the URL
    const searchResultsContainer = document.querySelector('.search-results');
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // Get kandaNumber and selectedKanda from URL parameters
    const kandaNumber = urlParams.get('kandaNumber');
    const selectedKanda = urlParams.get('selectedKanda');

    // Log the values for debugging
    console.log(`kandaNumber: ${kandaNumber}, selectedKanda: ${selectedKanda}`);

    // Check if selectedKanda is not undefined before using toLowerCase
    if (selectedKanda) {
        // Use selectedKanda.toLowerCase() safely
        console.log(`Lowercased selectedKanda: ${selectedKanda.toLowerCase()}`);
    } else {
        console.log('selectedKanda is undefined or null');
    }

    // Load the JSON file dynamically based on the selected Kanda
    const jsonFilePath = `DharmicData/Ramayanas/ValmikiRamayana/${kandaNumber}_${selectedKanda.toLowerCase()}.json`;
    console.log(`jsonFilePath: ${jsonFilePath}`);

    // Fetch and display the JSON file content
    fetchJSONFile(jsonFilePath)
        .then(data => {
            // Log the data for debugging
            console.log('Fetched data:', data);

            // Display the content in the search-results container
            data.forEach(entry => {
                const entryDetails = document.createElement('div');
                // Display Kaanda, Sarg, Shloka, and Text
                entryDetails.innerHTML = `
                    <div style="display: grid; align-items: center; justify-content: center;">
                        <p style="color: yellow;">Kaanda: ${entry.kaanda.charAt(0).toUpperCase() + entry.kaanda.slice(1)}</p>
                        <p style="color: white;">Sarg: ${entry.sarg}</p>
                        <p style="color: white;">Shloka: ${entry.shloka}</p>
                        <p style="color: orange;">${formatText(entry.text)}</p>
                        <br><br>
                    </div>
                `;

                searchResultsContainer.appendChild(entryDetails);
            });
        })
        .catch(error => {
            console.error(`Error loading ${selectedKanda} data:`, error);
            displayNoResults();
        });
}

// Function to format text
function formatText(text) {
    const indexOfPipe = text.indexOf('।');
    if (indexOfPipe !== -1) {
        return text.replace('।', ' ।<br>');
    }
    return text;
}

// Function to display no results message
function displayNoResults() {
    const searchResultsContainer = document.querySelector('.search-results');
    const noResultsMessage = document.createElement('div');
    noResultsMessage.innerHTML = `<p>No results found.</p>`;
    searchResultsContainer.appendChild(noResultsMessage);
}

// Function to create and handle the "Translate" button
function createTranslateButton() {
    const button = document.createElement('button');
    button.innerText = 'Translate';
    button.type = 'submit';
    button.className = 'btn waves-effect waves-light';

    // Button styles
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.padding = '10px';
    button.style.borderRadius = '13px';
    button.style.background = '#00796b';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.transition = 'all 0.3s ease';

    // Hover effect
    button.addEventListener('mouseover', () => {
        button.style.boxShadow = 'inset 9.61px 9.61px 16px hsl(179, 91%, 23%), inset -9.61px -9.61px 16px hsl(179, 91%, 37%)';
    });
    button.addEventListener('mouseout', () => {
        button.style.boxShadow = 'inset 9.61px 9.61px 16px #047471, inset -9.61px -9.61px 16px #06aaa7';
    });

    // Translation URL construction and opening
    button.addEventListener('click', () => {
        const additionalParams = `_x_tr_sl=sa&_x_tr_tl=en&_x_tr_hl=en-GB`;
        const originalBaseUrl = 'https://hinduscriptures.onrender.com/';
        const translatedBaseUrl = 'https://hinduscriptures-onrender-com.translate.goog/';
        const currentPath = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        const kandaNumber = urlParams.get('kandaNumber');
        const selectedKanda = urlParams.get('selectedKanda');
        
        // Constructing the translated URL
        const extendedUrl = `${translatedBaseUrl}${currentPath}.html?kandaNumber=${kandaNumber}&selectedKanda=${selectedKanda}&${additionalParams}`;
        
        console.log(`Extended URL: ${extendedUrl}`);
        window.open(extendedUrl, '_blank');
    });

    document.body.appendChild(button);
}

// Call the function to display content and create the Translate button when the page loads
window.onload = () => {
    displayKandaContent();
    createTranslateButton();
};
