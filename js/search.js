// Function to fetch JSON file
async function fetchJSONFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch JSON file: ${filePath}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching JSON file: ${filePath}`, error);
        throw error;
    }
}

// Function to perform the initial search
function search() {
    const searchInput = document.getElementById('search-input').value.toLowerCase().trim();

    const searchRedirects = [
        { keywords: ['valmiki ramayana', 'valmiki ramayan', 'balakanda', 'ayodhya kanda', 'aranya kanda', 'kishkindha kanda', 'sundara kanda', 'yudhha kanda', 'uttara kanda', 'valmikiramayana', 'valmikiramayan', 'bala kanda', 'ayodhyakanda', 'aranyakanda', 'kishkindhakanda', 'sundarakanda', 'yudhhakanda', 'uttarakanda'], redirect: 'Ramayanas' },
        { keywords: ['mahabharata', 'mahabharat', 'adi parva', 'adiparva', 'sabha parva', 'vana parva', 'virata parva', 'udyoga parva', 'bhishma parva', 'drona parva', 'karna parva', 'shalya parva', 'sauptika parva', 'stri parva', 'shanti parva', 'anushasana parva', 'ashvamedhika parva', 'ashramavasika parva', 'mausala parva', 'mahaprasthanika parva', 'swargarohanika parva'], redirect: 'mahabharata' },
        { keywords: ['adhyatmaramayanabook', 'adhyatmaramayana', 'adhyatma ramayana', 'adhyatma ramayan', 'adhyatmaramayan'], redirect: 'AdhyatmaRamayanaBook.html' },
        { keywords: ['ramayana', 'ramayan'], redirect: 'ramayana_difftable.html' },
        { keywords: ['adbhutramayanbook', 'adbhutramayan', 'adbhut ramayana', 'adbhutramayana', 'adbhuta ramayan', 'adbhutaramayana', 'adbhutaramayan', 'adbhuta ramayan'], redirect: 'AdbhutRamayanBook.html' },
        { keywords: ['srimadbhagvadgita', 'bhagvadgita', 'srimad bhagvad gita', 'bhagavad gita', 'srimad bhagavad gita', 'srimadbhagavadgita', 'iswara gita', 'ananta gita', 'hari gita', 'vyasa gita'], redirect: 'BhagvadGita.html' },
        { keywords: ['purana', 'puranas', 'puran', 'agni purana', 'bhagavata purana', 'bhavishya purana', 'brahma purana', 'brahmaanda purana', 'brahmavaivarta purana', 'garuda purana', 'kurma purana', 'linga purana', 'markandeya purana', 'matsya purana', 'narada purana', 'padma purana', 'shiva purana', 'skanda purana', 'vamana purana', 'varaha purana', 'vayu purana', 'vishnu purana'], redirect: 'Puranas.html' },
        { keywords: ['atharvaveda', 'samaveda', 'yajurveda', 'rigveda', 'atharva veda', 'sama veda', 'yajur veda', 'rig veda', 'vedas', 'veda'], redirect: 'Vedas' },
        { keywords: ['stotra', 'stotras'], redirect: 'Stotras' },
        { keywords: ['smritis', 'smriti'], redirect: 'Smritis' },
        { keywords: ['stut', 'stutis'], redirect: 'Stutis' },
        { keywords: ['chalisa', 'chalisas'], redirect: 'Chalisas' },
        { keywords: ['ashtak', 'ashtakas'], redirect: 'Ashtakas' },
        { keywords: ['kavach', 'kavachas'], redirect: 'Kavachas' },
        { keywords: ['upnishad', 'upnishads', '108 upnishad'], redirect: 'Upnishad' },
        { keywords: ['namavali', 'namavalis'], redirect: 'Namavalis' },
        { keywords: ['aarati', 'aarti', 'aaratis', 'aartis'], redirect: 'Aarati' },
        { keywords: ['bhajan', 'bhajans', 'bhajans'], redirect: 'Bhajan' },
        { keywords: ['kirtan', 'shikshapatri', 'vachnamrut', 'bhakti', 'chintamani', 'satsang', 'prashnavali', 'saar sidhi', 'Janmangal Namavali & Stotram', 'Janmangal Stotram', 'Janmangal Namavali', '16 sanskar', 'swaminarayan', 'yamdand', 'Nishkulanand', 'Satsangi-Jivan', 'Satsangi Jivan'], redirect: 'Swaminarayan-Sect' },
        { keywords: ['upang', 'upanga', 'Nyay', 'Vaisheshik', 'Samkhya', 'Yoga', 'Mīmāṃsā', 'Vedanta', '6 darshan'], redirect: 'Upanga' },
        { keywords: ['vedanga', 'vedang', 'jyotish', 'kalp', 'ashthadhyay', 'chhanda', 'nirukt', 'shiksha'], redirect: 'Vedanga' },
        { keywords: ["Baal Kāṇḍa", "Ayodhya Kāṇḍa", "Aranya Kāṇḍa", "Kishkindha Kāṇḍa", "Sundar Kāṇḍa", "Lanka Kāṇḍa", "Uttar Kāṇḍa", 'Lanka kanda', 'Ramcharitmanas'], redirect: 'Ramcharitmanas' },
        { keywords: ['gita', 'aajgar gita', 'agastya gita', 'aila gita (shrimad bhagwat mahapurana)', 'anu gita', 'ashtavakra gita (dattatreyakrut)', 'avadhuta gita (shrimad bhagwat mahapurana)', 'avadhuta gita', 'baka gita', 'bhagavati gita', 'bhikshu gita', 'bodhya gita (mahabharata)', 'brahma gita (skanda purana)', 'brahma gita (yoga vasishtha)', 'brahman gita (mahabharata)', 'devi gita', 'dharma vyaadh gita (mahabharata)', 'dhisha gita', 'ganesh gita', 'garbha gita', 'gayatri gita', 'gopi gita', 'guha gita', 'guru gita', 'haarit gita', 'hans gita (mahabharata)', 'hans gita (shrimad bhagwat mahapurana)', 'isvara gita', 'jivan mukta gita', 'kaashyapa gita', 'kama gita', 'kapil gita (shrimad bhagwat mahapurana)', 'karuna gita (shrimad bhagwat mahapurana)', 'lakshman gita (ramcharitamanas)', 'manki gita', 'nahusha gita (mahabharata)', 'narada gita', 'pandava gita', 'paraashara gita (mahabharata)', 'paramhansa gita', 'pingala gita', 'pitru gita (varaha purana)', 'prithvi gita', 'putra gita', 'raasa gita', 'ram gita (adbhuta ramayana)', 'ram gita (adhyatma ramayana)', 'ribhu gita', 'rishabha gita (mahabharata)', 'rishabha gita (shrimad bhagwat mahapurana)', 'rudra gita (shrimad bhagwat mahapurana)', 'rudra gita (varaha purana)', 'saptashati gita', 'saraswati gita', 'shadaj gita', 'shampak gita', 'shanti gita', 'shaunaka gita (mahabharata)', 'shiv gita', 'shiva gita', 'shri ramana gita', 'shri vaanara gita', 'shrigaala gita (mahabharata)', 'shruti gita (shrimad bhagwat mahapurana)', 'siddha gita', 'surya gita', 'suta gita', 'tulsi gita', 'uddhava gita', 'utathya gita', 'uttara gita', 'vaamadeva gita (mahabharata)', 'vaishnava gita', 'vasishtha gita', 'venu gita', 'vrutra gita', 'yajnvalkya gita (mahabharata)', 'yama gita (agni purana)', 'yama gita (vishnu purana)', 'yudhisthira gita'], redirect: 'Gitas' }
    ];

    for (const redirect of searchRedirects) {
        if (isValidKeywords(searchInput, redirect.keywords)) {
            window.location.href = `${redirect.redirect}?q=${encodeURIComponent(searchInput)}`;
            return;
        }
    }

    // Display a message for invalid keywords
    displayInvalidKeywords();
}

// Function to check if entered keywords are valid
function isValidKeywords(input, validKeywords) {
    // Convert input to lowercase for case-insensitivity
    const lowercaseInput = input.toLowerCase();

    // Check if any part of the valid keywords is included in the input
    return validKeywords.some(keyword => lowercaseInput.includes(keyword.toLowerCase()));
}

// Function to display a message for invalid keywords
function displayInvalidKeywords() {
    // Display the error message in an alert
    alert('Invalid keywords entered. Please enter valid keywords.');
}
