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



/*
<script>
const tracks_data_obj = <%-JSON.stringify(trackObjects)%>;

const html_legend_plugin = {
    id: 'htmlLegend',
    afterUpdate(chart, args, options)
    {
        const legend_list = $('#album-cover-row');
        legend_list.empty();

        const items = chart.options.plugins.legend.labels.generateLabels(chart);

        let tracknum = 0;

        items.forEach(item =>
        {
            let curr_item = tracks_data_obj.tracks[tracknum];
            let track_cover_container = $('<div></div>');
            track_cover_container.addClass(`col-3`);

            let track_image = $('<img>');
            track_image.attr('src', `${curr_item.track_image}`);
            track_image.attr('alt', `album cover for ${curr_item.track_name}`);
            track_image.addClass("album-cover img-fluid");

            let track_text = $(`<a></a>`).text(`${item.text}`).css({ "text-align": "center" }).addClass("link-dark").attr('href', curr_item.track_url);
            track_image.css({
                "background": item.fillStyle,
                "border-color": item.strokeStyle,
                "border-width": '3px',
                "opacity": item.hidden ? 0.2 : 1.0
            });

            track_cover_container.append(track_image);
            track_cover_container.append(track_text);

            track_cover_container.click(function clicked()
            {
                const { type } = chart.config;
                if (type === 'pie' || type === 'doughnut')
                {
                    chart.toggleDataVisibility(item.index);
                }
                else
                {
                    chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
                }
                chart.update();
            }
            )

            legend_list.append(track_cover_container);

            tracknum++;
        })

        // average
    }
}

function get_chart()
{

}

const default_colors = [];
const different_colors = [];
default_colors.push("120, 198, 121,", "65, 171, 93,", "35, 132, 67,", "0, 90, 50,", "39, 255, 115,");
different_colors.push("127, 201, 127,", "190, 174, 212,", "253, 192, 134,", "255, 255, 153,", "76, 174, 255,");
const dominant_colors = [];
let datasetlist = [];

const relative_mappings = {
    "danceability": "danceability",
    "duration": "duration",
    "energy": "energy",
    "speechiness": "speechiness",
    "tempo": "tempo",
    "valence": "valence",
};

const absolute_mappings = {
    "danceability": "danceability",
    "energy": "energy",
    "speechiness": "speechiness",
    "valence": "valence",
};

let chart_mode = "radar";
let mapping_mode = relative_mappings;
let scaling_mode = "relative";
let track_chart = null;
let features_obj = "normalized_features";

function destroy_chart()
{
    track_chart.destroy();
}

function create_chart()
{
    let canvcontainer = document.getElementById('canvas-container');
    let cnvs = document.getElementById('track_chart');
    let ctx = document.getElementById('track_chart').getContext('2d');

    // get color list
    canvcontainer.width = canvcontainer.clientWidth;
    canvcontainer.height = canvcontainer.clientHeight;

    if (chart_mode === "radar")
    {
        track_chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: Object.keys(mapping_mode),
                datasets: datasetlist,
            },
            options: {
                layout: {
                    padding: {
                        top: 5,
                        bottom: 5,
                    },
                },
                responsive: true,
                plugins: {
                    htmlLegend: {
                        containerID: 'album-cover-row'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    r: {
                        angleLines: {
                        },
                        min: 0,
                        max: 1.0,
                        ticks: {
                            display: false
                        },
                    },
                }
            },
            plugins: [html_legend_plugin]
        });
    }
    else
    {
        track_chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(mapping_mode),
                datasets: datasetlist,
            },
            options: {
                layout: {
                    padding: {
                        top: 5,
                        bottom: 5,
                    },
                },
                elements: {
                    bar: { borderWidth: 2 }
                },
                plugins: {
                    htmlLegend: {
                        containerID: 'album-cover-row'
                    },
                    legend: {
                        display: false
                    }
                },
                responsive: true,
                scales: {
                    xAxes: {
                        display: true,
                        ticks: {
                            maxRotation: 90,
                            minRotation: 45
                        }
                    },
                    yAxes: {
                        ticks: {
                            display: false
                        }
                    },
                },
            },
            plugins: [html_legend_plugin]
        });
    }

    get_chart = () => { return track_chart; }
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