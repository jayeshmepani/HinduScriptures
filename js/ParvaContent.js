const filenameToBook = {
    '1.json': 'Adi Parva', '2.json': 'Sabha Parva', '3.json': 'Vana Parva',
    '4.json': 'Virata Parva', '5.json': 'Udyoga Parva', '6.json': 'Bhishma Parva',
    '7.json': 'Drona Parva', '8.json': 'Karna Parva', '9.json': 'Shalya Parva',
    '10.json': 'Sauptika Parva', '11.json': 'Stri Parva', '12.json': 'Shanti Parva',
    '13.json': 'Anushasana Parva', '14.json': 'Ashvamedhika Parva', '15.json': 'Ashramavasika Parva',
    '16.json': 'Mausala Parva', '17.json': 'Mahaprasthanika Parva', '18.json': 'Swargarohanika Parva',
};

const urlParams = new URLSearchParams(window.location.search);
const filename = urlParams.get('filename');

const IS_GOOGLE_TRANSLATED = window.location.hostname.endsWith('.translate.goog');
const USE_WEB_WORKER_DEFAULT = true;
const USE_WEB_WORKER = !IS_GOOGLE_TRANSLATED && USE_WEB_WORKER_DEFAULT;


let allParvaData = [];
let currentBookName = '';
let debounceTimeout;
let dataWorker;

const jsonContentDiv = document.getElementById('jsonContent');
const chapterSelector = document.getElementById('chapterSelector');
const shlokaSelector = document.getElementById('shlokaSelector');
const searchInput = document.getElementById('searchInput');
const parvaTitleElement = document.getElementById('parvaTitle');
const searchResultCountElement = document.getElementById('searchResultCount');
const loadingIndicator = document.getElementById('loadingIndicator');

function showLoading(message) {
    if (loadingIndicator) {
        loadingIndicator.textContent = message;
        loadingIndicator.style.display = 'block';
    }
    if (jsonContentDiv) jsonContentDiv.innerHTML = '';
}

function hideLoading() {
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

function formatTextForDisplay(text) {
    let formatted = text.replace(/\n/g, ' ।<br>');
    formatted = formatted.trim();
    if (formatted.endsWith('।')) formatted = formatted.slice(0, -1).trim();
    if (formatted.endsWith('॥')) formatted = formatted.slice(0, -2).trim();
    formatted += ' ॥';
    return formatted;
}

function populateChapterSelector() {
    if (!chapterSelector || !allParvaData || allParvaData.length === 0) return;
    const chapters = [...new Set(allParvaData.map(entry => entry.chapter))].sort((a, b) => a - b);
    chapterSelector.innerHTML = '<option value="all">All Chapters</option>';
    chapters.forEach(chapter => {
        const option = document.createElement('option');
        option.value = chapter;
        option.innerText = `Chapter ${chapter}`;
        chapterSelector.appendChild(option);
    });
    chapterSelector.disabled = false;
    if (shlokaSelector) shlokaSelector.disabled = chapterSelector.value === 'all';
}

function populateShlokaSelector(selectedChapterValue) {
    if (!shlokaSelector || !allParvaData || allParvaData.length === 0) return;
    const currentShlokaVal = shlokaSelector.value;
    shlokaSelector.innerHTML = '<option value="all">All Shlokas</option>';

    if (selectedChapterValue === 'all') {
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
            if (shlokaNumbersInChapter.map(String).includes(String(currentShlokaVal))) {
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
    const selectedChapter = chapterSelector ? chapterSelector.value : 'all';
    const selectedShloka = shlokaSelector ? shlokaSelector.value : 'all';
    const searchTerm = searchInput ? searchInput.value.trim() : '';

    if (!allParvaData || allParvaData.length === 0) {
        if (jsonContentDiv) jsonContentDiv.innerHTML = '<p class="no-results">Data not loaded yet or is empty.</p>';
        if (searchResultCountElement) searchResultCountElement.textContent = '';
        return;
    }

    if (jsonContentDiv) jsonContentDiv.innerHTML = '<div class="loader">Filtering content...</div>';
    if (searchResultCountElement) searchResultCountElement.textContent = '';

    setTimeout(() => {
        let filteredData = allParvaData;

        if (selectedChapter !== 'all') {
            filteredData = filteredData.filter(entry => entry.chapter === parseInt(selectedChapter));
        }
        if (selectedChapter !== 'all' && selectedShloka !== 'all' && shlokaSelector && !shlokaSelector.disabled) {
            filteredData = filteredData.filter(entry => entry.shloka === parseInt(selectedShloka));
        }

        let isDevanagariQuery = false;
        let iastQueryForm = '';
        let asciiQueryForm = '';
        let devanagariQueryEquivalent = '';

        if (searchTerm) {
            const qLower = searchTerm.toLowerCase();
            isDevanagariQuery = /[\u0900-\u097F]/.test(searchTerm);

            iastQueryForm = qLower;
            if (!isDevanagariQuery && window.Sanscript) {
                try {
                    const transliterated = Sanscript.t(searchTerm, 'hk', 'iast');
                    if (transliterated) iastQueryForm = transliterated.toLowerCase();
                } catch (e) { console.warn("Sanscript Error (HK to IAST for query):", searchTerm, e); }
            }

            asciiQueryForm = iastQueryForm.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            if (!isDevanagariQuery && window.Sanscript) {
                try {
                    const devEquiv = Sanscript.t(iastQueryForm, 'iast', 'devanagari');
                    if (devEquiv) devanagariQueryEquivalent = devEquiv;
                } catch (e) { console.warn("Sanscript Error (IAST to Devanagari for query):", iastQueryForm, e); }
            }

            filteredData = filteredData.filter(entry => {
                if (isDevanagariQuery) {
                    return entry.dev.includes(searchTerm);
                } else {
                    const matchesAscii = entry.ascii.includes(asciiQueryForm);
                    const matchesIast = entry.iast.includes(iastQueryForm);
                    const matchesDevEquivalent = devanagariQueryEquivalent && entry.dev.includes(devanagariQueryEquivalent);
                    return matchesAscii || matchesIast || matchesDevEquivalent;
                }
            });
        }

        if (jsonContentDiv) jsonContentDiv.innerHTML = '';

        if (searchResultCountElement) {
            if (searchTerm) {
                searchResultCountElement.textContent = `${filteredData.length} result(s) found.`;
            } else {
                searchResultCountElement.textContent = '';
            }
        }

        if (filteredData.length === 0) {
            if (jsonContentDiv) jsonContentDiv.innerHTML = '<p class="no-results">No shlokas found matching your criteria.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        filteredData.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'shloka-entry';

            let displayText = formatTextForDisplay(entry.text);

            if (searchTerm) {
                let termToHighlightInDevanagari = searchTerm;
                if (!isDevanagariQuery && devanagariQueryEquivalent) {
                    termToHighlightInDevanagari = devanagariQueryEquivalent;
                }

                const finalHighlightTerm = termToHighlightInDevanagari.trim();
                if (finalHighlightTerm) {
                    try {
                        const escapedTerm = finalHighlightTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(escapedTerm, 'gi');
                        displayText = displayText.replace(regex, match => `<span class="highlight">${match}</span>`);
                    } catch (e) { console.warn("Regex error during highlighting:", finalHighlightTerm, e); }
                }
            }

            entryDiv.innerHTML = `
                <div class="shloka-header">
                    <span class="shloka-meta">Chapter: ${entry.chapter}, Shloka: ${entry.shloka}</span>
                </div>
                <p class="shloka-text">${displayText}</p>
            `;
            fragment.appendChild(entryDiv);
        });
        if (jsonContentDiv) jsonContentDiv.appendChild(fragment);
    }, 10);
}

function preprocessShlokasOnMainThread(data) {
    if (typeof Sanscript === 'undefined' || !Sanscript) {
        console.error("MainThread: Sanscript library not loaded!");
        throw new Error("Sanscript not available on main thread for preprocessing.");
    }
    return data.map(entry => {
        const devText = entry.text;
        let iastText = devText;
        try {
            iastText = Sanscript.t(devText, 'devanagari', 'iast');
        } catch (e) { console.warn("MainThread Sanscript (dev->iast) error for:", devText.substring(0, 20), e.message); }
        iastText = iastText.toLowerCase();
        const asciiText = iastText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        return { ...entry, dev: devText, iast: iastText, ascii: asciiText };
    });
}


if (!filename) {
    if (jsonContentDiv) jsonContentDiv.innerHTML = '<p class="no-results" style="color:red;">Error: Parva data file not specified in URL.</p>';
    if (parvaTitleElement) parvaTitleElement.textContent = "Error";
    hideLoading();
} else {
    showLoading("Loading Parva data...");
    if (chapterSelector) chapterSelector.disabled = true;
    if (shlokaSelector) shlokaSelector.disabled = true;
    if (searchInput) searchInput.disabled = true;

    if (USE_WEB_WORKER && window.Worker) {
        console.log("Using Web Worker (original domain).");
        dataWorker = new Worker('/js/data-worker.js');

        dataWorker.onmessage = function (e) {
            if (e.data.type === 'SUCCESS') {
                allParvaData = e.data.payload;
                currentBookName = filenameToBook[filename] || filename.replace('.json', '');
                document.title = `${currentBookName} - Content`;
                if (parvaTitleElement) parvaTitleElement.textContent = currentBookName;

                populateChapterSelector();
                populateShlokaSelector(chapterSelector ? chapterSelector.value : 'all');
                filterAndDisplayContent();
                hideLoading();
                if (searchInput) searchInput.disabled = false;

            } else if (e.data.type === 'ERROR') {
                console.error("Worker error:", e.data.payload);
                if (jsonContentDiv) jsonContentDiv.innerHTML = `<p class="no-results" style="color:red;">Error processing Parva data: ${e.data.payload.message || 'Unknown worker error'}</p>`;
                if (parvaTitleElement) parvaTitleElement.textContent = "Error Processing Data";
                hideLoading();
                if (chapterSelector) chapterSelector.disabled = false;
                if (shlokaSelector) shlokaSelector.disabled = false;
                if (searchInput) searchInput.disabled = false;
            }
        };

        dataWorker.onerror = function (error) {
            console.error(`Worker runtime error: ${error.message}`, error);
            if (jsonContentDiv) jsonContentDiv.innerHTML = `<p class="no-results" style="color:red;">A critical error occurred with the data processor: ${error.message}</p>`;
            if (parvaTitleElement) parvaTitleElement.textContent = "Critical Worker Error";
            hideLoading();
            if (chapterSelector) chapterSelector.disabled = false;
            if (shlokaSelector) shlokaSelector.disabled = false;
            if (searchInput) searchInput.disabled = false;
        };

        fetch(`/DharmicData/Mahabharata/${filename}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}: ${response.statusText} while fetching ${filename}`);
                }
                return response.text();
            })
            .then(jsonText => {
                showLoading("Processing data in background...");
                dataWorker.postMessage({
                    type: 'PROCESS_DATA',
                    payload: jsonText,
                    sanscriptPath: '/js/sanscript.js'
                });
            })
            .catch(error => {
                console.error(`Error loading Parva data:`, error);
                if (jsonContentDiv) jsonContentDiv.innerHTML = `<p class="no-results" style="color:red;">Error loading Parva data: ${error.message}</p>`;
                if (parvaTitleElement) parvaTitleElement.textContent = "Error Loading Data";
                hideLoading();
                if (chapterSelector) chapterSelector.disabled = false;
                if (shlokaSelector) shlokaSelector.disabled = false;
                if (searchInput) searchInput.disabled = false;
                if (dataWorker) dataWorker.terminate();
            });
    } else {
        if (IS_GOOGLE_TRANSLATED) {
            console.warn("Page is translated by Google. Falling back to main thread processing for Web Worker compatibility.");
        } else if (!window.Worker && USE_WEB_WORKER_DEFAULT) {
            console.warn("Web Workers not supported by this browser. Falling back to main thread processing.");
        } else if (!USE_WEB_WORKER_DEFAULT) {
            console.log("Processing on Main Thread (USE_WEB_WORKER_DEFAULT is false).");
        }

        fetch(`/DharmicData/Mahabharata/${filename}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}: ${response.statusText} while fetching ${filename}`);
                }
                showLoading("Parsing JSON (Main Thread)...");
                return response.json();
            })
            .then(data => {
                showLoading("Preprocessing Shlokas (Main Thread)...");
                allParvaData = preprocessShlokasOnMainThread(data);

                currentBookName = filenameToBook[filename] || filename.replace('.json', '');
                document.title = `${currentBookName} - Content`;
                if (parvaTitleElement) parvaTitleElement.textContent = currentBookName;

                populateChapterSelector();
                populateShlokaSelector(chapterSelector ? chapterSelector.value : 'all');
                filterAndDisplayContent();
                hideLoading();
                if (chapterSelector) chapterSelector.disabled = false;
                if (shlokaSelector) shlokaSelector.disabled = false;
                if (searchInput) searchInput.disabled = false;
            })
            .catch(error => {
                console.error(`Error loading Parva data (Main Thread):`, error);
                if (jsonContentDiv) jsonContentDiv.innerHTML = `<p class="no-results" style="color:red;">Error loading Parva data: ${error.message}</p>`;
                if (parvaTitleElement) parvaTitleElement.textContent = "Error Loading Data";
                hideLoading();
                if (chapterSelector) chapterSelector.disabled = false;
                if (shlokaSelector) shlokaSelector.disabled = false;
                if (searchInput) searchInput.disabled = false;
            });
    }
}

if (chapterSelector) {
    chapterSelector.addEventListener('change', (e) => {
        populateShlokaSelector(e.target.value);
        filterAndDisplayContent();
    });
}
if (shlokaSelector) {
    shlokaSelector.addEventListener('change', filterAndDisplayContent);
}
if (searchInput) {
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            filterAndDisplayContent();
        }, 300);
    });
}

function createTranslateButton() {
    const translateButtonContainer = document.querySelector('.translate-button-container');
    if (!translateButtonContainer) {
        return;
    }

    const button = document.createElement('button');
    button.innerText = 'Translate This Page';
    button.type = 'button';
    button.className = 'btn waves-effect waves-light';

    Object.assign(button.style, {
        position: 'fixed', top: '10px', right: '10px', padding: '10px 15px',
        borderRadius: '13px', background: '#00796b', color: 'white',
        border: 'none', cursor: 'pointer', transition: 'all 0.3s ease',
        zIndex: '1001',
        boxShadow: 'inset 9.61px 9.61px 16px #047471, inset -9.61px -9.61px 16px #06aaa7'
    });

    button.addEventListener('mouseover', () => {
        button.style.boxShadow = 'inset 9.61px 9.61px 16px hsl(179, 91%, 23%), inset -9.61px -9.61px 16px hsl(179, 91%, 37%)';
        button.style.background = '#00695c';
    });
    button.addEventListener('mouseout', () => {
        button.style.boxShadow = 'inset 9.61px 9.61px 16px #047471, inset -9.61px -9.61px 16px #06aaa7';
        button.style.background = '#00796b';
    });

    button.addEventListener('click', initiateTranslation);

    translateButtonContainer.innerHTML = '';
    translateButtonContainer.appendChild(button);
}

function initiateTranslation() {
    const destUrl = new URL(window.location.href);
    destUrl.hostname = window.location.hostname.replace(/\./g, "-") + ".translate.goog";
    destUrl.protocol = "https:";
    destUrl.searchParams.set("_x_tr_sl", "sa");
    destUrl.searchParams.set("_x_tr_tl", "en");
    destUrl.searchParams.set("_x_tr_hl", "en-GB");
    destUrl.searchParams.set("_x_tr_pto", "wapp");
    window.open(destUrl.toString(), '_blank');
}

window.onload = () => {
    createTranslateButton();
};