// This function makes sure thic code starts when the page is loaded
$( document ).ready(async function() {

      // Default year to display
      changeYear(2021);

      // Once the year is changed in the drop down menu, change the graph
      $('#year-select').on('change', function() {
            changeYear($( "#year-select option:selected" ).text());
      });

});

// This function changes the year of the data display on it
async function changeYear(year){
  // Generating variables & using am4 library for Chord Diagram
  var counter = 0;
  var raw_data = [];
  var regions_in_data = [];
  var complete_data_to_plot = [];
  var chart = am4core.create("chartdiv", am4charts.ChordDiagram);
  chart.data = [];

  // Fetching the year data from Python backend
  await fetch("/get_data?year=" + year).then((response) => response.json()).then(async function(response) {

      // For each item in the list returned, we categorise certain items (e.g Italian, Italy into one category)
      // to ensure data can be visible on the diagram then we add it to new array raw_data
      for (var i = 0; i < response.length; i++) {
              response[i].region = checkNamings(response[i].region);
              response[i].cuisine = checkNamings(response[i].cuisine);
              raw_data.push(response[i]);
      }

      // Here we generate new array of "unique" regions
      for (var i = 0; i < raw_data.length; i++) {
            // if(raw_data[i].region == "Singapore"){
            //   console.log(raw_data[i])
            //   console.log(regions_in_data.indexOf(raw_data[i].region))
            // }


            if(regions_in_data.indexOf(raw_data[i].region) == -1){
                    regions_in_data.push(raw_data[i].region);
            }
      }

      // For each unique region...
      for (var x = 0; x < regions_in_data.length; x++) {
            // ... get all the items that have that region...
            var current_region_data_raw = raw_data.filter(item => item.region === regions_in_data[x]);

            // ... and all collect all the cuisines they have from that region into "current_region_data" dictionary
            var current_region_data = {};
            for (var xx = 0; xx < current_region_data_raw.length; xx++) {
                  if(current_region_data[current_region_data_raw[xx].cuisine]){
                    current_region_data[current_region_data_raw[xx].cuisine] = current_region_data[current_region_data_raw[xx].cuisine] + 1;
                  }else{
                    current_region_data[current_region_data_raw[xx].cuisine] = 1;
                  }
            }
            // Lastly add that dictionary to the array that will be then used to plot the graph
            complete_data_to_plot.push({region: regions_in_data[x], data: current_region_data});
      }

  });

  // Once we fetched all the data and we have in the format that we want it, we add the data to the chart data array
  for (var i = 0; i < complete_data_to_plot.length; i++) {
      for (let value in complete_data_to_plot[i].data) {
          chart.data.push({"from": complete_data_to_plot[i].region, "to": value, "value": parseInt(complete_data_to_plot[i].data[value])});
      }
  }

  // These lines set the rest of the graph properties
  chart.data = chart.data.slice(0, 2000);
  chart.dataFields.fromName = "from";
  chart.dataFields.toName = "to";
  chart.dataFields.value = "value";

  // Removes the watermark
  $('g[style="cursor: pointer;"]').remove();

}

// This function ensures that we have categorise different names into groups
function checkNamings(name) {
  if(name.includes("rrebr") || name.includes("Norwegan") || name == "Finnish" || name == "Finland" || name == "Norway" || name == "Sweden" || name == "Denmark" || name == "Danish" || name.includes("danish") || name.includes("Danish")){
    return "Scandinavian";
  }else if(name.includes("Corsican") || name.includes("Proven") || name.includes("Savoyard") || name == "Classic French" || name == "Classic French, Creative" || name == "Modern French, Creative" || name == "French Contemporary" || name == "French" || name.includes("French") || name.includes("french")){
    return "France";
  }else if(name.includes("Cantonese")){
    return "Cantonese";
  }else if(name == "Classic cuisine"){
    return "Classic";
  }else if(name.includes("Contemporary") || name.includes("Modern") || name.includes("modern") || name.split(" ")[0] == "Contemporary" || name.split(",")[0] == "Contemporary" || name.split(" ")[0] == "Modern" || name.split(",")[0] == "Modern" || name == "Contemporary" || name == "Modern Cuisine, Contemporary" || name == "Modern Cuisine" || name == "Modern Cuisine, Contemporary" || name == "modern" || name == "Modern cuisine"){
    return "Modern";
  }else if(name == "Korean" || name.includes("Korean") || name.includes("korean")){
    return "South Korea";
  }else if(name.includes("Creative") || name.split(" ")[0] == "Creative" || name.split(",")[0] == "Creative" || name == "Modern Cuisine, Creative" || name == "Creative, Modern Cuisine" || name == "Creative, Innovative" || name == "creative"){
    return "Creative";
  }else if(name == "Asian contemporary" || name == "Noodles and congee"){
    return "Asian";
  }else if(name.includes("fish") || name.includes("Crab") || name == "Creative, Seafood" || name.split(" ")[0] == "Seafood" || name.split(",")[0] == "Seafood" || name.includes("Freshwater")){
    return "Seafood";
  }else if(name == "Mediterranean cuisine"){
    return "Mediterranean";
  }else if(name == "French contemporary" || name == "Creative French" || name == "Modern French"){
    return "France";
  }else if(name.includes("Kalguksu") || name.includes("Jokbal") || name.includes("Naeng") || name.includes("Dwaeji") || name == "Korean contemporary"){
    return "South Korea";
  }else if(name.includes("Taipei") || name == "Taiwanese"){
    return "Taiwan";
  }else if(name.includes("Dogani") || name.includes("Gejang") || name.includes("Gomtang") || name.includes("Macanese") || name.includes("Tonkatsu") || name.includes("Shojin") || name.includes("Shandong") || name.includes("Dongbei") || name.includes("Congee") || name.includes("Burme") || name.includes("Lebanese") || name.includes("Dumplings") || name.includes("Hotpot") || name.includes("Noodl") || name.includes("Rice") || name.includes("Sri Lankan") || name.includes("Middle Eastern") || name.includes("Afghan") || name.includes("Turk") || name.includes("Vietnam") || name.includes("Tibetan") || name.includes("Malaysian") || name == "Asian influences" || name == "Peranakan" || name == "Fujian" || name == "Temple cuisine" || name.includes("Asian")){
    return "Asian";
  }else if(name.includes("United States") || name.includes("California") || name.includes("American") || name == "Washington DC" || name == "American" || name == "Californian" || name == "Chicago" || name == "California" || name == "New York City" ){
    return "America";
  }else if(name.includes("Singapo") ){
    return "Singapore";
  }else if(name.includes("Breton") || name == "Traditional British"){
    return "United Kingdom";
  }else if(name.includes("Yaki") || name.includes("Izakaya") || name.includes("Chankon") || name.includes("Okono") || name.includes("Onigiri") || name.includes("Kushiage") || name.includes("Obanzai") || name.includes("Oden") || name.includes("Tempura") || name.includes("Sukiyaki") || name.includes("Soba") || name == "Sushi" || name == "Japanese" || name == "Teppanyaki" || name == "Japanese contemporary" || name == "Ramen" || name.includes("Japanese")){
    return "Japan";
  }else if(name.includes("Huai") ||  name.includes("Hakk") || name.includes("Yunn") || name.includes("Sich") || name.includes("Hunan") || name.includes("Yoshoku") || name.includes("Udon") || name.includes("Eel") || name.includes("Memil") || name.includes("Chue") || name.includes("Yuk") || name.includes("Seo") || name.includes("Teochew") || name.includes("Ningbo") || name.includes("Dubu") || name.includes("Mandu") || name.includes("Bulgogi") || name.includes("Sujebi") || name.includes("Hubei") || name.includes("Chao") || name.includes("Dpmgbei") || name.includes("Deli") || name.includes("Lao") || name.includes("Hong") || name.includes("Zhe") || name.includes("Xi") || name.includes("Chiu Chow") || name.includes("Shun Tak") || name.includes("Chinese") || name == "Sichuan-Huai Yang" || name == "Hang Zhou" || name == "Dim Sum" || name == "China Mainland" || name == "Sichuan" || name == "Macau" || name == "Taizhou" || name.includes("Shanghai") || name == "Hunanese and Sichuan"){
    return "Chinese";
  }else if(name.includes("International") || name.includes("Fusion") || name == "International"){
    return "Fusion";
  }else if(name == "Modern British"){
    return "United Kingdom";
  }else if(name == "Creative British"){
    return "United Kingdom";
  }else if(name.includes("Piedmontese") || name.includes("Tuscan") || name.includes("Pizza") || name == "Italian contemporary" || name == "Italian" || name.includes("Italian") || name.includes("Italy")){
    return "Italy";
  }else if(name.includes("Serbia") || name.includes("Iceland") || name.includes("San Marino") || name.includes("Andorra") || name.includes("Malta") || name.includes("Irish") || name.includes("Slov") || name.includes("Luxemb") | name.includes("Belgi") || name.includes("Switzerland") || name.includes("Swiss") || name.includes("Netherland") || name.includes("Germ") || name.includes("Portug") || name.includes("Hungarian") || name.includes("Swedish") || name.includes("Czech") || name.includes("Croatian") || name.includes("Greek") || name.includes("European") || name.includes("Polish") || name == "Ireland" || name == "European contemporary" || name == "Europe" || name == "Croatia" || name == "Hungary" || name == "Poland" || name == "Czech Republic"){
    return "European";
  }else if(name.includes("Isan") || name.includes("Thai") || name == "Thai Contemporary" || name == "Thai" || name == "Southern Thai"){
    return "Thailand";
  }else if(name == "Rio de Janeiro" || name == "Sao Paulo"){
      return "Brazil";
  }else if(name == "Austrian"){
      return "Austria";
  }else if(name.includes("Traditional")){
      return "Traditional";
  }else if(name.includes("Gastropub")){
      return "Gastropub";
  }else if(name.includes("Curry") || name.includes("India")){
      return "Indian";
  }else if(name.includes("Regional")){
      return "Regional";
  }else if(name.includes("Mexican") || name.includes("Peru") || name.includes("Colombia")){
      return "Latin America";
  }else if(name.includes("Vegan") || name.includes("Organic")){
      return "Vegan";
  }else if(name == "Market cuisine"){
      return "Street Food";
  }else if(name == "Meats and grills" || name.includes("grills") || name.includes("Grills")){
      return "Barbecue";
  }else if(name.split(" ")[0] == "Vegetarian" || name.split(",")[0] == "Vegetarian"){
      return "Vegetarian";
  }else if(name.includes("Creole") || name.includes("Sharing") || name.includes("Small") || name.includes("ian") || name.includes("Home") || name.includes("Beef") || name.includes("South") || name.includes("Cuisine") || name.includes("Country")){
      return "Other";
  }else if(name.includes("Basque") || name.includes("Catal") || name.includes("Spain") || name.includes("Moroccan") || name == "Spanish" || name == "Greece" || name.includes("Spanish") || name.includes("Chicken")){
      return "Mediterranean";
  }else{
    return name;
  }

}
