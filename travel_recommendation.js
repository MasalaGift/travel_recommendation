
// ----- DOM references -----
const searchInput = document.getElementById('searchInput');
const btnSearch = document.getElementById('btnSearch');
const btnClear = document.getElementById('btnClear');
const resultsContainer = document.getElementById('resultsContainer');

// ----- Global data store -----
let travelData = null;

// ----- Fetch data from JSON -----
function loadData() {
    fetch('travel_recommendation_api.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            travelData = data;
            console.log('✅ Travel data loaded:', travelData);
        })
        .catch(error => {
            console.error('❌ Error loading data:', error);
            // Show error in results area
            if (resultsContainer) {
                resultsContainer.classList.add('visible');
                resultsContainer.innerHTML = `
                    <div class="no-results">
                        <div class="icon">⚠️</div>
                        <h3>Data loading failed</h3>
                        <p>Could not load travel_recommendation_api.json. Please check the file.</p>
                    </div>
                `;
            }
        });
}

// ----- Search logic (similar to your example) -----
function searchCondition() {
    // Clear previous results
    resultsContainer.innerHTML = '';
    resultsContainer.classList.remove('visible');

    const query = searchInput.value.trim();
    if (!query) {
        return; // do nothing if empty
    }

    // If data not yet loaded, show message
    if (!travelData) {
        resultsContainer.classList.add('visible');
        resultsContainer.innerHTML = `
            <div class="no-results">
                <div class="icon">⏳</div>
                <h3>Loading data…</h3>
                <p>Please wait for the data to load and try again.</p>
            </div>
        `;
        return;
    }

    const lowerQuery = query.toLowerCase();
    let results = [];

    // --- 1) Check for beach keywords ---
    if (lowerQuery.includes('beach') || lowerQuery.includes('beaches')) {
        results = results.concat(travelData.beaches.map(item => ({
            ...item,
            type: 'beach'
        })));
    }

    // --- 2) Check for temple keywords ---
    if (lowerQuery.includes('temple') || lowerQuery.includes('temples')) {
        results = results.concat(travelData.temples.map(item => ({
            ...item,
            type: 'temple'
        })));
    }

    // --- 3) Check for country or city ---
    // If query contains "country" or "countries", show all cities from all countries
    if (lowerQuery.includes('country') || lowerQuery.includes('countries')) {
        travelData.countries.forEach(country => {
            country.cities.forEach(city => {
                results.push({
                    name: `${city.name}, ${country.name}`,
                    imageUrl: city.imageUrl,
                    description: city.description,
                    type: 'country'
                });
            });
        });
    } else {
        // Otherwise, search for matching country name or city name
        travelData.countries.forEach(country => {
            // Check if country name matches
            if (country.name.toLowerCase().includes(lowerQuery)) {
                country.cities.forEach(city => {
                    results.push({
                        name: `${city.name}, ${country.name}`,
                        imageUrl: city.imageUrl,
                        description: city.description,
                        type: 'country'
                    });
                });
            } else {
                // Check if any city name matches
                country.cities.forEach(city => {
                    if (city.name.toLowerCase().includes(lowerQuery)) {
                        results.push({
                            name: `${city.name}, ${country.name}`,
                            imageUrl: city.imageUrl,
                            description: city.description,
                            type: 'country'
                        });
                    }
                });
            }
        });
    }

    // Remove duplicates (same name)
    const seen = new Set();
    results = results.filter(item => {
        const key = item.name;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // --- Display results ---
    displayResults(results, query);
}

// ----- Display results in grid -----
function displayResults(results, query) {
    resultsContainer.classList.add('visible');

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <div class="icon">🔍</div>
                <h3>No results found</h3>
                <p>Try searching for "beach", "temple", or a country/city name.</p>
            </div>
        `;
        return;
    }

    // Limit to 8 results
    const displayItems = results.slice(0, 8);

    let html = `
        <div class="results-title">
            <span>📍</span> ${displayItems.length} recommendation${displayItems.length > 1 ? 's' : ''} for "${escapeHtml(query)}"
        </div>
        <div class="results-grid">
    `;

    displayItems.forEach(item => {
        const typeLabel = item.type === 'beach' ? '🏖️ Beach' :
                          item.type === 'temple' ? '🛕 Temple' : '🌍 Country';
        html += `
            <div class="result-card">
                <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" loading="lazy" />
                <div class="card-body">
                    <span class="place-type">${typeLabel}</span>
                    <h4>${escapeHtml(item.name)}</h4>
                    <p>${escapeHtml(item.description)}</p>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    resultsContainer.innerHTML = html;
}

// ----- Clear results -----
function clearResults() {
    searchInput.value = '';
    resultsContainer.classList.remove('visible');
    resultsContainer.innerHTML = '';
}

// ----- Helper: escape HTML to prevent XSS -----
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        if (m === '"') return '&quot;';
        return m;
    });
}

// ----- Attach event listeners -----
if (btnSearch && searchInput && btnClear) {
    btnSearch.addEventListener('click', searchCondition);
    btnClear.addEventListener('click', clearResults);
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            searchCondition();
        }
    });
}

// ----- Load data on page load -----
loadData();

// ----- Contact form (optional) -----
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const msg = document.getElementById('contactMessage').value.trim();
        if (name && email && msg) {
            alert(`✅ Thank you, ${name}! We've received your message.`);
            this.reset();
        } else {
            alert('⚠️ Please fill all fields.');
        }
    });
}

// ----- Highlight active nav link (runs on all pages) -----
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname.split('/').pop() || 'home.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});