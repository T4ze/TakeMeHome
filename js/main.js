var timeZone = 1,
    routes = [],
    markers = [],
    currentIndex;


var transports = {
  "metro": "RATP",
  "tramway": "RATP",
  "bus": "RATP",
  "rer": "RATP"
};

function findRoutes(stops) {
  routes = [];

  // init
  $('#tabs').html("");

  // Get Navitia token form env
  var navitia_token = process.env.NAVITIA_TOKEN;

  $.ajax({
    type: "GET",
    url: "https://api.navitia.io/v1/journeys?"
        + "from=" + stops.coords.from.lng + ";" + stops.coords.from.lat
        + "&to=" + stops.coords.to.lng + ";" + stops.coords.to.lat + "&",
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
          coord: stops.coords,
          from: stops.addresses.from,
          to: stops.addresses.to,
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
    },
    error: function (request, error) {
      if (arguments[0].status) {
        $('#tabs').append("<div class='text-center' style='padding: 15px;'>Il n'y a aucun resultat pour cet itinéraire.</div>");
      }
    },
  });
}


var saveData;

function setData(index, map) {
  currentIndex = index;
  markers = [];
  saveData = {};
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

    setPath(v.coords, map, i);


    if (v.type.name == "street_network") {
      console.log("walk");

      $(".save-detail").append('<div id="detail-' + i + '"></div>');
      saveData[v.coords.from.lat + "," + v.coords.from.lng] = i;

      $.ajax({
        type: "GET",
        url: "https://maps.googleapis.com/maps/api/directions/json?origin="
        + v.coords.from.lat + "," + v.coords.from.lng
        + "&destination=" + v.coords.to.lat + "," + v.coords.to.lng
        + "&mode=walking&key=AIzaSyDsTAz9LGb-CcyfMX0LXHMuQqhIs7_tSVI",
        dataType: 'json',
        success: function(data) {
          var indexValue = saveData[this.url.split('=')[1].split('&')[0]];
          var html = '<div class="col-xs-12"><div class="col-xs-6"></div><div class="col-xs-6"></div></div>';
          var tmp = "";
          var indication = '';

          data.routes[0].legs[0].steps.forEach(function (path) {
            console.log(path);
            tmp += "|" + path.start_location.lat + ", " + path.start_location.lng;
            tmp += "|" + path.end_location.lat + ", " + path.end_location.lng;
            indication += path.html_instructions + "<br>";
          });

          //html += '<div class="col-xs-6"><img src="http://maps.googleapis.com/maps/api/staticmap?size=200x100&amp;sensor=false&amp;path=color:0xff0000ff|weight:5' + tmp + '"/></div>';
          html += '<div class="col-xs-12">' + indication + '</div>';

          $("#detail-" + indexValue).html('<div class="col-xs-12" style="padding: 15px">' + html + '</div>');
        }
      });
    } else {
      console.log("transport");
      $(".save-detail").append('<div class="col-xs-12" style="padding: 15px"><div class="col-xs-12">'
      + 'Prendre le ' + v.type.line.mode + " " + setGraphicTransport(v)
      + ' en direction de <b>' + v.type.line.direction + '</b>'
      + '</div></div>');
    }

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

  //$(".save-detail").addClass("active");
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

function setPath(coord, map, i) {
  var flightPlanCoordinates = [ coord.from, coord.to ];
  var flightPath = new google.maps.Polyline({
    path: flightPlanCoordinates,
    geodesic: true,
    strokeColor: getRandomColor(i),
    strokeOpacity: 1.0,
    strokeWeight: 2
  });

  markers.push(new google.maps.Marker({
    position: coord.from,
    map: map,
    visible: false,
  }));
  markers.push(new google.maps.Marker({
    position: coord.to,
    map: map,
    visible: false,
  }));

  flightPath.setMap(map);

  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < markers.length; i++) {
   bounds.extend(markers[i].getPosition());
  }

  map.fitBounds(bounds);
  map.setZoom(map.getZoom() + 1);
}

function getRandomColor(i) {
  var colors = [ '#356f74', '#b6ab46', '#65b0ed', '#441d74', '#FF0000', '#f4f4f4', '#000000', '#467448'  ];
  //return colors[ Math.floor(Math.random() * colors.length) ];

  return colors[i % colors.length];
}


function save() {
  var tmp = routes[currentIndex];

  $('.save-detail').addClass('active');

  (html2canvas($('.save-detail'), {
    imageTimeout: 2000,
    removeContainer: true
  })).then(function(canvas) {
    var dataURI = canvas.toDataURL();

    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // create a blob for writing to a file
    var blob = new Blob([ab], {type: mimeString});

    // ===============================================
    var a = document.createElement('a');
    url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = "test.png";
    //a.click();
    var event = document.createEvent("MouseEvents");
        event.initMouseEvent(
                "click", true, false, window, 0, 0, 0, 0, 0
                , false, false, false, false, 0, null
        );
    a.dispatchEvent(event);
    window.URL.revokeObjectURL(url);
    $('.save-detail').removeClass('active');
  });

};

function mail() {
  var tmp = routes[currentIndex];

  var content = "Résumé de votre trajet :\n\n";
  content += "Départ (" + tmp.time_start + ") : " + tmp.from + " à \n";
  content += "Arrivé (" + tmp.time_end + ") :   " + tmp.to + " à \n";
  content += "\n\n";

  content += "Detail : \n\n";

  var j = 1;
  tmp.stops.forEach(function (v, i) {
    content += j + ". ";

    if (v.type.name == "street_network") {
      content += "Marchez de " + v.from + " à " + v.to + ".";
    } else {
      content += "Prendre le " + v.type.line.mode + " " + v.type.line.code + " en direction de " + v.type.line.direction + ".\n";
      j++;
      content += j + ". ";
      content += "Descendre à " + v.to + ".";
    }

    content += "\n";
    j++;
  });

  content += j + ". Vous êtes arrivé.\n\n\nBon trajet !";

  var formattedBody = "FirstLine \n Second Line \n Third Line";
  var mailToLink = "mailto:x@email.com?subject=Itinéraire&body=" + encodeURIComponent(content);
  window.location.href = mailToLink;

  console.log(content);
};
