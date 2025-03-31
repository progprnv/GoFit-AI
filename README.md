
 <div align="center">
  <a href="https://">
    <img
      src="https://github.com/user-attachments/assets/07144fba-c9d3-4088-be1e-4b5edab5b19f"
      alt="gofit"
      height="64"
    />


   
  </a>
  <h3>
    <b>
     GoFit v0.0.1
    </b>
  </h3>
  <b>
    Open Sourced AI Fitness Care 
  </b>
  <p>

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen?logo=github)](CODE_OF_CONDUCT.md) [![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/progprnv/gofit-ai/actions)  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)  
[![Issues](https://img.shields.io/github/issues/progprnv/gofit-ai)](https://github.com/progprnv/gofit-ai/issues)  [![Stars](https://img.shields.io/github/stars/progprnv/gofit-ai)](https://github.com/progprnv/gofit-ai/stargazers)


  </p>
  <p>
    <sub>
      Built with ❤︎ by
      <a href="https://github.com/progprnv/gofit-ai/graphs/contributors">
        contributors
      </a>
    </sub>
  </p>
  <br />
  
</div>




## 🚀 Overview  
**GoFit AI** is an innovative open-source project that combines artificial intelligence, location-based services, and weather data to provide users with a holistic fitness and wellness experience. Whether you're looking for nearby gyms, weather-aware fitness tips, or personalized food recommendations, GoFit AI has you covered!  

The project is divided into **3 exciting phases** that seamlessly integrate to form the complete experience.

---

## 🌟 Features  

### Phase 1: Gym & Turf Finder  
- **Input**: User provides age, weight, height, and location (city, district, state, country).  
- **Action**: Queries the **Gemini API** to fetch the **top 5 turfs** and **top 5 gyms** near the user’s location.  
- **Output**: Displays results in a sleek div box with:  
  - 📍 Google Maps links  
  - 📞 Contact numbers  
  - ⭐ Ratings  

### Phase 2: Weather Insights  
- **Input**: Uses the user’s location from Phase 1.  
- **Action**: Fetches real-time weather data using the **OpenWeatherMap API**.  
- **Output**: Displays current weather conditions (e.g., temperature, humidity) in a clean, user-friendly format.  
  - ☀️ Clear skies  
  - 🌧️ Rain or clouds  

### Phase 3: Personalized Food Recommendations  
- **Input**: Combines weather data, user’s age, height, weight, and calculated BMI.  
- **Action**: Queries the **Gemini API** to suggest the **top 5 food items** tailored to the weather and user’s health.  
- **Output**: Lists food items with:  
  - 🥗 Reasons for recommendation  
  - 💪 Health benefits  

---

## 🛠️ Tech Stack  
- **Frontend**: HTML, CSS, JavaScript  
- **APIs**:  
  - [Gemini API](https://developers.google.com/gemini) (for location-based suggestions and food recommendations)  
  - [OpenWeatherMap API](https://openweathermap.org/api) (for real-time weather data)  
- **Languages**: JavaScript (for API calls and logic)  
- **Hosting**: Vercel  

---

## 📋 How It Works  

### Phase 1: Gym & Turf Finder  
1. User inputs their details (age, weight, height, and location).  
2. A POST request is sent to the Gemini API with a query like:  
   ~~~
   "Location is in {city, district, state, country}. Suggest me top 5 turfs and top 5 gym spots in my area with Google Maps links, contact numbers, and ratings for each."
   ~~~  
3. Results are displayed in a styled div box on the page.  

#### Gemini API Example  
~~~javascript
const apiKey = "YOUR_API_KEY"; // Replace with your key
const model = "gemini-2.0-flash";
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

const requestBody = {
  contents: [{
    parts: [{
      text: "Location is in Thrissur, Kerala, India. Suggest me top 5 turfs and top 5 gym spots in my area with Google Maps links, contact numbers, and ratings for each."
    }]
  }]
};

async function fetchSpots() {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });
  const data = await response.json();
  document.getElementById("spots").innerText = data.candidates[0].content.parts[0].text;
}
~~~

---

### Phase 2: Weather Insights  
1. User’s location (e.g., `Thrissur, IN`) is passed to the OpenWeatherMap API.  
2. Weather data is fetched and displayed.  

#### OpenWeatherMap API Example  
~~~javascript
const weatherApiKey = "YOUR_API_KEY"; // Replace with your key
const location = "Thrissur,IN";
const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${weatherApiKey}&units=metric`;

async function fetchWeather() {
  const response = await fetch(weatherUrl);
  const data = await response.json();
  document.getElementById("weather").innerText = `Temp: ${data.main.temp}°C, ${data.weather[0].description}`;
}
~~~

---

### Phase 3: Food Recommendations  
1. Combines weather data, user’s BMI (calculated from age, height, weight), and health context.  
2. Sends a query to the Gemini API like:  
   ~~~
   "Current weather is 28°C, sunny. User is 25 years old, 170cm tall, 70kg, BMI 24.2. Suggest top 5 food items to stay healthy in this weather with reasons."
   ~~~  
3. Displays recommendations with reasons in a neat list.

---

## 📸 Screenshots  
  

---

## 📜 License  
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Media




https://github.com/user-attachments/assets/d6f04f00-29fb-4cc0-98bc-28b280834bcc



## Workflow

![GoFitAI_Project_Abstract_With_Icons pdf 1 _page-0001](https://github.com/user-attachments/assets/bfc1084d-1a85-480f-8006-26a838710bc5)

Read PDF here: [GoFitAI_Project_Abstract_With_Icons.pdf[1].pdf](https://github.com/user-attachments/files/19044352/GoFitAI_Project_Abstract_With_Icons.pdf.1.pdf)


## 💡 Future Roadmap  
- Add user authentication for personalized profiles.  
- Integrate calorie tracking.  
- Support for multiple languages.

---

## 🙌 Acknowledgments  
- **Gemini API** for powering smart recommendations.  
- **OpenWeatherMap API** for real-time weather data.  
- You, for checking out GoFit AI!

---

**Star this repo if you like it! Let’s build a healthier world together! 🌟**













