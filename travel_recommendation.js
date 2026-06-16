// ----- SEARCH (only on home page) -----
const searchInput = document.getElementById('searchInput');
const btnSearch = document.getElementById('btnSearch');
const btnClear = document.getElementById('btnClear');
const resultsContainer = document.getElementById('resultsContainer');

let travelData = null;
let dataLoaded = false;

async function loadData() {
    try {
        const res = await fetch('travel_recommendation_api.json');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        travelData = await res.json();
        dataLoaded = true;
        console.log('✅ Travel data loaded successfully');
    } catch (err) {
        console.error('❌ Failed to load travel data:', err);
        travelData = null;
        dataLoaded = false;
        // Show a persistent error message in the results area if it exists
        if (resultsContainer) {
            resultsContainer.classList.add('visible');
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <div class="icon">⚠️</div>
                    <h3>Data loading error</h3>
                    <p>Could not load <strong>travel_recommendation_api.json</strong>. Please check the file and try again.</p>
                </div>
            `;
        }
    }
}

function performSearch() {
    if (!searchInput || !resultsContainer) return; // not on home page

    const query = searchInput.value.trim();
    if (!query) {
        resultsContainer.classList.remove('visible');
        resultsContainer.innerHTML = '';
        return;
    }

    if (!dataLoaded || !travelData) {
        resultsContainer.classList.add('visible');
        resultsContainer.innerHTML = `
            <div class="no-results">
                <div class="icon">⏳</div>
                <h3>Data not available</h3>
                <p>Please wait for the data to load, or check that the JSON file exists.</p>
            </div>
        `;
        return;
    }

    const lowerQuery = query.toLowerCase();
    let results = [];

    // Beaches
    if (lowerQuery.includes('beach') || lowerQuery.includes('beaches')) {
        results = results.concat(travelData.beaches.map(b => ({ ...b, type: 'beach' })));
    }

    // Temples
    if (lowerQuery.includes('temple') || lowerQuery.includes('temples')) {
        results = results.concat(travelData.temples.map(t => ({ ...t, type: 'temple' })));
    }

    // Countries
    if (lowerQuery.includes('country') || lowerQuery.includes('countries')) {
        travelData.countries.forEach(c => {
            c.cities.forEach(city => {
                results.push({ name: `${city.name}, ${c.name}`, imageUrl: city.imageUrl, description: city.description, type: 'country' });
            });
        });
    } else {
        travelData.countries.forEach(c => {
            if (c.name.toLowerCase().includes(lowerQuery)) {
                c.cities.forEach(city => {
                    results.push({ name: `${city.name}, ${c.name}`, imageUrl: city.imageUrl, description: city.description, type: 'country' });
                });
            }
            c.cities.forEach(city => {
                if (city.name.toLowerCase().includes(lowerQuery)) {
                    results.push({ name: `${city.name}, ${c.name}`, imageUrl: city.imageUrl, description: city.description, type: 'country' });
                }
            });
        });
    }

    // Deduplicate by name
    const seen = new Set();
    results = results.filter(r => {
        const key = r.name;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    renderResults(results, query);
}

function renderResults(results, query) {
    if (!resultsContainer) return;
    resultsContainer.classList.add('visible');

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <div class="icon">🔍</div>
                <h3>No results found</h3>
                <p>Try searching for "beach", "temple", or a country name.</p>
            </div>
        `;
        return;
    }

    const display = results.slice(0, 8);
    let html = `
        <div class="results-title">
            <span>📍</span> ${display.length} recommendation${display.length > 1 ? 's' : ''} for "${escapeHtml(query)}"
        </div>
        <div class="results-grid">
    `;

    display.forEach(item => {
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

function clearResults() {
    if (!searchInput || !resultsContainer) return;
    searchInput.value = '';
    resultsContainer.classList.remove('visible');
    resultsContainer.innerHTML = '';
}

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

// Attach event listeners only if elements exist (home page)
if (btnSearch && searchInput && btnClear) {
    btnSearch.addEventListener('click', performSearch);
    btnClear.addEventListener('click', clearResults);
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') performSearch(); });
}

// Load data once on page load
loadData();

// ----- CONTACT FORM (only on contact page) -----
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const msg = document.getElementById('contactMessage').value.trim();
        if (name && email && msg) {
            alert(`✅ Thank you, ${name}! We've received your message and will get back to you soon.`);
            this.reset();
        } else {
            alert('⚠️ Please fill in all fields before submitting.');
        }
    });
}

// ----- Set active nav link based on current page -----
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname.split('/').pop() || 'home.html';
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});