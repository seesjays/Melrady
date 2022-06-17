/**
 * Responsible for populating the High, Average, and Low data lists
 * with what should go in them:
 * Duration, Loudness, Tempo
 * 
 * I'd like to also put which track holds the high/low records for those
 * categories, but I worry about sizing.
 */
const datum = calculatedData;
// Highs, Lows, Averages
const maxes = datum.max;
const avgs = datum.avg;
const mins = datum.min;

const zeroPad = (num) => String(num).padStart(2, '0');

function simplifyData(dataset) {
    const { duration, loudness, tempo } = dataset;

    // duration calc
    const seconds = duration.value % 60;
    const minutes = duration.value / 60;
    let time = "0:00";

    time = `${Math.trunc(minutes)}:${zeroPad(Math.trunc(seconds))}`

    return [[time, duration.trackObject], [(Math.round(loudness.value) - 60), loudness.trackObject], [Math.round(tempo.value), tempo.trackObject]];
}

const data = [simplifyData(maxes), simplifyData(avgs), simplifyData(mins)];

for (let i = 0; i < 3; i++) {
    const set = data[i];
    const listId = `#extra-data-${i + 1}`;

    let trackNames = [];
    if (i != 1) {
        trackNames = [set[0][1], set[1][1], set[2][1]].map(trackObject => trackObject.trackData.trackName);
    }

    let trackNameElements = ["", "", ""];
    if (trackNames.length > 0) {
        trackNameElements = trackNames.map((trackName) => `
        <p class="text-muted mb-0"><small>${trackName}</small></p>
        `);
    }



    $(listId).append(`<li class="list-group-item">Duration: <strong>${set[0][0]}</strong>${trackNameElements[0]}</li>`);
    $(listId).append(`<li class="list-group-item">Loudness: <strong>${set[1][0]} dB</strong>${trackNameElements[1]}</li>`);
    $(listId).append(`<li class="list-group-item">Tempo: <strong>${set[2][0]} BPM</strong>${trackNameElements[2]}</li>`);
}