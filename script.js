// Replace these with your actual API keys (use a backend in production for security)
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
const WEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
const GROK_API_KEY = 'YOUR_GROK_API_KEY';

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
        const fitnessQuery = `location is in ${data.city},${data.district},${data.state},${data.country} suggest me top 5 turfs and top 5 gym spots in my area with google map links and also contact number and also ratings for each`;
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

        // Scroll to results
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

// Show error message
function showError(message) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

// API Calls with error handling
async function callGeminiAPI(query) {
    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
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
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${WEATHER_API_KEY}&units=metric`;
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
        const apiUrl = 'https://api.x.ai/v1/chat/completions';
        const requestBody = {
            model: 'grok-beta',
            messages: [{ role: 'user', content: query }]
        };
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) throw new Error('Grok API error');
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        throw new Error('Failed to fetch food recommendations');
    }
}

// Display Functions with animations
function displayFitnessSpots(text) {
    const turfsMatch = text.match(/top 5 turfs([\s\S]*?)(?=top 5 gym spots|$)/i);
    const gymsMatch = text.match(/top 5 gym spots([\s\S]*)/i);
    
    const turfsText = turfsMatch ? turfsMatch[1].trim().split('\n').map(line => `<p>${line}</p>`).join('') : 'No turfs found.';
    const gymsText = gymsMatch ? gymsMatch[1].trim().split('\n').map(line => `<p>${line}</p>`).join('') : 'No gyms found.';
    
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
        <div class="weather-info">
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
