var apiKey = "de107e5570d600069ddff98bb569bca2";
var city = "toronto";
var queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey;



fetch(queryURL)

//on page load display last searched city
$(document).ready(function() {
    generateHistory();
    let lastSearched = JSON.parse(localStorage.getItem("inputCity"));
    if (lastSearched.length > 0) {
        // if localStorage has saved data, load most recent search
        let lastCity = lastSearched[lastSearched.length - 1];
        //display last searched city's weather onload
        createQuery(lastCity);
    }

    // Manipulate city input and react on click
    $("#search-btn").on("click ", function(event) {
        event.preventDefault();
        var inputCity = $("#input-city").val();
        // get list of cities from localStorage, create empty array if data does not exist
        let cityArray = JSON.parse(localStorage.getItem("inputCity")) || [];
        // add inputCity to history list
        cityArray.push(inputCity);
        // save updated list of cities to localStorage
        localStorage.setItem("inputCity", JSON.stringify(cityArray));
        console.log(cityArray);
        generateHistory();
    });

    //function to create history
    function generateHistory() {
        // get history from localStorage
        let cityHistory = JSON.parse(localStorage.getItem("inputCity"));
        //if search history doesn't exist, then create .searchHistoryContainer
        if (!$(".searchHistoryContainer").length && cityHistory.length) {
            $("#history").append('<div class="searchHistoryContainer"></div>');
        }
        //clear history
        $(".searchHistoryContainer").html("");
        //for loop to generate history
        for (let cityCounter = 0; cityCounter < cityHistory.length; cityCounter++) {
            let city = cityHistory[cityCounter];
            $(".searchHistoryContainer").append(
                `<button id="CityBtn${cityCounter}">${city}</button>`
            );
            // display information by clicking on city from history
            $(".searchHistoryContainer").on("click", `#CityBtn${cityCounter}`, function() {
                createQuery(city);
                localStorage.setItem("city", JSON.stringify(city));
            });
        }
    };

    //create queryURL function - the Value of inputCity, could be the city history, could be the search input. depends on which clicked
    function createQuery(city) {
        let inputCity = city ? city : $("#citySearch").val();

        //query1URL is Current Weather Data API + the city searched (inputCity) from the input field
        console.log("City passed from city history clicked: " + city);
        let query1URL =
            "https://api.openweathermap.org/data/2.5/weather?q=" +
            inputCity +
            "&units=imperial&appid=apiKey";

        //first AJAX call to Current Weather Data API, to obtain the city name (data)
        //query2URL variable is One Call API + lat and long from Current Weather Data API
        $.ajax({
            url: query1URL,
            method: "GET",
        }).then(function(data) {
            console.log("I am current data: ");
            console.log(data);
            let query2URL =
                "https://api.openweathermap.org/data/2.5/onecall?lat=" +
                data.coord.lat +
                "&lon=" +
                data.coord.lon +
                "&units=imperial&appid=apiKey";

            //second AJAX call to One Call API, to obtain the extended forecast and UV index
            $.ajax({
                url: query2URL,
                method: "GET",
            }).then(function(uvExtendedData) {
                console.log("I am uv and extended data: ");
                console.log(uvExtendedData);

                //create weatherIcon variable to display the weather icon from One Call API - uvExtendedData.current.weather[0].icon
                //+ "https://openweathermap.org/img/wn/" (the URL for the Open Weather weather icon images)
                let weatherIcon = uvExtendedData.current.weather[0].icon;
                let iconURL =
                    "https://openweathermap.org/img/wn/" + weatherIcon + ".png";

                //create todaysForecastContainer (container with appended divs)
                $(".reportColumn").html("");

                $(".reportColumn").append(
                    '<div class="todaysForecastContainer"></div>'
                );
                //append divs to todaysForecastContainer to display current queried city name and weather icon, current date, humdity, wind speed and
                //uvi index from query1URL AJAX call
                $(".todaysForecastContainer").append(
                    `<h2 class="currentCity">${
            data.name
            //moment.unix() to format dt unix
          } <span class="currentCityDate">(${moment
            .unix(uvExtendedData?.current?.dt)
            .format(
              "M/DD/YYYY"
            )})</span> <img id="weatherIcon" src="${iconURL}"/></h2>`
                );

                $(".todaysForecastContainer").append(
                    `<p class="currentCityTemp">Temperature: ${
            uvExtendedData.current.temp + " &deg;F"
          }</p>`
                );

                $(".todaysForecastContainer").append(
                    `<p class="currentCityHumidity">Humidity: ${
            uvExtendedData.current.humidity + "%"
          }</p>`
                );

                $(".todaysForecastContainer").append(
                    `<p class="currentCityWindSpeed">Wind Speed: ${
            uvExtendedData.current.wind_speed + " MPH"
          }</p>`
                );

                $(".todaysForecastContainer").append(
                    `<p>
          UV Index:
          <span class="${uivClassName(uvExtendedData.current.uvi)}"
            >${uvExtendedData.current.uvi}</span
          >
        </p>`
                );
                //append divs to multiForecastContainer y
                $(".reportColumn").append('<div class="multiForecastContainer"></div>');
                $(".multiForecastContainer").append("<h2>5-Day Forecast:</h2>");
                $(".multiForecastContainer").append(
                    '<div class="forecastCardsContainer"></div>'
                );
                //.map to display current queried city's 5 Day Forecast: date, weather icon, temperature and humidity
                uvExtendedData.daily.map((day, index) => {
                    if (index > 0 && index < 6) {
                        $(".forecastCardsContainer").append(
                            `
                <div class="forecastCard" id="{'card' + index}">
                  <h3>${moment.unix(day.dt).format("M/DD/YYYY")}</h3>
                  <div><img id="weatherIcon" src="https://openweathermap.org/img/wn/${
                    day.weather[0].icon
                  }.png"/></div>
                  <p>Temp: ${day.temp.day + " &deg;F"}</p>
                  <p>Humidity: ${day.humidity + "%"}</p>
                </div>
              `
                        );
                    }
                });
            });
        });
    }
    //function with if statements to return uv classes' CSS for today's date
    function uivClassName(uvi) {
        if (uvi < 4) {
            return "uv-favorable";
        } else if (uvi >= 4 && uvi <= 10) {
            return "uv-moderate";
        } else if (uvi > 11) {
            return "uv-extreme";
        } else {
            return "uv-undefined";
        }
    }
});