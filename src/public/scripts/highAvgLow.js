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

    return [time, (Math.round(loudness.value) - 60), Math.round(tempo.value)];
}

const data = [simplifyData(maxes), simplifyData(avgs), simplifyData(mins)];

for (let i = 0; i < 3; i++) {
    const set = data[i];
    const listId = `#extra-data-${i + 1}`;

    $(listId).append(`<li class="list-group-item">Duration: <strong>${set[0]}</strong></li>`);
    $(listId).append(`<li class="list-group-item">Loudness: <strong>${set[1]} dB</strong></li>`);
    $(listId).append(`<li class="list-group-item">Tempo: <strong>${set[2]} BPM</strong></li>`);
}