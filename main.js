function getCities() {
    fetch("https://www.el-tiempo.net/api/json/v2/municipios", {
            method: "GET",
        })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            data.forEach((element) => {
                let INE = element.CODIGOINE;

                let dataCity = INE.slice(0, 5);
                document
                    .querySelector("#datalistOptions")
                    .insertAdjacentHTML(
                        "beforeend",
                        `<option data-prov=${element.CODPROV} data-city=${dataCity}>${element.NOMBRE}</option>`
                    );
            });
        })

    .catch((err) => {
        console.error(err);
    });
}
getCities();

document.querySelector("#search").addEventListener("click", searchCity);

function searchCity() {
    let options = document.querySelectorAll("#datalistOptions option");
    let cityName = document.querySelector("#exampleDataList").value;

    options.forEach((option) => {
        if (cityName == option.textContent) {
            let codProv = option.dataset.prov;
            let codCity = option.dataset.city;
            console.log(codProv, codCity);
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
                    let cityName = document.querySelector("#cityName");
                    let provinceName = document.querySelector("#provinceName");
                    let province = data.municipio.NOMBRE_PROVINCIA;
                    let city = data.municipio.NOMBRE;
                    cityName.innerHTML = city;
                    provinceName.innerHTML = province;

                    //-WEATHER

                    let days = document.querySelectorAll("[date]");
                    let sky = document.querySelectorAll("[sky]");
                    let windDiv = document.querySelectorAll("[wind]");

                    for (let i = 0; i < days.length; i++) {
                        if (i === 0) {
                            //-Date
                            let dateToSplit0 = data.fecha;
                            splitDate(dateToSplit0, days[i]);

                            //-Sky(Wind+SkyStatus)
                            let stateSky = data.stateSky.id;
                            sky[i].insertAdjacentHTML(
                                "beforeend",
                                `<img src="assets/icons/sky/${stateSky}.png">`
                            );
                            //-Wind
                            let wind = data.pronostico.hoy.viento[0].direccion;
                            windDiv[i].insertAdjacentHTML(
                                "beforeend",
                                `<img src="assets/icons/wind/${wind}.png"><p>${wind}</p>`
                            );
                            console.log(wind);
                        } else {
                            //-Date
                            splitDate(
                                data.proximos_dias[i - 1]["@attributes"].fecha,
                                days[i]
                            );

                            //-Sky
                            if (typeof data.proximos_dias[i - 1].estado_cielo !== "string") {
                                let stateSky = data.proximos_dias[i - 1].estado_cielo[0];
                                sky[i].insertAdjacentHTML(
                                    "beforeend",
                                    `<img src="assets/icons/sky/${stateSky}.png">`
                                );
                            } else {
                                let stateSky = data.proximos_dias[i - 1].estado_cielo;
                                sky[i].insertAdjacentHTML(
                                    "beforeend",
                                    `<img src="assets/icons/sky/${stateSky}.png">`
                                );
                            }

                            //-Wind
                            if (i < 4) {
                                let wind = data.proximos_dias[i - 1].viento[0].direccion;
                                windDiv[i].insertAdjacentHTML(
                                    "beforeend",
                                    `<img src="assets/icons/wind/${wind}.png"><p>${wind}</p>`
                                );
                            } else {
                                let wind = data.proximos_dias[i - 1].viento.direccion;
                                windDiv[i].insertAdjacentHTML(
                                    "beforeend",
                                    `<img src="assets/icons/wind/${wind}.png"><p>${wind}</p>`
                                );
                            }
                        }
                    }
                });
        }
    });
}

function splitDate(dateToSplit, day) {
    let date = dateToSplit.split("-");
    let newDate = date[2] + "/" + date[1];
    day.innerHTML = newDate;
}