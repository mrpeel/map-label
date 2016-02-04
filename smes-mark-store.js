/*global Promise, setTimeout, window, document, console, navigator, self, MouseEvent, Blob, FileReader, module, atob, Uint8Array, define */
/*global ReverseGeocoder, xr */


var SMESMarkStore = function () {
    "use strict";

    this.useLocalStore = this.localStorageAvailable();
    this.maxRequests = 30;
    this.perNumberOfSeconds = 60;
    this.lastStorageTimeStamp = Date.now();
    this.baseURL = 'https://maps.land.vic.gov.au/lvis/services/smesDataDelivery';

    if (this.useLocalStore) {
        this.retrieveStoredMarks();
    } else {
        this.markData = {};
    }

    this.updateIndex = [];
    this.newIndex = [];

};


SMESMarkStore.prototype.localStorageAvailable = function () {
    "use strict";

    try {
        var storage = window.localStorage,
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return false;
    }
};

SMESMarkStore.prototype.retrieveStoredMarks = function () {
    "use strict";

    var storedData;

    if (!this.useLocalStore) {
        return;
    }

    storedData = window.localStorage.getItem('smes-mark-data');

    if (storedData) {
        this.markData = JSON.parse(storedData);
        //Remove data older than 14 days
        this.markData = this.removeOldMarks(14);

    } else {
        this.markData = {};
    }




};

SMESMarkStore.prototype.saveMarksToStorage = function () {
    "use strict";

    if (!this.useLocalStore) {
        return;
    }

    var self = this;
    var storageTimeStamp, culledMarkData;

    //Set timestamp for last storage
    self.lastStorageTimeStamp = Date.now();
    storageTimeStamp = self.lastStorageTimeStamp;

    //Set function to write storage after 30 seconds.
    // if another write request comes in within 30 seconds, this.lastStorageTimeStamp variable will have changed and the write will be aborted.
    window.setTimeout(function () {
        if (storageTimeStamp === self.lastStorageTimeStamp) {
            try {
                window.localStorage.setItem('smes-mark-data', JSON.stringify(self.markData));
            } catch (e) {
                try {
                    //Check total size - if >= 5MB then start culling - attempt to only store marks retrieved within the last 7 days
                    if (JSON.stringify(culledMarkData).length > 5000000) {
                        culledMarkData = self.removeOldMarks(7);
                    }

                    //Check total size - if still >= 5MB then start culling - attempt to only store marks retrieved in the last day
                    if (JSON.stringify(culledMarkData).length > 5000000) {
                        culledMarkData = self.removeOldMarks(7);
                    }

                    window.localStorage.setItem('smes-mark-data', JSON.stringify(culledMarkData));
                } catch (e) {
                    //Give up
                    console.log("Write to local storage failed");
                }
            }
        }
    }, 30000);

};

SMESMarkStore.prototype.removeOldMarks = function (numberOfDays) {
    "use strict";

    var individualMark;
    var comparisonDate;
    var newMarkData = this.markData;

    for (individualMark in newMarkData) {
        if (this.isNumberOfDaysOld(individualMark.lastUpdate, numberOfDays)) {
            delete newMarkData[individualMark];
        }
    }

    return newMarkData;
};

SMESMarkStore.prototype.isNumberOfDaysOld = function (dateValue, number) {
    "use strict";

    var comparisonDate = new Date(dateValue);
    var todaysDate = new Date();
    var msecPerDay = 1000 * 60 * 60 * 24;

    // Get the difference in milliseconds.
    var interval = todaysDate.getTime() - comparisonDate.getTime();

    // Calculate how many days the interval contains. Subtract that
    // many days from the interval to determine the remainder.
    var days = Math.floor(interval / msecPerDay);

    if (days >= number) {
        return true;
    } else {
        return false;
    }


};

SMESMarkStore.prototype.queueRetrieveMarkInformation = function (cLat, cLong, cRadius, callback) {
    "use strict";

    var self = this;
    var currentRequestTimeStamp = Date().now;
    //Set minimum time daly before executing web service request - this functions as a de-bounce operation
    var executionDelay = 500;

    //Record the last request queued time
    self.lastQueuedTimeStamp = currentRequestTimeStamp;
    var minInterval = (self.perNumberOfSeconds / self.maxRequests) * 1000;


    //If there has already been a request to the server, make sure this request doesn't execute until the minimum interval time
    if (self.lastSuccesfullRetrieve) {
        //Calulate the interval since tghe last request went through
        var currentInterval = currentRequestTimeStamp - self.lastSuccesfullRetrieve;

        //Reset execution delay to the remaining interval plus the standard execution delay
        if (currentInterval < minInterval) {
            executionDelay = minInterval - currentInterval + executionDelay;
        }
    }

    //Execute the logic after the appropriate wait
    window.setTimeout(function () {
        //Check if this is still the most recently queued request
        if (currentRequestTimeStamp === self.lastQueuedTimeStamp) {
            self.lastSuccesfullRetrieve = Date.now();
            self.retrieveMarkInformation.then(function (marksRetrieved) {
                //Check data element is present, if so process it, and run the callback function
                if (marksRetrieved.data) {
                    self.processRetrievedMarks(marksRetrieved.data).then(function () {
                        callback.apply();
                    });

                }
            }).catch(function (err) {
                console.log(err);
            });

        }
    }, executionDelay);


};

SMESMarkStore.prototype.processRetrievedMarks = function (retrievedData) {
    "use strict";

    var self = this;
    var dataObject, dataHash, objectProp;

    return new Promise(function (resolve, reject) {


        //reset indexes of new and updates marks
        self.updateIndex = [];
        self.newIndex = [];

        for (var i = 0; i < retrievedData.length; i++) {
            dataObject = retrievedData[i];

            //Check whether this mark is already in the store
            if (!self.markData[dataObject.nineFigureNumber]) {
                //Don't have mark, so add it
                dataHash = self.calculateDataHash(dataObject);
                self.addUpdateValueInStore(dataObject, dataHash);
                self.newIndex.push(dataObject.nineFigureNumber);

            } else {
                //Already have this mark - Check whether the mark was last retrieved within a day
                if (self.isNumberOfDaysOld(self.markData[dataObject.nineFigureNumber].lastUpdated || 0, 1)) {
                    //Check whether mark information has changed - using a simple data hash
                    dataHash = self.calculateDataHash(dataObject);

                    if (dataHash !== self.markData[dataObject.nineFigureNumber].dataHash) {
                        //data has changed so store data, store hash, remove address, and update lastUpdated
                        self.addUpdateValueInStore(dataObject, dataHash);
                        self.updateIndex.push(dataObject.nineFigureNumber);
                    }
                }

            }

        }

        resolve(true);

        //Trigger process to save marks into browser storage
        self.saveMarksToStorage();

    });


};

SMESMarkStore.prototype.calculateDataHash = function (dataObject) {
    "use strict";

    var objectProp, dataHash;

    dataHash = "";

    //Simple concatenation of the properties of the object - up to 24 vals
    for (objectProp in dataObject) {
        dataHash = dataHash + dataObject[objectProp];
    }

    return dataHash;
};

SMESMarkStore.prototype.addUpdateValueInStore = function (dataObject, dataHash) {
    "use strict";

    if (!this.markData[dataObject.nineFigureNumber]) {
        this.markData[dataObject.nineFigureNumber] = {};
    }

    this.markData[dataObject.nineFigureNumber].data = dataObject;
    this.markData[dataObject.nineFigureNumber].dataHash = dataHash;
    delete this.markData[dataObject.nineFigureNumber].address;
    this.markData[dataObject.nineFigureNumber].lastUpdated = Date.now();

};

SMESMarkStore.prototype.setAddress = function (nineFigureNumber, address) {
    "use strict";

    this.markData[nineFigureNumber].address = address;

};

/**
 * Call the getMarkInfornmation web service.  
 * @param {number} cLat, cLong - the coordinates for the center of the radius to search in
 * @return {promise} a promise which will resolve a data structure which contains the mark information 
 */
SMESMarkStore.prototype.retrieveMarkInformation = function (cLat, cLong, cRadius) {
    "use strict";


    return new Promise(function (resolve, reject) {
        xr.get(this.baseURL + '/getMarkInformation', {
                searchType: "Location",
                latitude: cLat,
                longitude: cLong,
                radius: cRadius,
                format: "Full"
            })
            .then(function (jsonResponse) {

                //Check for success - the messages element will not be present for success
                if (typeof jsonResponse.messages === 'undefined') {
                    //Results returned
                    resolve(jsonResponse.data);
                } else {
                    //Error returned
                    //Check for too many marks
                    if (jsonResponse.messages.message === "More than 250 marks were found for this search. Please refine your search criteria.") {
                        //Add message that the area has too many marks
                        console.log("Too many marks");
                        reject("Too many marks");

                    } else if (jsonResponse.messages.message === "No survey marks matched the criteria provided.") {
                        //Check for no marks
                        console.log("No marks found");
                        reject("No marks found");
                    } else {
                        //another message returned, log it
                        console.log(jsonResponse.messages.message);
                        reject("Webservice error");
                    }
                }

            })
            .catch(function (err) {
                console.log(err);
                return Promise.reject(err);
            });
    });

};

/**
 * Call the getSurveyMarSketches web service.  This is being called for a specific mark using its Nine Figure Number.
 * @param {string} nineFigureNumber - the mark's Ninem Figure Number
 * @return {promise} a promise which will resolve a data structure which contains the base64 encoded PDF 
 */

SMESMarkStore.prototype.getSurveyMarkSketchResponse = function (nineFigureNumber) {
    "use strict";

    return new Promise(function (resolve, reject) {
        xr.get(this.baseURL + '/getSurveyMarkSketches', {
                markList: nineFigureNumber,
                returnDefective: true
            })
            .then(function (jsonResponse) {

                //Check for success - the messages element will not be present for success
                if (typeof jsonResponse.messages === 'undefined') {
                    //Results returned
                    resolve(jsonResponse.data);
                } else {
                    //Error returned
                    //another message returned, log it
                    console.log(jsonResponse.messages.message);
                    reject("Webservice error");
                }

            })
            .catch(function (err) {
                console.log(err);
                return Promise.reject(err);
            });
    });
};

/**
 * Call the getSurveyMarkReports web service.  This is being called for a specific mark using its Nine Figure Number
 * @param {string} nineFigureNumber - the mark's Nine Figure Number
 * @return {promise} a promise which will resolve a data structure which contains the base64 encoded PDF 
 */
SMESMarkStore.prototype.getSurveyMarkReportResponse = function (nineFigureNumber) {
    "use strict";

    return new Promise(function (resolve, reject) {
        xr.get(this.baseURL + '/getSurveyMarkReports', {
                markList: nineFigureNumber,
                returnDefective: true
            })
            .then(function (jsonResponse) {

                //Check for success - the messages element will not be present for success
                if (typeof jsonResponse.messages === 'undefined') {
                    //Results returned
                    resolve(jsonResponse.data);
                } else {
                    //Error returned
                    //another message returned, log it
                    console.log(jsonResponse.messages.message);
                    reject("Webservice error");
                }

            })
            .catch(function (err) {
                console.log();
                return Promise.reject(err);
            });
    });
};
