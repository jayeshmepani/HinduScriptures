let Sanscript;

function preprocessShlokasInWorker(data) {
    if (typeof Sanscript === 'undefined' || !Sanscript) {
        console.error("Worker: Sanscript object is not defined or not loaded correctly.");
        throw new Error("Sanscript library is not properly loaded or available in worker.");
    }
    return data.map(entry => {
        const devText = entry.text;
        let iastText = devText;

        try {
            iastText = Sanscript.t(devText, 'devanagari', 'iast');
        } catch (e) {
            // console.warn("Worker Sanscript (dev->iast) error for:", devText.substring(0,20), e.message);
        }
        iastText = iastText.toLowerCase();

        const asciiText = iastText
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();

        return {
            ...entry,
            dev: devText,
            iast: iastText,
            ascii: asciiText
        };
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
                    } else if (typeof window !== 'undefined' && typeof window.Sanscript !== 'undefined') {
                        Sanscript = window.Sanscript;
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
            const processedData = preprocessShlokasInWorker(rawData);

            self.postMessage({ type: 'SUCCESS', payload: processedData });
        } catch (error) {
            console.error("Error in worker:", error.message, error.stack);
            self.postMessage({ type: 'ERROR', payload: { message: error.message, stack: error.stack } });
        }
    }
};