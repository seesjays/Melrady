// this is a mess.
/*
The objective of the chartManager is to:
A. Form and attach the chart.js instance to an element on the stats page
- If trackObjects is undefined, chartManager does nothing
B. Provide controls for the user to modify how the data is displayed
- Bar vs Radar
	Bars are better at displaying the data sometimes, particularly when the data points are close together.
	Radars are the signature display form, and provide an easier way to gain understanding frmo
		multiple data points. The datapoints aren't split up into their individual groups,
		which makes for an easier time comparing each song, as radar areas are overlaid atop
		one another.
- Colors
	Colors that match the album art (sourced from backend)
	Shades of green
	Static unique colors that are far apart
- Showing/Hiding different charts on the album
*/

// Track Object Array should already exist as trackObjects, this script's the last on the page.
// But we want a local reference, so:

class ChartManager {
	trackObjects = [];

	mode = "radar";

	colorProfiles = {
		green: ["29, 185, 84", "21, 158, 66", "11, 131, 50", "0, 106, 34"],
		unique: ["114, 224, 106", "126, 132, 250", "222, 61, 130", "246, 133, 17"],
		art: null,
	};
	colorProfile = "art";

	legendContainer = "album-cover-row";

	#categoryLabels = [
		"danceability",
		"duration",
		"energy",
		"speechiness",
		"tempo",
		"valence",
	];

	/**
	 * @param {Object[]} trackObjects - An array of fully formed track objects.
	 * @param {Object} chartManagerOptions - Overrides for the ChartManager's defaults
	 * @param {"radar"|"bar"} chartManagerOptions.mode - The type of chart to use initially
	 * @param {"art"|"unique"|"green"} chartManagerOptions.colorProfile = "art" - Which color profile to use initially.
	 * Art is calculated via the album art, unique is a set of very distinct colors for visibility, and green is a nice
	 * (though admittedly somewhat visible to distinguish since they're just different shades) gradient of greens.
	 * @param {string} [chartManagerOptions.legendContainer="album-cover-row"] - The ID of the element used to contain the
	 * HTMLElement legends that replace the chart's default legends
	 */
	constructor(trackObjects, chartManagerOptions) {
		if (trackObjects) {
			this.trackObjects = trackObjects;

			this.colorProfiles.art = trackObjects.map((trackObject) =>
				trackObject.color.join(", ")
			);

			if (chartManagerOptions?.mode) {
				this.mode = chartManagerOptions.mode;
			}

			if (chartManagerOptions?.colorProfile) {
				this.colorProfile = chartManagerOptions.colorProfile;
			}

			if (chartManagerOptions?.legendContainer) {
				this.legendContainer = chartManagerOptions.legendContainer;
			}
		}
	}

	/**
	 * Initializes the chart with the correct HTML element, as well as setting its initial options
	 */
	initializeChart() {
		const canvasContainer = document.getElementById("canvas-container");
		const ctx = document.getElementById("track-chart").getContext("2d");

		canvasContainer.width = canvasContainer.clientWidth;
		canvasContainer.height = canvasContainer.clientHeight;

		const options = optionsForMode(this.mode);
		this.chart = new Chart(ctx, {
			type: this.mode,
			data: {
				labels: this.#categoryLabels,
				datasets: [],
			},
			options: options,
		});

		function optionsForMode(mode) {
			const base = {
				responsive: true,
				plugins: {
					albumlegends: {
						containerID: "#album-cover-row",
					},
					legend: {
						display: false,
					},
				},
			}

			if (mode === "radar") {
				base.scales = {
					r: {
						angleLines: {},
						min: 0,
						max: 1.0,
						ticks: {
							display: false,
						},
					},
				}
			} else {
				base.scales = {
					xAxes: {
						display: true,
					},
					yAxes: {
						ticks: {
							display: false,
						},
					},
				}
				base.elements = {
					bar: { borderWidth: 2 },
				}
			}

			return base;
		}
	}

	/**
	 * Creates the datasets to be applied to the chart
	 * @returns a list of ChartJS friendly datasets, with the datapoints being the calculated relative values
	 * for each (used) category in the trackObject
	 */
	generateDataset() {
		return this.trackObjects.map((trackObject, index) => {
			// guard against the event where the relative values haven't
			// been calculated yet
			if (!trackObject.features.relative) return {};

			// use the proper RGB color profile
			let colorProfileRGB;
			if (this.colorProfile == "art") {
				colorProfileRGB = trackObject.color;
			} else if (this.colorProfile == "unique") {
				colorProfileRGB = this.colorProfiles.unique[index];
			} else if (this.colorProfile == "green") {
				colorProfileRGB = this.colorProfiles.green[index];
			}

			const data = this.#categoryLabels.map(
				(label) => trackObject.features.relative[label]
			);
			const borderColor = `rgba(${colorProfileRGB}, 0.9)`;
			const backgroundColor = `rgba(${colorProfileRGB}, 0.1)`;
			return {
				label: trackObject.trackData.trackName,
				data: data,
				backgroundColor: backgroundColor,
				pointBackgroundColor: borderColor,
				pointHoverBackgroundColor: backgroundColor,
				borderColor: borderColor,
				pointBorderColor: borderColor,
				pointHoverBorderColor: backgroundColor,
			};
		});
	}

	/**
	 * Sets the chart's current dataset to the one supplied.
	 * @param {Object[]} datasets 
	 */
	setDataset(datasets) {
		this.chart.data = {
			labels: this.#categoryLabels,
			datasets: datasets,
		};
		this.chart.update();
	}

	/**
	 * Transitions between color profiles without generating an entirely new dataset with the new color.
	 * @param {"art"|"unique"|"green"} newColorProfile - Which color profile to swap to.
	 */
	updateChartColors(newColorProfile) {
		if (this.colorProfile === newColorProfile) return false;
		this.colorProfile = newColorProfile;

		const chart = this.chart;
		const colorProfileRGBArray = this.colorProfiles[newColorProfile];

		for (let i = 0; i < chart.data.datasets.length; i++) {
			const borderColor = `rgba(${colorProfileRGBArray[i]}, 0.9)`;
			const backgroundColor = `rgba(${colorProfileRGBArray[i]}, 0.1)`;
			const dataset = this.chart.data.datasets[i];

			dataset.borderColor = borderColor;
			dataset.backgroundColor = backgroundColor;
			dataset.pointBackgroundColor = borderColor;
			dataset.pointBorderColor = borderColor;
			dataset.pointHoverBackgroundColor = backgroundColor;
			dataset.pointHoverBorderColor = borderColor;
		}

		chart.update();
	}

	/**
	 * Transitions the chart between radar and bar forms by generating new datasets
	 * @param {"radar"|"bar"} newMode - Which color profile to swap to.
	 */
	updateChartMode(newMode) {
		if (this.mode === newMode) return false;
		this.mode = newMode;

		if (this.chart) {
			this.chart.destroy();
		}

		this.initializeChart();
		const dataset = this.generateDataset();
		this.setDataset(dataset);
		this.chart.update();
	}
}

/**
 * Very important function that I put at the end for cleanliness
 * reasons.
 * Registers a global ChartJS plugin responsible for creating HTML elements
 * for legends. The reason I went through all the trouble of making
 * this is so the legends would have the album art in them
 */
function registerHTMLElementLegendPlugin() {
	Chart.register({
		id: "albumlegends",
		afterUpdate(chart) {
			// remove previous legend elements
			const containerID = chart.options.plugins["albumlegends"].containerID;
			const legendContainer = $(containerID);
			legendContainer.empty();

			/**
			 * Each legend item contains a couple things we can use for the element:
			 * fillStyle, strokeStyle, and text
			 * The rest we can just source from the trackObject at the item's index
			 * since trackObjects and the legend items are in the same order.
			 */
			const legends = chart.options.plugins.legend.labels.generateLabels(chart);
			legends.forEach((item, index) => {
				const trackObject = trackObjects[index];

				// I really like using template literals for HTML elements. It's so
				// convenient, yet they format so badly :(
				// Here we form the image and link elements then add them both to a container
				const img = `<img src=${trackObject.trackData.albumArt
					} alt="album cover for ${trackObject}" class="album-cover img-fluid" 
            style="background: ${item.fillStyle}; border-color: ${item.strokeStyle
					}; border-width: 3px;
            opacity: ${item.hidden ? 0.2 : 1.0};"/>`;

				const link = `<a href=${trackObject.trackData.trackURL} class="link-dark" 
            style="text-align: center;">${item.text}</a>`;

				const legendElement = $('<div class="col-3"></div>');

				legendElement.append(img);
				legendElement.append(link);
				legendContainer.append(legendElement);


				/**
				 * This bit here seems kinda arcance,
				 */
				legendElement.click(() => {
					const { type } = chart.config;
					if (type === "pie" || type === "doughnut") {
						chart.toggleDataVisibility(item.index);
					} else {
						chart.setDatasetVisibility(
							item.datasetIndex,
							!chart.isDatasetVisible(item.datasetIndex)
						);
					}
					chart.update();
				});
			});
		},
	});
}