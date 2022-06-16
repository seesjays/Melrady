/*
The objective of the dataManager is to:
A - Provide functions to create and manipulate
    data given the data from the trackObjects.
    A.1 - Form datasets for th chartManager
    A.2 - calculate min, avg, maxes and which tracks own those
*/

class DataManager {
    data = {
        max: {},
        avg: {},
        min: {}
    }

    constructor(trackObjects) {
        this.trackObjects = trackObjects;
        if (trackObjects) {
            this.calculateMaxes();
            this.calculateMins();
            this.calculateAvg();
            this.applyRelativeData();
        }
    }

    calculateMaxes() {
        // setting every value to 0 initially so we don't have to check
        // for that in the reducer
        let initMaxes = this.data.max;
        Object.keys(this.trackObjects[0].features.absolute).forEach((key) => initMaxes[key] = 0);

        // calculating totals with a reducer
        // takes every stat from each trackobject's features and
        // adds them to the totalObject
        for (const trackObject of trackObjects) {
            for (const [key, value] of Object.entries(trackObject.features.absolute)) {
                if (value > initMaxes[key].features.absolute[key]) {
                    prev[key] = trackObject;
                }
            }
        }

        this.data.max = maxObject;
    }

    calculateMins() {
        // setting every value to inf initially so we don't have to check
        // for that in the reducer
        let initMins = this.data.min;
        Object.keys(this.trackObjects[0].features.absolute).forEach((key) => initMins[key] = Infinity);

        // calculating totals with a reducer
        // takes every stat from each trackobject's features and
        // adds them to the totalObject
        const minObject = this.trackObjects.reduce(
            (prev, trackObject) => {
                for (const [key, value] of Object.entries(trackObject.features.absolute)) {
                    if (value < prev[key]) {
                        prev[key] = value
                    }
                }
                return prev;
            }, initMins);

        this.data.min = minObject;
    }

    calculateAvg() {
        // setting every value to 0 initially so we don't have to check
        // for that in the reducer
        let initAvg = this.data.avg;
        Object.keys(this.trackObjects[0].features.absolute).forEach((key) => initAvg[key] = 0);

        // calculating totals with a reducer
        // takes every stat from each trackobject's features and
        // adds them to the totalObject
        const avgObject = this.trackObjects.reduce((prev, trackObject) => {
            for (const [key, value] of Object.entries(trackObject.features.absolute)) {
                prev[key] += value;
            }
            return prev;
        }, initAvg);

        // currently avgObject is a set of totals, not averages
        Object.keys(initAvg).forEach(key => avgObject[key] /= this.trackObjects.length);

        this.data.avg = avgObject;
    }

    applyRelativeData() {
        this.trackObjects.forEach(trackObject => {
            const absolute = trackObject.features.absolute;

            for (const [key, value] of Object.entries(this.data.max)) {
                trackObject.features.relative[key] = absolute[key] / value.features.absolute[key];
            }
        });
    }
}

const dataManager = new DataManager(trackObjects);
const calculatedData = dataManager.data;