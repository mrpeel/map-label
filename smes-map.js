/** SMESGMap class encapsulating the maps functionality required to load a map with custom controls,
    set-up markers and and infor windows
*/

/*global Promise, google, document, navigator, console, MapLabel, InfoBox, window*/

/** 
 * 
 * PassOff uses BKDF2 to generate salted password and HMAC256 to generate a seed.  The seed is then ued to generate a password based on
    a chosen template.
 */
var SMESGMap = function (elementId, options) {
  "use strict";

  var melbourneCenter = new google.maps.LatLng(-37.813942, 144.9711861);

  this.setupMapStyles();

  options = options || {};

  options.mapOptions = options.mapOptions || {
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

  this.mapOptions = options.mapOptions;

  this.markers = [];
  this.labels = [];
  this.currentZoom = 1;
  this.markerIcons = [];
  this.markerSize = 10;
  this.markersVisible = true;
  this.labelsVisible = false;

  this.map = new google.maps.Map(document.getElementById(elementId), this.mapOptions);
  this.geocoder = new google.maps.Geocoder();
  this.infoWindow = new google.maps.InfoWindow();
  this.infoBox = new InfoBox({
    content: document.getElementById("infobox"),
    disableAutoPan: false,
    maxWidth: 440,
    pixelOffset: new google.maps.Size(-220, 0),
    zIndex: 6,
    /*boxStyle: {
        background: "url('http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/examples/tipbox.gif') no - repeat",
        opacity: 0.75 //,
            //width: "280px"
    },*/
    closeBoxURL: "",
    infoBoxClearance: new google.maps.Size(4, 4)
  });

  var self = this;

  /*self.markerClusterer = new MarkerClusterer(self.map, [], {
    gridSize: 10,
    maxZoom: 10
  });*/

  google.maps.event.addListener(self.map, 'zoom_changed', function () {
    self.checkSizeofMap();
    self.setZoomLevel();
  });


  if (typeof options.zoomChanged === "function") {
    google.maps.event.addListener(self.map, 'zoom_changed', function (e) {
      if (e === undefined) {
        e = self;
      }

      options.zoomChanged.apply(self, [e]);

    });

  }


  google.maps.event.addListener(self.map, 'idle', function () {
    self.refreshMarkers();
  });


  if (typeof options.idle === "function") {
    google.maps.event.addListener(self.map, 'idle', function (e) {
      if (e === undefined) {
        e = self;
      }

      options.idle.apply(self, [e]);

    });

  }

  /* Enable custom styling when the infowindow is displayed*/
  var lInfoBox = self.infoBox;
  google.maps.event.addListener(lInfoBox, 'domready', function () {
    var closeButt = document.getElementById("close-info-box");

    if (closeButt) {
      closeButt.addEventListener("click", function () {
        lInfoBox.setVisible(false);
        self.resetSelectedMarker();
      });
    }


  });


  //Attempt oto move map to current user coordinates
  self.geoLocate();


};

SMESGMap.prototype.geoLocate = function () {
  "use strict";

  var self = this;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        var geoPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        self.map.setCenter(geoPosition);
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

SMESGMap.prototype.addMarker = function (marker) {
  "use strict";

  //Capture local reference of map for use in click functions
  var self = this;
  var markerLat, markerLng, markerTitle, markerIcon, nineFigureNo, infoWindowContent, eventListeners, mapReference;

  markerLat = marker.lat;
  markerLng = marker.lng;
  markerTitle = marker.title;
  markerIcon = marker.icon;
  nineFigureNo = marker.nineFigureNo;
  infoWindowContent = marker.infoWindowContent;
  eventListeners = marker.eventListeners || null;

  //Check whether marker should be visible on the map or not, only set the mapReference if markers are being displayed
  if (self.markersVisible) {
    mapReference = self.map;
  }


  var icon = {
    url: markerIcon + ".svg",
    size: new google.maps.Size(self.markerSize, self.markerSize),
    scaledSize: new google.maps.Size(self.markerSize, self.markerSize)
  };


  var mapMarker = new google.maps.Marker({
    position: new google.maps.LatLng(markerLat, markerLng),
    title: markerTitle,
    map: mapReference,
    draggable: false,
    icon: icon,
    animation: google.maps.Animation.DROP,
    infoContent: infoWindowContent,
    nineFigureNo: nineFigureNo,
  });

  //self.markerClusterer.addMarker(mapMarker);


  mapMarker.addListener('click', function () {
    //self.infoWindow.setContent(mapMarker.infoContent); //infoWindowContent);
    //self.infoWindow.open(self.map, this);
    var infoBoxEl = document.getElementById("infobox");
    infoBoxEl.innerHTML = mapMarker.infoContent;
    self.setSelectedMarker(mapMarker);
    self.infoBox.open(self.map, this);
    self.infoBox.setVisible(true);
    self.map.panTo(mapMarker.position);


    if (eventListeners && eventListeners.click) {
      eventListeners.click.apply();
    }

    //Make sure that this doesn't fire before the rendering has completed
    if (eventListeners && eventListeners.domready) {
      window.setTimeout(function () {
        eventListeners.domready.apply(this);
      }, 0);
    }


  });


  self.markers.push(mapMarker);


  //If labels are being displayed, add the label as well
  if (self.labelsVisible) {
    //Create label and add to nmap
    var label = {};
    label.position = new google.maps.LatLng(markerLat, markerLng);
    markerTitle = marker.title;
    label.label = marker.title;
    label.nineFigureNo = marker.nineFigureNo;
    self.addLabel(label);
  }

};

SMESGMap.prototype.updateMarker = function (marker) {
  "use strict";

  //Capture local reference of map for use in click functions
  var self = this;

  var markerLat, markerLng, markerTitle, markerIcon, nineFigureNo, infoWindowContent, eventListeners;
  var mapMarker, icon;

  markerLat = marker.lat;
  markerLng = marker.lng;
  markerTitle = marker.title;
  markerIcon = marker.icon;
  nineFigureNo = marker.nineFigureNo;
  infoWindowContent = marker.infoWindowContent;


  for (var i = 0; i < self.markers.length; i++) {
    if (self.markers[i].nineFigureNo === nineFigureNo) {
      mapMarker = self.markers[i];
      break;
    }
  }

  //If a marker was found and defined continue processing
  if (mapMarker) {
    icon = {
      url: markerIcon + ".svg",
      size: new google.maps.Size(self.markerSize, self.markerSize),
      scaledSize: new google.maps.Size(self.markerSize, self.markerSize)
    };

    mapMarker.setIcon(icon);
    mapMarker.setPosition(new google.maps.LatLng(markerLat, markerLng));
    mapMarker.setTitle(markerTitle);
    mapMarker.infoContent = infoWindowContent;
  }

  for (var j = 0; j < self.markers.length; j++) {
    if (self.markers[j].nineFigureNo === nineFigureNo) {
      self.markers.splice(j, 1);
      break;
    }
  }

};

SMESGMap.prototype.setSelectedMarker = function (marker) {
  "use strict";

  var self = this;
  var icon = marker.icon;
  var url = icon.url;
  var newSize;

  self.resetSelectedMarker();

  //Ensure that the shadow version isn't already referenced
  url = url.replace("selected-", "");

  var lastSlash = url.lastIndexOf("/");

  url = url.substr(0, lastSlash + 1) + "selected-" + url.substr(lastSlash + 1);

  newSize = self.markerSize * 2;
  icon.scaledSize = new google.maps.Size(newSize, newSize);
  icon.size = new google.maps.Size(newSize, newSize);
  icon.url = url;

  marker.setIcon(icon);
  marker.isSelected = true;
};

SMESGMap.prototype.resetSelectedMarker = function () {
  "use strict";

  var self = this;
  var icon, url;

  for (var i = 0; i < self.markers.length; i++) {

    //Check if icon is larger and reset as necessary
    if (self.markers[i].isSelected) {
      icon = self.markers[i].icon;
      url = icon.url;

      //Ensure that the shadow version isn't referenced anymore for image
      url = url.replace("selected-", "");

      icon.scaledSize = new google.maps.Size(self.markerSize, self.markerSize);
      icon.size = new google.maps.Size(self.markerSize, self.markerSize);
      icon.url = url;

      self.markers[i].setIcon(icon);
      delete self.markers[i].isSelected;
    }
  }

};

SMESGMap.prototype.addLabel = function (label) {
  "use strict";

  var self = this;

  //Only reference the map if this label can be shown now
  var mapLabel = new MapLabel({
    text: label.label,
    position: label.position,
    map: self.map,
    fontFamily: "'Muli', sans-serif",
    strokeWeight: 6,
    fontColor: 'rgba(28, 43, 139, 0.87)',
    strokeColor: 'rgba(245, 245, 245, 0.87)',
    fontSize: 12,
    align: 'center',
    nineFigureNo: label.nineFigureNo
  });

  self.labels.push(mapLabel);

};


SMESGMap.prototype.setZoomLevel = function () {
  "use strict";

  var self = this;
  var zoomLevel = this.map.getZoom();

  //If zoom level has changed, depending on old and new zoom levels marks need to be shown or hidden
  if (!self.zoomLevel || self.zoomLevel !== zoomLevel) {

    if (zoomLevel < 14 && (!self.zoomLevel || self.zoomLevel >= 14)) {
      //self.hideMarkers();
      self.markersVisible = false;
    } else if (zoomLevel >= 14 && (!self.zoomLevel || self.zoomLevel < 14)) {
      //self.showMarkers();
    }

    if (zoomLevel >= 14) {
      self.markerResizeRequired = true;
      self.markersVisible = true;
    }

    if (zoomLevel >= 19) {
      self.labelsVisible = true;

    } else {
      self.labelsVisible = false;
    }

  }

  //Reset zoomLevel
  self.zoomLevel = self.map.getZoom();
  self.markerSize = 9 + ((self.zoomLevel - 14) * 1.75);

};


SMESGMap.prototype.clearLabels = function () {
  "use strict";

  var self = this;

  //Disconnect labels from the map
  for (var i = 0; i < self.labels.length; i++) {
    self.labels[i].setMap(null);
  }

  //Truncate the labels array
  self.labels.length = 0;
};

SMESGMap.prototype.refreshMarkers = function () {
  "use strict";

  var icon, newSize, position;
  var self = this;
  var bounds = self.map.getBounds();

  //Start by lcearing all labels
  self.clearLabels();

  //Loop through the markers and re-szie their icons
  for (var markerCounter = 0; markerCounter < self.markers.length || 0; markerCounter++) {
    //Check whether we need to worry about this marker
    position = self.markers[markerCounter].position;

    //  If markers are not being displayed or this marker isn't in the viewport then make sure it is hidden and move on
    if (!self.markersVisible || !bounds.contains(position)) {
      if (self.markers[markerCounter].map) {
        self.markers[markerCounter].setMap(null);
      }
    } else {
      //Retrieve the marker icon and re-set its size
      icon = self.markers[markerCounter].icon;
      newSize = self.markerSize || 14;

      if (self.markers[markerCounter].isSelected) {
        newSize = newSize * 2;
      }

      //Only update icon if it is not already the correct size
      if (icon.size.width !== newSize) {
        //Resize the marker icon
        icon.scaledSize = new google.maps.Size(newSize, newSize);
        icon.size = new google.maps.Size(newSize, newSize);

        //Update icon
        self.markers[markerCounter].setIcon(icon);
      }

      //If the item isn't already being displayed, set the map
      if (!self.markers[markerCounter].map) {
        self.markers[markerCounter].setMap(self.map);
      }

      //Check whether the labels are being displayed, if so add to map
      if (self.labelsVisible) {
        //Create label and add to nmap
        var label = {};
        label.position = position;
        label.label = self.markers[markerCounter].title;
        label.nineFigureNo = self.markers[markerCounter].nineFigureNo;
        self.addLabel(label);
      }

    }
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
  "use strict";

  var self = this;
  var input = document.getElementById(elementId);
  var searchInfoWindow = new google.maps.InfoWindow();

  var searchMarker = new google.maps.Marker({
    map: self.map,
    anchorPoint: new google.maps.Point(0, -29)
  });

  self.autoComplete = new google.maps.places.Autocomplete(input);
  self.autoComplete.bindTo('bounds', self.map);


  self.autoComplete.addListener('place_changed', function () {
    searchInfoWindow.close();
    searchMarker.setVisible(false);
    var place = self.autoComplete.getPlace();

    if (!place.geometry) {
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      self.map.fitBounds(place.geometry.viewport);
    } else {
      self.map.setCenter(place.geometry.location);
      self.map.setZoom(17); // Why 17? Because it will likely be close enough to load marks.
    }

    //Add map icon
    //searchMarker.setIcon( /** @type {google.maps.Icon} */ 
    /*({
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(35, 35)
    }));*/
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

    searchInfoWindow.setContent('<div><strong>' + place.name + '</strong><br>' + address + '</div>');
    searchInfoWindow.open(self.map, searchMarker);

  });

  searchMarker.addListener('click', function () {
    searchInfoWindow.open(self.map, searchMarker);
  });

};



SMESGMap.prototype.checkSizeofMap = function () {
  "use strict";

  var mapBoundsSouthWest = this.map.getBounds().getSouthWest();
  var mapCenter = this.map.getCenter();
  var self = this;

  if (typeof mapBoundsSouthWest !== 'undefined' && typeof mapCenter !== 'undefined') {
    var mapRadius = self.getDistanceKms(mapCenter.lat(), mapCenter.lng(), mapBoundsSouthWest.lat(), mapBoundsSouthWest.lng());

    self.mapSize = (mapRadius / 1000);
  } else {
    self.mapSize = 0;
  }


};

/**
 * Calculate the distance between two points in kilometres
 * @params {number} - coordinate values in latitude and longitude for the two points
 */
SMESGMap.prototype.getDistanceKms = function (point1Lat, point1Lng, point2Lat, point2Lng) {
  "use strict";

  var self = this;
  var R = 6378137; // Earth’s mean radius
  var dLat = self.calcRad(point2Lat - point1Lat);
  var dLong = self.calcRad(point2Lng - point1Lng);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(self.calcRad(point1Lat)) * Math.cos(self.calcRad(point2Lat)) *
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
  "use strict";

  return x * Math.PI / 180;
};

/**
  Map stlyes for use with Google maps
**/
SMESGMap.prototype.setupMapStyles = function () {
  "use strict";

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
}],
    Ultralight: [{
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{
        "color": "#e9e9e9"
            }, {
        "lightness": 17
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
      "elementType": "labels.text.stroke",
      "stylers": [{
        "visibility": "on"
            }, {
        "color": "#ffffff"
            }, {
        "lightness": 16
            }]
        }, {
      "elementType": "labels.text.fill",
      "stylers": [{
        "saturation": 36
            }, {
        "color": "#333333"
            }, {
        "lightness": 40
            }]
        }, {
      "elementType": "labels.icon",
      "stylers": [{
        "visibility": "off"
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
        }]
  };

};
