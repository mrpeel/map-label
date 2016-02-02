/* global SMESGMap */

var smesMap;

function setupMap() {

    var icon;
    smesMap = new SMESGMap("map");

    for (var mapCounter = 0; mapCounter <= 5; mapCounter++) {

        smesMap.addMarker('SMES Test ' + mapCounter, -37.813942 + (mapCounter * 0.005), 144.9711861 + (mapCounter * 0.005), 'scn-ahd-pm',
            '<div class="Neil">SMES Test ' + mapCounter + '</div>');

        smesMap.addLabel('SMES Test ' + mapCounter, -37.813942 + (mapCounter * 0.005), 144.9711861 + (mapCounter * 0.005));


    }
}
