/* global SMESGMap, dataResponse, document, console, SMESMarkStore, saveAs, window */

var smesMap;
var start, end;
var testMarkStore;
var scnAHDValues = ["ZEROTH ORDER", "2ND ORDER", "3RD ORDER", "SPIRIT LEVELLING"];
var scnGDA94Value = "ADJUSTMENT";
var pcmSearchText = "PCM";
var currentNineFigureNumber;
var currentLatLng = {};
var currentRadius;
var startingUp;



function setupMap() {

  start = new Date();
  var mapOptions = {};
  //startingUp = true;
  mapOptions.idle = requestMarkInformation;
  mapOptions.zoomChanged = displayZoomMessage;

  smesMap = new SMESGMap("map", mapOptions);

  window.setTimeout(function () {
    console.log('Time to create map: ' + (new Date() - start));
  }, 0);

  var markStoreOptions = {};
  markStoreOptions.loadMark = loadMark;
  testMarkStore = new SMESMarkStore(markStoreOptions);
  testMarkStore.retrieveStoredMarks();

  window.setTimeout(function () {
    console.log('Time to create mark store: ' + (new Date() - start));
  }, 0);

  smesMap.setUpAutoComplete("autoComplete");

  window.setTimeout(function () {
    console.log('Time to set-up auto-complete: ' + (new Date() - start));
  }, 0);

  /*window.setTimeout(function () {
    loadMarks();
    startingUp = false;
  }, 1000);*/


  var mapStyle = document.getElementById("map-style");

  mapStyle.addEventListener("change", function () {
    changeMapStyle(mapStyle.value);
  });


}

function changeMapStyle(styleName) {
  var styleDetails;

  if (styleName !== "google") {
    styleDetails = smesMap.mapStyles[styleName];
  }

  smesMap.map.setOptions({
    styles: styleDetails
  });
}

function requestMarkInformation() {

  if (startingUp) {
    return;
  }

  var mapCenter, radius, requestOptions;

  mapCenter = smesMap.map.getCenter();
  radius = smesMap.mapSize || 2;

  console.log("requestMarkInformation");

  requestOptions = {};
  requestOptions.cLat = mapCenter.lat();
  requestOptions.cLong = mapCenter.lng();
  requestOptions.cRadius = radius;
  requestOptions.finishedCallback = showZoomMessage;
  requestOptions.tooManyCallback = showZoomMessage;

  testMarkStore.requestMarkInformation(requestOptions);
  //console.log(testMarkStore.newIndex);

  if (!end) {
    window.setTimeout(function () {
      end = new Date();
      console.log('Time tp finish request information: ' + (end - start));
    }, 0);
  }

}

function showZoomMessage() {
  var msgEl = document.querySelector("[id=zoom-msg]");

  msgEl.classList.remove("hidden");
}

function displayZoomMessage() {
  var msgEl = document.querySelector("[id=zoom-msg]");

  if (smesMap.mapSize > 2) {
    msgEl.classList.remove("hidden");
  } else {
    msgEl.classList.add("hidden");
  }

}


function loadMark(surveyMark, loadType) {

  console.log("loadMark: " + surveyMark.nineFigureNumber);

  var markType;
  var closeButton = '<button id="close-info-box" class="close-button mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon">' +
    '<i class="material-icons">close</i>' +
    '</button>';

  var cardDiv = '<div class="mdl-card infobox mdl-shadow--3dp overflow-x-visible">';
  var contentSDiv = '<div class="card-content"><div class="card-left">';
  var contentMDiv = '</div><div class="card-value">';
  var contentEDiv = '</div></div>';
  var eventListeners = {};
  var marker = {};
  var label = {};

  markType = returnMarkType(surveyMark);

  eventListeners.domready = infoBoxReadyHandler(surveyMark.nineFigureNumber, surveyMark.name);
  eventListeners.click = markClickHandler(surveyMark.nineFigureNumber, surveyMark.latitude, surveyMark.longitude);

  marker.lat = surveyMark.latitude;
  marker.lng = surveyMark.longitude;
  marker.title = surveyMark.name;
  marker.icon = "symbology/" + markType.iconName;
  marker.nineFigureNo = surveyMark.nineFigureNumber;
  marker.eventListeners = eventListeners;
  marker.infoWindowContent = cardDiv + '<div class="mdl-card__title mdl-color-text--white">' +
    '<div class="info-window-header">' +
    '<div class="section__circle-container">' +
    '<div class="section__circle-container__circle card-symbol"> ' +
    '<img class="info-symbol" src="symbology/' + markType.iconName + '.svg">' +
    '</div>' +
    '</div>' +
    '<div class="header-text">' +
    '<div class="nine-figure">' + surveyMark.nineFigureNumber + '</div>' +
    '<div><h3 class="mdl-card__title-text">' + surveyMark.name + '</h3></div>' +
    '<div class="mark-status">' + markType.markDetails + '</div>' +
    '</div>' +
    '</div>' +
    closeButton +
    '</div>' +
    '<div class="mdl-card__supporting-text">' +
    '<div id="address' + surveyMark.nineFigureNumber + '"></div>' +

    '<div class="content-section">' +
    '<div class="content-icon"><i class="material-icons">swap_horiz</i></div>' +
    '<div class="content">' +
    contentSDiv + 'Nearest address:' + contentMDiv + surveyMark.latitude + ', ' + surveyMark.longitude + contentEDiv +
    contentSDiv + 'MGA:' + contentMDiv + surveyMark.zone + ', ' + surveyMark.easting + ', ' + surveyMark.northing + contentEDiv +
    contentSDiv + 'Technique:' + contentMDiv + surveyMark.gda94Technique + contentEDiv +
    contentSDiv + 'Ellipsoid height:' + contentMDiv + surveyMark.ellipsoidHeight + contentEDiv +
    contentSDiv + 'Uncertainty:' + contentMDiv + surveyMark.hUncertainty + contentEDiv +
    contentSDiv + 'Order:' + contentMDiv + surveyMark.hOrder + contentEDiv +
    contentSDiv + 'Measurements:' + contentMDiv + surveyMark.gda94Measurements + contentEDiv +
    '</div>' +
    '</div>' +
    '<div class="vert-spacer"></div>' +

    '<div class="content-section">' +
    '<div class="content-icon"><i class="material-icons">swap_vert</i></div>' +
    '<div class="content">' +
    contentSDiv + 'AHD height:' + contentMDiv + surveyMark.ahdHeight + contentEDiv +
    contentSDiv + 'Technique:' + contentMDiv + surveyMark.ahdTechnique + contentEDiv +
    contentSDiv + 'Uncertainty:' + contentMDiv + surveyMark.vUncertainty + contentEDiv +
    contentSDiv + 'Order:' + contentMDiv + surveyMark.vOrder + contentEDiv +
    contentSDiv + 'Level section:' + contentMDiv + surveyMark.ahdLevelSection + contentEDiv +
    '</div>' +
    '</div>' +

    '</div>' +
    '<div class="mdl-card__actions mdl-card--border">' +
    '<div class="horiz-spacer"></div>' +
    '<button id="sketch' + surveyMark.nineFigureNumber + '" class="mdl-button mdl-js-button mdl-js-ripple-effect smes-button fade-in">Sketch</button>' +
    '<button id="report' + surveyMark.nineFigureNumber + '" class="mdl-button mdl-js-button mdl-js-ripple-effect smes-button fade-in">Report</button>' +
    '</div></div>';


  label.lat = surveyMark.latitude;
  label.lng = surveyMark.longitude;
  label.label = surveyMark.name;
  label.nineFigureNo = surveyMark.nineFigureNumber;


  if (loadType === "new") {
    smesMap.addMarker(marker);
    smesMap.addLabel(label);

  } else {

    smesMap.updateMarker(marker);
    smesMap.updateLabel(label);
  }

}

function markClickHandler(nineFigureNumber, lat, lng) {
  return function () {
    currentNineFigureNumber = nineFigureNumber;
    currentLatLng.lat = lat;
    currentLatLng.lng = lng;
    console.log(nineFigureNumber);
  };

}

function infoBoxReadyHandler(nineFigureNumber, markName) {
  //Remove multiple spaces where present in the name
  var downloadName = markName.replace(/  +/g, ' ');

  return function () {
    document.querySelector("[id=sketch" + nineFigureNumber + "]").addEventListener("click", function () {
      console.log('Sketch: ' + nineFigureNumber);

      testMarkStore.getSurveyMarkSketchResponse(nineFigureNumber).then(function (pdfData) {
        var blob = testMarkStore.base64toBlob(pdfData.document, 'application/pdf');

        saveAs(blob, downloadName + ' (' + nineFigureNumber + ') Sketch.pdf');
      }).catch(function (error) {
        console.log("PDF retrieval failed");
      });

    }, false);
    document.querySelector("[id=report" + nineFigureNumber + "]").addEventListener("click", function () {
      console.log('Report: ' + nineFigureNumber);

      testMarkStore.getSurveyMarkReportResponse(nineFigureNumber).then(function (pdfData) {
        var blob = testMarkStore.base64toBlob(pdfData.document, 'application/pdf');

        saveAs(blob, downloadName + ' (' + nineFigureNumber + ') Report.pdf');
      }).catch(function (error) {
        console.log("PDF retrieval failed");
      });

    }, false);
  };

}

function returnMarkType(surveyMark) {
  var markType = {};
  var isSCN = false,
    isPCM = false,
    hasAHD = false,
    isSCNGDA94 = false,
    isSCNAHD = false,
    isDefective = hasAHD;


  if (surveyMark.status != "OK") {
    //Defective mark
    isDefective = true;
  } else {
    //OK mark - determine other values
    if (surveyMark.scn === "Yes") {
      isSCN = true;
    }
    //Check if it has an AHD Height
    if (surveyMark.ahdHeight !== "") {
      hasAHD = true;
    }
    //Check if PCM - Nine Figure Number starts with 1
    if (String(surveyMark.nineFigureNumber).indexOf("1") === 0) {
      isPCM = true;
    }
    //Retrieve GDA94 technique to determine whether SCN GDA94
    if (surveyMark.gda94Technique.indexOf(scnGDA94Value) >= 0) {
      isSCNGDA94 = true;
    }

    //Check AHD technique to determine whether it is SCN AHD
    scnAHDValues.forEach(function (ahdApproxValue) {
      if (surveyMark.ahdTechnique.indexOf(ahdApproxValue) >= 0) {
        isSCNAHD = true;
      }
    });

    //Now all of the source values have been retrieved, work through possible combinations to determine correct symbol
    if (isDefective) {
      markType.iconName = "defective";
      markType.markDetails = "Defective";

    } else if (!isDefective && !isSCN && !hasAHD) {
      markType.iconName = "gda94approx-pm";
      markType.markDetails = "Non-SCN (GDA94)";
    } else if (!isDefective && !isSCN && hasAHD) {
      markType.iconName = "ahdapprox-pm";
      markType.markDetails = "Non-SCN (GDA94), non-SCN (AHD)";
    } else if (!isDefective && isSCN && isPCM) {
      markType.iconName = "scn-gda94-pcm";
      markType.markDetails = "SCN (GDA94)";
    } else if (!isDefective && isSCN && !hasAHD && !isPCM) {
      markType.iconName = "scn-gda94-pm";
      markType.markDetails = "SCN (GDA94)";
    } else if (!isDefective && isSCN && hasAHD && !isSCNGDA94) {
      markType.iconName = "scn-ahd-pm";
      markType.markDetails = "Non-SCN (GDA94), SCN (AHD)";
    } else if (!isDefective && isSCN && hasAHD && isSCNGDA94 && isSCNAHD) {
      markType.iconName = "scn-gda94-ahd-pm";
      markType.markDetails = "SCN (GDA94), SCN (AHD)";
    } else if (!isDefective && isSCN && hasAHD && isSCNGDA94 && !isSCNAHD) {
      markType.iconName = "scn-gda94-ahdapprox-pm";
      markType.markDetails = "Non-SCN (GDA94)";
    }
  }

  return markType;

}
