
$(document).on("click", "#tabs li", function () {
  setData($(this).attr("data-index"));
})


var autocompleteFrom, autocompleteTo;

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

}

$("#validateRoute").on("click", function () {
  var place;
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

  // from
  place = autocompleteFrom.getPlace();
  if (!place || place.name == "")
    return;

  stops.from = {
    lng : place.geometry.location.lng(),
    lat : place.geometry.location.lat(),
  }

  // to
  place = autocompleteTo.getPlace();
  if (!place || place.name == "")
    return;

  stops.to = {
    lng : place.geometry.location.lng(),
    lat : place.geometry.location.lat(),
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
