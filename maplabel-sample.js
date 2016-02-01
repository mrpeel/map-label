/*global google, document, window, MapLabel*/

function init() {
    var mapLabels = [];
    var markers = [];

    var myLatlng = new google.maps.LatLng(-37.813942, 144.9711861);
    var myOptions = {
        zoom: 13,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById('map'), myOptions);

    var infoWindow = new google.maps.InfoWindow({
        content: '<div></div>'
    });

    for (var mapCounter = 0; mapCounter <= 5; mapCounter++) {

        var mapLabel = new MapLabel({
            text: 'SMES Test ' + mapCounter,
            position: new google.maps.LatLng(-37.813942 + (mapCounter * 0.005), 144.9711861 + (mapCounter * 0.005)),
            map: map,
            fontSize: 12,
            align: 'center'
        });

        mapLabels.push(mapLabel);

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(-37.813942 + (mapCounter * 0.005), 144.9711861 + (mapCounter * 0.005)),
            title: 'SMES Test ' + mapCounter,
            map: map,
            draggable: false,
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
        for (var labelCounter = 0; labelCounter < mapLabels.length; labelCounter++) {
            if (markers[labelCounter].get('map') === null) {
                markers[labelCounter].setMap(map);
            } else {
                markers[labelCounter].setMap(null);
            }
        }


    });


}

google.maps.event.addDomListener(window, 'load', init);
