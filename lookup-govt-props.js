/* global document, google, console, alert, window, smesMap */

var govtPropsNeedingAddress = [{
        id: 102,
        name: "AUSTRALIAN GOVERNMENT SOLICITOR"
    }, {
        id: 103,
        name: "AUSTRALIAN MARITIME SAFETY AUTHORITY"
    }, {
        id: 104,
        name: "AUSTRALIAN NATIONAL UNIVERSITY"
    }, {
        id: 107,
        name: "COMMONWEALTH OF AUSTRALIA"
    }, {
        id: 108,
        name: "COMMONWEALTH SCIENTIFIC AND INDUSTRIAL RESEARCH ORGANISATION"
    }, {
        id: 110,
        name: "DEFENCE SERVICE HOMES CORPORATION"
    }, {
        id: 111,
        name: "DEPARTMENT OF DEFENCE"
    }, {
        id: 112,
        name: "EXPORT FINANCE AND INSURANCE CORPORATION"
    }, {
        id: 113,
        name: "FEDERAL AIRPORTS CORPORATION"
    }, {
        id: 114,
        name: "LOCAL AUTHORITIES SUPERANNUATION BOARD"
    }, {
        id: 203,
        name: "CENTRAL GIPPSLAND INSTITUTE OF TECHNICAL AND FURTHER EDUCATION"
    }, {
        id: 208,
        name: "GOULBURN OVENS INSTITUTE OF TECHNICAL AND FURTHER EDUCATION"
    }, {
        id: 210,
        name: "KANGAN BATMAN INSTITUTE OF TECHNICAL AND FURTHER EDUCATION"
    }, {
        id: 212,
        name: "MELBOURNE CONVENTION AND EXHIBITION TRUST"
    }, {
        id: 216,
        name: "SOUTH WEST INSTITUTE OF TECHNICAL AND FURTHER EDUCATION"
    }, {
        id: 217,
        name: "SUNRAYSIA INSTITUTE OF TECHNICAL AND FURTHER EDUCATION"
    }, {
        id: 222,
        name: "VICTORIAN COLLEGE OF THE ARTS"
    }, {
        id: 224,
        name: "WODONGA INSTITUTE OF TECHNICAL AND FURTHER EDUCATION"
    }, {
        id: 304,
        name: "ANDERSON'S CREEK CEMETERY TRUST"
    }, {
        id: 307,
        name: "BALLARAT GENERAL CEMETERIES TRUST"
    }, {
        id: 314,
        name: "BENDIGO CEMETERIES TRUST"
    }, {
        id: 317,
        name: "CALVARY HEALTH CARE BETHLEHEM"
    }, {
        id: 320,
        name: "COBRAM DISTRICT HOSPITAL"
    }, {
        id: 325,
        name: "EAST GRAMPIANS HEALTH SERVICE"
    }, {
        id: 329,
        name: "EDENHOPE AND DISTRICT MEMORIAL HOSPITAL"
    }, {
        id: 330,
        name: "FAWKNER CREMATORIUM AND MEMORIAL PARK"
    }, {
        id: 334,
        name: "HESSE RURAL HEALTH SERVICE"
    }, {
        id: 335,
        name: "HEYWOOD RURAL HEALTH"
    }, {
        id: 336,
        name: "INGLEWOOD AND DISTRICT HEALTH SERVICE"
    }, {
        id: 337,
        name: "KEILOR CEMETERY TRUST"
    }, {
        id: 340,
        name: "KYABRAM AND DISTRICT HEALTH SERVICES"
    }, {
        id: 341,
        name: "KYNETON DISTRICT HEALTH SERVICE"
    }, {
        id: 344,
        name: "MALDON HOSPITAL"
    }, {
        id: 345,
        name: "MALLEE TRACK HEALTH AND COMMUNITY SERVICES"
    }, {
        id: 346,
        name: "MANANGATANG AND DISTRICT HOSPITAL"
    }, {
        id: 349,
        name: "MCIVOR HEALTH AND COMMUNITY SERVICES"
    }, {
        id: 351,
        name: "MENTAL HEALTH REVIEW BOARD"
    }, {
        id: 354,
        name: "NATHALIA DISTRICT HOSPITAL"
    }, {
        id: 355,
        name: "NECROPOLIS SPRINGVALE"
    }, {
        id: 357,
        name: "NORTHERN HEALTH"
    }, {
        id: 359,
        name: "OMEO DISTRICT HEALTH"
    }, {
        id: 363,
        name: "PETER MACCALLUM CANCER INSTITUTE"
    }, {
        id: 365,
        name: "PRESTON CEMETERY TRUST"
    }, {
        id: 368,
        name: "RURAL NORTHWEST HEALTH"
    }, {
        id: 369,
        name: "SEYMOUR DISTRICT MEMORIAL HOSPITAL"
    }, {
        id: 370,
        name: "SOUTH GIPPSLAND HOSPITAL"
    }, {
        id: 372,
        name: "SOUTHERN HEALTH"
    }, {
        id: 373,
        name: "ST. GEORGE'S HEALTH SERVICE LIMITED"
    }, {
        id: 376,
        name: "TALLANGATTA HEALTH SERVICE"
    }, {
        id: 377,
        name: "TEMPLESTOWE CEMETERY TRUST"
    }, {
        id: 379,
        name: "THE TRUSTEE OF THE ALTONA MEMORIAL PARK"
    }, {
        id: 380,
        name: "THE CHELTENHAM AND REGIONAL CEMETERIES TRUST"
    }, {
        id: 382,
        name: "THE LILYDALE CEMETERIES TRUST"
    }, {
        id: 383,
        name: "THE MILDURA CEMETERY TRUST"
    }, {
        id: 384,
        name: "THE QUEEN ELIZABETH CENTRE"
    }, {
        id: 389,
        name: "TRUSTEES OF THE GEELONG CEMETERIES TRUST"
    }, {
        id: 392,
        name: "WEST GIPPSLAND HEALTHCARE GROUP"
    }, {
        id: 397,
        name: "WODONGA REGIONAL HEALTH SERVICE"
    }, {
        id: 398,
        name: "WYNDHAM CEMETERIES TRUST"
    }, {
        id: 399,
        name: "YARRAM AND DISTRICT HEALTH SERVICE"
    }, {
        id: 401,
        name: "YEA AND DISTRICT MEMORIAL HOSPITAL"
    }, {
        id: 453,
        name: "VICTORIA POLICE "
    }, {
        id: 454,
        name: "VICTORIA STATE EMERGENCY SERVICE AUTHORITY "
    }, {
        id: 760,
        name: "PORT OF HASTINGS CORPORATION"
    }, {
        id: 762,
        name: "VICTORIAN REGIONAL CHANNELS AUTHORITY"
    }, {
        id: 800,
        name: "MINISTER FOR FINANCE"
    }, {
        id: 802,
        name: "MINISTER FOR ENVIRONMENT AND CLIMATE CHANGE"
    }, {
        id: 803,
        name: "GEELONG PERFORMING ARTS CENTRE TRUST"
    }, {
        id: 806,
        name: "VICFORESTS"
    }, {
        id: 807,
        name: "VICTORIAN PLANTATIONS CORPORATION"
    }, {
        id: 811,
        name: "SECRETARY TO THE DEPARTMENT OF SUSTAINABILITY AND ENVIRONMENT"
    }, {
        id: 740,
        name: "PARKS VICTORIA"
    }
];


var predictionsArray = [];
var service;
var placesService;

function getAddresses() {

    service = new google.maps.places.AutocompleteService();
    placesService = new google.maps.places.PlacesService(smesMap.map);

    for (var c = 0; c < govtPropsNeedingAddress.length; c++) {
        executeSearch(govtPropsNeedingAddress[c].name);
    }



}

function executeSearch(proprName) {

    window.setTimeout(function () {
        /*service.getQueryPredictions({
            input: searchInput
        }, processSuggestions);*/

        placesService.textSearch({
            query: proprName,
            location: smesMap.map.getCenter(),
            radius: 100000
        }, processSearch);
    }, (Math.random() * govtPropsNeedingAddress.length * 1000));
}

function processSuggestions(predictions, status) {
    if (status != google.maps.places.PlacesServiceStatus.OK) {
        console.log(status);
        return;
    }

    predictionsArray.push(predictions[0].description);
    console.log(predictionsArray);
}

function processSearch(places, status) {
    if (status != google.maps.places.PlacesServiceStatus.OK) {
        console.log(status);
        return;
    }

    var proprId;

    places.forEach(function (place) {
        proprId = findProprietor(place.name);
        if (place.formatted_address && proprId > 0) {
            console.log(proprId + '||' + place.name + '||' + place.formatted_address.replace(", Australia", ""));
        }
    });



}

function findProprietor(propName) {
    for (var c = 0; c < govtPropsNeedingAddress.length; c++) {
        if (govtPropsNeedingAddress[c].name.toLowerCase() === propName.toLowerCase()) {
            return govtPropsNeedingAddress[c].id;
        }
    }

}
