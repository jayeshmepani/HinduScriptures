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

    // Button click handler
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

    // Generate translation URL
    const extendedUrl = filename
        ? `${translatedBaseUrl}${currentPath}.html?filename=${encodeURIComponent(filename)}&${additionalParams}`
        : `${translatedBaseUrl}${currentPath}.html?${additionalParams}`;

    console.log(`Extended URL: ${extendedUrl}`);

    // Open the new window
    const newWindow = window.open(extendedUrl, '_blank');

    // Handle same-origin scenario
    newWindow.onload = () => {
        try {
            // If the new window is same-origin, inject custom styles
            const styleElement = newWindow.document.createElement('style');
            styleElement.textContent = `
                #jsonContent::before {
                    content: 'Kindly ensure the language is set correctly';
                    height: max-content;
                    display: flex;
                    flex-direction: column;
                    font-size: 16px;
                    font-weight: bold;
                    color: red;
                    align-items: center;
                    position: relative;
                    top: -5.5vh;
                }
            `;
            newWindow.document.head.appendChild(styleElement);
        } catch (err) {
            console.error('Could not modify the new window. Is it cross-origin?', err);
        }
    };
}

// Initialize the "Translate" button when the page loads
window.onload = createTranslateButton;
