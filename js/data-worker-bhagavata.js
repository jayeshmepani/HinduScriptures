// /js/data-worker-bhagavata.js - NO CHANGES NEEDED TO THIS FILE

let Sanscript;

function preprocessBhagavataDataInWorker(data) {
    if (typeof Sanscript === 'undefined' || !Sanscript) {
        console.error("Worker: Sanscript object is not defined or not loaded correctly.");
        throw new Error("Sanscript library is not properly loaded or available in worker.");
    }
    return data.map(entry => {
        const processedEntry = { ...entry };

        if (entry.devanagari && typeof entry.devanagari === 'string') {
            processedEntry.devanagari_dev = entry.devanagari;
            try {
                processedEntry.devanagari_iast = Sanscript.t(entry.devanagari, 'devanagari', 'iast').toLowerCase();
            } catch (e) {
                processedEntry.devanagari_iast = entry.devanagari.toLowerCase();
            }
            processedEntry.devanagari_ascii = processedEntry.devanagari_iast.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        } else {
            processedEntry.devanagari_dev = '';
            processedEntry.devanagari_iast = '';
            processedEntry.devanagari_ascii = '';
        }

        if (entry.translation && typeof entry.translation === 'string') {
            processedEntry.translation_iast = entry.translation.toLowerCase();
            processedEntry.translation_ascii = processedEntry.translation_iast.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        } else {
            processedEntry.translation_iast = '';
            processedEntry.translation_ascii = '';
        }

        if (entry.purport && typeof entry.purport === 'string') {
            processedEntry.purport_iast = entry.purport.toLowerCase();
            processedEntry.purport_ascii = processedEntry.purport_iast.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        } else {
            processedEntry.purport_iast = '';
            processedEntry.purport_ascii = '';
        }

        return processedEntry;
    });
}

self.onmessage = function (e) {
    const { type, payload, sanscriptPath } = e.data;

    if (type === 'PROCESS_DATA') {
        try {
            if (typeof Sanscript === 'undefined') {
                if (sanscriptPath) {
                    importScripts(sanscriptPath);
                    if (typeof self.Sanscript !== 'undefined') {
                        Sanscript = self.Sanscript;
                    } else if (typeof globalThis.Sanscript !== 'undefined') {
                        Sanscript = globalThis.Sanscript;
                    }
                } else {
                    throw new Error("Sanscript path not provided to worker.");
                }
            }

            if (typeof Sanscript === 'undefined' || !Sanscript) {
                throw new Error("Sanscript failed to load or initialize in worker even after importScripts.");
            }

            const rawData = JSON.parse(payload);
            const processedData = preprocessBhagavataDataInWorker(rawData);

            self.postMessage({ type: 'SUCCESS', payload: processedData });
        } catch (error) {
            console.error("Error in Bhagavata worker:", error.message, error.stack);
            self.postMessage({ type: 'ERROR', payload: { message: error.message, stack: error.stack } });
        }
    }
};