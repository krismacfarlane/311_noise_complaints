var zoom = 12;
var center = [40.658528, -73.952551]; //set center coordinates
var map = L.map('map').setView(center, zoom);

//http://leaflet-extras.github.io/leaflet-providers/preview/
var provider_name = "Acetate.all";

L.tileLayer.provider(provider_name).addTo(map);

map.attributionControl.setPrefix('311 Complaints via NYC OpenData');

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1;
var yyyy = today.getFullYear();

if(dd<10) {
  dd = '0' + dd
}

if(mm<10) {
  mm = '0' + mm
}

today = yyyy + '-' + mm + '-' + dd;

//data URL variables
var start_date = '2015-01-01'; //YYYY-MM-DD
var end_date = today; //YYYY-MM-DD
var borough = 'BRONX';
var c_type = 'Noise'; //complaint type

$( "#map_title" ).html( c_type + " 311 Service Requests from " + start_date + " to " + end_date + " in the Bronx");


//define marker icon using Leaflet Awesome
//(https://github.com/lvoogdt/Leaflet.awesome-markers)
var c_type_icon = L.AwesomeMarkers.icon({
  icon: 'headphones',
  prefix: 'fa',
  markerColor: 'darkpurple',
  iconColor: '#FFFFFF' //any hex color (e.g., "#FFFFFF")
});


//build the data URL
var URL = "http://data.cityofnewyork.us/resource/erm2-nwe9.json";
  URL += "?";
  URL += "$where=";
  URL += "(latitude IS NOT NULL)"; //only return records with coordinates
  URL += " AND ";
  URL += "(borough='" + borough + "')";
  URL += " AND ";
  URL += "(complaint_type='" + c_type + "')";
  URL += " AND ";
  URL += "(created_date>='" + start_date + "') AND (created_date<='" + end_date + "')";
  URL += "&$group=complaint_type,latitude,longitude";
  URL += "&$select=complaint_type,latitude,longitude,count(*)";

  URL = encodeURI(URL);


$.getJSON(URL, function (data) {

  var c_type_markers = []; //array to store c_type markers
  var all_markers = []; //array to store all markers

  $.each(data, function(index, rec){

    var popup_html = "<b>" + rec.complaint_type + "</b>";
      popup_html += "<br>";
      popup_html += rec.count + " complaint(s) at this location";

    var marker;


    marker = L.marker([rec.latitude, rec.longitude], { icon: c_type_icon }).bindPopup(popup_html);
    c_type_markers.push(marker); //add marker to array of c_type markers

    all_markers.push(marker); //add marker to array of all markers
  });


  var all_layer = L.featureGroup(all_markers);
  var c_type_layer = L.featureGroup(c_type_markers).addTo(map); //create layer of c_type markers and add to map


  map.fitBounds(all_layer.getBounds()); //use layer of all markers to set map extent

  //create object containing c_type marker layers
  var overlays = {};
    overlays[c_type] = c_type_layer;

  //add layer control using above object
  L.control.layers(null,overlays).addTo(map);

});
