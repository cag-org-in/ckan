var savedIDs = [];
var tamilLabels = {
  'AREA': 'பகுதியில்',
  'PERIMETER': 'சுற்றளவு',
  'SUR_ID': 'ஐடி'
};

function initSidebar() {
  // called when you finish loading first data layer
  $("#loading").hide();
}

function setSelectFeature(feature) {
  // clear data
  $("ul#properties").html("");
  if (!feature) {
    // if user clicks outside mapped area
    $("#save, #remove").hide();
    return;
  }

  // show all properties
  currentID = feature.properties.SUR_ID;
  var propkeys = Object.keys(feature.properties);
  for (var i = 0; i < propkeys.length; i++) {
    var key = propkeys[i];
    var value = feature.properties[key];
    if (['bounds', 'userNote'].indexOf(key) > -1) {
      break;
    }
    var combinedKey = key.toLowerCase();
    if (tamilLabels[key]) {
      combinedKey += " / " + tamilLabels[key];
    }
    var label = $("<label>").text(combinedKey);
    var val = $("<span>").text(value);
    $("<li>")
      .append(label)
      .append(val)
      .appendTo("ul#properties");
  }
  /*
  if ($("#loggedin").length) {
    $("<label>").text("Your Notes / குறிப்புகள்").appendTo("ul#properties");
    $("<textarea></textarea>")
      .val(feature.properties.userNote)
      .appendTo("ul#properties");
  }
  */
  $("#save").show();
  if (savedIDs.indexOf(currentID) > -1) {
    $("#remove").show();
  } else {
    $("#remove").hide();
  }
}

$("#save").click(function () {
  // update user selection
  /*
  var myNote = $("#properties textarea").val();
  selectFeature.setProperty("userNote", myNote);
  if ($("#loggedin").length) {
    $.post("/savenote", {
      user: $("#loggedin").text(),
      note: myNote,
      layer: 'first',
      id: currentID
    }, function (response) {
      console.log("save response: " + response);
    });
  }
    */
  if (savedIDs.indexOf(currentID) > -1) {
    return;
  }

  // new cases: add to saved list
  var saver = $("<span>").text("SUR ID: " + currentID);
  var myFeature = selectFeature;
  var bounds = myFeature.properties.bounds;
  savedIDs.push(currentID);
  saver.on("click", function () {
    fitBounds(bounds);
    selectFeature = myFeature;
    setSelectFeature(myFeature);
    allFeatures.setStyle(updateVectorMap);
  });
  $("<li id='layer_" + currentID + "'>")
    .append(saver)
    .appendTo("ul#saved");

  // make it possible to remove selection
  $("#remove").show();

  // update appearance on map
  allFeatures.setStyle(updateVectorMap);
});

$("#remove").click(function() {
  var myNote = '';
  selectFeature.setProperty("userNote", "");
  if ($("#loggedin").length) {
    $.post("/deletenote", {
      user: $("#loggedin").text(),
      layer: 'first',
      id: currentID
    }, function (response) {
      console.log("delete response: " + response);
    });
  }

  savedIDs.splice(savedIDs.indexOf(currentID), 1);
  $("#layer_" + currentID).remove();

  // update appearance on map
  selectFeature = null;
  setSelectFeature(null);
  allFeatures.setStyle(updateVectorMap);
});
