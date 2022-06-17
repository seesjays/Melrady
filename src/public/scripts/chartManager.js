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

const categoryLabels = [
	"danceability",
	"duration",
	"energy",
	"speechiness",
	"tempo",
	"valence",
];
let chartMode = "radar";
let trackChart = null;
let features_obj = "normalized_features";

class ChartManager {
	trackObjects = [];

	mode = "radar";

	colorProfiles = {
		green: ["29,185,84", "25,126,56", "16,72,30", "0,25,0"],
		unique: ["114, 224, 106", "126, 132, 250", "222, 61, 130", "246, 133, 17"],
		art: null,
	};
	colorProfile = "art";

	legendContainer = "album-cover-row";

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
		const canvas = document.getElementById("track-chart");
		const ctx = document.getElementById("track-chart").getContext("2d");

		canvasContainer.width = canvasContainer.clientWidth;
		canvasContainer.height = canvasContainer.clientHeight;

		const options = this.optionsForMode(this.mode);
		this.chart = new Chart(ctx, {
			type: this.mode,
			data: {
				labels: categoryLabels,
				datasets: [],
			},
			...options,
		});
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

			const data = categoryLabels.map(
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

	setDataset(datasets) {
		this.chart.data = {
			labels: categoryLabels,
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

			/*
            legends
			$(`#track-${i + 1}-cover`).css({
				"background-color": backgroundColor,
				"border-color": borderColor,
			});
            */
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

	optionsForMode(mode) {
		if (mode === "radar") {
			const radarOptions = {
				options: {
					responsive: true,
					plugins: {
						albumlegends: {
							containerID: "#album-cover-row",
						},
						legend: {
							display: false,
						},
					},
					scales: {
						r: {
							angleLines: {},
							min: 0,
							max: 1.0,
							ticks: {
								display: false,
							},
						},
					},
				},
			};

			return radarOptions;
		} else {
			const barOptions = {
				options: {
					responsive: true,
					plugins: {
						albumLegends: {
							containerID: "#album-cover-row",
						},
						legend: {
							display: false,
						},
					},
					scales: {
						xAxes: {
							display: true,
						},
						yAxes: {
							ticks: {
								display: false,
							},
						},
					},
					elements: {
						bar: { borderWidth: 2 },
					},
				},
			};

			return barOptions;
		}
	}
}

const chartManager = new ChartManager(trackObjects);

// If this is registered after chart creation, the legends don't appear
registerHTMLElementLegendPlugin();

chartManager.initializeChart();
const dataset = chartManager.generateDataset();
chartManager.setDataset(dataset);
chartManager.chart.update();

$(".color-button").click(function () {
	switch (this.id) {
		case "art-color-button":
			chartManager.updateChartColors("art");
			break;
		case "unique-color-button":
			chartManager.updateChartColors("unique");
			break;
		case "green-color-button":
			chartManager.updateChartColors("green");
			break;
	}
});

$(".type-button").click(function () {
	switch (this.id) {
		case "radar-type":
			chartManager.updateChartMode("radar");
			break;
		case "bar-type":
			chartManager.updateChartMode("bar");
			break;
	}
});

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
			console.log(legends);
			legends.forEach((item, index) => {
				const trackObject = trackObjects[index];

				// I really like using template literals for HTML elements. It's so
				// convenient, yet they format so badly :(
				// Here we form the image and link elements then add them both to a container
				const img = `<img src=${
					trackObject.trackData.albumArt
				} alt="album cover for ${trackObject}" class="album-cover img-fluid" 
            style="background: ${item.fillStyle}; border-color: ${
					item.strokeStyle
				}; border-width: 3px;
            opacity: ${item.hidden ? 0.2 : 1.0};"/>`;

				const link = `<a href=${trackObject.trackData.trackURL} class="link-dark" 
            style="text-align: center;">${item.text}</a>`;

				const legendElement = $('<div class="col-3"></div>');

				legendElement.append(img);
				legendElement.append(link);
				legendContainer.append(legendElement);

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

/*
<script>
const tracks_data_obj = <%-JSON.stringify(trackObjects)%>;



function get_chart()
{

}




const absolute_mappings = {
    "danceability": "danceability",
    "energy": "energy",
    "speechiness": "speechiness",
    "valence": "valence",
};


function destroy_chart()
{
    track_chart.destroy();
}



function update_colors()
{
    let chart = get_chart();
    let display_color = $('input[name="display-color-button"]:checked').attr('id');

    const corresponding_color_set = {
        "dominant-color": dominant_colors,
        "green-color": default_colors,
        "unique-color": different_colors,
    };

    for (let i = 0; i < chart.data.datasets.length; i++)
    {
        let border_col = `rgba(${corresponding_color_set[display_color][i]} 0.9)`;
        let background_col = `rgba(${corresponding_color_set[display_color][i]} 0.1)`;
        let set = chart.data.datasets[i];

        set.borderColor = border_col;
        set.backgroundColor = background_col;
        set.pointBackgroundColor = border_col;
        set.pointBorderColor = border_col;
        set.pointHoverBackgroundColor = background_col;
        set.pointHoverBorderColor = background_col;

        $(`#track-${i + 1}-cover`).css({
            "background-color": background_col,
            "border-color": border_col
        });
    }

    chart.update();
}

const relative_mapping_swap = () =>
{
    mapping_mode = relative_mappings;
    features_obj = "normalized_features";

    let chart = get_chart();

    generate_data();
    chart.data = {
        labels: Object.keys(mapping_mode),
        datasets: datasetlist
    };
    chart.update();
};

const absolute_mapping_swap = () =>
{
    mapping_mode = absolute_mappings;
    features_obj = "track_features";

    let chart = get_chart();

    generate_data();
    chart.data = {
        labels: Object.keys(mapping_mode),
        datasets: datasetlist
    };
    chart.update();
};

function generate_data()
{
    datasetlist = [];

    const color_averaging = [0, 0, 0];
    let albumnum = 0;
    tracks_data_obj.tracks.forEach((track) =>
    {
        let color = "0, 0, 0,";

        for (let i = 0; i < 3; i++)
        {
            color_averaging[i] += track.track_color[i];
        }

        if (track.track_color !== null)
        {
            color = `${track.track_color[0]}, ${track.track_color[1]}, ${track.track_color[2]},`;
            dominant_colors.push(color);
        }
        else
        {
            color = differentcolors[albumnum];
            dominant_colors.push(color);
        }

        let border_col = `rgba(${color} 0.9)`;
        let background_col = `rgba(${color} 0.1)`;

        let set = {
            label: track.track_name,
            data: Object.keys(mapping_mode).map(key => track[features_obj][mapping_mode[key]]),
            borderColor: border_col,
            backgroundColor: background_col,
            pointBackgroundColor: border_col,
            pointBorderColor: border_col,
            pointHoverBackgroundColor: background_col,
            pointHoverBorderColor: background_col,
        }

        albumnum++;
        datasetlist.push(set);
    });

    // average
    for (let i = 0; i < 3; i++)
    {
        color_averaging[i] /= tracks_data_obj.tracks.length;
    }

    if (dominant_colors.length === tracks_data_obj.tracks.length + 1)
    {
        dominant_colors.pop();
    }

    const average_color = `${color_averaging[0]}, ${color_averaging[1]}, ${color_averaging[2]},`;
    dominant_colors.push(average_color);
    avgvalue = {
        label: "Average",
        data: Object.keys(mapping_mode).map(key => tracks_data_obj.full_data.averages[mapping_mode[key]]),
        borderColor: `rgba(${average_color} 0.9)`,
        backgroundColor: `rgba(${average_color} 0.1)`,
    }
    //datasetlist.push(avgvalue);
}

function new_scale()
{
    if (scaling_mode === "relative")
    {
        relative_mapping_swap();
    }
    if (scaling_mode === "absolute")
    {
        absolute_mapping_swap();
    }
}

$(document).ready(function ()
{
    generate_data();
    create_chart();

    $('input[name="display-color-button"]').click(() =>
    {
        let chart = get_chart();

        let display_type = $('input[name="display-color-button"]:checked').attr('id');

        const corresponding_color_set = {
            "dominant-color": dominant_colors,
            "green-color": default_colors,
            "unique-color": different_colors,
        };

        for (let i = 0; i < chart.data.datasets.length; i++)
        {
            let border_col = `rgba(${corresponding_color_set[display_type][i]} 0.9)`;
            let background_col = `rgba(${corresponding_color_set[display_type][i]} 0.1)`;
            let set = chart.data.datasets[i];

            set.borderColor = border_col;
            set.backgroundColor = background_col;
            set.pointBackgroundColor = border_col;
            set.pointBorderColor = border_col;
            set.pointHoverBackgroundColor = background_col;
            set.pointHoverBorderColor = background_col;

            $(`#track-${i + 1}-cover`).css({
                "background-color": background_col,
                "border-color": border_col
            });
        }

        chart.update();
    });

    $('input[name="display-mode-button"]').click(() =>
    {
        let track_chart = get_chart();

        let display_type = $('input[name="display-mode-button"]:checked').attr('id');

        if (display_type === "radar-display" && chart_mode !== "radar")
        {
            chart_mode = "radar";
        }
        else if (display_type === "bar-display" && chart_mode !== "bar")
        {
            chart_mode = "bar";
        }
        else
        {
            return;
        }

        destroy_chart();
        create_chart();
    });

    $('input[name="display-scaling-button"]').click(() =>
    {
        let track_chart = get_chart();

        let new_scaling_mode = $('input[name="display-scaling-button"]:checked').attr('id');

        if (new_scaling_mode === "relative-display" && scaling_mode !== "relative")
        {
            scaling_mode = "relative";
            new_scale();
            update_colors();
        }
        else if (new_scaling_mode === "absolute-display" && scaling_mode !== "absolute")
        {
            scaling_mode = "absolute";
            new_scale();
            update_colors();
        }
        else
        {
            return;
        }
    });
});
</script>

<script>
// Highs, Lows, Averages
const tracks_data_obj_datagathering = <%-JSON.stringify(tracks_data)%>;

const highs = tracks_data_obj_datagathering.full_data.maximums;
const avgs = tracks_data_obj_datagathering.full_data.averages;
const lows = tracks_data_obj_datagathering.full_data.minimums;

const zeroPad = (num) => String(num).padStart(2, '0')

function simplify_data(data)
{
    const { duration, loudness, tempo } = data;

    // duration calc
    let measure = "seconds";
    let minutes = duration / 60;
    let seconds = duration % 60;
    let time = "0:00";

    time = `${Math.trunc(minutes)}:${zeroPad(Math.trunc(seconds))}`

    return [time, (Math.round(loudness) - 60), Math.round(tempo)];
}

$(document).ready(function ()
{
    let data = [simplify_data(highs), simplify_data(avgs), simplify_data(lows)]
    for (let i = 0; i < 3; i++) 
    {
        let set = data[i];
        let list_id = `#extra-data-${i + 1}`;
        $(list_id).append(`<li class="list-group-item">Duration: <strong>${set[0]}</strong></li>`);
        $(list_id).append(`<li class="list-group-item">Loudness: <strong>${set[1]} dB</strong></li>`);
        $(list_id).append(`<li class="list-group-item">Tempo: <strong>${set[2]} BPM</strong></li>`);
    }
});
</script>
*/
