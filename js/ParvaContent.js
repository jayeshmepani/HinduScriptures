const filenameToBook = {
    '1.json': 'Adi Parva',
    '2.json': 'Sabha Parva',
    '3.json': 'Vana Parva',
    '4.json': 'Virata Parva',
    '5.json': 'Udyoga Parva',
    '6.json': 'Bhishma Parva',
    '7.json': 'Drona Parva',
    '8.json': 'Karna Parva',
    '9.json': 'Shalya Parva',
    '10.json': 'Sauptika Parva',
    '11.json': 'Stri Parva',
    '12.json': 'Shanti Parva',
    '13.json': 'Anushasana Parva',
    '14.json': 'Ashvamedhika Parva',
    '15.json': 'Ashramavasika Parva',
    '16.json': 'Mausala Parva',
    '17.json': 'Mahaprasthanika Parva',
    '18.json': 'Swargarohanika Parva',
};

const urlParams = new URLSearchParams(window.location.search);
const filename = urlParams.get('filename');

let allParvaData = [];
let currentBookName = '';
let debounceTimeout;
let synthVoices = [];
const HARDCODED_VOICE_NAME = "Microsoft Madhur Online (Natural) - Hindi (India)";
const HARDCODED_PITCH = 0.75;
const HARDCODED_RATE = 0.83;

const jsonContentDiv = document.getElementById('jsonContent');
const chapterSelector = document.getElementById('chapterSelector');
const shlokaSelector = document.getElementById('shlokaSelector');
const searchInput = document.getElementById('searchInput');
const parvaTitleElement = document.getElementById('parvaTitle');

function formatTextForDisplay(text) {
    let formatted = text.replace(/\n/g, ' ।<br>');

    formatted = formatted.trim(); // Trim entire string first

    if (formatted.endsWith('।')) {
        formatted = formatted.slice(0, -1).trim();
    }
    if (formatted.endsWith('॥')) { 
        formatted = formatted.slice(0, -2).trim();
    }
    
    formatted += ' ॥';
    
    return formatted;
}


function populateChapterSelector() {
    const chapters = [...new Set(allParvaData.map(entry => entry.chapter))].sort((a, b) => a - b);
    chapterSelector.innerHTML = '<option value="all">All Chapters</option>';
    chapters.forEach(chapter => {
        const option = document.createElement('option');
        option.value = chapter;
        option.innerText = `Chapter ${chapter}`;
        chapterSelector.appendChild(option);
    });
}

function populateShlokaSelector(selectedChapterValue) {
    const currentShlokaVal = shlokaSelector.value;
    shlokaSelector.innerHTML = '<option value="all">All Shlokas</option>';

    if (selectedChapterValue === 'all' || !allParvaData.length) {
        shlokaSelector.value = 'all';
        shlokaSelector.disabled = true;
    } else {
        shlokaSelector.disabled = false;
        const chapterNumber = parseInt(selectedChapterValue);
        const shlokaNumbersInChapter = [...new Set(
            allParvaData
                .filter(entry => entry.chapter === chapterNumber)
                .map(entry => entry.shloka)
        )].sort((a, b) => a - b);

        if (shlokaNumbersInChapter.length > 0) {
            shlokaNumbersInChapter.forEach(shlokaNum => {
                const option = document.createElement('option');
                option.value = shlokaNum;
                option.innerText = `Shloka ${shlokaNum}`;
                shlokaSelector.appendChild(option);
            });
            if (shlokaNumbersInChapter.includes(parseInt(currentShlokaVal))) {
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
    const selectedChapter = chapterSelector.value;
    const selectedShloka = shlokaSelector.value;
    const searchTerm = searchInput.value.trim().toLowerCase();
    jsonContentDiv.innerHTML = '<div class="loader">Filtering content...</div>';

    setTimeout(() => {
        let filteredData = allParvaData;
        if (selectedChapter !== 'all') {
            filteredData = filteredData.filter(entry => entry.chapter === parseInt(selectedChapter));
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
            
            let displayText = formatTextForDisplay(entry.text);
            if (searchTerm) {
                const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                displayText = displayText.replace(regex, match => `<span class="highlight">${match}</span>`);
            }

            entryDiv.innerHTML = `
                <div class="shloka-header">
                    <span class="shloka-meta">Chapter: ${entry.chapter}, Shloka: ${entry.shloka}</span>
                </div>
                <p class="shloka-text">${displayText}</p>
            `;
            fragment.appendChild(entryDiv);
        });
        jsonContentDiv.appendChild(fragment);
    }, 50);
}

if (!filename) {
    jsonContentDiv.innerHTML = '<p class="no-results" style="color:red;">Error: Parva data file not specified in URL.</p>';
    if (parvaTitleElement) parvaTitleElement.textContent = "Error";
} else {
    fetch(`/DharmicData/Mahabharata/${filename}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch JSON file: ${filename}. Status: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            allParvaData = data;
            currentBookName = filenameToBook[filename] || filename.replace('.json', '');
            document.title = `${currentBookName} - Content`;
            if (parvaTitleElement) parvaTitleElement.textContent = currentBookName;
            
            populateChapterSelector();
            populateShlokaSelector(chapterSelector.value); 
            filterAndDisplayContent();
        })
        .catch(error => {
            jsonContentDiv.innerHTML = `<p class="no-results" style="color:red;">Error loading Parva data: ${error.message}</p>`;
            if (parvaTitleElement) parvaTitleElement.textContent = "Error Loading Data";
            console.error(`Error loading Parva data: ${error.message}`);
        });
}

chapterSelector.addEventListener('change', (e) => {
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