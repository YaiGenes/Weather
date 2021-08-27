validateCity();
getCities();
document.querySelector("#search").addEventListener("click", searchCity);

function getCities() {
    fetch("https://www.el-tiempo.net/api/json/v2/municipios", {
            method: "GET",
        })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            document.querySelector("#introduction span").textContent = data.length;
            printCityList(data);
        })

    .catch((err) => {
        console.error(err);
    });
}

function searchCity() {
    let options = document.querySelectorAll("#datalistOptions option");
    let cityName = document.querySelector("#exampleDataList").value;

    let canvasMaxTemp = [];
    let canvasMinTemp = [];

    document.querySelectorAll("[date]").innerHTML = "";
    document.querySelectorAll("[sky]").innerHTML = "";

    options.forEach((option) => {
        if (cityName == option.textContent) {
            let codProv = option.dataset.prov;
            let codCity = option.dataset.city;
            fetch(
                    `https://www.el-tiempo.net/api/json/v2/provincias/${codProv}/municipios/${codCity}`, {
                        method: "GET",
                    }
                )
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    //-CityName

                    printCityInfo(data);

                    //-WEATHER
                    let days = document.querySelectorAll("[daynumber]");
                    let sky = document.querySelectorAll("[sky]");
                    let windDiv = document.querySelectorAll("[wind]");
                    let temps = document.querySelectorAll("[temp]");
                    let sens = document.querySelectorAll("[sens]");
                    let humidities = document.querySelectorAll("[humidity]");
                    let rains = document.querySelectorAll("[rain]");

                    for (let i = 0; i < days.length; i++) {
                        // For today (i=0), the API access to the weather data have a different path
                        if (i === 0) {
                            document.querySelectorAll("[dayname]")[0].innerHTML = "Today";
                            //-Date
                            let dateToSplit0 = data.fecha;
                            printDate(dateToSplit0, days[i]);

                            //-Sky(Wind+SkyStatus)
                            let stateSky = data.stateSky.id;
                            getSky(sky, stateSky, i);

                            //-Wind
                            let wind = data.pronostico.hoy.viento[0].direccion;

                            getWind(windDiv, wind, i);

                            //-Temp
                            let tempMax = data.temperaturas.max;
                            canvasMaxTemp.push(parseInt(tempMax));
                            let tempMin = data.temperaturas.min;
                            canvasMinTemp.push(parseInt(tempMin));

                            getTemperature(temps, tempMin, tempMax, i);

                            //-Sens
                            let allSens = data.pronostico.hoy.sens_termica;

                            getSensationAverage(sens, allSens, i);

                            //-Humidity
                            let allHum = data.pronostico.hoy.humedad_relativa;
                            getHumidityAverage(humidities, allHum, i);

                            //-Rain
                            let allrain = data.pronostico.hoy.prob_precipitacion;
                            getRain(rains, allrain, i);
                        } else {
                            //-Date
                            let apiDays = data.proximos_dias[i - 1]["@attributes"].fecha;
                            printDate(apiDays, days[i]);
                            printDayName(apiDays, i);

                            //-Sky
                            if (typeof data.proximos_dias[i - 1].estado_cielo !== "string") {
                                let stateSky = data.proximos_dias[i - 1].estado_cielo[0];
                                getSky(sky, stateSky, i);
                            } else {
                                let stateSky = data.proximos_dias[i - 1].estado_cielo;
                                getSky(sky, stateSky, i);
                            }

                            //-Wind and Rain

                            // Api has different route for Wind and Rain after 5th day
                            if (i < 4) {
                                let wind = data.proximos_dias[i - 1].viento[0].direccion;
                                getWind(windDiv, wind, i);
                                let allrain = data.proximos_dias[i - 1].prob_precipitacion;
                                getRain(rains, allrain, i);
                            } else {
                                let wind = data.proximos_dias[i - 1].viento.direccion;
                                getWind(windDiv, wind, i);
                                let allRain = data.proximos_dias[i - 1].prob_precipitacion;

                                rains[i].innerHTML = `<b>Rain:</b> ${allRain}%`;
                            }

                            //-Temp
                            let tempMax = data.proximos_dias[i - 1].temperatura.maxima;
                            let tempMin = data.proximos_dias[i - 1].temperatura.minima;
                            getTemperature(temps, tempMin, tempMax, i);
                            canvasMaxTemp.push(parseInt(tempMax));
                            canvasMinTemp.push(parseInt(tempMin));

                            //-Sens
                            let sensMax = data.proximos_dias[i - 1].sens_termica.maxima;
                            let sensMin = data.proximos_dias[i - 1].sens_termica.minima;
                            sens[
                                i
                            ].innerHTML = `<b>T.Sensation:</b> <span style="color: blue">${sensMin}ºC</span> - <span style="color: red">${sensMax}ºC</span>`;

                            //-Humidity
                            let humMax = data.proximos_dias[i - 1].humedad_relativa.maxima;
                            let humMin = data.proximos_dias[i - 1].humedad_relativa.minima;
                            if (humMax != humMin) {
                                humidities[
                                    i
                                ].innerHTML = `<b>Humidity:</b> ${humMin}% - ${humMax}%`;
                            } else {
                                humidities[i].innerHTML = `<b>Humidity:</b> ${humMin}%`;
                            }
                        }
                    }
                    charts(canvasMaxTemp, canvasMinTemp);
                });
        }
    });
}

function printDayName(days, i) {
    // Use array to link getDay() to the name of the day

    const weekday = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    let newDate = new Date(days);
    let dayNames = document.querySelectorAll("[dayname]");
    dayNames[i].textContent = weekday[newDate.getDay()];
}

function printDate(dateToSplit, day) {
    let date = dateToSplit.split("-");
    let newDate = date[2] + "/" + date[1];
    day.innerHTML = newDate;
}

function printCityInfo(apiData) {
    let cityName = document.querySelector("#cityName");
    let city = apiData.municipio.NOMBRE;
    cityName.innerHTML = city;

    let provinceName = document.querySelector("#provinceName");
    let province = apiData.municipio.NOMBRE_PROVINCIA;
    provinceName.innerHTML = `Province: ${province}`;

    let populationSelector = document.querySelector("#population");
    let population = apiData.municipio.POBLACION_MUNI;
    populationSelector.innerHTML = `Population: ${population} inhabitants`;

    let heightSelector = document.querySelector("#height");
    let height = apiData.municipio.ALTITUD;
    heightSelector.innerHTML = `Height: ${height}m`;
    console.log();
}

function printCityList(apiData) {
    apiData.forEach((element) => {
        let INE = element.CODIGOINE;

        let dataCity = INE.slice(0, 5);
        document
            .querySelector("#datalistOptions")
            .insertAdjacentHTML(
                "beforeend",
                `<option data-prov=${element.CODPROV} data-city=${dataCity}>${element.NOMBRE}</option>`
            );
    });
}

function getSky(skySelector, stateSky, i) {
    if (skySelector[i].children.length == 0) {
        skySelector[i].insertAdjacentHTML(
            "beforeend",
            `<img sky-${i} src="assets/icons/sky/${stateSky}.png">`
        );
    } else {
        document.querySelector(
            `[sky-${i}]`
        ).src = `assets/icons/sky/${stateSky}.png`;
    }
}

function getWind(windSelector, wind, i) {
    if (windSelector[i].children.length == 0) {
        windSelector[i].insertAdjacentHTML(
            "beforeend",
            `<img wind-${i} src="assets/icons/wind/${wind}.png"><p p-wind-${i}>${wind}</p>`
        );
    } else {
        document.querySelector(`[wind-${0}]`).src = `assets/icons/wind/${wind}.png`;
        document.querySelector(`[p-wind-${0}]`).textContent = wind;
    }
}

function getTemperature(tempSelector, tempMin, tempMax, i) {
    tempSelector[
        i
    ].innerHTML = `<b>Temperature:</b> <span style="color: blue">${tempMin}ºC</span> - <span style="color: red">${tempMax}ºC</span>`;
}

function getSensationAverage(sensSelector, allSens, i) {
    let intSens = [];
    allSens.forEach((element) => {
        intSens.push(parseInt(element));
    });
    sensSelector[
        i
    ].innerHTML = `<b>T.Sensation:</b> <span style="color: blue">${Math.min(
    ...intSens
  )}ºC</span> - <span style="color: red">${Math.max(...intSens)}ºC</span>`;
}

function getHumidityAverage(humiditySelector, humidity, i) {
    let intHum = [];
    humidity.forEach((element) => {
        intHum.push(parseInt(element));
    });
    let humMax = Math.max(...intHum);
    let humMin = Math.min(...intHum);

    if (humMin != humMax) {
        humiditySelector[i].innerHTML = `<b>Humidity:</b> ${humMin}% - ${humMax}%`;
    } else {
        humiditySelector[i].innerHTML = `<b>Humidity:</b> ${humMin}%`;
    }
}

function getRain(rainSelector, rain, i) {
    let intrain = [];
    rain.forEach((element) => {
        intrain.push(parseInt(element));
    });
    let rainMax = Math.max(...intrain);
    let rainMin = Math.min(...intrain);

    if (rainMax != rainMin) {
        rainSelector[i].innerHTML = `<b>Rain:</b> ${rainMin}% - ${rainMax}%`;
    } else {
        rainSelector[i].innerHTML = `<b>Rain:</b> ${rainMin}%`;
    }
}

function validateCity() {
    let btn = document.querySelector("#search");
    btn.disabled = true;

    let searchBox = document.querySelector("#exampleDataList");
    searchBox.addEventListener("input", () => {
        btn.disabled = true;

        let options = document.querySelectorAll("option");
        options.forEach((element) => {
            if (element.textContent == searchBox.value) {
                btn.disabled = false;
            }
        });
    });
}

function charts(canvasMaxTemp, canvasMinTemp) {
    let objTemp = { canvasMaxTemp, canvasMinTemp };
    console.log(objTemp);
    var ctx = document.getElementById("chart").getContext("2d");
    let days = document.querySelectorAll("[dayname]");
    let xs = [];
    days.forEach((day) => {
        xs.push(day.textContent);
    });
    console.log(xs);
    var myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: xs,
            datasets: [{
                label: ["Max temperature ªC", "Min temperature ªC"],
                data: objTemp,
                backgroundColor: [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(255, 159, 64, 0.2)",
                ],
                borderColor: ["rgba(255, 99, 132, 1)", "rgba(255, 159, 64, 1)"],
                borderWidth: 1,
            }, ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                },
            },
        },
    });
}