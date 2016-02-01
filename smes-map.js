/** GooMap class encapsulating the maps functionality required to load a map with custom controls,
    set-up markers and and infor windows
*/

/*global  google, document, navigator, console, MapLabel*/

/** 
 * 
 * PassOff uses BKDF2 to generate salted password and HMAC256 to generate a seed.  The seed is then ued to generate a password based on
    a chosen template.
 */
var SMESGMap = function (elementId, options) {
    "use strict";

    var melbourneCenter = new google.maps.LatLng(-37.813942, 144.9711861);

    this.setupMapStyles();
    this.mapOptions = options.mapOptions || {
        center: melbourneCenter,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,

        mapTypeControl: false,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        scaleControl: true,
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        panControl: false,
        rotateControl: false,
        styles: this.mapStyles.iovation
    };

    this.map = new google.maps.Map(document.getElementById(elementId), this.mapOptions);
    this.geoLocate();
    this.geocoder = new google.maps.Geocoder;
    this.markerClusterer = new MarkerClusterer(speedTest.map, speedTest.markers);

    this.markers = [];
    this.labels = [];
    this.currentZoom = 1;
    this.markerIcons = [];
    this.markerSize = 14;

    google.maps.event.addListener(this.map, 'zoom_changed', function () {
        this.checkSizeofMap();
        this.setZoomLevel();
    });


    if (options.idle) {
        google.maps.event.addListener(this.map, 'idle', function (e) {
            if (e === undefined) {
                e = this;
            }

            options.idle.apply(this, [e]);

        });

    }


    google.maps.event.addListener(this.map, 'idle', this.refreshIcons);



};

SMESGMap.prototype.geoLocate = function () {
    "use strict";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
                var geoPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                this.map.setCenter(geoPosition);

            },
            function (error) {
                console.log(error);
            });
    }

};



SMESGMap.prototype.getZoom = function () {
    "use strict";

    return this.map.getZoom();

};

/**
 * 
 * @param {None}.
 * @return {None}.
 */

var mapLabel = new MapLabel({
    text: 'SMES Test ' + mapCounter,
    position: new google.maps.LatLng(-37.813942 + (mapCounter * 0.005), 144.9711861 + (mapCounter * 0.005)),
    map: map,
    minZoom: 17,
    fontSize: 12,
    align: 'center'
});



SMESGMap.prototype.addMarker = function (markerTitle, markerLat, markerLng, markerIcon, infoWindowContent) {
    "use strict";

    //Capture local reference of map for use in click functions
    var mapRef = this.map;

    var icon = {
        url: markerIcon + ".svg",
        size: new google.maps.Size(this.markerSize, this.markerSize),
        scaledSize: new google.maps.Size(this.markerSize, this.markerSize)
    };


    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(markerLat, markerLng),
        title: markerTitle,
        map: this.map,
        draggable: false,
        icon: icon,
        infoContent: infoWindowContent
    });


    marker.addListener('click', function () {
        infoWindow.setContent(this.infoContent);
        infoWindow.open(mapRef, this);
    });

    markers.push(marker);

};

SMESGMap.prototype.addLabel = function (labelContent, labelLat, labelLng) {


    var mapLabel = new MapLabel({
        text: labelContent,
        position: new google.maps.LatLng(labelLat, labelLng),
        map: this.map,
        minZoom: 17,
        fontSize: 12,
        align: 'center'
    });

    this.labels.push(mapLabel);



};


SMESGMap.prototype.setZoomLevel = function (newSize) {
    "use strict";
    var zoomLevel = this.map.getZoom();

    //If zoom level has changed, depending on old and new zoom levels marks need to be shown or hidden
    if (!this.zoomLevel || this.zoomLevel !== zoomLevel) {

        if (zoomLevel < 14 && this.zoomLevel >= 14) {
            this.hideMarkers();
        } else if (zoomLevel >= 14 && this.zoomLevel < 14) {
            this.showMarkers();

        }

        if (zoomLevel >= 14) {
            this.updateMarkerIconSize(markerSize);
        }

    }

    //Reset zoomLevel
    this.zoomLevel = this.map.getZoom();
    this.markerSize = this.zoomLevel;

};

SMESGMap.prototype.hideMarkers = function () {
    "use strict";

    for (var i = 0; i < this.markers.length; i++) {
        this.markers[i].setMap(null);
    }

};

SMESGMap.prototype.showMarkers = function () {
    "use strict";

    for (var i = 0; i < this.markers.length; i++) {
        this.markers[i].setMap(this.map);
    }

};


SMESGMap.prototype.hideLabels = function () {
    "use strict";

    for (var i = 0; i < this.labels.length; i++) {
        this.labels[i].set('map', 'null');
    }


};

SMESGMap.prototype.showLabels = function () {
    "use strict";

    for (var i = 0; i < this.labels.length; i++) {
        this.labels[i].set('map', this.map);
    }

};



SMESGMap.prototype.reverseGeocode = function (cLat, cLng) {
    "use strict";

    return new Promise(function (resolve, reject) {

        var latLng = {
            lat: cLat,
            lng: cLng
        };

        this.geocoder.geocode({
            'location': latLng
        }, function (results, status) {

            if (status === google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    resolve(results[0].formatted_address);
                } else {
                    resolve("");
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
                reject('Geocoder failed due to: ' + status);
            }
        });
    });
};

SMESGMap.prototype.setUpAutoComplete = function (elementId) {

    input = document.getElementById(elementId);

    searchMarker = new google.maps.Marker({
        map: map.map,
        anchorPoint: new google.maps.Point(0, -29)
    });

    this.autoComplete = new google.maps.places.Autocomplete(input);
    this.autoComplete.bindTo('bounds', this.map);

    infoWindow = new google.maps.InfoWindow();

    autoComplete.addListener('place_changed', function () {
        infoWindow.close();
        searchMarker.setVisible(false);
        var place = autoComplete.getPlace();

        if (!place.geometry) {
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.map.fitBounds(place.geometry.viewport);
        } else {
            map.map.setCenter(place.geometry.location);
            map.setZoom(17); // Why 17? Because it will likely be close enough to load marks.
        }
        //Check for marks at new location
        queueRedraw();
        //Add map icon
        searchMarker.setIcon( /** @type {google.maps.Icon} */ ({
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        }));
        searchMarker.setPosition(place.geometry.location);
        searchMarker.setVisible(true);

        var address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }

        infoWindow.setContent('<div><strong>' + place.name + '</strong><br>' + address + '</div>');
        infoWindow.open(map.map, searchMarker);

    });

    searchMarker.addListener('click', function () {
        infoWindow.open(map.map, searchMarker);
    });

};



SMESGMap.prototype.checkSizeofMap = function () {


    var mapBoundsSouthWest = this.map.getBounds().getSouthWest();
    var mapCenter = this.map.getCenter();

    if (typeof mapBounds !== 'undefined') {
        var mapRadius = this.getDistanceKms(mapCenter.lat(), mapCenter.lng(), mapBoundsSouthWest.lat(), mapBoundsSouthWest.lng());

        this.mapSize = (mapRadius / 1000);
    } else {
        this.mapSize = 0;
    }


};

/**
 * Calculate the distance between two points in kilometres
 * @params {number} - coordinate values in latitude and longitude for the two points
 */
SMESGMap.prototype.getDistanceKms = function (point1Lat, point1Lng, point2Lat, point2Lng) {
    var R = 6378137; // Earth’s mean radius
    var dLat = this.calcRad(point2Lat - point1Lat);
    var dLong = this.calcRad(point2Lng - point1Lng);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.calcRad(point1Lat)) * Math.cos(this.calcRad(point2Lat)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    return d; // returns the distance in metres
};

/**
 * Calculate radians for a given value
 * @params {number} x - the input value
 */
SMESGMap.prototype.calcRad = function (x) {
    return x * Math.PI / 180;
};

/**
  Map stlyes for use with Google maps
**/
SMESGMap.prototype.setupMapStyles = function () {
    this.mapStyles = {
        coolGrey: [{
            "featureType": "landscape",
            "elementType": "labels",
            "stylers": [{
                "visibility": "off"
                }]
            }, {
            "featureType": "transit",
            "elementType": "labels",
            "stylers": [{
                "visibility": "off"
                }]
            }, {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [{
                "visibility": "off"
                }]
            }, {
            "featureType": "water",
            "elementType": "labels",
            "stylers": [{
                "visibility": "off"
                }]
            }, {
            "featureType": "road",
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
                }]
            }, {
            "stylers": [{
                "hue": "#00aaff"
            }, {
                "saturation": -100
            }, {
                "gamma": 2.15
            }, {
                "lightness": 12
                }]
            }, {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [{
                "visibility": "on"
            }, {
                "lightness": 24
                }]
            }, {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{
                "lightness": 57
                }]
            }],

        darkGrey: [
            {
                "featureType": "landscape",
                "stylers": [
                    {
                        "saturation": -100
            },
                    {
                        "lightness": 65
            },
                    {
                        "visibility": "on"
            }
        ]
    },
            {
                "featureType": "poi",
                "stylers": [
                    {
                        "saturation": -100
            },
                    {
                        "lightness": 51
            },
                    {
                        "visibility": "simplified"
            }
        ]
    },
            {
                "featureType": "road.highway",
                "stylers": [
                    {
                        "saturation": -100
            },
                    {
                        "visibility": "simplified"
            }
        ]
    },
            {
                "featureType": "road.arterial",
                "stylers": [
                    {
                        "saturation": -100
            },
                    {
                        "lightness": 30
            },
                    {
                        "visibility": "on"
            }
        ]
    },
            {
                "featureType": "road.local",
                "stylers": [
                    {
                        "saturation": -100
            },
                    {
                        "lightness": 40
            },
                    {
                        "visibility": "on"
            }
        ]
    },
            {
                "featureType": "transit",
                "stylers": [
                    {
                        "saturation": -100
            },
                    {
                        "visibility": "simplified"
            }
        ]
    },
            {
                "featureType": "administrative.province",
                "stylers": [
                    {
                        "visibility": "off"
            }
        ]
    },
            {
                "featureType": "water",
                "elementType": "labels",
                "stylers": [
                    {
                        "visibility": "on"
            },
                    {
                        "lightness": -25
            },
                    {
                        "saturation": -100
            }
        ]
    },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "hue": "#ffff00"
            },
                    {
                        "lightness": -25
            },
                    {
                        "saturation": -97
            }
        ]
    }
],

        paleDawn: [{
            "featureType": "administrative",
            "elementType": "all",
            "stylers": [{
                "visibility": "on"
    }, {
                "lightness": 33
    }]
}, {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{
                "color": "#f2e5d4"
    }]
}, {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [{
                "color": "#c5dac6"
    }]
}, {
            "featureType": "poi.park",
            "elementType": "labels",
            "stylers": [{
                "visibility": "on"
    }, {
                "lightness": 20
    }]
}, {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{
                "lightness": 20
    }]
}, {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [{
                "color": "#c5c6c6"
    }]
}, {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [{
                "color": "#e4d7c6"
    }]
}, {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [{
                "color": "#fbfaf7"
    }]
}, {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{
                "visibility": "on"
    }, {
                "color": "#acbcc9"
    }]
}],

        shiftWorker: [{
            "stylers": [{
                "saturation": -100
    }, {
                "gamma": 1
    }]
}, {
            "elementType": "labels.text.stroke",
            "stylers": [{
                "visibility": "off"
    }]
}, {
            "featureType": "poi.business",
            "elementType": "labels.text",
            "stylers": [{
                "visibility": "off"
    }]
}, {
            "featureType": "poi.business",
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
    }]
}, {
            "featureType": "poi.place_of_worship",
            "elementType": "labels.text",
            "stylers": [{
                "visibility": "off"
    }]
}, {
            "featureType": "poi.place_of_worship",
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
    }]
}, {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{
                "visibility": "simplified"
    }]
}, {
            "featureType": "water",
            "stylers": [{
                "visibility": "on"
    }, {
                "saturation": 50
    }, {
                "gamma": 0
    }, {
                "hue": "#50a5d1"
    }]
}, {
            "featureType": "administrative.neighborhood",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#333333"
    }]
}, {
            "featureType": "road.local",
            "elementType": "labels.text",
            "stylers": [{
                "weight": 0.5
    }, {
                "color": "#333333"
    }]
}, {
            "featureType": "transit.station",
            "elementType": "labels.icon",
            "stylers": [{
                "gamma": 1
    }, {
                "saturation": 50
    }]
}],

        simpleLight: [{
            "featureType": "administrative",
            "elementType": "all",
            "stylers": [{
                "visibility": "simplified"
    }]
}, {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [{
                "visibility": "simplified"
    }, {
                "color": "#fcfcfc"
    }]
}, {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{
                "visibility": "simplified"
    }, {
                "color": "#fcfcfc"
    }]
}, {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [{
                "visibility": "simplified"
    }, {
                "color": "#dddddd"
    }]
}, {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [{
                "visibility": "simplified"
    }, {
                "color": "#dddddd"
    }]
}, {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [{
                "visibility": "simplified"
    }, {
                "color": "#eeeeee"
    }]
}, {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{
                "visibility": "simplified"
    }, {
                "color": "#dddddd"
    }]
}],

        muted: [{
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#444444"
    }]
}, {
            "featureType": "administrative.locality",
            "elementType": "labels",
            "stylers": [{
                "visibility": "on"
    }]
}, {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{
                "color": "#f2f2f2"
    }, {
                "visibility": "simplified"
    }]
}, {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{
                "visibility": "on"
    }]
}, {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{
                "visibility": "simplified"
    }, {
                "saturation": "-65"
    }, {
                "lightness": "45"
    }, {
                "gamma": "1.78"
    }]
}, {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [{
                "visibility": "off"
    }]
}, {
            "featureType": "poi",
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
    }]
}, {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{
                "saturation": -100
    }, {
                "lightness": 45
    }]
}, {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [{
                "visibility": "on"
    }]
}, {
            "featureType": "road",
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
    }]
}, {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [{
                "visibility": "simplified"
    }]
}, {
            "featureType": "road.highway",
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
    }]
}, {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
    }]
}, {
            "featureType": "transit.line",
            "elementType": "geometry",
            "stylers": [{
                "saturation": "-33"
    }, {
                "lightness": "22"
    }, {
                "gamma": "2.08"
    }]
}, {
            "featureType": "transit.station.airport",
            "elementType": "geometry",
            "stylers": [{
                "gamma": "2.08"
    }, {
                "hue": "#ffa200"
    }]
}, {
            "featureType": "transit.station.airport",
            "elementType": "labels",
            "stylers": [{
                "visibility": "off"
    }]
}, {
            "featureType": "transit.station.rail",
            "elementType": "labels.text",
            "stylers": [{
                "visibility": "off"
    }]
}, {
            "featureType": "transit.station.rail",
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "simplified"
    }, {
                "saturation": "-55"
    }, {
                "lightness": "-2"
    }, {
                "gamma": "1.88"
    }, {
                "hue": "#ffab00"
    }]
}, {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{
                "color": "#bbd9e5"
    }, {
                "visibility": "simplified"
    }]
}],

        iovation: [{
            "featureType": "all",
            "elementType": "geometry",
            "stylers": [{
                "gamma": "0.82"
    }]
}, {
            "featureType": "all",
            "elementType": "geometry.fill",
            "stylers": [{
                "gamma": "1.21"
    }]
}, {
            "featureType": "all",
            "elementType": "labels",
            "stylers": [{
                "lightness": "-60"
    }]
}, {
            "featureType": "all",
            "elementType": "labels.text",
            "stylers": [{
                "gamma": "5.37"
    }]
}, {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#419d8c"
    }, {
                "lightness": "-39"
    }]
}, {
            "featureType": "all",
            "elementType": "labels.text.stroke",
            "stylers": [{
                "visibility": "on"
    }, {
                "color": "#ffffff"
    }, {
                "lightness": 16
    }]
}, {
            "featureType": "all",
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
    }]
}, {
            "featureType": "administrative",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#fefefe"
    }, {
                "lightness": 20
    }]
}, {
            "featureType": "administrative",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#fefefe"
    }, {
                "lightness": 17
    }, {
                "weight": 1.2
    }]
}, {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [{
                "color": "#f5f5f5"
    }, {
                "lightness": 20
    }]
}, {
            "featureType": "landscape.natural",
            "elementType": "geometry.fill",
            "stylers": [{
                "saturation": "0"
    }]
}, {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{
                "color": "#f5f5f5"
    }, {
                "lightness": 21
    }]
}, {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [{
                "color": "#dedede"
    }, {
                "lightness": 21
    }]
}, {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#ffffff"
    }, {
                "lightness": 17
    }]
}, {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#ffffff"
    }, {
                "lightness": 29
    }, {
                "weight": 0.2
    }]
}, {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [{
                "color": "#ffffff"
    }, {
                "lightness": 18
    }]
}, {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [{
                "color": "#ffffff"
    }, {
                "lightness": 16
    }]
}, {
            "featureType": "transit",
            "elementType": "geometry",
            "stylers": [{
                "color": "#f2f2f2"
    }, {
                "lightness": 19
    }]
}, {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{
                "color": "#e9e9e9"
    }, {
                "lightness": 17
    }]
}, {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#42738d"
    }, {
                "gamma": "5.37"
    }]
}]
    };

};
