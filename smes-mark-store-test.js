/* global SMESMarkStore, dataResponse, document, console, dataResponse, overlapDataResponse */

function testSMESMarkStore() {

    var testMarkStore = new SMESMarkStore();
    var nineFig, day, updateDate;

    testMarkStore.processRetrievedMarks(dataResponse.data).then(function () {
        return testMarkStore.processRetrievedMarks(overlapDataResponse.data);
    }).then(function () {

        updateDate = new Date();

        day = updateDate.getDate();

        //Change the last update to yesterday and re-process the data
        for (nineFig in testMarkStore.markData) {
            testMarkStore.markData[nineFig].lastUpdated = updateDate.setDate(day - 1);
        }

        return testMarkStore.processRetrievedMarks(dataResponse.data);
    }).then(function () {

        //Change the last update to 8 days ago and reprocess the data
        updateDate = new Date();

        day = updateDate.getDate();

        //Change the last update to yesterday and re-process the data
        for (nineFig in testMarkStore.markData) {
            testMarkStore.markData[nineFig].lastUpdated = updateDate.setDate(day - 8);
        }

        return testMarkStore.processRetrievedMarks(dataResponse.data);
    }).then(function () {

        //Change the last update to 15 days ago and reprocess the data
        //Change the last update to 8 days ago and reprocess the data
        updateDate = new Date();

        day = updateDate.getDate();

        //Change the last update to yesterday and re-process the data
        for (nineFig in testMarkStore.markData) {
            testMarkStore.markData[nineFig].lastUpdated = updateDate.setDate(day - 15);
        }

        testMarkStore.saveMarksToStorage();
    });


    testMarkStore.requestMarkInformation(-37.813942, 144.976, 0.5, callbackTest);
    testMarkStore.requestMarkInformation(-37.813942, 144.976, 0.5, callbackTest);
    testMarkStore.requestMarkInformation(-37.813942, 144.976, 0.5, callbackTest);
    testMarkStore.requestMarkInformation(-37.813942, 144.976, 0.5, callbackTest);
    testMarkStore.requestMarkInformation(-37.813942, 144.976, 0.5, callbackTest);
    testMarkStore.requestMarkInformation(-37.813942, 144.976, 0.5, callbackTest);
    testMarkStore.requestMarkInformation(-37.813942, 144.976, 0.5, callbackTest);
    testMarkStore.requestMarkInformation(-37.813942, 144.976, 0.5, callbackTest);
    testMarkStore.requestMarkInformation(-37.813942, 144.976, 0.5, callbackTest);
    testMarkStore.requestMarkInformation(-37.813942, 144.981, 0.5, callbackTest);
    console.log(testMarkStore.newIndex);

}

function callbackTest() {
    console.log("callback");
}
