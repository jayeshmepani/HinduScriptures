# Goals

Working plan for Hindu Scriptures. The catalogue of titles is `docs/SCRIPTURE_TEXTS_LIST.md`. The app reads files from `DharmicData/`.

## Primary

1. **Add the missing texts.** Bring named works that are still absent into the catalogue, and into `DharmicData/` when a file exists or is added.

2. **Update the web app.**
   - Add new HTML, CSS, and JS for sections and texts the app does not have yet.
   - Change the existing pages so the texts they already cover include what is missing.
   - Known gaps include Upāṅga, Occult, and the Vedic layers that are in the catalogue and not on the site: Saṃhitā, Brāhmaṇa, Āraṇyaka, Anukramaṇī, Pariśiṣṭa, and Ṣaḍdarśana as its own section.

3. **Restructure the project.** Refactor and reorganize the app around those catalogue changes. Upāṅga, Occult, and the newer sections should stop being one-off pages. The home menu should follow the catalogue.

## Next

1. **Reading tools, run locally.** Translation, transliteration, transcription, and text-to-speech all run on this machine. Speech is a local model that can be finetuned and audio-engineered. It is not an online voice API. `js/sanscript.js` is replaced. Transliteration and transcription become a mix of rules and ML, better than the current library. Translation today goes through Google Translate (`js/translate.js`). That call goes too.

2. **Keep the corpus in JSON.**
   - Convert every PDF in `DharmicData/` to JSON.
   - Improve the JSON files that already exist, so search, filtering, and the later tools can use one shape.
   - PDFs are not one kind of file. Raster pages are images and need OCR. Some vector pages copy as the text on screen and can be extracted. Some vector pages look selectable but paste as other characters, because the font encoding does not match the glyphs. Those pages are rendered and OCR’d. The copied gibberish is not kept as the text.

3. **Local AI replaces every online API.** Every online API and every call site is replaced by one locally run LLM. The stack is AI, RAG, finetuning, and more. A question may arrive as text, audio, video, or image, and the answer has to come from the texts. This covers Google Gemini (`js/server.js`), Google Translate (`js/translate.js`), and any other online call. The stack uses the JSON corpus.
