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

const IS_GOOGLE_TRANSLATED = window.location.hostname.endsWith('.translate.goog');
const USE_WEB_WORKER_DEFAULT = true;
const USE_WEB_WORKER = !IS_GOOGLE_TRANSLATED && USE_WEB_WORKER_DEFAULT;

let allKandaData = [];
let currentBookName = '';
let debounceTimeout;
let dataWorker;

const jsonContentDiv = document.getElementById('jsonContent');
const sargSelector = document.getElementById('sargSelector');
const shlokaSelector = document.getElementById('shlokaSelector');
const searchInput = document.getElementById('searchInput');
const kandaTitleElement = document.getElementById('kandaTitle');
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
    let formatted = text.replace(/\n/g, ' '); 
    let parts = formatted.split('।');
    if (parts.length >= 2) {
        formatted = parts[0] + ' ।<br>' + parts.slice(1).join('।');
    }
    return formatted;
}

function populateSargSelector() {
    if (!sargSelector || !allKandaData || allKandaData.length === 0) return;
    const sargs = [...new Set(allKandaData.map(entry => entry.sarg))].sort((a, b) => a - b);
    sargSelector.innerHTML = '<option value="all">All Sargas</option>';
    sargs.forEach(sarg => {
        const option = document.createElement('option');
        option.value = sarg;
        option.innerText = `Sarg ${sarg}`;
        sargSelector.appendChild(option);
    });
    sargSelector.disabled = false;
    if (shlokaSelector) shlokaSelector.disabled = sargSelector.value === 'all';
}

function populateShlokaSelector(selectedSargValue) {
    if (!shlokaSelector || !allKandaData || allKandaData.length === 0) return;
    const currentShlokaVal = shlokaSelector.value;
    shlokaSelector.innerHTML = '<option value="all">All Shlokas</option>';

    if (selectedSargValue === 'all') {
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
            if (shlokaNumbersInSarg.map(String).includes(String(currentShlokaVal))) {
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
    const selectedSarg = sargSelector ? sargSelector.value : 'all';
    const selectedShloka = shlokaSelector ? shlokaSelector.value : 'all';
    const searchTerm = searchInput ? searchInput.value.trim() : '';

    if (!allKandaData || allKandaData.length === 0) {
        if (jsonContentDiv) jsonContentDiv.innerHTML = '<p class="no-results">Data not loaded yet or is empty.</p>';
        if (searchResultCountElement) searchResultCountElement.textContent = '';
        return;
    }

    if (jsonContentDiv) jsonContentDiv.innerHTML = '<div class="loader">Filtering content...</div>';
    if (searchResultCountElement) searchResultCountElement.textContent = '';

    setTimeout(() => {
        let filteredData = allKandaData;

        if (selectedSarg !== 'all') {
            filteredData = filteredData.filter(entry => entry.sarg === parseInt(selectedSarg));
        }
        if (selectedSarg !== 'all' && selectedShloka !== 'all' && shlokaSelector && !shlokaSelector.disabled) {
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
                    <span class="shloka-meta">Sarg: ${entry.sarg}, Shloka: ${entry.shloka}</span>
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
        } catch (e) { console.warn("MainThread Sanscript (dev->iast) error for:", devText.substring(0,20), e.message); }
        iastText = iastText.toLowerCase();
        const asciiText = iastText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        return { ...entry, dev: devText, iast: iastText, ascii: asciiText };
    });
}


if (!filename) {
    if (jsonContentDiv) jsonContentDiv.innerHTML = '<p class="no-results" style="color:red;">Error: Kanda data file not specified in URL.</p>';
    if (kandaTitleElement) kandaTitleElement.textContent = "Error";
    hideLoading();
} else {
    showLoading("Loading Kanda data...");
    if (sargSelector) sargSelector.disabled = true;
    if (shlokaSelector) shlokaSelector.disabled = true;
    if (searchInput) searchInput.disabled = true;

    if (USE_WEB_WORKER && window.Worker) {
        console.log("Using Web Worker (original domain).");
        dataWorker = new Worker('/js/data-worker.js');

        dataWorker.onmessage = function (e) {
            if (e.data.type === 'SUCCESS') {
                allKandaData = e.data.payload;
                currentBookName = filenameToBook[filename] || filename.replace('.json', '');
                document.title = `${currentBookName} - Content`;
                if (kandaTitleElement) kandaTitleElement.textContent = currentBookName;

                populateSargSelector();
                populateShlokaSelector(sargSelector ? sargSelector.value : 'all');
                filterAndDisplayContent();
                hideLoading();
                if (searchInput) searchInput.disabled = false;

            } else if (e.data.type === 'ERROR') {
                console.error("Worker error:", e.data.payload);
                if (jsonContentDiv) jsonContentDiv.innerHTML = `<p class="no-results" style="color:red;">Error processing Kanda data: ${e.data.payload.message || 'Unknown worker error'}</p>`;
                if (kandaTitleElement) kandaTitleElement.textContent = "Error Processing Data";
                hideLoading();
                if (sargSelector) sargSelector.disabled = false;
                if (shlokaSelector) shlokaSelector.disabled = false;
                if (searchInput) searchInput.disabled = false;
            }
        };

        dataWorker.onerror = function (error) {
            console.error(`Worker runtime error: ${error.message}`, error);
            if (jsonContentDiv) jsonContentDiv.innerHTML = `<p class="no-results" style="color:red;">A critical error occurred with the data processor: ${error.message}</p>`;
            if (kandaTitleElement) kandaTitleElement.textContent = "Critical Worker Error";
            hideLoading();
            if (sargSelector) sargSelector.disabled = false;
            if (shlokaSelector) shlokaSelector.disabled = false;
            if (searchInput) searchInput.disabled = false;
        };

        fetch(`/DharmicData/Ramayanas/ValmikiRamayana/${filename}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}: ${response.statusText} while fetching ${filename}`);
                }
                return response.text();
            })
            .then(jsonText => {
                showLoading("Processing Kanda data in background...");
                dataWorker.postMessage({
                    type: 'PROCESS_DATA',
                    payload: jsonText,
                    sanscriptPath: '/js/sanscript.js'
                });
            })
            .catch(error => {
                console.error(`Error loading Kanda data:`, error);
                if (jsonContentDiv) jsonContentDiv.innerHTML = `<p class="no-results" style="color:red;">Error loading Kanda data: ${error.message}</p>`;
                if (kandaTitleElement) kandaTitleElement.textContent = "Error Loading Data";
                hideLoading();
                if (sargSelector) sargSelector.disabled = false;
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

        fetch(`/DharmicData/Ramayanas/ValmikiRamayana/${filename}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}: ${response.statusText} while fetching ${filename}`);
                }
                showLoading("Parsing Kanda JSON (Main Thread)...");
                return response.json();
            })
            .then(data => {
                showLoading("Preprocessing Kanda Shlokas (Main Thread)...");
                allKandaData = preprocessShlokasOnMainThread(data);

                currentBookName = filenameToBook[filename] || filename.replace('.json', '');
                document.title = `${currentBookName} - Content`;
                if (kandaTitleElement) kandaTitleElement.textContent = currentBookName;

                populateSargSelector();
                populateShlokaSelector(sargSelector ? sargSelector.value : 'all');
                filterAndDisplayContent();
                hideLoading();
                if (sargSelector) sargSelector.disabled = false;
                if (shlokaSelector) shlokaSelector.disabled = false;
                if (searchInput) searchInput.disabled = false;
            })
            .catch(error => {
                console.error(`Error loading Kanda data (Main Thread):`, error);
                if (jsonContentDiv) jsonContentDiv.innerHTML = `<p class="no-results" style="color:red;">Error loading Kanda data: ${error.message}</p>`;
                if (kandaTitleElement) kandaTitleElement.textContent = "Error Loading Data";
                hideLoading();
                if (sargSelector) sargSelector.disabled = false;
                if (shlokaSelector) shlokaSelector.disabled = false;
                if (searchInput) searchInput.disabled = false;
            });
    }
}

if (sargSelector) {
    sargSelector.addEventListener('change', (e) => {
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