// Get the filename from the query parameters
const urlParams = new URLSearchParams(window.location.search);
const filename = urlParams.get('filename');
console.log('Filename:', filename);

// Fetch and display the selected JSON file
fetch(`DharmicData/Gitas/Bhagvad Gita/${filename}`)
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

    // Check if BhagavadGita property exists in data
    if (data.BhagavadGita && Array.isArray(data.BhagavadGita)) {
      // Iterate over each entry in the BhagavadGita array
      data.BhagavadGita.forEach(entry => {
        // Create a new div for each entry
        const entryDiv = document.createElement('div');

        // Display Chapter, Verse, and Text
        entryDiv.innerHTML = `
          <div style="display: grid; align-items: center; justify-content: center;">
            <p style="color: yellow;">Chapter: ${entry.chapter}</p>
            <p style="color: white;">Verse: ${entry.verse}</p>
            <p style="color: orange;">${formatText(entry.text)}</p>
            <br><br>
          </div>
        `;

        jsonContentDiv.appendChild(entryDiv);
      });
    } else {
      // If BhagavadGita property is missing or not an array, handle it accordingly
      console.error(`Error: BhagavadGita property not found or not an array.`);
    }
  })
  .catch(error => {
    // Handle errors here
    console.error(`Error fetching or displaying JSON file ${filename}:`, error);
  });

// Map filenames to book names
const filenameToBook = {
  '1.json': 'Arjuna Vishada Yoga',
  '2.json': 'Sankhya Yoga',
  '3.json': 'Karma Yoga',
  '4.json': 'Gyana-Karma-Sanyasa Yoga',
  '5.json': 'Karma-Sanyasa Yoga',
  '6.json': 'Atma-Samyama Yoga',
  '7.json': 'Gyana-Vigyana Yoga',
  '8.json': 'Akshara Brahma Yoga',
  '9.json': 'Raja-Vidya-Raja-Guhya Yoga',
  '10.json': 'Vibhuti Yoga',
  '11.json': 'Vishwarupa-Darsana Yoga',
  '12.json': 'Bhakti Yoga',
  '13.json': 'Ksetra-Ksetrajna-Vibhaga Yoga',
  '14.json': 'Gunatraya-Vibhaga Yoga',
  '15.json': 'Purushottama Yoga',
  '16.json': 'Daivasura-Sampad-Vibhaga Yoga',
  '17.json': 'Shraddha-Traya-Vibhaga Yoga',
  '18.json': 'Moksha-Sanyasa Yoga'
};

function formatText(text) {
  const indexOfPipe = text.indexOf('।');
  if (indexOfPipe !== -1) {
    return text.replace('।', ' ।<br>');
  }
  return text;
}
