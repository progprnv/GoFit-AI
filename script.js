// Theme Toggle Functionality
const themeToggle = document.getElementById('theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Check for saved theme preference or use system preference
const currentTheme = localStorage.getItem('theme') || 
    (prefersDarkScheme.matches ? 'dark' : 'light');

// Set initial theme
document.documentElement.setAttribute('data-theme', currentTheme);
themeToggle.checked = currentTheme === 'dark';

// Theme toggle event listener
themeToggle.addEventListener('change', function(e) {
    const theme = e.target.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
});

// Listen for system theme changes
prefersDarkScheme.addEventListener('change', function(e) {
    if (!localStorage.getItem('theme')) {
        const theme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        themeToggle.checked = e.matches;
    }
});

// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                navLinks.style.display = 'none';
            }
        }
    });
});

// Replace these with your actual API keys (use a backend in production for security)
const GEMINI_API_KEY = 'AIzaSyDpujbyrAZ1I_hniPtJNZwnMClGSjfLj-A';
const WEATHER_API_KEY = 'ef044fe4724ec6a5f73404f603dcdd93';
const GROK_API_KEY = 'xai-IXOKMQ6mw5tiwSx0srZkDdEw4PagP0zrfIG1Z8FxM49SdXtfFhQCZhjvdMjGh7rMkDiAQx1UcQULDtgY';

// Form submission handler
document.getElementById('user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const resultsDiv = document.getElementById('results');
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;

    // Show loading states
    resultsDiv.style.display = 'block';
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="loading"></span> Generating Your Plan...';

    // Update loading states for each section
    updateLoadingStates();

    try {
        // Phase 1: Fitness Spots via Gemini API
        const fitnessQuery = `location is in ${data.city},${data.district},${data.state},${data.country} suggest me top 5 turfs and top 5 gym spots in my area with google map links, address and also contact number and also ratings for each in bulleted, no need to make the text bolder i mean no need of * formatting in response, add emojis too`;
        const fitnessResponse = await callGeminiAPI(fitnessQuery);
        displayFitnessSpots(fitnessResponse);

        // Phase 2: Current Weather via OpenWeatherMap API
        const weatherData = await getWeather(data.city, data.country);
        displayWeather(weatherData);

        // Phase 3: Food Recommendations via Grok API
        const heightM = parseFloat(data.height) / 100;
        const bmi = (parseFloat(data.weight) / (heightM * heightM)).toFixed(2);
        const foodQuery = `Given the current weather is ${weatherData.description}, temperature is ${weatherData.temp}°C, and the user's age is ${data.age}, height is ${data.height}cm, weight is ${data.weight}kg, BMI is ${bmi}, please suggest the top 5 recommended food items and top 5 foods to avoid or limit for this weather and health condition, along with reasons.`;
        const foodResponse = await callGrokAPI(foodQuery);
        displayFoodRecommendations(foodResponse);

        // Scroll to results with animation
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        console.error('Error:', error);
        showError('An error occurred while generating your fitness plan. Please try again.');
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
});

// Update loading states for all sections
function updateLoadingStates() {
    const sections = ['turfs', 'gyms', 'weather-data', 'recommended-foods', 'avoid-foods'];
    sections.forEach(section => {
        document.getElementById(section).innerHTML = `
            <div class="loading-container">
                <span class="loading"></span>
                <p>Loading ${section.replace('-', ' ')}...</p>
            </div>
        `;
    });
}

// Show error message with animation
function showError(message) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="error-message" data-aos="fade-up">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

// API Calls with error handling
async function callGeminiAPI(query) {
    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
        const requestBody = {
            contents: [{ parts: [{ text: query }] }]
        };
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) throw new Error('Gemini API error');
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        throw new Error('Failed to fetch fitness spots data');
    }
}

async function getWeather(city, country) {
    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&lang=en&units=metric&appid=${WEATHER_API_KEY}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Weather API error');
        const data = await response.json();
        return {
            description: data.weather[0].description,
            temp: data.main.temp
        };
    } catch (error) {
        throw new Error('Failed to fetch weather data');
    }
}

async function callGrokAPI(query) {
    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
        const requestBody = {
            contents: [{ parts: [{ text: query }] }]
        };
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) throw new Error('Gemini API error');
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Gemini API fetch failed:', error);
        throw new Error('Failed to fetch food recommendations');
    }
}

function displayFitnessSpots(text) {
    console.log('Raw fitness response:', text); // Debug: Keep for troubleshooting

    // Normalize text by removing excessive whitespace
    const normalizedText = text.replace(/\s*\n\s*/g, '\n').trim();

    // Flexible header detection
    const turfHeaderPatterns = [
        /top 5 turfs/i,
        /turfs in/i,
        /suggested turfs/i,
        /⚽️?\s*top 5 turfs/i
    ];
    const gymHeaderPatterns = [
        /top 5 gyms/i,
        /gym spots/i,
        /suggested gyms/i,
        /💪?\s*top 5 gyms/i
    ];

    let turfsSection = '';
    let gymsSection = '';

    // Find section boundaries
    const lines = normalizedText.split('\n');
    let turfStart = -1;
    let gymStart = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        if (turfStart === -1 && turfHeaderPatterns.some(pattern => pattern.test(line))) {
            turfStart = i;
        }
        if (gymStart === -1 && gymHeaderPatterns.some(pattern => pattern.test(line))) {
            gymStart = i;
            break;
        }
    }

    if (turfStart !== -1 && gymStart !== -1 && turfStart < gymStart) {
        turfsSection = lines.slice(turfStart, gymStart).join('\n').trim();
        gymsSection = lines.slice(gymStart).join('\n').trim();
    } else if (turfStart !== -1) {
        turfsSection = lines.slice(turfStart).join('\n').trim();
    } else if (gymStart !== -1) {
        gymsSection = lines.slice(gymStart).join('\n').trim();
    }

    // Fallback: If no clear split, look for bullet points and divide
    if (!turfsSection && !gymsSection) {
        const bulletItems = lines.filter(line => /^\*\s+/.test(line));
        if (bulletItems.length >= 5) {
            turfsSection = bulletItems.slice(0, 5).join('\n');
            gymsSection = bulletItems.slice(5, 10).join('\n');
        }
    }

    // Function to parse entries and format with details
    const formatEntries = (sectionText) => {
        if (!sectionText) return 'No entries found.';
        
        // Match entries starting with "*   " followed by optional emoji and name
        const entryRegex = /\*\s+[⚽🥅💪🏋️‍♀️]?\s*(.+?)(\n|$)([\s\S]*?)(?=\*\s+[⚽🥅💪🏋️‍♀️]?|$)/g;
        const entries = [];
        let match;
        while ((match = entryRegex.exec(sectionText)) !== null) {
            entries.push(match);
        }

        return entries.map(entry => {
            const name = entry[1].trim();
            const details = entry[3];
            const addressMatch = details.match(/(Address|Location):?\s*(.+)/i);
            const mapsMatch = details.match(/(Google Maps|Maps Link):?\s*\[(.*?)\]/i);
            const contactMatch = details.match(/Contact( Number)?:?\s*(.+)/i);
            const ratingMatch = details.match(/Rating:?\s*(.+)/i);

            const address = addressMatch ? addressMatch[2].trim() : 'Not provided';
            const mapsLink = mapsMatch ? mapsMatch[2].trim() : '#';
            const contact = contactMatch ? contactMatch[2].trim() : 'Not provided';
            const rating = ratingMatch ? ratingMatch[1].trim() : 'Not provided';

            return `
                <div class="fitness-entry">
                    <p><strong>${name}</strong></p>
                    <p>Address: ${address}</p>
                    <p><a href="${mapsLink}" target="_blank">Google Maps</a></p>
                    <p>Contact: ${contact}</p>
                    <p>Rating: ${rating}</p>
                </div>
            `;
        }).join('');
    };

    const turfsText = formatEntries(turfsSection);
    const gymsText = formatEntries(gymsSection);

    const turfsElement = document.getElementById('turfs');
    const gymsElement = document.getElementById('gyms');
    
    turfsElement.innerHTML = `<h3><i class="fas fa-futbol"></i> Top 5 Turfs</h3>${turfsText}`;
    gymsElement.innerHTML = `<h3><i class="fas fa-dumbbell"></i> Top 5 Gyms</h3>${gymsText}`;
    
    // Add fade-in animation
    turfsElement.style.opacity = '0';
    gymsElement.style.opacity = '0';
    setTimeout(() => {
        turfsElement.style.transition = 'opacity 0.5s ease';
        gymsElement.style.transition = 'opacity 0.5s ease';
        turfsElement.style.opacity = '1';
        gymsElement.style.opacity = '1';
    }, 100);
}
function displayWeather(data) {
    const weatherElement = document.getElementById('weather-data');
    weatherElement.innerHTML = `
        <div class="weather-info" data-aos="fade-up">
            <i class="fas fa-cloud-sun"></i>
            <p><strong>Weather:</strong> ${data.description}</p>
            <p><strong>Temperature:</strong> ${data.temp}°C</p>
        </div>
    `;
    
    // Add fade-in animation
    weatherElement.style.opacity = '0';
    setTimeout(() => {
        weatherElement.style.transition = 'opacity 0.5s ease';
        weatherElement.style.opacity = '1';
    }, 100);
}

function displayFoodRecommendations(text) {
    const parts = text.split(/top 5 foods to avoid or limit/i);
    const recommendedText = parts[0].match(/top 5 recommended food items([\s\S]*)/i);
    const avoidText = parts[1] ? parts[1].trim() : '';

    const recommendedList = recommendedText ? recommendedText[1].trim().split('\n').map(line => `<p>${line}</p>`).join('') : 'No recommendations available.';
    const avoidList = avoidText ? avoidText.split('\n').map(line => `<p>${line}</p>`).join('') : 'No foods to avoid listed.';

    const recommendedElement = document.getElementById('recommended-foods');
    const avoidElement = document.getElementById('avoid-foods');
    
    recommendedElement.innerHTML = `<h3><i class="fas fa-check-circle"></i> Recommended Foods</h3>${recommendedList}`;
    avoidElement.innerHTML = `<h3><i class="fas fa-times-circle"></i> Foods to Avoid or Limit</h3>${avoidList}`;
    
    // Add fade-in animation
    recommendedElement.style.opacity = '0';
    avoidElement.style.opacity = '0';
    setTimeout(() => {
        recommendedElement.style.transition = 'opacity 0.5s ease';
        avoidElement.style.transition = 'opacity 0.5s ease';
        recommendedElement.style.opacity = '1';
        avoidElement.style.opacity = '1';
    }, 100);
}

// Add scroll reveal animation
window.addEventListener('scroll', () => {
    const elements = document.querySelectorAll('.content-box, .feature-card, .form-group');
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
});
