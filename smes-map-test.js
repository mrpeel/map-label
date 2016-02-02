/* global SMESGMap, dataResponse, document, console */

var smesMap;
var scnAHDValues = ["ZEROTH ORDER", "2ND ORDER", "3RD ORDER", "SPIRIT LEVELLING"];
var scnGDA94Value = "ADJUSTMENT";
var pcmSearchText = "PCM";
var currentNineFigureNumber;
var currentLatLng = {};
var currentRadius;

function setupMap() {

    var icon;
    smesMap = new SMESGMap("map");
    smesMap.setUpAutoComplete("autoComplete");

    loadMarks();

}

function markClickHandler(nineFigureNumber, lat, lng) {
    return function () {
        currentNineFigureNumber = nineFigureNumber;
        currentLatLng.lat = lat;
        currentLatLng.lng = lng;
        console.log(nineFigureNumber);
    };

}

function domReadyHandler(nineFigureNumber) {
    return function () {
        document.querySelector("[id=sketch" + nineFigureNumber + "]").addEventListener("click", function () {
            console.log('Sketch: ' + nineFigureNumber);
        }, false);
        document.querySelector("[id=report" + nineFigureNumber + "]").addEventListener("click", function () {
            console.log('Report: ' + nineFigureNumber);
        }, false);
    };

}

function loadMarks() {

    var surveyMark, iconName;

    for (var i = 0; i < dataResponse.data.length; i++) {

        surveyMark = dataResponse.data[i];
        iconName = returnMarkerIconType(surveyMark);
        var eventListeners = {};

        eventListeners.domready = domReadyHandler(surveyMark.nineFigureNumber);
        eventListeners.click = markClickHandler(surveyMark.nineFigureNumber, surveyMark.latitude, surveyMark.longitude);

        smesMap.addMarker(surveyMark.name,
            surveyMark.latitude,
            surveyMark.longitude,
            iconName,
            '<p class="mdl-color-text--primary"><b>' + surveyMark.name + '</b></p><hr>' +
            '<p>Nine Figure Number: ' + surveyMark.nineFigureNumber + '</p>' +
            '<p>Status: ' + surveyMark.status + '</p>' +
            '<p>SCN: ' + surveyMark.scn + '</p>' +
            '<p>Zone: ' + surveyMark.zone + '</p>' +
            '<p>Easting: ' + surveyMark.easting + '</p>' +
            '<p>Northing: ' + surveyMark.northing + '</p>' +
            '<p>AHD Height: ' + surveyMark.ahdHeight + '</p>' +
            '<p>Ellipsoid Height: ' + surveyMark.ellipsoidHeight + '</p>' +
            '<p>GDA94 Technique: ' + surveyMark.gda94Technique + '</p>' +
            '<p>AHD Technique: ' + surveyMark.ahdTechnique + '</p>' +
            '<hr>' +
            '<button id="sketch' + surveyMark.nineFigureNumber + '" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-color-text--primary smes-button fade-in">&nbsp;&nbsp;View Mark Sketch&nbsp;&nbsp;</button>' +
            '<button id="report' + surveyMark.nineFigureNumber + '" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-color-text--primary smes-button fade-in">&nbsp;&nbsp;View Mark Report&nbsp;&nbsp;</button>',
            eventListeners);


        smesMap.addLabel(surveyMark.name,
            surveyMark.latitude,
            surveyMark.longitude);


    }
}

function returnMarkerIconType(surveyMark) {
    var isSCN, isPCM, hasAHD, isSCNGDA94, isSCNAHD;

    //Set default values for each type
    isSCN = false;
    isPCM = false;
    hasAHD = false;
    isSCNGDA94 = false;
    isSCNAHD = false;

    if (surveyMark.status != "OK") {
        //Defective mark
        return "defective";
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
        if (!isSCN && !hasAHD) {
            return "gda94approx-pm";
        } else if (!isSCN && hasAHD) {
            return "ahdapprox-pm";
        } else if (isSCN && isPCM) {
            return "scn-gda94-pcm";
        } else if (isSCN && !hasAHD && !isPCM) {
            return "scn-gda94-pm";
        } else if (isSCN && hasAHD && !isSCNGDA94) {
            return "scn-ahd-pm";
        } else if (isSCN && hasAHD && isSCNGDA94 && isSCNAHD) {
            return "scn-gda94-ahd-pm";
        } else if (isSCN && hasAHD && isSCNGDA94 && !isSCNAHD) {
            return "scn-gda94-ahdapprox-pm";
        }
    }



}
