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
        `https://www.el-tiempo.net/api/json/v2/provincias/${codProv}/municipios/${codCity}`,
        {
          method: "GET",
        }
      )
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log(data);
        });
    }
  });
}
