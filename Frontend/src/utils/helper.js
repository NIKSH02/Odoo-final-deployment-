
let API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const API_KEY = 'a0819c4a101d13b91399935fee5b9b23'

// Function to get temperature-based recommendations
function getTemperatureRecommendations(temp, feelsLike, description, humidity) {
    const recommendations = {
        message: '',
        suggestions: [],
        activityLevel: '',
        hydrationTip: '',
        clothing: '',
        bestTime: '',
        icon: '🌡️'
    };

    if (temp < 10) {
        recommendations.message = "It's quite cold! Perfect for high-intensity sports.";
        recommendations.suggestions = [
            "Great weather for intensive sports like squash or badminton",
            "Indoor courts recommended for comfort",
            "Perfect for team sports that keep you moving"
        ];
        recommendations.activityLevel = "High intensity recommended";
        recommendations.hydrationTip = "Stay warm and hydrated with warm beverages";
        recommendations.clothing = "Wear layers and warm-up properly";
        recommendations.bestTime = "Midday hours (11 AM - 3 PM) for outdoor activities";
        recommendations.icon = "🥶";
    } else if (temp >= 10 && temp < 20) {
        recommendations.message = "Cool and comfortable weather for all activities!";
        recommendations.suggestions = [
            "Perfect for both indoor and outdoor sports",
            "Ideal for tennis, basketball, or football",
            "Great for longer duration activities"
        ];
        recommendations.activityLevel = "All activity levels suitable";
        recommendations.hydrationTip = "Regular hydration is sufficient";
        recommendations.clothing = "Light layers recommended";
        recommendations.bestTime = "Any time of day is suitable";
        recommendations.icon = "😊";
    } else if (temp >= 20 && temp < 30) {
        recommendations.message = "Pleasant weather! Great for outdoor sports.";
        recommendations.suggestions = [
            "Excellent for outdoor courts and fields",
            "Perfect for cricket, tennis, or football",
            "Ideal conditions for most sports activities"
        ];
        recommendations.activityLevel = "All activity levels perfect";
        recommendations.hydrationTip = "Stay hydrated, especially during intense activities";
        recommendations.clothing = "Light, breathable clothing recommended";
        recommendations.bestTime = "Early morning or evening preferred for outdoor activities";
        recommendations.icon = "☀️";
    } else if (temp >= 30 && temp < 35) {
        recommendations.message = "Hot weather! Take precautions and stay hydrated.";
        recommendations.suggestions = [
            "Consider air-conditioned indoor venues",
            "Schedule activities during cooler hours",
            "Swimming or water sports highly recommended"
        ];
        recommendations.activityLevel = "Moderate intensity recommended";
        recommendations.hydrationTip = "Frequent hydration breaks essential";
        recommendations.clothing = "Light, UV-protective clothing";
        recommendations.bestTime = "Early morning (6-9 AM) or evening (6-8 PM)";
        recommendations.icon = "🔥";
    } else {
        recommendations.message = "Very hot! Indoor venues strongly recommended.";
        recommendations.suggestions = [
            "Air-conditioned indoor courts only",
            "Avoid prolonged outdoor activities",
            "Consider water-based activities if available"
        ];
        recommendations.activityLevel = "Light activity only";
        recommendations.hydrationTip = "Constant hydration and electrolyte replacement needed";
        recommendations.clothing = "Minimal, light-colored, UV-protective clothing";
        recommendations.bestTime = "Avoid peak hours (10 AM - 4 PM)";
        recommendations.icon = "🌡️";
    }

    // Add humidity-based suggestions
    if (humidity > 70) {
        recommendations.suggestions.push("High humidity - ensure good ventilation");
        recommendations.hydrationTip += " Extra care needed due to high humidity";
    }

    // Add weather condition-based suggestions
    if (description.includes('rain')) {
        recommendations.suggestions.push("Indoor venues recommended due to rain");
        recommendations.icon = "🌧️";
    } else if (description.includes('clear')) {
        recommendations.suggestions.push("Clear skies - perfect for outdoor activities!");
    }

    return recommendations;
}

async function getWeatherData (city) { 
    try {
        let response = await fetch (`${API_URL}?q=${city}&appid=${API_KEY}&units=metric`)
        let jsonResponse = await response.json();
        let result = {
            city: jsonResponse.name,
            country: jsonResponse.sys.country,
            temp: jsonResponse.main.temp,
            humidity: jsonResponse.main.humidity,
            description: jsonResponse.weather[0].description,
            icon: jsonResponse.weather[0].icon,
            temp_max: jsonResponse.main.temp_max,
            temp_min: jsonResponse.main.temp_min,
            wind: jsonResponse.wind.speed,
            feelsLike : jsonResponse.main.feels_like,
            // Add recommendations based on temperature
            recommendations: getTemperatureRecommendations(
                jsonResponse.main.temp, 
                jsonResponse.main.feels_like, 
                jsonResponse.weather[0].description,
                jsonResponse.main.humidity
            )
        }
        return result;
    }catch (err) {
        throw new Error(err);
    }
}

    export { getWeatherData };