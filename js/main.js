var timeZone = 1;
var routes = [];
var transports = require('./transports.json');

function findRoutes(stops) {
  routes = [];

  // Get Navitia token form env
  var navitia_token = process.env.NAVITIA_TOKEN;

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
      // sucess request
      data.journeys.forEach(function (journey, index) {
        //console.log(journey);
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


        // Reduce informations
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
              from: elt.from.name.split('(')[0],
              to: elt.to.name.split('(')[0],
              type: {
                name: elt.type,
                line: (elt.type != "public_transport") ? {} : {
                  code: elt.display_informations.code.toLowerCase(),
                  mode: elt.display_informations.commercial_mode.toLowerCase(),
                  direction: elt.display_informations.direction.split('(')[0],
                },
              },
            };
          }
        }).filter(n => n);

        // Show preview route
        var content = "";
        currentRoute.stops.forEach(function (part, i) {
          content += setGraphicTransport(part);

          if (i < currentRoute.stops.length - 1)
            content += " > ";
        });


        $('#tabs').append('<li role="presentation" data-index="' + index + '"><a href="#tab' + index + '" aria-controls="tab' + index + '" role="tab" data-toggle="tab">'
        + '<div class="col-xs-12 preview-elt">'
          + '<div class="col-xs-10 nopadding">'
            + content
          + '</div>'
          + '<div class="pull-right">'
            + ((journey.duration - (journey.duration % 60)) / 60) + "m "
          + '</div>'
        + '</div></a></li>'
        );

        // Save route in temporary data
        routes.push(currentRoute);

        //console.log(currentRoute);
        //console.log("=====================================================");
      });
    }
  });
}


function setData(index) {
  console.log(routes[index]);

  // initialize
  $(".route-line").html("");

  $("#total-time").html(routes[index].duration);
  $("#route-time").html(routes[index].time_start + " > " + routes[index].time_end);

  // for each stop, add it to the list
  routes[index].stops.forEach(function (v, i) {
    console.log(v);
    var content = '<li> \
      <div class="dot"></div> \
      <div class="content"> \
        <div class="date col-xs-2">' + v.departure_date_time + '</div> \
        <div class="col-xs-offset-4 description"> \
          <div class="station"><b>' + v.from + '</b>'
          + (v.type.name == "public_transport" ? ('<br>' + v.type.line.direction) : '')
          + '</div> \
        </div> \
      </div> \
      <div class="content info"> \
        <div class="col-xs-1 nopadding"> \
          <div class="time">' + Math.floor(v.duration / 60) + "m" + '</div> \
        </div> \
        <div class="transport">' + setGraphicTransport(v) + '</div> \
      </div> \
    </li>';

    $(".route-line").append(content);
  });

  // add last point (arrival)
  var tmp = routes[index].stops[routes[index].stops.length - 1];
  var content = '<li> \
    <div class="dot"></div> \
    <div class="content" style="min-height: 0px;"> \
      <div class="date col-xs-2">' + tmp.arrival_date_time + '</div> \
      <div class="col-xs-offset-4 description"> \
        <div class="station"><b>' + tmp.to + '</b></div> \
      </div> \
    </div> \
  </li>';
  $(".route-line").append(content);

  // show content
  $(".route-detail").addClass("active");
}

function getTime(s) {
  // Get hour and minutes from specific date format
  return ((parseInt(s.substring(9, 11))) + timeZone) + ":" + s.substring(11, 13);
}

function setGraphicTransport(v) {
  if (v.type.name == "public_transport") {
    var mode = v.type.line.mode.replace("rapidtransit", "rer");
    if (transports[mode]) {
      return '<img class="' + mode + '" src="http://www.ratp.fr/itineraires/picto/' + mode + '/' + v.type.line.code + '.png" />';
    } else {
      return v.type.line.code;
    }
  } else if (v.type.name == "street_network") {
    return '<img class="icon" src="img/walk.png"/>';
  }

  return "";
}

/*
function getTransport(v) {
  if (v.type.name == "street_network")
    return 'marche';
  else {
    if (v.type.line.mode == "metro")
      return "m" + v.type.line.code;
    else if (v.type.line.mode == "tramway")
      return v.type.line.code;
    else if (v.type.line.mode == "rer")
      return "RER"+ v.type.line.code;
    else if (v.type.line.mode == "bus")
      return "Bus " + v.type.line.code;
    else
      return "";
  }
}
*/
