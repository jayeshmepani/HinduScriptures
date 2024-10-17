// Function to create and handle the "Translate" button
function createTranslateButton() {
    const button = document.createElement('button');
    button.innerText = 'Translate';
    button.type = 'submit';
    button.className = 'btn waves-effect waves-light'; // Add the specified class names
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.padding = '10px';
    button.style.borderRadius = '13px'; // Update border-radius
    button.style.background = '#058f8c'; // Update background
    button.style.boxShadow = 'inset 9.61px 9.61px 16px #047471, inset -9.61px -9.61px 16px #06aaa7'; // Update box-shadow
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.cursor = 'pointer';

    button.addEventListener('click', () => {
        const additionalParams = `_x_tr_sl=sa&_x_tr_tl=en&_x_tr_hl=en-GB`;
        // const originalBaseUrl = 'https://hindu-scriptures.vercel.app/';
        // const translatedBaseUrl = 'https://hindu--scriptures-vercel-app.translate.goog/';
        const originalBaseUrl = 'https://hinduscriptures.onrender.com/';
        const translatedBaseUrl = 'https://hinduscriptures-onrender-com.translate.goog/';
        // const originalBaseUrl = 'https://jayeshmepani.github.io/';
        // const translatedBaseUrl = 'https://jayeshmepani-github-io.translate.goog/';
        // const originalBaseUrl = 'https://hinduscriptures.netlify.app/';
        // const translatedBaseUrl = 'https://hinduscriptures-netlify-app.translate.goog';
        const currentPath = window.location.pathname;
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const filename = urlParams.get('filename'); // Get the filename from the query params if available

        let extendedUrl;

        if (filename) {
            // If there's a filename, generate the URL using the filename
            extendedUrl = `${translatedBaseUrl}${currentPath}?filename=${encodeURIComponent(filename)}&${additionalParams}`;
        } else {
            // If there's no filename, just translate the current .html page
            extendedUrl = `${translatedBaseUrl}${currentPath}?${additionalParams}`;
        }

        console.log(`Extended URL: ${extendedUrl}`);
        window.open(extendedUrl, '_blank');
    });

    document.body.appendChild(button);
}

// Call the function to create the Translate button when the page loads
window.onload = () => {
    createTranslateButton();
};
