
$(document).on("click", "#tabs li", function () {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 48.8037874, lng: 2.37809900000002},
    zoom: 12,
    disableDefaultUI: true
  }, { maxZoom: 10 });
  setData($(this).attr("data-index"), map);
})


var autocompleteFrom, autocompleteTo, map;

function initialize() {
  console.log("init google map");
  var input = document.getElementById('fromAdress');
  autocompleteFrom = new google.maps.places.Autocomplete(input);
  google.maps.event.addListener(autocompleteFrom, 'place_changed', function () {
    var place = autocompleteFrom.getPlace();
    console.log("from : place", place.name);
    console.log("from : lat", place.geometry.location.lat(), "lng", place.geometry.location.lng());
  });

  var input2 = document.getElementById('toAdress');
  autocompleteTo = new google.maps.places.Autocomplete(input2);
  google.maps.event.addListener(autocompleteTo, 'place_changed', function () {
    var place = autocompleteTo.getPlace();
    console.log("to : place", place.name);
    console.log("to : lat", place.geometry.location.lat(), "lng", place.geometry.location.lng());
  });

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 48.8037874, lng: 2.37809900000002},
    zoom: 12,
    disableDefaultUI: true
  }, { maxZoom: 10 });

  findRoutes({
    coords: {
      from : {
        lng: "2.37809900000002",
        lat: "48.8037874"
      },
      to : {
        lng: "2.387552199999959",
        lat: "48.84978859999999"
      }
    },
    addresses: {
      from: "140 Boulevard de Stalingrad, 94200 Ivry-sur-Seine, France",
      to: "263 Rue du Faubourg Saint-Antoine, 75011 Paris, France",
    }
  });
}

$("#validateRoute").on("click", function () {
  var placeFrom, placeTo;
  var stops = {
      from : {
        long : 0,
        lat : 0,
      },
      to : {
        long : 0,
        lat : 0,
      }
  };

  placeFrom = autocompleteFrom.getPlace();
  placeTo = autocompleteTo.getPlace();

  if (!placeFrom || placeFrom.name == "" || !placeTo || placeTo.name == "")
    return;


  stops = {
    coords: {
      from: {
        lng : placeFrom.geometry.location.lng(),
        lat : placeFrom.geometry.location.lat(),
      },
      to: {
        lng : placeTo.geometry.location.lng(),
        lat : placeTo.geometry.location.lat(),
      },
    },
    addresses: {
      from: placeFrom.formatted_address,
      to: placeTo.formatted_address,
    }
  }

  findRoutes(stops);
});



$("#closePopup").on("click", function () {
  $(".route-detail").removeClass("active");
});


$(".switch").on("click", function () {
  var tmp = $("#fromAdress").val();
  $("#fromAdress").val($("#toAdress").val());
  $("#toAdress").val(tmp);
});
