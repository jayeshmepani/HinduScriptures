// Map filenames to book names
const filenameToBook = {
  '1.json': 'Adi Parva',
  '2.json': 'Sabha Parva',
  '3.json': 'Vana Parva',
  '4.json': 'Virata Parva',
  '5.json': 'Udyoga Parva',
  '6.json': 'Bhishma Parva',
  '7.json': 'Drona Parva',
  '8.json': 'Karna Parva',
  '9.json': 'Shalya Parva',
  '10.json': 'Sauptika Parva',
  '11.json': 'Stri Parva',
  '12.json': 'Shanti Parva',
  '13.json': 'Anushasana Parva',
  '14.json': 'Ashvamedhika Parva',
  '15.json': 'Ashramavasika Parva',
  '16.json': 'Mausala Parva',
  '17.json': 'Mahaprasthanika Parva',
  '18.json': 'Swargarohanika Parva',
};

// Get the filename from the query parameters
const urlParams = new URLSearchParams(window.location.search);
const filename = urlParams.get('filename');
console.log('Filename:', filename);

// Fetch and display the selected JSON file
fetch(`DharmicData/Mahabharata/${filename}`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON file: ${filename}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('JSON Data:', data);
    // Handle the JSON data here (e.g., display it on the page)
    const jsonContentDiv = document.getElementById('jsonContent');

    // Get the book name from the filenameToBook mapping
    const bookName = filenameToBook[filename] || filename;

    // Iterate over each entry in the JSON array
    data.forEach(entry => {
      // Create a new div for each entry
      const entryDiv = document.createElement('div');

      // Display Book, Chapter, Shloka, and Text
      entryDiv.innerHTML = `
      <div style="display: grid; align-items: center; justify-content: center;">
        <p style="color: yellow;">Book: ${bookName}</p>
        <p style="color: white;">Chapter: ${entry.chapter}</p>
        <p style="color: white;">Shloka: ${entry.shloka}</p>
        <p style="color: orange;">${entry.text.replace(/\n/g, ' ।<br> ').trim()} ॥</p>
        <br>
        <br>
      </div>
    `;

      // Append the entry div to the main content div
      jsonContentDiv.appendChild(entryDiv);
    });
  })
  .catch(error => {
    // Handle errors here
    console.error(`Error fetching or displaying JSON file ${filename}:`, error);
  });

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
