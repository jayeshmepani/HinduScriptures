const filenameToBook = {
    '1.json': 'Bāla Kāṇḍa',
    '2.json': 'Ayodhyā Kāṇḍa',
    '3.json': 'Araṇya Kāṇḍa',
    '4.json': 'Kiṣkindhā Kāṇda',
    '5.json': 'Sundara Kaṇḍa',
    '6.json': 'Yuddha Kāṇḍa',
    '7.json': 'Uttara Kanda'
};

// Get the filename from the query parameters
const urlParams = new URLSearchParams(window.location.search);
const filename = urlParams.get('filename');
console.log('Filename:', filename);

fetch(`DharmicData/Ramayanas/ValmikiRamayana/${filename}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch JSON file: ${filename}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('JSON Data:', data);

        const jsonContentDiv = document.getElementById('jsonContent');
        const sargSelector = document.getElementById('sargSelector');
        const shlokaSelector = document.getElementById('shlokaSelector');

        // Get the book name from the filenameToBook mapping
        const bookName = filenameToBook[filename] || filename;

        // Populate sarg selector dynamically
        const sargs = Array.from(new Set(data.map(entry => entry.sarg)));
        sargs.forEach(sarg => {
            const option = document.createElement('option');
            option.value = sarg;
            option.innerText = `sarg ${sarg}`;
            sargSelector.appendChild(option);
        });

        // Function to populate the shloka selector based on the selected sarg
        function populateshlokaSelector(selectedsarg) {
            // Clear existing shloka options
            shlokaSelector.innerHTML = '<option value="all">All</option>';

            // Find the number of shlokas for the selected sarg
            const shlokasInsarg = data.filter(entry => entry.sarg === selectedsarg);
            const numshlokas = Math.max(...shlokasInsarg.map(entry => entry.shloka));

            // Populate the shloka selector with appropriate range based on the number of shlokas in the sarg
            for (let i = 1; i <= numshlokas; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.innerText = `shloka ${i}`;
                shlokaSelector.appendChild(option);
            }
        }

        // Function to filter and display content based on selected sarg and shloka
        function filterContent() {
            const selectedsarg = sargSelector.value;
            const selectedshloka = shlokaSelector.value;

            // Filter data based on selected sarg and shloka
            const filteredData = data.filter(entry => {
                const sargMatch = selectedsarg === 'all' || entry.sarg === parseInt(selectedsarg);
                const shlokaMatch = selectedshloka === 'all' || entry.shloka === parseInt(selectedshloka);
                return sargMatch && shlokaMatch;
            });

            // Clear existing content
            jsonContentDiv.innerHTML = '';

            // Display filtered content
            filteredData.forEach(entry => {
                const entryDiv = document.createElement('div');
                entryDiv.innerHTML = `
                    <div style="display: grid; align-items: center; justify-content: center;">
                        <p style="color: yellow;">Kaanda: ${entry.kaanda.charAt(0).toUpperCase() + entry.kaanda.slice(1)}</p>
                        <p style="color: white;">Sarg: ${entry.sarg}</p>
                        <p style="color: white;">shloka: ${entry.shloka}</p>
                        <p style="color: orange;">${formatText(entry.text)}</p>
                        <br><br>
                    </div>
                `;
                jsonContentDiv.appendChild(entryDiv);
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

        // Add event listeners for selectors
        sargSelector.addEventListener('change', (e) => {
            const selectedsarg = parseInt(e.target.value);
            populateshlokaSelector(selectedsarg);
            filterContent(); // Re-filter content when sarg changes
        });

        shlokaSelector.addEventListener('change', filterContent);

        // Initial population of shloka options when page loads
        populateshlokaSelector('all');
        filterContent(); // Initial content display
    })
    .catch(error => {
        console.error(`Error fetching or displaying JSON file ${filename}:`, error);
    });


// Function to create and handle the "Translate" button
function createTranslateButton() {
    const button = document.createElement('button');
    button.innerText = 'Translate';
    button.type = 'submit';
    button.className = 'btn waves-effect waves-light';

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

    button.addEventListener('mouseover', () => {
        button.style.boxShadow = 'inset 9.61px 9.61px 16px hsl(179, 91%, 23%), inset -9.61px -9.61px 16px hsl(179, 91%, 37%)';
    });
    button.addEventListener('mouseout', () => {
        button.style.boxShadow = 'inset 9.61px 9.61px 16px #047471, inset -9.61px -9.61px 16px #06aaa7';
    });

    button.addEventListener('click', initiateTranslation);

    document.body.appendChild(button);
}

// Function to handle translation URL generation and opening
function initiateTranslation() {
    const additionalParams = `_x_tr_sl=sa&_x_tr_tl=en&_x_tr_hl=en-GB`;
    const originalBaseUrl = 'https://hinduscriptures.onrender.com';
    const translatedBaseUrl = 'https://hinduscriptures-onrender-com.translate.goog';
    const currentPath = window.location.pathname;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const filename = urlParams.get('filename');

    const extendedUrl = filename
        ? `${translatedBaseUrl}${currentPath}.html?filename=${encodeURIComponent(filename)}&${additionalParams}`
        : `${translatedBaseUrl}${currentPath}.html?${additionalParams}`;

    console.log(`Extended URL: ${extendedUrl}`);
    window.open(extendedUrl, '_blank');
}

window.onload = createTranslateButton;