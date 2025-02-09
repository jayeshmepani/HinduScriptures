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

fetch(`DharmicData/Mahabharata/${filename}`)
  .then(response => {
      if (!response.ok) {
          throw new Error(`Failed to fetch JSON file: ${filename}`);
      }
      return response.json();
  })
  .then(data => {
      console.log('JSON Data:', data);

      const jsonContentDiv = document.getElementById('jsonContent');
      const chapterSelector = document.getElementById('chapterSelector');
      const shlokaSelector = document.getElementById('shlokaSelector');

      // Get the book name from the filenameToBook mapping
      const bookName = filenameToBook[filename] || filename;

      // Populate chapter selector dynamically
      const chapters = Array.from(new Set(data.map(entry => entry.chapter)));
      chapters.forEach(chapter => {
          const option = document.createElement('option');
          option.value = chapter;
          option.innerText = `Chapter ${chapter}`;
          chapterSelector.appendChild(option);
      });

      // Function to populate the shloka selector based on the selected chapter
      function populateShlokaSelector(selectedChapter) {
          // Clear existing shloka options
          shlokaSelector.innerHTML = '<option value="all">All</option>';

          // Find the number of shlokas for the selected chapter
          const shlokasInChapter = data.filter(entry => entry.chapter === selectedChapter);
          const numShlokas = Math.max(...shlokasInChapter.map(entry => entry.shloka));

          // Populate the shloka selector with appropriate range based on the number of shlokas in the chapter
          for (let i = 1; i <= numShlokas; i++) {
              const option = document.createElement('option');
              option.value = i;
              option.innerText = `Shloka ${i}`;
              shlokaSelector.appendChild(option);
          }
      }

      // Function to filter and display content based on selected chapter and shloka
      function filterContent() {
          const selectedChapter = chapterSelector.value;
          const selectedShloka = shlokaSelector.value;

          // Filter data based on selected chapter and shloka
          const filteredData = data.filter(entry => {
              const chapterMatch = selectedChapter === 'all' || entry.chapter === parseInt(selectedChapter);
              const shlokaMatch = selectedShloka === 'all' || entry.shloka === parseInt(selectedShloka);
              return chapterMatch && shlokaMatch;
          });

          // Clear existing content
          jsonContentDiv.innerHTML = '';

          // Display filtered content
          filteredData.forEach(entry => {
              const entryDiv = document.createElement('div');
              entryDiv.innerHTML = `
                  <div style="display: grid; align-items: center; justify-content: center;">
                      <p style="color: yellow;">Book: ${bookName}</p>
                      <p style="color: white;">Chapter: ${entry.chapter}</p>
                      <p style="color: white;">Shloka: ${entry.shloka}</p>
                      <p style="color: orange;">${entry.text.replace(/\n/g, ' ।<br> ').trim()} ॥</p>
                      <br><br>
                  </div>
              `;
              jsonContentDiv.appendChild(entryDiv);
          });
      }

      // Add event listeners for selectors
      chapterSelector.addEventListener('change', (e) => {
          const selectedChapter = parseInt(e.target.value);
          populateShlokaSelector(selectedChapter);
          filterContent(); // Re-filter content when chapter changes
      });

      shlokaSelector.addEventListener('change', filterContent);

      // Initial population of shloka options when page loads
      populateShlokaSelector('all');
      filterContent(); // Initial content display
  })
  .catch(error => {
      console.error(`Error fetching or displaying JSON file ${filename}:`, error);
  });

// Function to create and handle the "Translate" button
function createTranslateButton() {
  const button = document.createElement('button');
  button.innerText = 'Translate';
  button.type = 'submit';
  button.className = 'btn waves-effect waves-light';
  
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

  button.addEventListener('mouseover', () => {
      button.style.boxShadow = 'inset 9.61px 9.61px 16px hsl(179, 91%, 23%), inset -9.61px -9.61px 16px hsl(179, 91%, 37%)';
  });
  button.addEventListener('mouseout', () => {
      button.style.boxShadow = 'inset 9.61px 9.61px 16px #047471, inset -9.61px -9.61px 16px #06aaa7';
  });

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

  const extendedUrl = filename
      ? `${translatedBaseUrl}${currentPath}.html?filename=${encodeURIComponent(filename)}&${additionalParams}`
      : `${translatedBaseUrl}${currentPath}.html?${additionalParams}`;

  console.log(`Extended URL: ${extendedUrl}`);
  window.open(extendedUrl, '_blank');
}

window.onload = createTranslateButton;