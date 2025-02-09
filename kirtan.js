let jsonData = []; // Assuming this is the array containing your kirtans data

// Function to display kirtans (only title in search result)
function displayKirtans(filteredData = jsonData) {
    const kirtanDisplay = document.getElementById("kirtan-display");
    kirtanDisplay.innerHTML = ""; // Clear previous content

    if (!filteredData || filteredData.length === 0) {
        kirtanDisplay.innerHTML = "<p>No kirtans found.</p>";
        return;
    }

    // Sort by Gujarati alphabet order (use a custom comparator)
    filteredData.sort((a, b) => {
        return a.title_guj.localeCompare(b.title_guj, 'gu', { sensitivity: 'base' });
    });

    // Create and append each kirtan element (only title)
    filteredData.forEach(kirtan => {
        const kirtanElement = document.createElement("div");
        kirtanElement.classList.add("kirtan-item");

        // Create the title element (clickable)
        const titleElement = document.createElement("h3");
        titleElement.textContent = `${kirtan.title_guj} | ${kirtan.title_eng}`;
        titleElement.addEventListener("click", () => {
            // Push the current state to history before showing the pad list
            history.pushState({ kirtan_group: kirtan.kirtan_group }, "", `#${kirtan.kirtan_group}`);
            showKirtanGroupPads(kirtan.kirtan_group);
        }); // On title click
        kirtanElement.appendChild(titleElement);

        kirtanDisplay.appendChild(kirtanElement);
    });
}

// Function to display all pads of the same kirtan_group with description
function showKirtanGroupPads(kirtanGroup) {
    const kirtanDisplay = document.getElementById("kirtan-display");
    kirtanDisplay.innerHTML = ""; // Clear previous content

    // Filter kirtans by kirtan_group
    const groupKirtans = jsonData.filter(kirtan => kirtan.kirtan_group === kirtanGroup);

    // Sort kirtans by pad_no
    groupKirtans.sort((a, b) => a.pad_no - b.pad_no);

    // Create and append each kirtan element from the selected group (with title, pad_no, and description)
    groupKirtans.forEach(kirtan => {
        const kirtanElement = document.createElement("div");
        kirtanElement.classList.add("kirtan-item");

        // Create the title element (non-clickable in this view)
        const titleElement = document.createElement("h2");
        titleElement.textContent = `${kirtan.pad_no}. ${kirtan.title_guj} | ${kirtan.title_eng}`;
        kirtanElement.appendChild(titleElement);

        // Create the description element, handling newlines
        const descriptionElement = document.createElement("p");
        descriptionElement.innerHTML = (kirtan.description_guj || kirtan.description_eng)
            .replace(/\n/g, '<br>')
            .trim(); // Replace newlines with <br> and trim whitespace
        kirtanElement.appendChild(descriptionElement);

        kirtanDisplay.appendChild(kirtanElement);
    });
}


// Function to handle the back button or manual navigation
function handlePopState(event) {
    if (event.state && event.state.kirtan_group) {
        showKirtanGroupPads(event.state.kirtan_group);
    } else {
        // If no state is found, go back to the main kirtan list
        displayKirtans();
    }
}

// Function to set up the search functionality with debouncing
function setupSearch() {
    const searchBar = document.getElementById("search-bar");
    let debounceTimeout;

    searchBar.addEventListener("input", () => {
        clearTimeout(debounceTimeout); // Clear the previous timeout if any

        const query = searchBar.value.toLowerCase();

        // Set a new timeout to trigger the search after 300ms of inactivity
        debounceTimeout = setTimeout(() => {
            // Filter all kirtans where the query matches the title or description
            const searchResults = jsonData.filter(kirtan =>
                (kirtan.title_guj && kirtan.title_guj.toLowerCase().includes(query)) ||
                (kirtan.title_eng && kirtan.title_eng.toLowerCase().includes(query)) ||
                (kirtan.description_guj && kirtan.description_guj.toLowerCase().includes(query)) ||
                (kirtan.description_eng && kirtan.description_eng.toLowerCase().includes(query))
            );

            // Sort search results by Gujarati alphabet order
            searchResults.sort((a, b) => {
                return a.title_guj.localeCompare(b.title_guj, 'gu', { sensitivity: 'base' });
            });

            // Display the filtered and sorted kirtans based on the search (only title)
            displayKirtans(searchResults); // Only display titles in search result
        }, 300); // Delay search by 300ms after the user stops typing
    });
}


// Function to show the loader
function showLoader() {
    const loader = document.getElementById("loader");
    const loadingMessage = document.getElementById("loading-message");
    loader.style.display = "block"; // Show the loader
    loadingMessage.style.display = "block"; // Show the loading message
}

// Function to hide the loader
function hideLoader() {
    const loader = document.getElementById("loader");
    const loadingMessage = document.getElementById("loading-message");
    loader.style.display = "none"; // Hide the loader
    loadingMessage.style.display = "none"; // Hide the loading message
}

// Load the JSON data when the page is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Show the loader before starting the fetch
    showLoader();

    // Load data from an external source or API
    loadData();

    // Listen for the popstate event
    window.addEventListener("popstate", handlePopState);
});

// Fetch the JSON data
function loadData() {
    fetch('DharmicData/Swaminarayan Sect/kirtan.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            jsonData = data.kirtan_list;
            hideLoader(); // Hide the loader once data is loaded
            displayKirtans(); // Initial display (all kirtans listed)
            setupSearch();
        })
        .catch(error => {
            console.error('Error loading JSON data:', error);
            hideLoader(); // Hide the loader even if there's an error
        });
}