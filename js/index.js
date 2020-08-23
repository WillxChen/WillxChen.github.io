const weatherConditions = ['sun', 'clear', 'partly cloudy', 'cloud', 'shower', 'storm', 'snow', 'fog'];

const clock = {
    getTime() {
        return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    },
    initialize(onTimer) {
        onTimer()
        setInterval(() => onTimer(), 60000);
    },
}

const getWeatherConditions = (shortForecast) => {
    const shortForecastAsLowercase = shortForecast.toLowerCase();
    return weatherConditions.find(weatherCondition => shortForecastAsLowercase.includes(weatherCondition));
}

const domHandler = {
    loadRandomBackground() {
        const colors = ['#0099cc', '#ff8c8c', '#D9D92B', '#a5ed5e',
                '#57d998', '#99ccff', '#c68cff', '#ff8cc6'];
        const body = document.querySelector("body");
        body.style.backgroundColor = colors[Math.floor(Math.random() * 8)];
    },
    updateTime() {
        const h1 = document.querySelector("h1");
        h1.innerText = clock.getTime();
    },
    updateUserLocation(city, state) {
        const h2 = document.querySelector("h2");
        h2.innerText = `${city}, ${state}`;
    },
    updateTempData(temperature, temperatureUnit) {
        const temperatureHandler = document.querySelector("h3");
        temperatureHandler.innerHTML = `${temperature}&#176;${temperatureUnit}`;
    },
    updateWeatherIcon(updatedForecast) {
        const weatherIcon = document.querySelector(".weather-icon");
        weatherIcon.src = `public/weather/${updatedForecast}.png`;
    },
    clearMain() {
        const main = document.querySelector("#app");
        main.innerHTML = "";
    },
}

const retrieveCityAndStateAPI = (positionalData) => {
    const { latitude, longitude } = positionalData;
    const url = `https://api.weather.gov/points/${latitude},${longitude}`;
    console.log(url);
    return fetch(url)
    .then((response) => {
        if (!response.ok)
            throw new Error(`Status Code Error: ${response.status}`);
        return response.json();
    })
};

const retrieveWeatherAPI = (positionalData) => {
    const { latitude, longitude } = positionalData;
    const url = `https://api.weather.gov/points/${latitude},${longitude}/forecast/hourly`;
    return fetch(url)
    .then((response) => {
        if (!response.ok)
            throw new Error(`Status Code Error: ${response.status}`);
        return response.json()
    })
};

const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(position => resolve(position))
        } else {
            reject()
        }
    })
}

const updateCityAndState = cityAndStateData => {
    const { city, state } = cityAndStateData.properties.relativeLocation.properties;
    domHandler.updateUserLocation(city, state);
}

const updateTemperatureAndForecast = weatherData => {
    const { temperature, temperatureUnit, shortForecast } = weatherData.properties.periods[0];
    domHandler.updateTempData(temperature, temperatureUnit);
    const updatedForecast = getWeatherConditions(shortForecast);
    domHandler.updateWeatherIcon(updatedForecast);
}
    

getCurrentPosition()
    .then(position => {
        console.log(`Coordinates retrieved: ${position.coords.latitude},${position.coords.longitude}`);
        const positionCoords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        return positionCoords
    })
    .then(positionCoords => {
        return Promise.all([retrieveCityAndStateAPI(positionCoords), retrieveWeatherAPI(positionCoords)])
    })
    .then(values => {
        const [cityAndStateData, weatherData] = values;
        updateCityAndState(cityAndStateData);
        updateTemperatureAndForecast(weatherData);
    })
    .catch((error) => {
        console.log(error);
    });

domHandler.loadRandomBackground();
clock.initialize(domHandler.updateTime);

const newPage = () => {
    const loadPage = () => {
        domHandler.clearMain();
    }
    return { loadPage }
}
