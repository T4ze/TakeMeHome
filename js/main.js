/*var routes = {
  stops: [],
  duration: 0,
  time_start: 0,
  time_end: 0,
  coord: {
    start: {
      lng: 0,
      lat: 0,
    },
    end: {
      lng: 0,
      lat: 0,
    }
  }
};
*/


var timeZone = 1;
var routes = [];


function findRoutes(stops) {
  routes = [];
  sessionStorage.setItem('navitia_token', process.env.NAVITIA_TOKEN);
  var transports = require('./transports.json');

  var navitia_token = sessionStorage.getItem("navitia_token");

/*
  var coord_from = {
    long: "2.382761",
    lat: "48.880950"
  };
  var coord_to = {
    long: "2.365319",
    lat: "48.880946"
  };
*/

  $.ajax({
    type: "GET",
    url: "https://api.navitia.io/v1/journeys?"
        + "from=" + stops.from.lng + ";" + stops.from.lat
        + "&to=" + stops.to.lng + ";" + stops.to.lat + "&",
    dataType: 'json',
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + btoa(navitia_token + ":"));
    },
    success: function(data) {
      //console.log(data);


      $("#res").html("");
      data.journeys.forEach(function (journey, index) {
        console.log(journey);
        var currentRoute = {
          stops: [],
          duration: "",
          time_start: getTime(journey.departure_date_time),
          time_end: getTime(journey.arrival_date_time),
          coord: stops
        };


        // Set route duration
        var tmp = journey.duration;
        if (tmp > 3600) {
          currentRoute.duration += Math.floor(tmp / 3600) + "h ";
          tmp %= 3600;
        }
        currentRoute.duration +=  Math.floor(tmp / 60) + "m";


        currentRoute.stops = journey.sections.map(function (elt) {
          if (elt.type == "public_transport" || elt.type == "street_network") {
            return {
              arrival_date_time: getTime(elt.arrival_date_time),
              departure_date_time: getTime(elt.departure_date_time),
              duration: elt.duration,
              coords: {
                from: {
                  lng:  elt.geojson.coordinates[0][0],
                  lat:  elt.geojson.coordinates[0][1],
                },
                to: {
                  lng:  elt.geojson.coordinates[elt.geojson.coordinates.length - 1][0],
                  lat:  elt.geojson.coordinates[elt.geojson.coordinates.length - 1][1],
                }
              },
              from: elt.from.name,
              to: elt.to.name,
              type: {
                name: elt.type,
                line: (elt.type != "public_transport") ? {} : {
                  code: elt.display_informations.code.toLowerCase(),
                  mode: elt.display_informations.commercial_mode.toLowerCase(),
                  direction: elt.display_informations.direction,
                },
              },
            };
          }
        }).filter(n => n);

        var content = "";
        currentRoute.stops.forEach(function (part, i) {
          if (part.type.name == "public_transport") {
            if (transports[part.type.line.mode]) {
              content += '<img class="icon" src="http://www.ratp.fr/itineraires/picto/' + part.type.line.mode + '/' + part.type.line.code + '.png" />';
            } else {
              content += part.type.line.mode;
              content += " ";
              content += part.type.line.code;
            }
          } else if (part.type.name == "street_network") {
            content += '<img class="icon" src="img/walk.png"/>';
          }

          if (i < currentRoute.stops.length - 1)
            content += " > ";
        });


        $('#tabs').append('<li role="presentation" data-index="' + index + '"><a href="#tab' + index + '" aria-controls="tab' + index + '" role="tab" data-toggle="tab"><div class="col-xs-12 nopadding">'
          + '<div class="col-xs-9 nopadding">'
            + content
          + '</div>'
          + '<div class="col-xs-3">'
            + ((journey.duration - (journey.duration % 60)) / 60) + "m "
          + '</div>'
        + '</div></a></li>'
        );

        console.log(currentRoute);
        routes.push(currentRoute);

        //$('#tabs-content').append('<div role="tabpanel" class="tab-pane" id="tab' + index + '"></div>');
        //$('#tab' + index).append('toto ' + index);





        //http://www.ratp.fr/itineraires/picto/tramway/t3a.png
        //console.log(JSON.stringify(parts, undefined, 2));



        /*
        journey.sections.forEach(function (part) {
          console.log(part);


          if (part.display_informations) {
            console.log(part.display_informations.commercial_mode + " " + part.display_informations.code);
          } else {
            console.log(part.type);
          }

          if (part.mode != "walking" &&  part.type != "waiting")
            console.log("From : " + part.from.name + " to " + part.to.name);


        });
        */
        //console.log(journey);
        //console.log("---------------------");
        console.log("=====================================================");
      });
    }
  });
}


function setData(index) {
  console.log(routes[index]);
}

function getTime(s) {
  return ((parseInt(s.substring(9, 11))) + timeZone) + ":" + s.substring(11, 13);
}
