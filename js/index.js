const clock = {
    getTime() {
        return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    },
    initialize() {
        domHandler.updateTime();
        const periodicallyUpdateTime = new Promise((resolve) => {
            setTimeout(() => {
                domHandler.updateTime();
                resolve();
            }, 60000);
        })
        .then(() => {
            this.initialize();
        });
    }
}

const getWeatherConditions = (shortForecast) => {
    const weatherConditions = ['sun', 'clear', 'partly cloudy', 'cloud', 'shower', 'storm', 'snow', 'fog'];
    let updatedCondition;

    shortForecast = shortForecast.toLowerCase();
    //Loop through weatherCondition file names to match current forecast
    for (let i = 0; i < weatherConditions.length; i++) {
        if (shortForecast.includes(weatherConditions[i])) {
            updatedCondition = weatherConditions[i];
            break;
        }
    }
        return updatedCondition;
}
    

const domHandler = {
    loadRandomBackground() {
        colors = ['#0099cc', '#ff8c8c', '#D9D92B', '#a5ed5e',
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
}

const retrieveUserLocation = () => {
    return new Promise((resolve, reject) => {
        if ('geolocation' in navigator) {
            resolve();
        } else {
            reject();
        }
    });
}

const retrieveWeatherAPI = (data) => {
    const {latitude, longitude} = data;
    const url1 = `https://api.weather.gov/points/${latitude},${longitude}`;
    const url2 = `https://api.weather.gov/points/${latitude},${longitude}/forecast/hourly`;
    console.log(url2);

    const getCityAndState = fetch(url1)
    .then((response) => {
        if (!response.ok)
            throw new Error(`Status Code Error: ${response.status}`);
        return response.json();
    })
    .then((data) => {
        const { city, state } = data.properties.relativeLocation.properties;
        domHandler.updateUserLocation(city,state);
        })

    const getWeatherData = fetch(url2)
    .then((response) => {
        if (!response.ok)
            throw new Error(`Status Code Error: ${response.status}`);
        return response.json()
    })
    .then((data) => {
        const { temperature, temperatureUnit, shortForecast } = data.properties.periods[0];
        domHandler.updateTempData(temperature, temperatureUnit);
        const updatedForecast = getWeatherConditions(shortForecast);
        domHandler.updateWeatherIcon(updatedForecast);
    })
    .catch((err) => {
        console.log('Error with Fetch')
        console.log(err);
    })
}

retrieveUserLocation()
    .then(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            console.log(`Coordinates retrieved: ${position.coords.latitude},${position.coords.longitude}`);

            const data = { latitude: position.coords.latitude, longitude: position.coords.longitude };
            retrieveWeatherAPI(data);
        });
    })
    .catch(() => {
        console.log('Failed to retrieve geolocation data.');
    });




domHandler.loadRandomBackground();
clock.initialize();

