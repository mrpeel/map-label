/*global document, google*/

google.maps.event.addListener(infowindow, 'domready', function () {

    // Reference to the DIV which receives the contents of the infowindow using jQuery
    var iwOuter = document.getElementsByClassName('.gm-style-iw');


    /* The DIV we want to change is above the .gm-style-iw DIV.
     */
    var iwBackground = iwOuter[0].parentElement;

    // Remove the background shadow DIV
    iwBackground.children(':nth-child(2)').css({
        'display': 'none'
    });

    // Remove the white background DIV
    iwBackground.children(':nth-child(4)').css({
        'display': 'none'
    });

});
