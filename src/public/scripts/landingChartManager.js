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

        const options = optionsForMode();
        this.chart = new Chart(ctx, {
            type: this.mode,
            data: {
                labels: this.categoryLabels,
                datasets: [],
            },
            options: options,
        });

        function optionsForMode() {
            console.log("test")
            const base = {
                responsive: true,
                tooltips: {
                    enabled: false,
                },
                scales: {
                    r: {
                        angleLines: {},
                        min: 0,
                        max: 1.0,
                        ticks: {
                            display: false,
                        },
                        display: false
                    },
                },
                plugins: {
                    albumlegends: {
                        containerID: "#album-cover-row",
                    },
                    legend: {
                        display: false,
                    },
                    tooltips: {
                        enabled: false,
                    },
                },
            }

            return base;
        }
    }
}


const landingChartManager = new LandingChartManager();

landingChartManager.initializeChart();
landingChartManager.updateChartColors("green");
const exampledataset = landingChartManager.generateDataset();
landingChartManager.setDataset(exampledataset);