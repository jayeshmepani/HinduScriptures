const filenameToBook = {
    '1.json': 'Bāla Kāṇḍa',
    '2.json': 'Ayodhyā Kāṇḍa',
    '3.json': 'Araṇya Kāṇḍa',
    '4.json': 'Kiṣkindhā Kāṇda',
    '5.json': 'Sundara Kaṇḍa',
    '6.json': 'Yuddha Kāṇḍa',
    '7.json': 'Uttara Kanda'
};

const urlParams = new URLSearchParams(window.location.search);
const filename = urlParams.get('filename');

let allKandaData = [];
let currentBookName = '';
let debounceTimeout;
let synthVoices = [];
const HARDCODED_VOICE_NAME = "Microsoft Madhur Online (Natural) - Hindi (India)";
const HARDCODED_PITCH = 0.75;
const HARDCODED_RATE = 0.83;

const jsonContentDiv = document.getElementById('jsonContent');
const sargSelector = document.getElementById('sargSelector');
const shlokaSelector = document.getElementById('shlokaSelector');
const searchInput = document.getElementById('searchInput');
const kandaTitleElement = document.getElementById('kandaTitle');

function formatText(text) {
    return text.replace(/।/g, ' ।<br>');
}

function populateSargSelector() {
    const sargs = [...new Set(allKandaData.map(entry => entry.sarg))].sort((a, b) => a - b);
    sargSelector.innerHTML = '<option value="all">All Sargas</option>';
    sargs.forEach(sarg => {
        const option = document.createElement('option');
        option.value = sarg;
        option.innerText = `Sarg ${sarg}`;
        sargSelector.appendChild(option);
    });
}

function populateShlokaSelector(selectedSargValue) {
    const currentShlokaVal = shlokaSelector.value;
    shlokaSelector.innerHTML = '<option value="all">All Shlokas</option>';

    if (selectedSargValue === 'all' || !allKandaData.length) {
        shlokaSelector.value = 'all';
        shlokaSelector.disabled = true;
    } else {
        shlokaSelector.disabled = false;
        const sargNumber = parseInt(selectedSargValue);
        const shlokaNumbersInSarg = [...new Set(
            allKandaData
                .filter(entry => entry.sarg === sargNumber)
                .map(entry => entry.shloka)
        )].sort((a, b) => a - b);

        if (shlokaNumbersInSarg.length > 0) {
            shlokaNumbersInSarg.forEach(shlokaNum => {
                const option = document.createElement('option');
                option.value = shlokaNum;
                option.innerText = `Shloka ${shlokaNum}`;
                shlokaSelector.appendChild(option);
            });
            if (shlokaNumbersInSarg.includes(parseInt(currentShlokaVal))) {
                shlokaSelector.value = currentShlokaVal;
            } else {
                shlokaSelector.value = 'all';
            }
        } else {
            shlokaSelector.value = 'all';
        }
    }
}

function filterAndDisplayContent() {
    const selectedSarg = sargSelector.value;
    const selectedShloka = shlokaSelector.value;
    const searchTerm = searchInput.value.trim().toLowerCase();
    jsonContentDiv.innerHTML = '<div class="loader">Filtering content...</div>';

    setTimeout(() => {
        let filteredData = allKandaData;
        if (selectedSarg !== 'all') {
            filteredData = filteredData.filter(entry => entry.sarg === parseInt(selectedSarg));
        }
        if (selectedShloka !== 'all' && !shlokaSelector.disabled) {
            filteredData = filteredData.filter(entry => entry.shloka === parseInt(selectedShloka));
        }
        if (searchTerm) {
            filteredData = filteredData.filter(entry => entry.text.toLowerCase().includes(searchTerm));
        }
        jsonContentDiv.innerHTML = '';

        if (filteredData.length === 0) {
            jsonContentDiv.innerHTML = '<p class="no-results">No shlokas found matching your criteria.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        filteredData.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'shloka-entry';
            let displayText = formatText(entry.text);
            if (searchTerm) {
                const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                displayText = displayText.replace(regex, match => `<span class="highlight">${match}</span>`);
            }

            entryDiv.innerHTML = `
                <div class="shloka-header">
                    <span class="shloka-meta">Sarg: ${entry.sarg}, Shloka: ${entry.shloka}</span>
                </div>
                <p class="shloka-text">${displayText}</p>
            `;
            fragment.appendChild(entryDiv);
        });
        jsonContentDiv.appendChild(fragment);
    }, 50);
}

if (!filename) {
    jsonContentDiv.innerHTML = '<p class="no-results" style="color:red;">Error: Kanda data file not specified in URL.</p>';
} else {
    fetch(`/DharmicData/Ramayanas/ValmikiRamayana/${filename}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch JSON file: ${filename}. Status: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            allKandaData = data;
            currentBookName = filenameToBook[filename] || filename.replace('.json', '');
            document.title = `${currentBookName} - Content`;
            kandaTitleElement.textContent = currentBookName;
            populateSargSelector();
            populateShlokaSelector(sargSelector.value);
            filterAndDisplayContent();
        })
        .catch(error => {
            jsonContentDiv.innerHTML = `<p class="no-results" style="color:red;">Error loading Kanda data: ${error.message}</p>`;
            console.error(`Error loading Kanda data: ${error.message}`);
        });
}

sargSelector.addEventListener('change', (e) => {
    populateShlokaSelector(e.target.value);
    filterAndDisplayContent();
});

shlokaSelector.addEventListener('change', filterAndDisplayContent);

searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        filterAndDisplayContent();
    }, 300);
});


function createTranslateButton() {
    const translateButtonContainer = document.querySelector('.translate-button-container');
    if (!translateButtonContainer) return;

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
    button.style.zIndex = '1001';

    button.addEventListener('mouseover', () => {
        button.style.boxShadow = 'inset 9.61px 9.61px 16px hsl(179, 91%, 23%), inset -9.61px -9.61px 16px hsl(179, 91%, 37%)';
    });
    button.addEventListener('mouseout', () => {
        button.style.boxShadow = 'inset 9.61px 9.61px 16px #047471, inset -9.61px -9.61px 16px #06aaa7';
    });
    
    button.style.boxShadow = 'inset 9.61px 9.61px 16px #047471, inset -9.61px -9.61px 16px #06aaa7';

    button.addEventListener('click', initiateTranslation);
    
    translateButtonContainer.innerHTML = ''; 
    translateButtonContainer.appendChild(button);
}

function initiateTranslation() {
    const additionalParams = `_x_tr_sl=sa&_x_tr_tl=en&_x_tr_hl=en-GB`;
    const currentPath = window.location.pathname;
    const queryString = window.location.search;
    const currentUrlParams = new URLSearchParams(queryString);
    const currentFilename = currentUrlParams.get('filename');
    const translatedBaseUrl = `https://${window.location.hostname.replace(/\./g, '-')}.translate.goog`;
    const extendedUrl = currentFilename
        ? `${translatedBaseUrl}${currentPath}?filename=${encodeURIComponent(currentFilename)}&${additionalParams}`
        : `${translatedBaseUrl}${currentPath}?${additionalParams}`;
    window.open(extendedUrl, '_blank');
}

window.onload = () => {
    createTranslateButton();
};