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

// Wait for DOM to load before attaching form handler
document.addEventListener('DOMContentLoaded', () => {
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
            const fitnessQuery = `location is in ${data.city},${data.district},${data.state},${data.country} suggest me top 5 turfs and top 5 gym spots in my area with address in plain text and also contact number and also ratings for each in bulleted points for each spots, add emojis too. Just give me the answer only with two titles Top 5 turfs and top 5 gyms and subtitles total of 10 for spot details. make some space between the these two different titles and highlight these two titles. i dont need '*' in output. no need starting sentence. just send me the answer`;
            const fitnessResponse = await callGeminiAPI(fitnessQuery);
            displayFitnessSpots(fitnessResponse);

            // Phase 2: Current Weather via OpenWeatherMap API
            const weatherData = await getWeather(data.city, data.country);
            displayWeather(weatherData);

            // Phase 3: Food Recommendations via Gemini API (corrected from Grok)
            const heightM = parseFloat(data.height) / 100;
            const bmi = (parseFloat(data.weight) / (heightM * heightM)).toFixed(2);
            const foodQuery = `Given the current weather is ${weatherData.description}, temperature is ${weatherData.temp}°C, and the user's age is ${data.age}, height is ${data.height}cm, weight is ${data.weight}kg, BMI is ${bmi}, please suggest the top 5 recommended food items and top 5 foods to avoid or limit for this weather and health condition, along with reasons.`;
            const foodResponse = await callGrokAPI(foodQuery); // Note: This uses Gemini API despite being named callGrokAPI
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
});

// Update loading states for all sections
function updateLoadingStates() {
    const sections = ['fitness-spots-content', 'weather-data', 'recommended-foods', 'avoid-foods'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) { // Check if element exists
            element.innerHTML = `
                <div class="loading-container">
                    <span class="loading"></span>
                    <p>Loading ${section.replace('-', ' ')}...</p>
                </div>
            `;
        } else {
            console.warn(`Element with ID '${section}' not found in DOM`);
        }
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

    // Normalize text by removing excessive whitespace and markdown headers
    const normalizedText = text
        .replace(/##\s*/g, '') // Remove "##" headers
        .replace(/\s*\n\s*/g, '\n') // Normalize whitespace around newlines
        .trim();

    // Display the full text without splitting
    const fitnessSpotsElement = document.getElementById('fitness-spots-content');
    fitnessSpotsElement.innerHTML = `<p>${normalizedText.replace(/\n/g, '<br>')}</p>`;
    
    // Add fade-in animation
    fitnessSpotsElement.style.opacity = '0';
    setTimeout(() => {
        fitnessSpotsElement.style.transition = 'opacity 0.5s ease';
        fitnessSpotsElement.style.opacity = '1';
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
