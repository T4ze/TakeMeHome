function findRoutes(stops) {
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
        + "from=" + stops.from.long + ";" + stops.from.lat
        + "&to=" + stops.to.long + ";" + stops.to.lat + "&",
    dataType: 'json',
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + btoa(navitia_token + ":"));
    },
    success: function(data) {
      //console.log(data);


      $("#res").html("");
      data.journeys.forEach(function (journey, index) {
        console.log(journey);
        console.log("=====================================================");
        //var parts = [];
        //console.log(journey.sections[0]);
        console.log(((journey.duration - (journey.duration % 60)) / 60) + "m " + (journey.duration % 60) + "s");

        parts = journey.sections.reduce(function (result, elt) {
          if (elt.type != "waiting" && elt.type != "transfer") {
            var tmp = {
              time: {
                departure: elt.departure_date_time,
                arrival: elt.arrival_date_time
              },
              type: elt.type,
            };

            if (elt.display_informations) {
              tmp.informations = {
                mode: elt.display_informations.commercial_mode.toLowerCase(),
                line: elt.display_informations.code.toLowerCase()
              };
            }

            if (elt.from && elt.to) {
              tmp.loc = {
                from: { name: elt.from.name, },
                to: { name: elt.to.name, },
              };


              if (elt.from.stop_point)
                tmp.loc.from.coord = elt.from.stop_point.coord;
              if  (elt.to.stop_point)
                tmp.loc.to.coord = elt.to.stop_point.coord;
            }

            result.push(tmp);
          }

          return result;
        }, []);


        var content = "";

        parts.forEach(function (part, i) {
          if (part.type == "waiting" || part.type == "transfer")
            return;


          if(part.informations) {
            if (transports[part.informations.mode]) {
              content += '<img class="icon" src="http://www.ratp.fr/itineraires/picto/' + part.informations.mode + '/' + part.informations.line + '.png" />';
            } else {
              content += part.informations.mode;
              content += " ";
              content += part.informations.line;
            }
          } else {
            content += '<img class="icon" src="img/walk.png"/>';
          }

          if (i < parts.length - 1)
            content += " > ";
        });


        $('#tabs').append('<li role="presentation"><a href="#tab' + index + '" aria-controls="tab' + index + '" role="tab" data-toggle="tab"><div class="col-xs-12">'
          + '<div class="col-xs-9">'
            + content
          + '</div>'
          + '<div class="col-xs-3">'
            + ((journey.duration - (journey.duration % 60)) / 60) + "m "
            + (journey.duration % 60) + 's'
          + '</div>'
        + '</div></a></li>'
        );

        $('#tabs-content').append('<div role="tabpanel" class="tab-pane" id="tab' + index + '"></div>');

        $('#tab' + index).append('<div></div>');

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
      });
    }
  });
}
