/** 
 * The objective of the DataManager is to:
 * 
 * A - provide functions to create and manipulate
 * data given the trackObjects with absolute values.
 * 
 * A.1 - calculate min, avg, max, and which tracks possess the mins and maxes.
 * 
 * A.2 - Apply the relative values, which are the values for each feature category 
 * divded by the max for that feature category for all tracks.   
*/
class DataManager {
	data = {
		max: {
			value: 0,
			trackObject: null,
		},
		avg: {
			value: 0,
			trackObject: null,
		},
		min: {
			value: 0,
			trackObject: null,
		},
	};

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
		// for that in the calculation
		let initMaxes = this.data.max;
		Object.keys(this.trackObjects[0].features.absolute).forEach(
			(key) => (initMaxes[key] = { trackObject: null, value: 0 })
		);

		/**
		 * calculating maxes.
		 * for each key (danceability, energy, etc), there's a corresponding key in data.max
		 * the value at that corresponding key is an object containing the max value, and the track object
		 * the max belongs to
		 */
		for (const trackObject of trackObjects) {
			for (const [key, value] of Object.entries(
				trackObject.features.absolute
			)) {
				if (value > initMaxes[key].value) {
					initMaxes[key].value = value;
					initMaxes[key].trackObject = trackObject;
				}
			}
		}
	}

	calculateMins() {
		// setting every value to inf initially so we don't have to check
		// for that in the calculation
		let initMins = this.data.min;
		Object.keys(this.trackObjects[0].features.absolute).forEach(
			(key) => (initMins[key] = { trackObject: null, value: Infinity })
		);

		/**
		 * calculating mins.
		 * for each key (danceability, energy, etc), there's a corresponding key in data.min
		 * the value at that corresponding key is an object containing the min value, and the track object
		 * the min belongs to
		 */
		for (const trackObject of trackObjects) {
			for (const [key, value] of Object.entries(
				trackObject.features.absolute
			)) {
				if (value < initMins[key].value) {
					initMins[key].value = value;
					initMins[key].trackObject = trackObject;
				}
			}
		}
	}

	calculateAvg() {
		// setting every value to 0 initially so we don't have to check
		// for that in the calculation
		let initAvg = this.data.avg;
		Object.keys(this.trackObjects[0].features.absolute).forEach(
			(key) => (initAvg[key] = 0)
		);

		/**
		 * calculating averages.
		 * for each key (danceability, energy, etc), there's a corresponding key in data.avg
		 * the value at that corresponding key is the average value for that key
		 */
		const avgObject = this.trackObjects.reduce((prev, trackObject) => {
			for (const [key, value] of Object.entries(
				trackObject.features.absolute
			)) {
				prev[key] += value;
			}
			return prev;
		}, initAvg);

		// currently avgObject is a set of totals, not averages
		Object.keys(initAvg).forEach(
			(key) => (avgObject[key] /= this.trackObjects.length)
		);

		this.data.avg = avgObject;
	}

	applyRelativeData() {

        /**
         * taking each value at each key in each track object, dividing that value by the max
         * for that key, then adding the calculated key/value to the relative features object
         * for that trackObject
         */
		this.trackObjects.forEach((trackObject) => {
			const absolute = trackObject.features.absolute;

			Object.keys(absolute).forEach((key) => {
				trackObject.features.relative[key] =
					absolute[key] / this.data.max[key].value;
			});
		});
	}
}

const dataManager = new DataManager(trackObjects);
const calculatedData = dataManager.data;
