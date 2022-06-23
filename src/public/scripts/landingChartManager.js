class LandingChartManager extends ChartManager {
    constructor(initialTrackObjects) {
        super(initialTrackObjects, {});
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
            const base = {
                responsive: true,
                animation: {
                    duration: 1000,
                },
                layout: {
                    padding: {
                        top: 5,
                        bottom: 5,
                    },
                },
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

    /**
     * Sets the chart's current dataset to the one supplied.
     * Override of chartManager's setDataset, this modified version iterates over the datasets the chart
     * already has, iterates over the keys of those datasets, and replaces the value at each key with the 
     * corresponding value for the corresponding new dataset.
     * 
     * It seems inefficient at first, but it's the only way (that I know of) to transition the values of a chart's
     * data instead of spawning a new set in. The animation as the chart changes color and data position
     * is just wonderful.
     * @param {Object[]} datasets 
     */
    setDataset(datasets) {
        if (this.chart.data.datasets.length == 0) {
            super.setDataset(datasets);
        }
        else {
            // chart already initialized This check is necessary because we can't edit the data values
            // of a chart that doesn't exist yet.

            Object.keys(this.chart.data.datasets).forEach((set, index) => {
                Object.keys(this.chart.data.datasets[set]).forEach((datasetProperty) => {
                    this.chart.data.datasets[set][datasetProperty] = datasets[index][datasetProperty];
                });
            });

            this.chart.update();
        };
    }
}