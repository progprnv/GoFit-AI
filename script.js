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

    // Show loading states
    resultsDiv.style.display = 'block';
    document.getElementById('turfs').innerHTML = '<p>Loading turfs...</p>';
    document.getElementById('gyms').innerHTML = '<p>Loading gyms...</p>';
    document.getElementById('weather-data').innerHTML = '<p>Loading weather...</p>';
    document.getElementById('recommended-foods').innerHTML = '<p>Loading recommendations...</p>';
    document.getElementById('avoid-foods').innerHTML = '<p>Loading foods to avoid...</p>';

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
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = '<p style="color: red;">An error occurred. Please try again.</p>';
    }
});

// Gemini API Call
async function callGeminiAPI(query) {
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
}

// OpenWeatherMap API Call
async function getWeather(city, country) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${WEATHER_API_KEY}&units=metric`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Weather API error');
    const data = await response.json();
    return {
        description: data.weather[0].description,
        temp: data.main.temp
    };
}

// Grok API Call
async function callGrokAPI(query) {
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
}

// Display Functions
function displayFitnessSpots(text) {
    const turfsMatch = text.match(/top 5 turfs([\s\S]*?)(?=top 5 gym spots|$)/i);
    const gymsMatch = text.match(/top 5 gym spots([\s\S]*)/i);
    
    const turfsText = turfsMatch ? turfsMatch[1].trim().split('\n').map(line => `<p>${line}</p>`).join('') : 'No turfs found.';
    const gymsText = gymsMatch ? gymsMatch[1].trim().split('\n').map(line => `<p>${line}</p>`).join('') : 'No gyms found.';
    
    document.getElementById('turfs').innerHTML = `<h3>Top 5 Turfs</h3>${turfsText}`;
    document.getElementById('gyms').innerHTML = `<h3>Top 5 Gyms</h3>${gymsText}`;
}

function displayWeather(data) {
    document.getElementById('weather-data').innerHTML = `
        <p><strong>Weather:</strong> ${data.description}</p>
        <p><strong>Temperature:</strong> ${data.temp}°C</p>
    `;
}

function displayFoodRecommendations(text) {
    const parts = text.split(/top 5 foods to avoid or limit/i);
    const recommendedText = parts[0].match(/top 5 recommended food items([\s\S]*)/i);
    const avoidText = parts[1] ? parts[1].trim() : '';

    const recommendedList = recommendedText ? recommendedText[1].trim().split('\n').map(line => `<p>${line}</p>`).join('') : 'No recommendations available.';
    const avoidList = avoidText ? avoidText.split('\n').map(line => `<p>${line}</p>`).join('') : 'No foods to avoid listed.';

    document.getElementById('recommended-foods').innerHTML = `<h3>Recommended Foods</h3>${recommendedList}`;
    document.getElementById('avoid-foods').innerHTML = `<h3>Foods to Avoid or Limit</h3>${avoidList}`;
}
