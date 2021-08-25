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

  document.querySelectorAll("[date]").innerHTML = "";
  document.querySelectorAll("[sky]").innerHTML = "";
  /*
  document.querySelectorAll("[wind]").innerHTML = "";
  document.querySelectorAll("[temp]").innerHTML = "";
  */

  options.forEach((option) => {
    if (cityName == option.textContent) {
      let codProv = option.dataset.prov;
      let codCity = option.dataset.city;
      console.log(codProv, codCity);
      fetch(
        `https://www.el-tiempo.net/api/json/v2/provincias/${codProv}/municipios/${codCity}`,
        {
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
          let temps = document.querySelectorAll("[temp]");
          for (let i = 0; i < days.length; i++) {
            if (i === 0) {
              //-Date
              let dateToSplit0 = data.fecha;
              splitDate(dateToSplit0, days[i]);

              //-Sky(Wind+SkyStatus)
              let stateSky = data.stateSky.id;

              if (sky[i].children.length == 0) {
                sky[i].insertAdjacentHTML(
                  "beforeend",
                  `<img sky-${i} src="assets/icons/sky/${stateSky}.png">`
                );
              } else {
                document.querySelector(
                  `[sky-${i}]`
                ).src = `assets/icons/sky/${stateSky}.png`;
              }
              //-Wind
              let wind = data.pronostico.hoy.viento[0].direccion;

              if (windDiv[i].children.length == 0) {
                windDiv[i].insertAdjacentHTML(
                  "beforeend",
                  `<img wind-${i} src="assets/icons/wind/${wind}.png"><p p-wind-${i}>${wind}</p>`
                );
              } else {
                document.querySelector(
                  `[wind-${i}]`
                ).src = `assets/icons/wind/${wind}.png`;
                document.querySelector(`[p-wind-${i}]`).textContent = wind;
              }

              //-Temp
              let tempMax = data.temperaturas.max;
              let tempMin = data.temperaturas.min;
              temps[0].textContent = `Temperatura: ${tempMin}ºC - ${tempMax}ºC`;

              //-Sens
              let allSens = data.pronostico.hoy.sens_termica;
              let intSens = [];
              allSens.forEach((element) => {
                intSens.push(parseInt(element));
              });
              document.querySelector(
                "[sens]"
              ).textContent = `T.Sensation: ${Math.min(
                ...intSens
              )} - ${Math.max(...intSens)}`;

              //-Humidity
              let allHum = data.pronostico.hoy.humedad_relativa;
              let intHum = [];
              allHum.forEach((element) => {
                intHum.push(parseInt(element));
              });
              let humMax = Math.max(...intHum);
              let humMin = Math.min(...intHum);
              document.querySelectorAll(
                "[humidity]"
              )[0].textContent = `Humidity: ${humMin}% - ${humMax}%`;

              //-Rain
              let allrain = data.pronostico.hoy.prob_precipitacion;
              let intrain = [];
              allrain.forEach((element) => {
                intrain.push(parseInt(element));
              });
              let rainMax = Math.max(...intrain);
              let rainMin = Math.min(...intrain);
              document.querySelectorAll(
                "[rain]"
              )[0].textContent = `Rain: ${rainMin}% - ${rainMax}%`;
            } else {
              //-Date
              splitDate(
                data.proximos_dias[i - 1]["@attributes"].fecha,
                days[i]
              );

              //-Sky
              if (sky[i].children.length == 0) {
                if (
                  typeof data.proximos_dias[i - 1].estado_cielo !== "string"
                ) {
                  let stateSky = data.proximos_dias[i - 1].estado_cielo[0];
                  sky[i].insertAdjacentHTML(
                    "beforeend",
                    `<img sky-${i} src="assets/icons/sky/${stateSky}.png">`
                  );
                } else {
                  let stateSky = data.proximos_dias[i - 1].estado_cielo;
                  sky[i].insertAdjacentHTML(
                    "beforeend",
                    `<img sky-${i} src="assets/icons/sky/${stateSky}.png">`
                  );
                }
              } else {
                if (
                  typeof data.proximos_dias[i - 1].estado_cielo !== "string"
                ) {
                  let stateSky = data.proximos_dias[i - 1].estado_cielo[0];
                  document.querySelector(
                    `[sky-${i}]`
                  ).src = `assets/icons/sky/${stateSky}.png`;
                } else {
                  let stateSky = data.proximos_dias[i - 1].estado_cielo;
                  document.querySelector(
                    `[sky-${i}]`
                  ).src = `assets/icons/sky/${stateSky}.png`;
                }
              }

              //-Wind
              if (windDiv[i].children.length == 0) {
                if (i < 4) {
                  let wind = data.proximos_dias[i - 1].viento[0].direccion;
                  windDiv[i].insertAdjacentHTML(
                    "beforeend",
                    `<img wind-${i} src="assets/icons/wind/${wind}.png"><p p-wind-${i}>${wind}</p>`
                  );
                } else {
                  let wind = data.proximos_dias[i - 1].viento.direccion;
                  windDiv[i].insertAdjacentHTML(
                    "beforeend",
                    `<img wind-${i} src="assets/icons/wind/${wind}.png"><p p-wind-${i}>${wind}</p>`
                  );
                }
              } else {
                if (i < 4) {
                  let wind = data.proximos_dias[i - 1].viento[0].direccion;

                  document.querySelector(
                    `[wind-${i}]`
                  ).src = `assets/icons/wind/${wind}.png `;
                  document.querySelector(`[p-wind-${i}]`).textContent = wind;
                } else {
                  let wind = data.proximos_dias[i - 1].viento.direccion;
                  document.querySelector(
                    `[wind-${i}]`
                  ).src = `assets/icons/wind/${wind}.png `;
                  document.querySelector(`[p-wind-${i}]`).textContent = wind;
                }
              }
              //-Temp
              let tempMax = data.proximos_dias[i - 1].temperatura.maxima;
              let tempMin = data.proximos_dias[i - 1].temperatura.minima;
              temps[i].textContent = `Temperatura: ${tempMin}ºC - ${tempMax}ºC`;

              //-Sens
              let sensMax = data.proximos_dias[i - 1].sens_termica.maxima;
              let sensMin = data.proximos_dias[i - 1].sens_termica.minima;
              document.querySelectorAll("[sens]")[
                i
              ].textContent = `T.Sensation: ${sensMin}ºC - ${sensMax}ºC`;

              //-Humidity
              let humMax = data.proximos_dias[i - 1].humedad_relativa.maxima;
              let humMin = data.proximos_dias[i - 1].humedad_relativa.minima;
              document.querySelectorAll("[humidity]")[
                i
              ].textContent = `Humidity: ${humMin}% - ${humMax}%`;

              //-Rain
              if (i < 4) {
                let allrain = data.proximos_dias[i - 1].prob_precipitacion;
                let intrain = [];
                allrain.forEach((element) => {
                  intrain.push(parseInt(element));
                });
                let rainMax = Math.max(...intrain);
                let rainMin = Math.min(...intrain);
                document.querySelectorAll("[rain]")[
                  i
                ].textContent = `Rain: ${rainMin}% - ${rainMax}%`;
              } else {
                let allRain = data.proximos_dias[i - 1].prob_precipitacion;

                document.querySelectorAll("[rain]")[
                  i
                ].textContent = `Rain: ${allRain}%`;
              }
            }
          }
        });
    }
  });
}

// HOY - HUMEDAD RELATIVA MUCHOS DATOS, PROB PRECIPITACION VARIOS DATOS
// RESTO -   HUMEDAD MAX Y MIN                             ''

function splitDate(dateToSplit, day) {
  let date = dateToSplit.split("-");
  let newDate = date[2] + "/" + date[1];
  day.innerHTML = newDate;
}
