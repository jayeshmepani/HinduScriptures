// Function to fetch JSON file
function fetchJSONFile(filePath) {
    return fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch JSON file: ${filePath}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error(`Error fetching JSON file: ${filePath}`, error);
            throw error;
        });
}

// Function to display the list of Kandas
function displayKandaList() {
    const searchResultsContainer = document.querySelector('.kanda-list');
    searchResultsContainer.innerHTML = '';

    const kandas = ['Balakanda', 'Ayodhyakanda', 'Aranyakanda', 'Kishkindhakanda', 'Sundarakanda', 'Yudhhakanda', 'Uttarakanda'];

    const orderedList = document.createElement('ol');
    // Display each Kanda as a clickable link
    kandas.forEach((kanda, index) => {
        const kandaLink = document.createElement('a');
//        kandaLink.href = `kandaContent?q=${kanda.toLowerCase()}`;
//        kandaLink.href = `kandaContent?kandaNumber=${index + 1}&selectedKanda=${encodeURIComponent(kanda)}`;
        kandaLink.href = '#';
        kandaLink.textContent = `${index + 1}. ${kanda}`;
//        kandaLink.addEventListener('click', () => displayKandaContent(index + 1, kanda));
        kandaLink.addEventListener('click', () => redirectToKandaContent(index + 1, kanda));

        const listItem = document.createElement('ol');
        listItem.appendChild(kandaLink);

        searchResultsContainer.appendChild(listItem);
    });
}

// Function to redirect to the content page for the selected Kanda
function redirectToKandaContent(kandaNumber, selectedKanda) {
    // Redirect to kandaContent with query parameters
    window.location.href = `kandaContent?kandaNumber=${kandaNumber}&selectedKanda=${encodeURIComponent(selectedKanda)}`;
}

// Initialize the Kanda List display
displayKandaList();
displayKandaContent();