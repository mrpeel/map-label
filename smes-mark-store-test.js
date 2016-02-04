/* global SMESMarkStore, dataResponse, document, console, dataResponse, overlapDataResponse */

function testSMESMarkStore() {

    var testMarkStore = new SMESMarkStore();

    testMarkStore.processRetrievedMarks(dataResponse.data).then(function () {
        console.log("New index");
        console.log(testMarkStore.newIndex);
        console.log("Update index");
        console.log(testMarkStore.updateIndex);
        return testMarkStore.processRetrievedMarks(overlapDataResponse.data);
    }).then(function () {
        console.log("New index");
        console.log(testMarkStore.newIndex);
        console.log("Update index");
        console.log(testMarkStore.updateIndex);
        console.log("Data store");
        console.log(testMarkStore.markData);
    });




}
