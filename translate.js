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

    // Translation URL construction
    button.addEventListener('click', initiateTranslation);

    document.body.appendChild(button);
}

// Function to handle translation URL generation and opening
function initiateTranslation() {
    const additionalParams = `_x_tr_sl=sa&_x_tr_tl=en&_x_tr_hl=en-GB`;
    // const originalBaseUrl = 'https://hindu-scriptures.vercel.app/';
    // const translatedBaseUrl = 'https://hindu--scriptures-vercel-app.translate.goog/';
    const originalBaseUrl = 'https://hinduscriptures.onrender.com';
    const translatedBaseUrl = 'https://hinduscriptures-onrender-com.translate.goog';
    // const originalBaseUrl = 'https://jayeshmepani.github.io/';
    // const translatedBaseUrl = 'https://jayeshmepani-github-io.translate.goog/';
    // const originalBaseUrl = 'https://hinduscriptures.netlify.app/';
    // const translatedBaseUrl = 'https://hinduscriptures-netlify-app.translate.goog';
    const currentPath = window.location.pathname;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const filename = urlParams.get('filename');

    // Generate translation URL
    const extendedUrl = filename
        ? `${translatedBaseUrl}${currentPath}.html?filename=${encodeURIComponent(filename)}&${additionalParams}`
        : `${translatedBaseUrl}${currentPath}.html?${additionalParams}`;

    console.log(`Extended URL: ${extendedUrl}`);
    window.open(extendedUrl, '_blank');
}

// Call the function to create the Translate button when the page loads
window.onload = createTranslateButton;
