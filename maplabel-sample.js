/*global google, document, window, MapLabel, console*/

var currentZoom, mapLabels, markers, map;

function init() {
    mapLabels = [];
    markers = [];

    var myLatlng = new google.maps.LatLng(-37.813942, 144.9711861);
    var myOptions = {
        zoom: 13,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map'), myOptions);

    var infoWindow = new google.maps.InfoWindow({
        content: '<div></div>'
    });

    for (var mapCounter = 0; mapCounter <= 5; mapCounter++) {

        var mapLabel = new MapLabel({
            text: 'SMES Test ' + mapCounter,
            position: new google.maps.LatLng(-37.813942 + (mapCounter * 0.005), 144.9711861 + (mapCounter * 0.005)),
            map: map,
            minZoom: 17,
            fontSize: 12,
            align: 'center'
        });

        mapLabels.push(mapLabel);

        var icon = {
            url: "scn-gda94-ahd-pm.svg",
            //anchor: new google.maps.Point(20, 20),
            size: new google.maps.Size(20, 30),
            scaledSize: new google.maps.Size(20, 30)
        };

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(-37.813942 + (mapCounter * 0.005), 144.9711861 + (mapCounter * 0.005)),
            title: 'SMES Test ' + mapCounter,
            map: map,
            draggable: false,
            icon: icon,
            infoContent: '<div>SMES Test ' + mapCounter + '</div>'
        });


        marker.addListener('click', function () {
            infoWindow.setContent(this.infoContent);
            infoWindow.open(map, this);
            //infowindow.open(map, marker);
        });

        markers.push(marker);
    }


    var changeAlign = document.getElementById('change-align');
    google.maps.event.addDomListener(changeAlign, 'click', function () {
        for (var labelCounter = 0; labelCounter < mapLabels.length; labelCounter++) {
            mapLabels[labelCounter].set('align', document.getElementById('align').value);
        }
    });

    var changeFont = document.getElementById('change-font');
    google.maps.event.addDomListener(changeFont, 'click', function () {
        for (var labelCounter = 0; labelCounter < mapLabels.length; labelCounter++) {
            mapLabels[labelCounter].set('fontSize', document.getElementById('font').value);
        }
    });

    var changeColor = document.getElementById('change-color');
    google.maps.event.addDomListener(changeColor, 'click', function () {
        for (var labelCounter = 0; labelCounter < mapLabels.length; labelCounter++) {
            mapLabels[labelCounter].set('fontColor', document.getElementById('font-color').value);
        }
    });


    var changeStrokeColor = document.getElementById('change-strokecolor');
    google.maps.event.addDomListener(changeStrokeColor, 'click', function () {
        for (var labelCounter = 0; labelCounter < mapLabels.length; labelCounter++) {
            mapLabels[labelCounter].set('strokeColor',
                document.getElementById('stroke-color').value);
        }
    });

    var showHideLabels = document.getElementById('show-hide-labels');
    google.maps.event.addDomListener(showHideLabels, 'click', function () {
        for (var labelCounter = 0; labelCounter < mapLabels.length; labelCounter++) {
            if (mapLabels[labelCounter].get('map') === null) {
                mapLabels[labelCounter].set('map', map);
            } else {
                mapLabels[labelCounter].set('map', null);
            }
        }


    });

    var showHideMarkers = document.getElementById('show-hide-markers');
    google.maps.event.addDomListener(showHideMarkers, 'click', function () {
        for (var markerCounter = 0; markerCounter < mapLabels.length; markerCounter++) {
            if (markers[markerCounter].get('map') === null) {
                markers[markerCounter].setMap(map);
            } else {
                markers[markerCounter].setMap(null);
            }
        }


    });


    google.maps.event.addListener(map, 'idle', checkandUpdateIcons);
}




function checkandUpdateIcons() {
    var zoomLevel = map.getZoom();
    var markerSize;

    if (!currentZoom || currentZoom !== zoomLevel) {

        if (zoomLevel < 14 && currentZoom >= 14) {
            for (var hideCounter = 0; hideCounter < mapLabels.length; hideCounter++) {
                markers[hideCounter].setMap(null);
            }
        } else if (zoomLevel >= 14 && currentZoom < 14) {
            for (var showCounter = 0; showCounter < mapLabels.length; showCounter++) {
                markers[showCounter].setMap(map);
            }

        }

        if (zoomLevel >= 14) {
            markerSize = zoomLevel * 1.6;

            //Now refresh marker size for all markers
            for (var markerCounter = 0; markerCounter < mapLabels.length; markerCounter++) {
                updateMarkerIconSize(markers[markerCounter], markerSize);
            }
        }

    }

    //Reset currentZoom
    currentZoom = zoomLevel;
}

function updateMarkerIconSize(marker, markerSize) {
    console.log(map.getZoom());
    console.log(marker.icon);
    var icon = marker.icon;

    icon.scaledSize = new google.maps.Size(markerSize, markerSize * 1.5);
    icon.size = new google.maps.Size(markerSize, markerSize * 1.5);
    marker.setIcon(icon);

}
