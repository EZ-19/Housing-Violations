/* eslint-disable max-len */

/*
  Hook this script to index.html
  by adding `<script src="script.js">` just before your closing `</body>` tag
*/

/*
  ## Utility Functions
    Under this comment place any utility functions you need - like an inclusive random number selector
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
*/

function getRandomIntInclusive(min, max) {
    const newMin = Math.ceil(min);
    const newMax = Math.floor(max);
    return Math.floor(Math.random() * (newMax - newMin + 1) + newMin); // The maximum is inclusive and the minimum is inclusive
  }
  
  function injectHTML(list) {
    console.log('fired injectHTML');
    const target = document.querySelector('#resturant_list');
    target.innerHTML = '';
  
    const listEl = document.createElement('ol');
    target.appendChild(listEl);
  
    list.forEach((item) => {
      const el = document.createElement('li');
      el.innerText = item.street_address;
      listEl.appendChild(el);
    });
  }
  
  function processRestaurants(list) {
    console.log('fired restaurants list');
    const range = [...Array(15).keys()]; // Special notation to create an array of 15 elements
    const newArray = range.map((item) => {
      const index = getRandomIntInclusive(0, list.length);
      return list[index];
    });
    return newArray;
    /*
        ## Process Data Separately From Injecting It
          This function should accept your 1,000 records
          then select 15 random records
          and return an object containing only the restaurant's name, category, and geocoded location
          So we can inject them using the HTML injection function
  
          You can find the column names by carefully looking at your single returned record
          https://data.princegeorgescountymd.gov/Health/Food-Inspection/umjn-t2iz
  
        ## What to do in this function:
  
        - Create an array of 15 empty elements (there are a lot of fun ways to do this, and also very basic ways)
        - using a .map function on that range,
        - Make a list of 15 random restaurants from your list of 100 from your data request
        - Return only their name, category, and location
        - Return the new list of 15 restaurants so we can work on it separately in the HTML injector
      */
  }
  
  function filterList(array, filterInputValue) {
    const newArray = array.filter((item) => {
      const lowerCaseName = item.street_address.toLowerCase();
      const lowerCaseQuery = filterInputValue.toLowerCase();
      return lowerCaseName.includes(lowerCaseQuery);
    });
    return newArray;
  }
  
  function initMap() {
    console.log('init map');
    const map = L.map('map').setView([38.9897, -76.9378], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    return map;
  }
  
  function markerPlace(array, map) {
    console.log('markerPlace', array);
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        layer.remove();
      }
    });
  
    array.forEach((item, index) => {
      const {coordinates} = item.geocoded_column_1;
      L.marker([coordinates[1], coordinates[0]]).addTo(map);
      if (index === 0) {
        map.setView([coordinates[1], coordinates[0]], 10);
      }
    });
  }
  
  function initChart(chart, object) {
    const labels = Object.keys(object);
    const info = Object.keys(object).map((item) => object[item].length);
  
    const data = {
      labels: labels,
      datasets: [{
        label: 'Housing Violation Cases by City',
        backgroundColor: ['rgb(255, 99, 132)',
                          'rgb(54, 162, 235)',
                          'rgb(155, 19, 112)',
                          'rgb(34, 162, 115)',
                          'rgb(155, 69, 132)',
                          'rgb(204, 2, 55)',
                          'rgb(65, 100, 62)',
                          'rgb(74, 72, 73)',
                          'rgb(115, 2, 123)',
                          'rgb(34, 62, 235)',
                          'rgb(55, 110, 3)'],
        bordercolor: 'rgb(255, 99, 132)',
        data: info
      }]
    };
  
    const config = {
      type: 'pie',
      data: data,
      options: {}
    };
  
    return new Chart(
      chart,
      config
    );
  }
  
  function changeChart(chart, dataObject) {
    const labels = Object.keys(dataObject);
    const info = Object.keys(dataObject).map((item) => dataObject[item].length);
  
    chart.data.labels = labels;
    chart.data.datasets.forEach((set) => {
      set.data = info;
      return set;
    });
  
    chart.update();
  }
  
  function shapeDataForLineChart(array) {
    return array.reduce((collection, item) => {
      if (!collection[item.city]) {
        collection[item.city] = [item];
      } else {
        collection[item.city].push(item);
      }
      return collection;
    }, {});
  }
  
  async function getData() {
    const url = 'https://data.montgomerycountymd.gov/resource/k9nj-z35d.json'; // remote URL! you can test it in your browser
    const data = await fetch(url); // We're using a library that mimics a browser 'fetch' for simplicity
    const json = await data.json(); // the data isn't json until we access it using dot notation
    const reply = json.filter((item) => Boolean(item.city)).filter((item) => Boolean(item.street_address));
    console.log(reply);
    return reply;
  }
  
  async function mainEvent() {
    // const pageMap = initMap();
  
    // the async keyword means we can make API requests
    const form = document.querySelector('.main_form'); // get your main form so you can do JS with it
    const submit = document.querySelector('#get-resto'); // get a reference to your submit button
    const loadAnimation = document.querySelector('.lds-ellipsis');
    const chartTarget = document.querySelector('#myChart');
    submit.style.display = 'none'; // let your submit button disappear
  
    /*
        Let's get some data from the API - it will take a second or two to load
        This next line goes to the request for 'GET' in the file at /server/routes/foodServiceRoutes.js
        It's at about line 27 - go have a look and see what we're retrieving and sending back.
       */
    // const results = await fetch('/api/foodServicePG');
    // const arrayFromJson = await results.json(); // here is where we get the data from our request as JSON
  
    // API Data Request
    const chartData = await getData();
    console.log("Chart DATA");
    console.log(chartData);
    const shapedData = shapeDataForLineChart(chartData);
    console.log(shapedData);
    const myChart = initChart(chartTarget, shapedData);
  
    // console.log(arrayFromJson.data[0]);
  
    // this is called "string interpolation" and is how we build large text blocks with variables
    // console.log(`${arrayFromJson.data[0].name} ${arrayFromJson.data[0].category}`);
  
    // This IF statement ensures we can't do anything if we don't have information yet
    // if (!arrayFromJson.data?.length) { return; } // Return if we have no data
  
    let currentList = [];
  
    // let's turn the submit button back on by setting it to display as a block when we have data available
    submit.style.display = 'block';
  
    // Hidding the load button
    loadAnimation.classList.remove('lds-ellipsis');
    loadAnimation.classList.add('lds-ellipsis_hidden');
  
    form.addEventListener('input', (event) => {
      console.log('input', event.target.value);
      const newFilterList = filterList(currentList, event.target.value);
      injectHTML(newFilterList);
      const localData = shapeDataForLineChart(newFilterList);
      changeChart(myChart, localData);
      console.log(localData);
      // markerPlace(newFilterList, pageMap);
    });
  
    // And here's an eventListener! It's listening for a "submit" button specifically being clicked
    // this is a synchronous event event, because we already did our async request above, and waited for it to resolve
    form.addEventListener('submit', (submitEvent) => {
      // This is needed to stop our page from changing to a new URL even though it heard a GET request
      submitEvent.preventDefault();
  
      // This constant will have the value of your 15-restaurant collection when it processes
      currentList = processRestaurants(chartData);
      console.log(currentList);
  
      // And this function call will perform the "side effect" of injecting the HTML list for you
      injectHTML(currentList);
      const localData = shapeDataForLineChart(currentList);
      changeChart(myChart, localData);
      console.log(localData);
      // markerPlace(currentList, pageMap);
      // By separating the functions, we open the possibility of regenerating the list
      // without having to retrieve fresh data every time
      // We also have access to some form values, so we could filter the list based on name
    });
  }
  
  /*
      This last line actually runs first!
      It's calling the 'mainEvent' function at line 57
      It runs first because the listener is set to when your HTML content has loaded
    */
  document.addEventListener('DOMContentLoaded', async () => mainEvent()); // the async keyword means we can make API requests
  