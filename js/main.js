$(window).on('load', function(){
  sessionStorage.setItem('navitia_token', process.env.NAVITIA_TOKEN);

  var goHome = function() {
    var navitia_token = sessionStorage.getItem("navitia_token");
    console.log(navitia_token);
    console.log("test");

    var coord_from = {
      long: "2.37809900000002",
      lat :"48.8037874"
    };
    var coord_to = {
      long: "2.387552199999959",
      lat: "48.84978859999999"
    };

    $.ajax({
      type: "GET",
      url: "https://api.navitia.io/v1/journeys?"
          + "from=" + coord_from.long + ";" + coord_from.lat
          + "&to=" + coord_to.long + ";" + coord_to.lat + "&",
      dataType: 'json',
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + btoa(navitia_token + ":"));
      },
      success: function(data) {
        //console.log(data);


        $("#res").html("");
        data.journeys.forEach(function (journey) {
          //console.log(journey);
          //var parts = [];
          //console.log(journey.sections[0]);

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
                  mode: elt.display_informations.commercial_mode,
                  line: elt.display_informations.code
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


          var content = "<div>";
          parts.forEach(function (part, i) {
            if (part.type == "waiting" || part.type == "transfer")
              return;

            if(part.informations) {
              content += part.informations.mode;
              content += " ";
              content += part.informations.line;
            } else {
              content += "walk";
            }

            console.log(i + " " + parts.length);
            if (i < parts.length - 1)
              content += " > ";
          });
          content += "<br><br></div>";

          $("#res").append(content);

          //http://www.ratp.fr/itineraires/picto/tramway/t3a.png
          console.log(JSON.stringify(parts, undefined, 2));



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
          console.log(journey);
          console.log("---------------------");
        });
      }
    });
  };

  goHome();
  //setInterval(getData,20000);
});
