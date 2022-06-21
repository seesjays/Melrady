class LandingChartManager extends ChartManager {
    constructor() {
        super(exampleTrackObjectsA, {});
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
                labels: this.categoryLabels,
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
}


const landingChartManager = new LandingChartManager();
landingChartManager.cha
landingChartManager.initializeChart();
const exampledataset = landingChartManager.generateDataset();
landingChartManager.setDataset(exampledataset);